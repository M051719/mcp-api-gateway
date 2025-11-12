#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Nightly backup orchestration script (full + public-only + manifests + optional encryption)
.DESCRIPTION
  Generates:
    1. Full cluster logical dump (pg_dumpall) -> backup_<timestamp>.sql.gz
    2. Public-only artifacts (.dump.gz, .sql.gz, counts CSV/JSON, public manifest)
    3. Master manifest (all artifacts) + dedicated full backup manifest.
  Optional: Encrypt artifacts (age or gpg) and optionally remove plaintext copies.
  Retention: removes artifacts older than -RetentionDays.
.PARAMETER Encrypt
  Enable encryption; requires -AgeRecipient or -GpgRecipient.
.PARAMETER AgeRecipient
  age recipient string (public key) when using age encryption.
.PARAMETER GpgRecipient
  GPG recipient (key ID/email) for gpg encryption.
.PARAMETER RemovePlaintext
  Remove original unencrypted artifacts after successful encryption.
Exit codes:
  0 success; 1 pg_dumpall failed; 2 public-only failed; 3 retention cleanup issue.
#>
param(
    [string]$Service = 'db',
    [string]$Database = 'postgres',
    [string]$User = 'postgres',
    [int]$RetentionDaysPlaintext = 7,
    [int]$RetentionDaysEncrypted = 30,
    [ValidateSet('all', 'plaintext-only', 'encrypted-only')] [string]$PruneMode = 'all',
    [ValidateSet('Optimal', 'Fastest', 'NoCompression')] [string]$CompressionLevel = 'Optimal',
    [switch]$Encrypt,
    [string]$AgeRecipient,
    [string]$GpgRecipient,
    [switch]$RemovePlaintext,
    [string]$ConfigPath = './scripts/backup.config.psd1'
)

$ErrorActionPreference = 'Stop'

# Load config file (if exists) to override defaults; environment vars override config
function Merge-Config {
    param([hashtable]$cfg)
    if ($cfg.Service) { $script:Service = $cfg.Service }
    if ($cfg.Database) { $script:Database = $cfg.Database }
    if ($cfg.User) { $script:User = $cfg.User }
    if ($cfg.RetentionDaysPlaintext) { $script:RetentionDaysPlaintext = [int]$cfg.RetentionDaysPlaintext }
    if ($cfg.RetentionDaysEncrypted) { $script:RetentionDaysEncrypted = [int]$cfg.RetentionDaysEncrypted }
    if ($cfg.PruneMode) { $script:PruneMode = $cfg.PruneMode }
    if ($cfg.CompressionLevel) { $script:CompressionLevel = $cfg.CompressionLevel }
    if ($cfg.Encrypt) { $script:Encrypt = [bool]$cfg.Encrypt }
    if ($cfg.AgeRecipient) { $script:AgeRecipient = $cfg.AgeRecipient }
    if ($cfg.GpgRecipient) { $script:GpgRecipient = $cfg.GpgRecipient }
    if ($cfg.RemovePlaintext) { $script:RemovePlaintext = [bool]$cfg.RemovePlaintext }
}

if (Test-Path $ConfigPath) {
    try {
        $loaded = Import-PowerShellDataFile -Path $ConfigPath
        if ($loaded) { Merge-Config -cfg $loaded }
    }
    catch { Write-Host ("⚠️ Failed to load config {0}: {1}" -f $ConfigPath, $_.Exception.Message) -ForegroundColor Yellow }
}

# Environment variable overrides (PREFIX: BACKUP_*)
function EnvOverride {
    param([string]$name, [scriptblock]$apply)
    $val = [Environment]::GetEnvironmentVariable($name)
    if ($val) { & $apply $val }
}
EnvOverride 'BACKUP_SERVICE' { param($v) $script:Service = $v }
EnvOverride 'BACKUP_DATABASE' { param($v) $script:Database = $v }
EnvOverride 'BACKUP_USER' { param($v) $script:User = $v }
EnvOverride 'BACKUP_RETENTION_PLAIN' { param($v) $script:RetentionDaysPlaintext = [int]$v }
EnvOverride 'BACKUP_RETENTION_ENC' { param($v) $script:RetentionDaysEncrypted = [int]$v }
EnvOverride 'BACKUP_PRUNE_MODE' { param($v) $script:PruneMode = $v }
EnvOverride 'BACKUP_COMPRESSION_LEVEL' { param($v) $script:CompressionLevel = $v }
EnvOverride 'BACKUP_ENCRYPT' { param($v) $script:Encrypt = ($v -in @('1', 'true', 'yes')) }
EnvOverride 'BACKUP_AGE_RECIPIENT' { param($v) $script:AgeRecipient = $v }
EnvOverride 'BACKUP_GPG_RECIPIENT' { param($v) $script:GpgRecipient = $v }
EnvOverride 'BACKUP_REMOVE_PLAINTEXT' { param($v) $script:RemovePlaintext = ($v -in @('1', 'true', 'yes')) }

