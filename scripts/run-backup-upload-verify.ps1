#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Harness: full backup → public-only artifacts → optional upload → integrity verify.
.DESCRIPTION
  Orchestrates a single end-to-end cycle using backup-nightly.ps1, then optionally
  uploads artifacts to S3 (if Bucket is configured) and runs verify-backup-integrity.ps1.
.PARAMETER SkipUpload
  Skip S3 upload even if bucket/prefix configured.
.PARAMETER ConfigPath
  Optional path to backup config (psd1). If omitted, defaults to ./scripts/backup.config.psd1.
.PARAMETER Timestamp
  Force a timestamp (used mainly for testing). Normally auto-generated within backup-nightly.
#>
param(
    [switch]$SkipUpload,
    [string]$ConfigPath = './scripts/backup.config.psd1',
    [string]$Timestamp
)

$ErrorActionPreference = 'Stop'

# Normalize working directory to repo root (parent of scripts folder)
try { Set-Location (Split-Path $PSScriptRoot -Parent) } catch {}

function Get-BackupConfig {
    param([string]$Path)
    if (Test-Path $Path) { return Import-PowerShellDataFile -Path $Path } else { return @{} }
}

$cfg = Get-BackupConfig -Path $ConfigPath

Write-Host "[Harness] Starting end-to-end backup cycle" -ForegroundColor Cyan

# Run nightly backup (timestamp created inside). We'll capture timestamp from manifest naming.
Write-Host "[Harness] Invoking backup-nightly.ps1" -ForegroundColor Gray
pwsh ./scripts/backup-nightly.ps1 @(
    if ($cfg.Service) { '-Service'; $cfg.Service }
    if ($cfg.Database) { '-Database'; $cfg.Database }
    if ($cfg.User) { '-User'; $cfg.User }
    if ($cfg.RetentionDaysPlaintext) { '-RetentionDaysPlaintext'; $cfg.RetentionDaysPlaintext }
    if ($cfg.RetentionDaysEncrypted) { '-RetentionDaysEncrypted'; $cfg.RetentionDaysEncrypted }
    if ($cfg.PruneMode) { '-PruneMode'; $cfg.PruneMode }
    if ($cfg.Encrypt) { '-Encrypt' }
    if ($cfg.AgeRecipient) { '-AgeRecipient'; $cfg.AgeRecipient }
    if ($cfg.GpgRecipient) { '-GpgRecipient'; $cfg.GpgRecipient }
    if ($cfg.RemovePlaintext) { '-RemovePlaintext' }
) | Out-Null

# Determine timestamp
if (-not $Timestamp) {
    $latest = Get-ChildItem ./backups -Filter 'manifest_full_*.sha256' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $latest) { $latest = Get-ChildItem ./backups -Filter 'manifest_public_only_*.sha256' | Sort-Object LastWriteTime -Descending | Select-Object -First 1 }
    if (-not $latest) { $latest = Get-ChildItem ./backups -Filter 'manifest_*.sha256' | Sort-Object LastWriteTime -Descending | Select-Object -First 1 }
    if ($latest) {
        Write-Host "[Harness] Found manifest: $($latest.Name)" -ForegroundColor DarkGray
        $patterns = @(
            '^manifest_full_(\d{8}_\d{6})\.sha256$',
            '^manifest_public_only_(\d{8}_\d{6})\.sha256$',
            '^manifest_(\d{8}_\d{6})\.sha256$'
        )
        foreach ($pat in $patterns) {
            $m = [regex]::Match($latest.Name, $pat)
            if ($m.Success) { $Timestamp = $m.Groups[1].Value; break }
        }
    }
}
if (-not $Timestamp) { Write-Host "[Harness] Could not determine timestamp." -ForegroundColor Red; exit 1 }
Write-Host "[Harness] Using timestamp: $Timestamp" -ForegroundColor Gray

# Optional upload
$bucket = $cfg.Bucket
$prefix = $cfg.Prefix
if (-not $SkipUpload -and $bucket) {
    Write-Host "[Harness] Uploading artifacts to s3://$bucket/$prefix" -ForegroundColor Gray
    try {
        pwsh ./scripts/upload-backup-s3.ps1 -Timestamp $Timestamp -Bucket $bucket -Prefix $prefix @(
            if ($cfg.AwsProfile) { '-AwsProfile'; $cfg.AwsProfile }
            if ($cfg.Encrypt) { '-IncludeEncrypted' }
        )
    }
    catch { Write-Host "[Harness] Upload failed: $($_.Exception.Message)" -ForegroundColor Yellow }
}
else {
    Write-Host "[Harness] Skipping upload (bucket not configured or SkipUpload specified)." -ForegroundColor DarkGray
}

# Verify integrity
Write-Host "[Harness] Verifying integrity" -ForegroundColor Gray
$verifyOutput = pwsh ./scripts/verify-backup-integrity.ps1 -Timestamp $Timestamp -IncludePublicOnlyManifest -IncludeFullManifest 2>&1 | Out-String
$verifyExitCode = $LASTEXITCODE

if ($verifyExitCode -gt 0) {
    Write-Host "[Harness] Integrity verification reported issues (exit code $verifyExitCode)." -ForegroundColor Yellow
    
    # Send alert
    $alertSubject = "Backup Integrity Verification Failed - $Timestamp"
    $alertBody = @"
Backup integrity verification detected issues for timestamp: $Timestamp

Exit Code: $verifyExitCode

Verification Output:
$verifyOutput

Please investigate immediately.
"@
    
    try {
        pwsh ./scripts/send-backup-alert.ps1 -Subject $alertSubject -Body $alertBody -ConfigPath $ConfigPath
    }
    catch {
        Write-Host "[Harness] Failed to send alert: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
else {
    Write-Host "[Harness] Integrity verification PASSED." -ForegroundColor Green
}

Write-Host "[Harness] Cycle complete." -ForegroundColor Cyan
