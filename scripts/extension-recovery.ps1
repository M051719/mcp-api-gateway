[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$DatabaseUrl,
    [switch]$DropTimescale,
    [switch]$DropPlv8
)

$ErrorActionPreference = 'Stop'

function Invoke-PostgresNonQuery {
    param([string]$Sql)
    & psql "$DatabaseUrl" -v ON_ERROR_STOP=1 -c $Sql | Out-Null
}

Write-Host "[Recovery] Checking/repairing extensions..." -ForegroundColor Cyan

try {
    if ($DropTimescale) {
        Write-Host "[Recovery] Dropping TimescaleDB (CASCADE)" -ForegroundColor Yellow
        Invoke-PostgresNonQuery -Sql 'DROP EXTENSION IF EXISTS timescaledb CASCADE;'
    }
    Write-Host "[Recovery] Ensuring TimescaleDB installed" -ForegroundColor Yellow
    Invoke-PostgresNonQuery -Sql "CREATE EXTENSION IF NOT EXISTS timescaledb;"
    Invoke-PostgresNonQuery -Sql "ALTER EXTENSION timescaledb UPDATE;"
    Write-Host "[Recovery] TimescaleDB OK" -ForegroundColor Green
}
catch {
    Write-Warning "[Recovery] TimescaleDB error: $($_.Exception.Message)"
}

try {
    if ($DropPlv8) {
        Write-Host "[Recovery] Dropping plv8 (CASCADE)" -ForegroundColor Yellow
        Invoke-PostgresNonQuery -Sql 'DROP EXTENSION IF EXISTS plv8 CASCADE;'
    }
    Write-Host "[Recovery] Ensuring plv8 installed" -ForegroundColor Yellow
    Invoke-PostgresNonQuery -Sql "CREATE EXTENSION IF NOT EXISTS plv8;"
    Invoke-PostgresNonQuery -Sql "ALTER EXTENSION plv8 UPDATE;"
    Write-Host "[Recovery] plv8 OK" -ForegroundColor Green
}
catch {
    Write-Warning "[Recovery] plv8 error: $($_.Exception.Message)"
}

Write-Host "[Recovery] Extension check/repair completed." -ForegroundColor Cyan
