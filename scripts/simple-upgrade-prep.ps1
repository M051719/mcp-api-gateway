#!/usr/bin/env pwsh
# Simple upgrade prep - validates current state and creates reports
param(
    [string]$OutDir = "tmp/upgrade_report"
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$reportFile = Join-Path $OutDir "upgrade_prep_${timestamp}.txt"

function Write-Report {
    param([string]$Message)
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host $Message
    Add-Content -Path $reportFile -Value "$ts : $Message"
}

Write-Report "========================================="
Write-Report "PRE-UPGRADE VALIDATION REPORT"
Write-Report "========================================="

# 1. Postgres Version
Write-Report ""
Write-Report "1. POSTGRES VERSION:"
$version = docker compose -f compose.yml exec -T db psql -U postgres -At -c "SELECT version();"
Write-Report $version

# 2. Extension List
Write-Report ""
Write-Report "2. INSTALLED EXTENSIONS:"
$extensions = docker compose -f compose.yml exec -T db psql -U postgres -At -F '|' -c "SELECT extname, extversion FROM pg_extension ORDER BY extname;"
$extensions | ForEach-Object { Write-Report "  $_" }

# 3. Database Size
Write-Report ""
Write-Report "3. DATABASE SIZE:"
$dbSize = docker compose -f compose.yml exec -T db psql -U postgres -At -c "SELECT pg_size_pretty(pg_database_size('postgres'));"
Write-Report "  Total: $dbSize"

# 4. Table Count
Write-Report ""
Write-Report "4. TABLE INVENTORY:"
$tableCount = docker compose -f compose.yml exec -T db psql -U postgres -At -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"
Write-Report "  Public schema tables: $tableCount"

$tables = docker compose -f compose.yml exec -T db psql -U postgres -At -F '|' -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
$tables | ForEach-Object { Write-Report "  $_" }

# 5. Check for problematic extensions
Write-Report ""
Write-Report "5. UPGRADE READINESS:"
$hasTimescale = docker compose -f compose.yml exec -T db psql -U postgres -At -c "SELECT 1 FROM pg_extension WHERE extname = 'timescaledb';"
$hasPlv8 = docker compose -f compose.yml exec -T db psql -U postgres -At -c "SELECT 1 FROM pg_extension WHERE extname = 'plv8';"
$hasPgCron = docker compose -f compose.yml exec -T db psql -U postgres -At -c "SELECT 1 FROM pg_extension WHERE extname = 'pg_cron';"

if ($hasTimescale -match '1') {
    Write-Report "  ⚠️  TimescaleDB detected - requires special upgrade procedure"
}
else {
    Write-Report "  ✅ No TimescaleDB - standard upgrade OK"
}

if ($hasPlv8 -match '1') {
    Write-Report "  ⚠️  plv8 detected - verify compatibility with target PG version"
}
else {
    Write-Report "  ✅ No plv8 - standard upgrade OK"
}

if ($hasPgCron -match '1') {
    Write-Report "  ⚠️  pg_cron detected - archive job_run_details before upgrade"
}
else {
    Write-Report "  ✅ No pg_cron - no archival needed"
}

# 6. Connection test
Write-Report ""
Write-Report "6. CONNECTION HEALTH:"
$connCount = docker compose -f compose.yml exec -T db psql -U postgres -At -c "SELECT count(*) FROM pg_stat_activity;"
Write-Report "  Active connections: $connCount"

Write-Report ""
Write-Report "========================================="
Write-Report "REPORT COMPLETE"
Write-Report "========================================="
Write-Report "Report saved to: $reportFile"

Write-Host ""
Write-Host "✅ Pre-upgrade validation complete!" -ForegroundColor Green
Write-Host "📄 Full report: $reportFile" -ForegroundColor Cyan
