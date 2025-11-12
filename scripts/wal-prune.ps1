#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Prune old WAL archive files based on retention policy
.DESCRIPTION
    Removes WAL archive files from the database container's /wal_archive volume
    that are older than the configured retention period.
.PARAMETER RetentionDays
    Number of days to retain WAL files. Defaults to 14.
.PARAMETER Service
    Docker Compose service name. Defaults to 'db'.
.PARAMETER ConfigPath
    Path to backup config (psd1). Defaults to ./scripts/backup.config.psd1
#>
param(
    [int]$RetentionDays = 14,
    [string]$Service = 'db',
    [string]$ConfigPath = './scripts/backup.config.psd1'
)

$ErrorActionPreference = 'Stop'

# Load config
if (Test-Path $ConfigPath) {
    try {
        $cfg = Import-PowerShellDataFile -Path $ConfigPath
        if ($cfg.WalArchiveRetentionDays) { $RetentionDays = $cfg.WalArchiveRetentionDays }
        if ($cfg.Service) { $Service = $cfg.Service }
    }
    catch { Write-Host "⚠️ Failed to load config: $($_.Exception.Message)" -ForegroundColor Yellow }
}

# Environment override
$envRetention = [Environment]::GetEnvironmentVariable('BACKUP_WAL_RETENTION_DAYS')
if ($envRetention) { $RetentionDays = [int]$envRetention }

Write-Host "[WAL Prune] Pruning WAL archive files older than $RetentionDays days..." -ForegroundColor Yellow

# Ensure service is up
try { docker compose up -d $Service | Out-Null } catch {}
Start-Sleep -Seconds 2

# Find and remove old WAL files
$cutoffDays = $RetentionDays
$findCmd = "find /wal_archive -type f -name '*.gz' -o -name '0*' -mtime +${cutoffDays}"
$walFiles = docker compose exec -T $Service sh -lc "$findCmd" 2>&1 | Out-String

if ($walFiles -and $walFiles.Trim()) {
    $fileCount = ($walFiles -split "`n" | Where-Object { $_ }).Count
    Write-Host "  Found $fileCount WAL file(s) to remove" -ForegroundColor Gray
    
    $removeCmd = "find /wal_archive -type f \( -name '*.gz' -o -name '0*' \) -mtime +${cutoffDays} -delete"
    docker compose exec -T $Service sh -lc "$removeCmd" | Out-Null
    Write-Host "✅ WAL archive pruning complete." -ForegroundColor Green
}
else {
    Write-Host "  No old WAL files found." -ForegroundColor Gray
}

exit 0
