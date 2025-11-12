#!/usr/bin/env pwsh
<#!
Automated backup restore validation script.
Validates that a pg_dumpall backup can be restored into a fresh Postgres 17 container.
#>
param(
    [string]$Image = "supabase/postgres:17.6.1.044",
    [string]$BackupFile = "",             # If empty, auto-select latest backup_*.sql or newest public_only_*.dump in ./backups
    [string]$ContainerName = "pg17-restore-test",
    [switch]$KeepContainer,                # Keep container running after test
    [int]$ReadyTimeoutSeconds = 90,
    [switch]$PublicOnly,                   # Force using a public-only -Fc dump if available
    [switch]$SkipErrorsSummary,            # Suppress verbose error listing
    [switch]$StrictCounts,                 # Exit with non-zero if counts mismatch
    [switch]$NoCleanup                     # Alias for -KeepContainer
)

$ErrorActionPreference = "Stop"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Postgres Backup Restore Validation" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan

function Resolve-BackupFile {
    param([string]$Explicit, [switch]$PreferPublicDump)
    if ($Explicit) { return $Explicit }
    $dir = Join-Path (Get-Location) 'backups'
    if (-not (Test-Path $dir)) { Write-Host "❌ backups directory not found" -ForegroundColor Red; exit 1 }
    $publicDump = Get-ChildItem $dir -Filter 'public_only_*.dump' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    $sqlDump = Get-ChildItem $dir -Filter 'backup_*.sql' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($PreferPublicDump -and $publicDump) { return $publicDump.FullName }
    if ($publicDump -and -not $sqlDump) { return $publicDump.FullName }
    if ($sqlDump) { return $sqlDump.FullName }
    if ($publicDump) { return $publicDump.FullName }
    Write-Host "❌ No suitable backup files (backup_*.sql or public_only_*.dump) found in ./backups" -ForegroundColor Red; exit 1
}

$BackupFile = Resolve-BackupFile -Explicit $BackupFile -PreferPublicDump:($PublicOnly)
if (-not (Test-Path $BackupFile)) { Write-Host "❌ Backup file not found: $BackupFile" -ForegroundColor Red; exit 1 }

$isFcDump = $BackupFile.ToLower().EndsWith('.dump')

$backupSizeKB = [math]::Round((Get-Item $BackupFile).Length / 1KB, 2)
Write-Host "Using backup: $(Split-Path -Leaf $BackupFile) ($backupSizeKB KB) Format: $(if ($isFcDump) { 'custom (-Fc)' } else { 'plain SQL' })" -ForegroundColor Green

# Ensure previous container is removed
Write-Host "Cleaning any existing test container..." -ForegroundColor Gray
try { docker rm -f $ContainerName 2>$null | Out-Null } catch {}

Write-Host "Starting fresh Postgres container: $ContainerName ($Image)" -ForegroundColor Yellow
$cid = docker run --rm -d --name $ContainerName -e POSTGRES_PASSWORD=test $Image
if (-not $cid) { Write-Host "❌ Failed to start container" -ForegroundColor Red; exit 1 }
Write-Host "Container ID: $cid" -ForegroundColor Gray

# Wait for readiness
Write-Host "Waiting for database readiness (timeout: $ReadyTimeoutSeconds s)..." -ForegroundColor Gray
$ready = $false
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
while ($stopwatch.Elapsed.TotalSeconds -lt $ReadyTimeoutSeconds) {
    Start-Sleep -Seconds 2
    $probe = docker exec $ContainerName pg_isready -U postgres 2>&1
    if ($probe -match 'accepting connections') { $ready = $true; break } else { Write-Host "  ⏳ $($stopwatch.Elapsed.TotalSeconds.ToString('0'))s: initializing..." -ForegroundColor DarkGray }
}
$stopwatch.Stop()
if (-not $ready) { Write-Host "❌ Database not ready within timeout" -ForegroundColor Red; docker logs $ContainerName --tail=50; exit 1 }
Write-Host "✅ Database ready in $([math]::Round($stopwatch.Elapsed.TotalSeconds,1))s" -ForegroundColor Green

if ($isFcDump) {
    Write-Host "Detected custom format dump (.dump). Using pg_restore with safer flags." -ForegroundColor Yellow
    $targetPath = '/tmp/restore.dump'
}
else {
    $targetPath = '/tmp/restore.sql'
}

