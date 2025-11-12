[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$DatabaseUrl,
  [string]$OutputDir = './extension_backups',
  [switch]$IncludeTimescaleMetadata,
  [switch]$IncludePlv8Functions
)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir | Out-Null }

function Invoke-PostgresQuery {
  param([string]$Query)
  $env:PGOPTIONS = '-c search_path=public'
  $result = & psql "$DatabaseUrl" -At -F '|' -c $Query 2>$null
  return $result
}

Write-Host "[Backup] Starting extension metadata backup..." -ForegroundColor Cyan

if ($IncludePlv8Functions) {
  Write-Host "[Backup] Checking for plv8 extension..." -ForegroundColor Yellow
  
  # Check if plv8 exists
  $plv8Exists = & psql "$DatabaseUrl" -At -c "SELECT 1 FROM pg_extension WHERE extname = 'plv8';" 2>$null
  
  if ($plv8Exists -eq '1') {
    Write-Host "[Backup] Dumping plv8 function definitions" -ForegroundColor Yellow
    $plv8File = Join-Path $OutputDir 'plv8_functions_backup.sql'
    $plv8Query = @'
SELECT format(
  'CREATE OR REPLACE FUNCTION %I.%I(%s) RETURNS %s AS %L LANGUAGE plv8;',
  n.nspname,
  p.proname,
  pg_get_function_arguments(p.oid),
  pg_get_function_result(p.oid),
  p.prosrc
)
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.prolang = (SELECT oid FROM pg_language WHERE lanname = 'plv8');
'@
    $plv8Sql = & psql "$DatabaseUrl" -At -c $plv8Query 2>&1
    Set-Content -Path $plv8File -Value $plv8Sql
    Write-Host "[Backup] plv8 functions saved to $plv8File" -ForegroundColor Green
  }
  else {
    Write-Host "[Backup] plv8 extension not installed - skipping" -ForegroundColor Gray
    $plv8File = Join-Path $OutputDir 'plv8_functions_backup.sql'
    Set-Content -Path $plv8File -Value "-- plv8 extension not installed at backup time"
  }
}

if ($IncludeTimescaleMetadata) {
  Write-Host "[Backup] Checking for TimescaleDB extension..." -ForegroundColor Yellow
  
  # Check if timescaledb exists
  $tsExists = & psql "$DatabaseUrl" -At -c "SELECT 1 FROM pg_extension WHERE extname = 'timescaledb';" 2>$null
  
  if ($tsExists -eq '1') {
    Write-Host "[Backup] Dumping TimescaleDB hypertable metadata" -ForegroundColor Yellow
    $tsFile = Join-Path $OutputDir 'timescaledb_hypertables.csv'
    $tsQuery = @'
SELECT format('%I.%I', schemaname, tablename) as hypertable,
       chunk_count,
       compression_state
FROM timescaledb_information.hypertables;
'@
    & psql "$DatabaseUrl" -c "COPY ($tsQuery) TO STDOUT WITH CSV HEADER" > $tsFile 2>&1
    Write-Host "[Backup] Hypertables saved to $tsFile" -ForegroundColor Green

    $jobFile = Join-Path $OutputDir 'timescaledb_jobs.csv'
    $jobQuery = 'SELECT * FROM timescaledb_information.job_stats;'
    & psql "$DatabaseUrl" -c "COPY ($jobQuery) TO STDOUT WITH CSV HEADER" > $jobFile 2>&1
    Write-Host "[Backup] Job stats saved to $jobFile" -ForegroundColor Green
  }
  else {
    Write-Host "[Backup] TimescaleDB extension not installed - skipping" -ForegroundColor Gray
    $tsFile = Join-Path $OutputDir 'timescaledb_hypertables.csv'
    Set-Content -Path $tsFile -Value "# TimescaleDB extension not installed at backup time"
  }
}

Write-Host "[Backup] Extension backup operations completed." -ForegroundColor Cyan