if (-not (Test-Path './backups')) { New-Item -ItemType Directory -Path './backups' | Out-Null }
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$fullSql = Join-Path (Get-Location) "backups/backup_${timestamp}.sql"
$fullGz = "$fullSql.gz"

Write-Host "[Nightly Backup] Starting at $(Get-Date)" -ForegroundColor Cyan
Write-Host "Target service: $Service  Database: $Database  User: $User" -ForegroundColor Gray

Write-Host "Ensuring database service is up..." -ForegroundColor DarkGray
try { docker compose up -d $Service | Out-Null } catch {}
Start-Sleep -Seconds 2

Write-Host "Creating full cluster pg_dumpall backup..." -ForegroundColor Yellow
try {
    docker compose exec -T $Service sh -lc "pg_dumpall -U $User" | Out-File -FilePath $fullSql -Encoding utf8
}
catch {
    Write-Host "❌ pg_dumpall failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Compress to gzip
function Compress-Gzip {
    param([string]$InputPath, [string]$OutputPath, [string]$Level = 'Optimal')
    $inStream = [System.IO.File]::OpenRead($InputPath)
    $outStream = [System.IO.File]::Create($OutputPath)
    try {
        $compressionLevel = switch ($Level) {
            'Optimal' { [System.IO.Compression.CompressionLevel]::Optimal }
            'Fastest' { [System.IO.Compression.CompressionLevel]::Fastest }
            'NoCompression' { [System.IO.Compression.CompressionLevel]::NoCompression }
            default { [System.IO.Compression.CompressionLevel]::Optimal }
        }
        $gzip = New-Object System.IO.Compression.GZipStream($outStream, $compressionLevel)
        try { $inStream.CopyTo($gzip) } finally { $gzip.Dispose() }
    }
    finally { $inStream.Dispose(); $outStream.Dispose() }
}

Compress-Gzip -InputPath $fullSql -OutputPath $fullGz -Level $CompressionLevel
Remove-Item $fullSql -Force
$sizeFullKB = [math]::Round((Get-Item $fullGz).Length / 1KB, 2)
Write-Host "✅ Full backup created: $(Split-Path -Leaf $fullGz) ($sizeFullKB KB)" -ForegroundColor Green

Write-Host "Creating public-only artifact set..." -ForegroundColor Yellow
try {
    $encArgs = @()
    if ($Encrypt) {
        $encArgs += '-Encrypt'
        if ($AgeRecipient) { $encArgs += '-AgeRecipient'; $encArgs += $AgeRecipient }
        if ($GpgRecipient) { $encArgs += '-GpgRecipient'; $encArgs += $GpgRecipient }
        if ($RemovePlaintext) { $encArgs += '-RemovePlaintext' }
    }
    pwsh ./scripts/create-public-dump.ps1 -Service $Service -Database $Database -User $User -Timestamp $timestamp -CompressionLevel $CompressionLevel @encArgs
}
catch {
    Write-Host "❌ Public-only dump failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 2
}

# Master manifest for the run
function Write-HashLine {
    param([string]$Path, [System.IO.StreamWriter]$Writer)
    $h = Get-FileHash -Algorithm SHA256 -Path $Path
    $Writer.WriteLine("$($h.Hash.ToLower())  $(Split-Path -Leaf $Path)")
}

$masterManifest = Join-Path (Get-Location) "backups/manifest_${timestamp}.sha256"
$w = New-Object System.IO.StreamWriter($masterManifest, $false, (New-Object System.Text.UTF8Encoding($false)))
try {
    # Include full backup gz
    Write-HashLine -Path $fullGz -Writer $w
    # Include public-only set for this timestamp
    $pubFiles = Get-ChildItem ./backups -Filter "public_only_${timestamp}*" | Sort-Object Name
    foreach ($f in $pubFiles) { Write-HashLine -Path $f.FullName -Writer $w }
}
finally { $w.Dispose() }
Write-Host "🧾 Master manifest: $(Split-Path -Leaf $masterManifest)" -ForegroundColor Cyan

# Per-run full backup manifest
$fullManifest = Join-Path (Get-Location) "backups/manifest_full_${timestamp}.sha256"
$fw = New-Object System.IO.StreamWriter($fullManifest, $false, (New-Object System.Text.UTF8Encoding($false)))
try { Write-HashLine -Path $fullGz -Writer $fw } finally { $fw.Dispose() }
Write-Host "🧾 Full backup manifest: $(Split-Path -Leaf $fullManifest)" -ForegroundColor Cyan

# Optional encryption of full backup + manifests (already handled for public set inside create-public-dump)
function Test-CommandAvailable {
    param([string]$Name); return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}
function Protect-BackupFile {
    param([string]$InputPath, [string]$AgeRecipient, [string]$GpgRecipient)
    if ($AgeRecipient) {
        if (-not (Test-CommandAvailable 'age')) { throw "'age' not found in PATH" }
        $outPath = "$InputPath.age"; & age -r $AgeRecipient -o $outPath $InputPath | Out-Null; return $outPath
    }
    elseif ($GpgRecipient) {
        if (-not (Test-CommandAvailable 'gpg')) { throw "'gpg' not found in PATH" }
        $outPath = "$InputPath.gpg"; & gpg --yes --batch --output $outPath --encrypt --recipient $GpgRecipient $InputPath | Out-Null; return $outPath
    }
    else { throw "Protect-BackupFile called without recipient" }
}
if ($Encrypt) {
    Write-Host "Encrypting full backup artifacts..." -ForegroundColor Yellow
    $targets = @($fullGz, $masterManifest, $fullManifest)
    $encTargets = @()
    foreach ($t in $targets) { if (Test-Path $t) { $encTargets += $t } }
    foreach ($t in $encTargets) {
        try { Protect-BackupFile -InputPath $t -AgeRecipient $AgeRecipient -GpgRecipient $GpgRecipient | Out-Null }
        catch { Write-Host "  ⚠️ Failed to encrypt $(Split-Path -Leaf $t): $($_.Exception.Message)" -ForegroundColor Yellow }
    }
    if ($RemovePlaintext) {
        foreach ($t in $encTargets) { try { Remove-Item $t -Force } catch {} }
    }
}

# Retention cleanup
Write-Host "Applying retention policies (plaintext=$RetentionDaysPlaintext d, encrypted=$RetentionDaysEncrypted d, mode=$PruneMode)..." -ForegroundColor Yellow
try {
    $now = Get-Date
    $plainCutoff = $now.AddDays(-$RetentionDaysPlaintext)
    $encCutoff = $now.AddDays(-$RetentionDaysEncrypted)
    $all = Get-ChildItem ./backups | Where-Object { $_.Name -like 'backup_*' -or $_.Name -like 'public_only_*' -or $_.Name -like 'manifest_*' }
    foreach ($f in $all) {
        $isEncrypted = ($f.Name -match '\.(age|gpg)$')
        $ageDays = [int]((Get-Date) - $f.LastWriteTime).TotalDays
        $remove = $false
        if ($PruneMode -eq 'plaintext-only' -and $isEncrypted) { continue }
        if ($PruneMode -eq 'encrypted-only' -and -not $isEncrypted) { continue }
        if ($isEncrypted) { if ($f.LastWriteTime -lt $encCutoff) { $remove = $true } }
        else { if ($f.LastWriteTime -lt $plainCutoff) { $remove = $true } }
        if ($remove) {
            Write-Host "  Removing $($isEncrypted ? 'encrypted' : 'plaintext') artifact: $($f.Name) (age=${ageDays}d)" -ForegroundColor DarkGray
            try { Remove-Item $f.FullName -Force } catch { Write-Host "   ⚠️ Failed to remove $($f.Name): $($_.Exception.Message)" -ForegroundColor Yellow }
        }
    }
}
catch {
    Write-Host "⚠️ Retention cleanup encountered an error: $($_.Exception.Message)" -ForegroundColor Yellow
    exit 3
}

Write-Host "[Nightly Backup] Completed successfully." -ForegroundColor Cyan
exit 0