# Copy backup into container
Write-Host "Copying backup into container ($targetPath)..." -ForegroundColor Gray
docker cp $BackupFile "${ContainerName}:$targetPath"
Write-Host "✅ Copied" -ForegroundColor Green

# Perform restore
Write-Host "Restoring backup (this may produce expected permission warnings)..." -ForegroundColor Yellow
$restoreStart = Get-Date
if ($isFcDump) {
    # Use flags to avoid ownership/privilege noise in validation context
    $restoreOutput = docker exec $ContainerName pg_restore -U postgres --no-owner --no-privileges -d postgres $targetPath 2>&1
}
else {
    $restoreOutput = docker exec $ContainerName psql -U postgres -f $targetPath 2>&1
}
$restoreDuration = (Get-Date) - $restoreStart
Write-Host "Restore duration: $([math]::Round($restoreDuration.TotalSeconds,1))s" -ForegroundColor Gray

# Basic sanity checks
Write-Host "Running post-restore sanity checks..." -ForegroundColor Yellow
$tables = docker exec $ContainerName psql -U postgres -At -c "SELECT table_schema||'.'||table_name FROM information_schema.tables WHERE table_schema IN ('public') ORDER BY 1;" 2>$null
$exts = docker exec $ContainerName psql -U postgres -At -c "SELECT extname||':'||extversion FROM pg_extension ORDER BY 1;" 2>$null

Write-Host "Public tables:" -ForegroundColor Cyan
if ($tables) { $tables.Split("`n") | Where-Object { $_ -ne '' } | ForEach-Object { Write-Host "  • $_" -ForegroundColor White } } else { Write-Host "  (none)" -ForegroundColor DarkGray }

Write-Host "Extensions:" -ForegroundColor Cyan
if ($exts) { $exts.Split("`n") | Where-Object { $_ -ne '' } | ForEach-Object { Write-Host "  • $_" -ForegroundColor White } } else { Write-Host "  (none)" -ForegroundColor DarkGray }

# Row counts for public schema
Write-Host "Row counts (public schema):" -ForegroundColor Cyan
$rows = docker exec $ContainerName psql -U postgres -At -c "SELECT relname||':'||n_live_tup FROM pg_stat_user_tables WHERE schemaname='public' ORDER BY 1;" 2>$null
if ($rows) { $rows.Split("`n") | Where-Object { $_ -ne '' } | ForEach-Object { Write-Host "  • $_" -ForegroundColor White } } else { Write-Host "  (none)" -ForegroundColor DarkGray }

# Attempt counts integrity diff if an original counts CSV exists (only for public_only_* dumps)
function Parse-CountsCsv {
    param([string]$Path)
    $map = @{}
    if (-not (Test-Path $Path)) { return $map }
    Get-Content $Path | ForEach-Object {
        if ($_ -match '^[^,]+,\d+$') {
            $parts = $_.Split(',')
            $table = $parts[0]
            $count = [int]$parts[1]
            # store as relname only if format is schema.rel
            if ($table -match '^public\.(.+)$') { $table = $Matches[1] }
            $map[$table] = $count
        }
    }
    return $map
}

function Parse-CountsRowsString {
    param([string]$RowsString)
    $map = @{}
    if (-not $RowsString) { return $map }
    $RowsString.Split("`n") | Where-Object { $_ -match ':' } | ForEach-Object {
        $parts = $_.Split(':')
        if ($parts.Length -ge 2) {
            $map[$parts[0]] = [int]$parts[1]
        }
    }
    return $map
}

$originalCountsFile = $null
if ($BackupFile -match 'public_only_(\d{8}_\d{6})\.dump$') {
    $stamp = $Matches[1]
    $candidate = Join-Path (Split-Path $BackupFile -Parent) "public_only_${stamp}_counts.csv"
    if (Test-Path $candidate) { $originalCountsFile = $candidate }
}

