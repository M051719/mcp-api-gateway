[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$DatabaseUrl,
  [string]$OutputDir = './extension_backups',
  [switch]$IncludeTimescaleMetadata,
  [switch]$IncludePlv8Functions
)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir | Out-Null }

function Invoke-PostgresQuery {
  param([string]$Query)
  $env:PGOPTIONS='-c search_path=public'
  $result = & psql "$DatabaseUrl" -At -F '|' -c $Query 2>$null
  return $result
}

Write-Host "[Backup] Starting extension metadata backup..." -ForegroundColor Cyan

if ($IncludePlv8Functions) {
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
  $plv8Sql = & psql "$DatabaseUrl" -At -c $plv8Query
  Set-Content -Path $plv8File -Value $plv8Sql
  Write-Host "[Backup] plv8 functions saved to $plv8File" -ForegroundColor Green
}

if ($IncludeTimescaleMetadata) {
  Write-Host "[Backup] Dumping TimescaleDB hypertable metadata" -ForegroundColor Yellow
  $tsFile = Join-Path $OutputDir 'timescaledb_hypertables.csv'
  $tsQuery = @'
SELECT format('%I.%I', schemaname, tablename) as hypertable,
       chunk_count,
       compression_state
FROM timescaledb_information.hypertables;
'@
  & psql "$DatabaseUrl" -c "COPY ($tsQuery) TO STDOUT WITH CSV HEADER" > $tsFile
  Write-Host "[Backup] Hypertables saved to $tsFile" -ForegroundColor Green

  $jobFile = Join-Path $OutputDir 'timescaledb_jobs.csv'
  $jobQuery = 'SELECT * FROM timescaledb_information.job_stats;'
  & psql "$DatabaseUrl" -c "COPY ($jobQuery) TO STDOUT WITH CSV HEADER" > $jobFile
  Write-Host "[Backup] Job stats saved to $jobFile" -ForegroundColor Green
}

Write-Host "[Backup] Extension backup operations completed." -ForegroundColor Cyan
