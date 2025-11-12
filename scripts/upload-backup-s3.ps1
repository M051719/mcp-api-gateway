#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Upload a backup artifact set for a given timestamp to S3 (or compatible) and optionally its manifests.
.DESCRIPTION
  Given a timestamp (yyyyMMdd_HHmmss), this script locates artifacts under ./backups:
    backup_<ts>.sql.gz
    public_only_<ts>.dump.gz
    public_only_<ts>.sql.gz
    public_only_<ts>_counts.csv
    public_only_<ts>_counts.json
    manifest_<ts>.sha256
    manifest_full_<ts>.sha256 (optional)
    manifest_public_only_<ts>.sha256 (optional)
  Uploads each existing file to the target bucket/prefix using AWS CLI.
  Optional encryption artifacts (.age/.gpg) will also be uploaded if present.
.PARAMETER Timestamp
  The backup timestamp (folder naming convention) to upload (required).
.PARAMETER Bucket
  Target S3 bucket name (required).
.PARAMETER Prefix
  Optional key prefix inside bucket (default: backups/).
.PARAMETER Profile
  Optional AWS CLI profile name.
.PARAMETER DryRun
  Show what would be uploaded without performing the copy.
.PARAMETER IncludeEncrypted
  Also upload encrypted versions (.age/.gpg). If false, only plaintext.
.EXAMPLES
  pwsh ./scripts/upload-backup-s3.ps1 -Timestamp 20251111_230100 -Bucket my-bucket -Prefix prod/db
  pwsh ./scripts/upload-backup-s3.ps1 -Timestamp 20251111_230100 -Bucket my-bucket -IncludeEncrypted -DryRun
.NOTES
  Requires: aws CLI configured with credentials (aws configure or environment vars).
#>
param(
    [Parameter(Mandatory = $true)][string]$Timestamp,
    [string]$Bucket,
    [string]$Prefix = 'backups',
    [string]$AwsProfile,
    [switch]$DryRun,
    [switch]$IncludeEncrypted,
    [string]$ConfigPath = './scripts/backup.config.psd1'
)

$ErrorActionPreference = 'Stop'

# Load defaults from config and environment if parameters not passed
function Merge-UploadConfig {
    param([hashtable]$cfg)
    if (-not $Bucket -and $cfg.Bucket) { $script:Bucket = $cfg.Bucket }
    if (-not $Prefix -and $cfg.Prefix) { $script:Prefix = $cfg.Prefix }
    if (-not $AwsProfile -and $cfg.AwsProfile) { $script:AwsProfile = $cfg.AwsProfile }
}
if (Test-Path $ConfigPath) {
    try { $loaded = Import-PowerShellDataFile -Path $ConfigPath; if ($loaded) { Merge-UploadConfig -cfg $loaded } } catch {}
}
if (-not $Bucket) { $envBucket = [Environment]::GetEnvironmentVariable('BACKUP_S3_BUCKET'); if ($envBucket) { $Bucket = $envBucket } }
if (-not $Prefix) { $envPrefix = [Environment]::GetEnvironmentVariable('BACKUP_S3_PREFIX'); if ($envPrefix) { $Prefix = $envPrefix } }
if (-not $AwsProfile) { $envProfile = [Environment]::GetEnvironmentVariable('BACKUP_AWS_PROFILE'); if ($envProfile) { $AwsProfile = $envProfile } }

if (-not $Bucket) { Write-Host "Bucket is required (param, config, or env BACKUP_S3_BUCKET)." -ForegroundColor Red; exit 1 }

function Test-CommandAvailable {
    param([string]$Name); return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}
if (-not (Test-CommandAvailable 'aws')) { Write-Host "aws CLI not found in PATH" -ForegroundColor Red; exit 1 }

$base = Join-Path (Get-Location) 'backups'
if (-not (Test-Path $base)) { Write-Host "backups directory missing" -ForegroundColor Red; exit 1 }

$patterns = @(
    "backup_${Timestamp}.sql.gz",
    "public_only_${Timestamp}.dump.gz",
    "public_only_${Timestamp}.sql.gz",
    "public_only_${Timestamp}_counts.csv",
    "public_only_${Timestamp}_counts.json",
    "manifest_${Timestamp}.sha256",
    "manifest_full_${Timestamp}.sha256",
    "manifest_public_only_${Timestamp}.sha256"
)

if ($IncludeEncrypted) {
    $patterns += $patterns | ForEach-Object { $_ + '.age' }
    $patterns += $patterns | ForEach-Object { $_ + '.gpg' }
}

$existing = @()
foreach ($p in $patterns) {
    $path = Join-Path $base $p
    if (Test-Path $path) { $existing += $path }
}

if ($existing.Count -eq 0) {
    Write-Host "No artifacts found for timestamp $Timestamp" -ForegroundColor Yellow
    exit 0
}

Write-Host "Uploading ${existing.Count} artifacts for timestamp $Timestamp to s3://$Bucket/$Prefix" -ForegroundColor Cyan

foreach ($f in $existing) {
    $key = "$Prefix/$(Split-Path -Leaf $f)" -replace '\\', '/'
    $cmdArgs = @('s3', 'cp', $f, "s3://$Bucket/$key")
    if ($AwsProfile) { $cmdArgs = @('--profile', $AwsProfile) + $cmdArgs }
    if ($DryRun) {
        Write-Host "[DRY RUN] aws $($cmdArgs -join ' ')" -ForegroundColor DarkGray
    }
    else {
        $result = aws $cmdArgs 2>&1
        if ($LASTEXITCODE -ne 0) { Write-Host "  ❌ Failed: $result" -ForegroundColor Red } else { Write-Host "  ✅ Uploaded" -ForegroundColor Green }
    }
}

Write-Host "Upload process complete." -ForegroundColor Cyan
