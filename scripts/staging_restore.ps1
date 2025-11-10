#!/usr/bin/env pwsh
# staging_restore.ps1
# Restore database from backup and verify extension state
# Usage: ./scripts/staging_restore.ps1 -BackupFile "db.dump" -TargetDb "dbname"

param(
    [Parameter(Mandatory = $true)]
    [string]$BackupFile,
    
    [Parameter(Mandatory = $true)]
    [string]$TargetDb,
    
    [string]$DatabaseUrl = $env:DATABASE_URL,
    
    [string]$OutDir = "tmp/restore_verify",
    
    [switch]$SkipExtensionRestore,
    
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# Validate inputs
if (-not $DatabaseUrl) {
    throw "DATABASE_URL environment variable or -DatabaseUrl parameter required"
}

# Create output directory
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
$logFile = Join-Path $OutDir "restore.log"
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
        [string]$Database = $TargetDb,
        [switch]$IgnoreErrors
    )
    try {
        # Construct connection string with specific database
        $dbUrl = $DatabaseUrl -replace '/[^/]+$', "/$Database"
        $result = psql $dbUrl -v ON_ERROR_STOP=1 -t -c $Query
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

# 1. Verify backup file exists
Write-Log "Step 1: Verifying backup file..."
if (-not (Test-Path $BackupFile)) {
    throw "Backup file not found: $BackupFile"
}

# 2. Check backup format and content
Write-Log "Step 2: Checking backup format..."
$backupInfo = pg_restore -l $BackupFile 2>$null
if (-not $?) {
    throw "Invalid backup file format or corrupt backup"
}

# 3. Pre-restore checks
Write-Log "Step 3: Running pre-restore checks..."
$dbExists = Invoke-Psql "SELECT 1 FROM pg_database WHERE datname = '$TargetDb'" -Database "postgres" -IgnoreErrors
if ($dbExists) {
    Write-Log "WARNING: Target database $TargetDb exists"
    if (-not $DryRun) {
        Write-Log "Dropping existing database..."
        Invoke-Psql "DROP DATABASE $TargetDb" -Database "postgres"
    }
}

if ($DryRun) {
    Write-Log "DRY RUN - would restore $BackupFile to $TargetDb"
    exit 0
}

# 4. Create fresh database
Write-Log "Step 4: Creating fresh database..."
Invoke-Psql "CREATE DATABASE $TargetDb" -Database "postgres"

# 5. Restore backup
Write-Log "Step 5: Restoring backup..."
$restoreOutput = pg_restore -d $DatabaseUrl -v $BackupFile 2>&1
Add-Content -Path $logFile -Value $restoreOutput

# 6. Post-restore validation
Write-Log "Step 6: Running post-restore validation..."

# Check extension states
$extResult = Invoke-Psql @"
SELECT e.extname, 
       e.extversion,
       CASE WHEN e.extrelocatable THEN 'yes' ELSE 'no' END as relocatable,
       n.nspname as schema
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
ORDER BY e.extname;
"@
Write-Log "Installed extensions:`n$extResult"

# Check TimescaleDB specific items if present
$tsdbCheck = Invoke-Psql @"
SELECT COUNT(*) as hypertable_count 
FROM timescaledb_information.hypertables;
"@ -IgnoreErrors
if ($tsdbCheck) {
    Write-Log "Found $tsdbCheck TimescaleDB hypertables"
    
    # Check chunks
    $chunkCheck = Invoke-Psql @"
SELECT format('%I.%I', h.schema_name, h.table_name) as hypertable,
       count(c.*) as chunk_count,
       pg_size_pretty(sum(pg_total_relation_size(format('%I.%I', c.schema_name, c.table_name)::regclass))) as total_size
FROM timescaledb_information.hypertables h
LEFT JOIN timescaledb_information.chunks c ON h.hypertable_id = c.hypertable_id
GROUP BY h.schema_name, h.table_name;
"@
    Write-Log "Hypertable status:`n$chunkCheck"
}

# Check plv8 if present
$plv8Check = Invoke-Psql "SELECT plv8_version();" -IgnoreErrors
if ($plv8Check) {
    Write-Log "plv8 version: $plv8Check"
    
    # List plv8 functions
    $plv8Funcs = Invoke-Psql @"
SELECT n.nspname as schema,
       p.proname as function,
       pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.prolang = (SELECT oid FROM pg_language WHERE lanname = 'plv8');
"@
    Write-Log "plv8 functions:`n$plv8Funcs"
}

# 7. Run extension upgrades if needed
if (-not $SkipExtensionRestore) {
    Write-Log "Step 7: Checking for extension upgrades..."
    
    # TimescaleDB
    $tsdbVersion = Invoke-Psql "SELECT extversion FROM pg_extension WHERE extname = 'timescaledb';" -IgnoreErrors
    if ($tsdbVersion -and [version]$tsdbVersion -lt [version]"2.16.1") {
        Write-Log "Upgrading TimescaleDB to latest compatible version..."
        Invoke-Psql "ALTER EXTENSION timescaledb UPDATE;"
    }
    
    # plv8
    $plv8Version = Invoke-Psql "SELECT extversion FROM pg_extension WHERE extname = 'plv8';" -IgnoreErrors
    if ($plv8Version -and [version]$plv8Version -lt [version]"3.1.10") {
        Write-Log "Upgrading plv8 to latest compatible version..."
        Invoke-Psql "ALTER EXTENSION plv8 UPDATE;"
    }
}

# 8. Final validation
Write-Log "Step 8: Running final validation..."

# Check for any invalid indexes
$invalidIndexes = Invoke-Psql @"
SELECT schemaname, tablename, indexname 
FROM pg_indexes i
JOIN pg_class c ON c.relname = i.indexname
WHERE c.relname NOT LIKE 'pg_%'
  AND NOT pg_index_is_valid(c.oid);
"@
if ($invalidIndexes) {
    Write-Log "WARNING: Found invalid indexes:`n$invalidIndexes"
}

# Analyze database
Write-Log "Running ANALYZE to update statistics..."
Invoke-Psql "ANALYZE VERBOSE;"

Write-Log "Restore complete! Check $logFile for full output"
Write-Log @"
Next steps:
1. Review extension versions and upgrade if needed
2. Verify application connectivity
3. Run integration tests
4. Consider VACUUM ANALYZE on large tables
"@