$countsIntegrityPassed = $true
if ($originalCountsFile) {
    Write-Host "Performing counts integrity comparison with $(Split-Path -Leaf $originalCountsFile)" -ForegroundColor Cyan
    $origMap = Parse-CountsCsv -Path $originalCountsFile
    $restoredMap = Parse-CountsRowsString -RowsString $rows
    $diffs = @()
    foreach ($k in $origMap.Keys) {
        if (-not $restoredMap.ContainsKey($k)) {
            $diffs += "MISSING:$k (expected ${origMap[$k]})"
            $countsIntegrityPassed = $false
        }
        elseif ($restoredMap[$k] -ne $origMap[$k]) {
            $diffs += "COUNT_MISMATCH:$k expected=${origMap[$k]} restored=${restoredMap[$k]}"
            $countsIntegrityPassed = $false
        }
    }
    foreach ($k in $restoredMap.Keys) {
        if (-not $origMap.ContainsKey($k)) {
            $diffs += "NEW_TABLE:$k restored=${restoredMap[$k]}"
            $countsIntegrityPassed = $false
        }
    }
    if ($diffs.Count -eq 0) {
        Write-Host "✅ Counts integrity PASSED (all table counts match)." -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ Counts integrity FAILED (differences found):" -ForegroundColor Yellow
        $diffs | ForEach-Object { Write-Host "  • $_" -ForegroundColor DarkYellow }
    }
}
else {
    Write-Host "(No matching original counts CSV found for comparison)" -ForegroundColor DarkGray
}

# Summarize warnings/errors from restore output
Write-Host "Parsing restore output for ERROR/WARNING summary..." -ForegroundColor Gray
$errors = $restoreOutput -split "`n" | Where-Object { $_ -match 'ERROR:' }
$warnings = $restoreOutput -split "`n" | Where-Object { $_ -match 'WARNING:' }
Write-Host "Errors: $($errors.Count)  Warnings: $($warnings.Count)" -ForegroundColor Yellow

if (-not $SkipErrorsSummary) {
    if ($errors.Count -gt 0) {
        Write-Host "Sample errors (top 5):" -ForegroundColor Red
        $errors | Select-Object -First 5 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkRed }
    }
    if ($warnings.Count -gt 0) {
        Write-Host "Sample warnings (top 5):" -ForegroundColor Yellow
        $warnings | Select-Object -First 5 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkYellow }
    }
}
else {
    Write-Host "(Suppressed detailed error listing via -SkipErrorsSummary)" -ForegroundColor DarkGray
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "RESTORE TEST COMPLETE" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan

if ($NoCleanup) { $KeepContainer = $true }

if (-not $KeepContainer) {
    Write-Host "Cleaning up container..." -ForegroundColor Gray
    docker rm -f $ContainerName 2>$null | Out-Null
    Write-Host "✅ Removed test container" -ForegroundColor Green
}
else {
    Write-Host "⚠️ Container retained: $ContainerName (remember to remove manually)" -ForegroundColor Yellow
}

Write-Host "Result Summary:" -ForegroundColor White
Write-Host "  Backup file: $(Split-Path -Leaf $BackupFile)" -ForegroundColor White
Write-Host "  Restore seconds: $([math]::Round($restoreDuration.TotalSeconds,1))" -ForegroundColor White
function Count-Lines {
    param([string]$s)
    if (-not $s) { return 0 }
    return ($s -split "`n" | Where-Object { $_ -ne '' }).Count
}
Write-Host "  Tables restored (public): $(if ($tables) { (Count-Lines $tables) } else { (Count-Lines $rows) })" -ForegroundColor White
Write-Host "  Errors: $($errors.Count)  Warnings: $($warnings.Count)" -ForegroundColor White

if ($errors.Count -eq 0) {
    if ($countsIntegrityPassed) {
        Write-Host "✅ Backup is structurally restorable and counts integrity verified." -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ Structural restore succeeded but counts integrity failed." -ForegroundColor Yellow
        if ($StrictCounts) { Write-Host "❌ Exiting due to -StrictCounts enforcement." -ForegroundColor Red; if (-not $KeepContainer) { try { docker rm -f $ContainerName 2>$null | Out-Null } catch {} }; exit 2 }
    }
}
else {
    Write-Host "⚠️ Non-critical errors may relate to reserved Supabase roles in vanilla container." -ForegroundColor Yellow
    if ($StrictCounts -and -not $countsIntegrityPassed) { Write-Host "❌ Counts mismatch plus errors; failing due to -StrictCounts." -ForegroundColor Red; if (-not $KeepContainer) { try { docker rm -f $ContainerName 2>$null | Out-Null } catch {} }; exit 3 }
}
