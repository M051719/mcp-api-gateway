#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Verify backup artifacts against their SHA256 manifests.
.DESCRIPTION
  For a given timestamp, reads manifests and recomputes hashes for all listed files
  in the ./backups directory, reporting OK/MISMATCH/MISSING per file and a summary code.
.PARAMETER Timestamp
  Timestamp of the backup set (yyyyMMdd_HHmmss). If omitted, verifies latest manifest_*.sha256.
.PARAMETER IncludePublicOnlyManifest
  Also verify manifest_public_only_<ts>.sha256 if present.
.PARAMETER IncludeFullManifest
  Also verify manifest_full_<ts>.sha256 if present.
.EXAMPLES
  pwsh ./scripts/verify-backup-integrity.ps1 -Timestamp 20251111_230100 -IncludePublicOnlyManifest -IncludeFullManifest
  pwsh ./scripts/verify-backup-integrity.ps1  # auto-select latest manifest_<ts>.sha256
#>
param(
    [string]$Timestamp,
    [switch]$IncludePublicOnlyManifest,
    [switch]$IncludeFullManifest
)

$ErrorActionPreference = 'Stop'
$base = Join-Path (Get-Location) 'backups'
if (-not (Test-Path $base)) { Write-Host "backups directory missing" -ForegroundColor Red; exit 1 }

function Select-LatestTimestamp {
    $m = Get-ChildItem $base -Filter 'manifest_*.sha256' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($m) {
        if ($m.Name -match 'manifest_(\d{8}_\d{6})\.sha256') { return $Matches[1] }
    }
    return $null
}

if (-not $Timestamp) {
    $Timestamp = Select-LatestTimestamp
    if (-not $Timestamp) { Write-Host "No manifests present in backups/" -ForegroundColor Yellow; exit 0 }
    Write-Host "Using latest timestamp: $Timestamp" -ForegroundColor Gray
}

$manifests = @()
$main = Join-Path $base "manifest_${Timestamp}.sha256"
if (Test-Path $main) { $manifests += $main }
if ($IncludePublicOnlyManifest) {
    $pub = Join-Path $base "manifest_public_only_${Timestamp}.sha256"
    if (Test-Path $pub) { $manifests += $pub }
}
if ($IncludeFullManifest) {
    $full = Join-Path $base "manifest_full_${Timestamp}.sha256"
    if (Test-Path $full) { $manifests += $full }
}

if ($manifests.Count -eq 0) { Write-Host "No manifests found for timestamp $Timestamp" -ForegroundColor Yellow; exit 0 }

$bad = 0; $missing = 0; $ok = 0
foreach ($mf in $manifests) {
    Write-Host "Verifying $(Split-Path -Leaf $mf)..." -ForegroundColor Cyan
    Get-Content $mf | ForEach-Object {
        $line = $_.Trim(); if (-not $line) { return }
        # format: <hash(space)(space)filename>
        $idx = $line.IndexOf('  ')
        if ($idx -lt 0) { return }
        $expect = $line.Substring(0, $idx).ToLower()
        $file = $line.Substring($idx + 2)
        $path = Join-Path $base $file
        if (-not (Test-Path $path)) { Write-Host "MISSING  $file" -ForegroundColor Yellow; $missing++; return }
        $actual = (Get-FileHash -Algorithm SHA256 -Path $path).Hash.ToLower()
        if ($actual -eq $expect) { Write-Host "OK       $file" -ForegroundColor Green; $ok++ }
        else { Write-Host "MISMATCH $file" -ForegroundColor Red; $bad++ }
    }
}

Write-Host "Summary: OK=$ok MISSING=$missing MISMATCH=$bad" -ForegroundColor White
if ($bad -gt 0) { exit 2 }
if ($missing -gt 0) { exit 1 }
exit 0
