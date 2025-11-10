#!/usr/bin/env pwsh
# staging_upgrade_prep.ps1
# Safe staging runbook for preparing database upgrade
# Usage: ./scripts/staging_upgrade_prep.ps1 -DryRun $true

param(
    [string]$OutDir = "tmp/upgrade_prep",
    [int]$ArchiveDays = 90,
    [int]$BatchSize = 10000,
    [switch]$DryRun,
    [switch]$SkipVacuum,
    [string]$DatabaseUrl = $env:DATABASE_URL
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# Validate inputs
if (-not $DatabaseUrl) {
    throw "DATABASE_URL environment variable or -DatabaseUrl parameter required"
}

# Create output directory
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
$logFile = Join-Path $OutDir "upgrade_prep.log"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

function Write-Log {
    param([string]$Message)
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "$ts : $Message"
    Write-Host $logMessage
    Add-Content -Path $logFile -Value $logMessage
}

function Invoke-Psql {
    param(
        [string]$Query,
        [switch]$IgnoreErrors
    )
    try {
        # Use --dbname to ensure connection string is parsed correctly on Windows
        Write-Log "Executing SQL: $Query"
        $result = & psql --no-psqlrc --dbname "$DatabaseUrl" -v ON_ERROR_STOP=1 -t -c "$Query" 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Log "psql returned non-zero exit code: $LASTEXITCODE"
        }
        if ($result) {
            Write-Log "SQL output: $result"
        }
        return $result
    }
    catch {
        if (-not $IgnoreErrors) {
            throw
        }
        Write-Log "Warning: Query failed (ignored): $Query"
        Write-Log $_.Exception.Message
        return $null
    }
}

# 1. Take pre-change snapshot
Write-Log "Step 1: Creating pre-change reports..."
Write-Log "Running extension inventory..."
& $PSScriptRoot/report_extensions.ps1
Copy-Item "tmp/upgrade_report/*" -Destination $OutDir -Force

# 2. Verify we can create backup
Write-Log "Step 2: Testing backup capabilities..."
if (-not $DryRun) {
    $backupFile = Join-Path $OutDir "pre_archive_backup.sql"
    Write-Log "Creating backup to $backupFile"
    $dumpResult = & pg_dump --schema-only --file "$backupFile" "$DatabaseUrl" 2>&1
    if (-not $?) {
        Write-Log $dumpResult
        throw "Backup test failed - cannot proceed without backup capability"
    }
}

# 3. Check pg_cron table size
Write-Log "Step 3: Checking cron.job_run_details size..."
$rowCount = Invoke-Psql "SELECT count(*) FROM cron.job_run_details WHERE finished_at < now() - interval '$ArchiveDays days';"
Write-Log "Found $rowCount rows older than $ArchiveDays days"

# Initialize csvFile variable for later reference
$csvFile = Join-Path $OutDir "job_run_details_$timestamp.csv"

if ($DryRun) {
    Write-Log "DRY RUN - would archive/delete $rowCount rows to $csvFile"
}
else {
    # 4. Archive to CSV
    Write-Log "Step 4: Archiving old rows to CSV..."
    $copyCmd = "\\copy (SELECT * FROM cron.job_run_details WHERE finished_at < now() - interval '$ArchiveDays days') TO '$csvFile' CSV HEADER"
    # Use direct psql invocation for \copy meta-command to avoid escaping issues
    $copyResult = & psql --no-psqlrc --dbname "$DatabaseUrl" -v ON_ERROR_STOP=1 -c "$copyCmd" 2>&1
    if (-not $?) { Write-Log "WARNING: copy command failed: $copyResult" } else { Write-Log "Archived rows to $csvFile" }

    # 5. Batch delete with progress
    Write-Log "Step 5: Deleting archived rows in batches..."
    $totalDeleted = 0
    do {
        $deleted = Invoke-Psql @"
            WITH batch AS (
                DELETE FROM cron.job_run_details 
                WHERE finished_at < now() - interval '$ArchiveDays days'
                LIMIT $BatchSize
                RETURNING 1
            )
            SELECT count(*) FROM batch;
"@
        $batchCount = [int]$deleted
        $totalDeleted += $batchCount
        Write-Log "Deleted batch of $batchCount rows (total: $totalDeleted)"
        
        if ($batchCount -gt 0) {
            Start-Sleep -Milliseconds 100
        }
    } while ($batchCount -gt 0)

    # 6. VACUUM unless skipped
    if (-not $SkipVacuum) {
        Write-Log "Step 6: Running VACUUM ANALYZE..."
        Invoke-Psql "VACUUM (VERBOSE, ANALYZE) cron.job_run_details;"
    }
}

# 7. Check extension versions
Write-Log "Step 7: Checking critical extension versions..."
$extensions = Invoke-Psql @"
    SELECT extname, extversion 
    FROM pg_extension 
    WHERE extname IN ('timescaledb', 'plv8', 'pg_cron', 'pgjwt')
    ORDER BY extname;
"@
Write-Log "Installed extensions:`n$extensions"

# 8. Check for roles using md5
Write-Log "Step 8: Checking for md5 password hashes..."
$md5Roles = Invoke-Psql "SELECT rolname FROM pg_authid WHERE rolpassword LIKE 'md5%' AND rolcanlogin = true;"
if ($md5Roles) {
    Write-Log "WARNING: Found roles using md5 passwords: $md5Roles"
    Write-Log "Run scripts/migrate_md5_roles.sql to generate ALTER ROLE statements"
}

# 9. Final size check
Write-Log "Step 9: Final table size check..."
$finalCount = Invoke-Psql "SELECT count(*) FROM cron.job_run_details;"
Write-Log "Final row count in cron.job_run_details: $finalCount"

Write-Log "Done! Check $logFile for full output"
Write-Log "Next steps:"
Write-Log "1. Review $OutDir for reports and backup"
Write-Log "2. If using archival: verify $csvFile"
Write-Log "3. Consider running VACUUM FULL if large amount of space was freed"
Write-Log "4. Run extension version upgrades if needed"