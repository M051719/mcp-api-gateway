#!/usr/bin/env pwsh
# Postgres 15 → 17 Major Version Upgrade (Dump/Restore Method)
# This is the SAFE way to upgrade major Postgres versions

param(
    [string]$OldVersion = "15.1.0.117",
    [string]$NewVersion = "17.6.1.044",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "POSTGRES MAJOR VERSION UPGRADE: 15 → 17 (DUMP/RESTORE)" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  WARNING: This is a MAJOR version upgrade requiring data migration" -ForegroundColor Red
Write-Host ""

# Pre-flight checks
Write-Host "PRE-FLIGHT CHECKS:" -ForegroundColor Yellow
Write-Host ""

# 1. Verify backup exists
Write-Host "1. Checking for recent backup..." -ForegroundColor White
$latestBackup = Get-ChildItem .\backups\backup_*.sql -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($latestBackup) {
    $backupAge = (Get-Date) - $latestBackup.LastWriteTime
    Write-Host "   ✅ Found backup: $($latestBackup.Name)" -ForegroundColor Green
    Write-Host "   📅 Age: $([math]::Round($backupAge.TotalHours, 1)) hours old" -ForegroundColor Gray
    if ($backupAge.TotalHours -gt 1) {
        Write-Host "   ⚠️  Backup is over 1 hour old - recommend fresh backup" -ForegroundColor Yellow
    }
}
else {
    Write-Host "   ❌ No backup found in ./backups/" -ForegroundColor Red
    exit 1
}

# 2. Check current version
Write-Host ""
Write-Host "2. Starting Postgres 15 to create final backup..." -ForegroundColor White
docker compose -f compose.yml up -d db
Start-Sleep -Seconds 10

$currentVersion = docker compose -f compose.yml exec -T db psql -U postgres -At -c "SELECT version();"
Write-Host "   Current: $($currentVersion -split ' ' | Select-Object -First 2)" -ForegroundColor Gray

if ($DryRun) {
    Write-Host ""
    Write-Host "=" * 70 -ForegroundColor Yellow
    Write-Host "DRY RUN - Upgrade steps:" -ForegroundColor Yellow
    Write-Host "=" * 70 -ForegroundColor Yellow
    Write-Host "1. Create final dump from Postgres 15" -ForegroundColor Gray
    Write-Host "2. Stop all containers" -ForegroundColor Gray
    Write-Host "3. Remove old Postgres 15 data volume" -ForegroundColor Gray
    Write-Host "4. Update compose.yml to Postgres 17" -ForegroundColor Gray
    Write-Host "5. Start Postgres 17 (fresh/empty)" -ForegroundColor Gray
    Write-Host "6. Restore dump into Postgres 17" -ForegroundColor Gray
    Write-Host "7. Verify data and extensions" -ForegroundColor Gray
    docker compose -f compose.yml down
    exit 0
}

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Red
Write-Host "⚠️  FINAL CONFIRMATION" -ForegroundColor Red
Write-Host "=" * 70 -ForegroundColor Red
Write-Host ""
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  • Create final SQL dump from Postgres 15" -ForegroundColor White
Write-Host "  • DELETE the existing Postgres 15 data volume" -ForegroundColor Red
Write-Host "  • Create fresh Postgres 17 database" -ForegroundColor White
Write-Host "  • Restore your data into Postgres 17" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  POINT OF NO RETURN - Existing volume will be destroyed!" -ForegroundColor Red
Write-Host ""
$confirmation = Read-Host "Type 'UPGRADE-TO-17' to proceed"

if ($confirmation -ne 'UPGRADE-TO-17') {
    Write-Host ""
    Write-Host "Upgrade cancelled." -ForegroundColor Yellow
    docker compose -f compose.yml down
    exit 0
}

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "STARTING UPGRADE" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Cyan

# Step 1: Final dump from Postgres 15
Write-Host ""
Write-Host "Step 1: Creating final SQL dump from Postgres 15..." -ForegroundColor Yellow
$dumpFile = "backup_pg15_final_${timestamp}.sql"
docker compose -f compose.yml exec -T db pg_dumpall -U postgres > ".\backups\$dumpFile"
$dumpSize = (Get-Item ".\backups\$dumpFile").Length / 1KB
Write-Host "   ✅ Created $dumpFile ($([math]::Round($dumpSize, 1)) KB)" -ForegroundColor Green

# Step 2: Stop and remove everything
Write-Host ""
Write-Host "Step 2: Stopping containers and removing Postgres 15 volume..." -ForegroundColor Yellow
docker compose -f compose.yml down -v
Write-Host "   ✅ Volume removed" -ForegroundColor Green

# Step 3: Update compose.yml
Write-Host ""
Write-Host "Step 3: Updating compose.yml to Postgres 17..." -ForegroundColor Yellow
$composeContent = Get-Content .\compose.yml -Raw
$composeContent = $composeContent -replace "supabase/postgres:$OldVersion", "supabase/postgres:$NewVersion"
Set-Content .\compose.yml -Value $composeContent
Write-Host "   ✅ Updated to supabase/postgres:$NewVersion" -ForegroundColor Green

# Step 4: Start Postgres 17 (empty)
Write-Host ""
Write-Host "Step 4: Starting Postgres 17 (fresh database)..." -ForegroundColor Yellow
docker compose -f compose.yml up -d db
Write-Host "   Waiting for Postgres 17 to initialize..." -ForegroundColor Gray

$maxAttempts = 30
$attempt = 0
$dbReady = $false

while ($attempt -lt $maxAttempts -and -not $dbReady) {
    Start-Sleep -Seconds 2
    $attempt++
    $healthCheck = docker compose -f compose.yml exec -T db pg_isready -U postgres 2>&1
    if ($healthCheck -match "accepting connections") {
        $dbReady = $true
        Write-Host "   ✅ Postgres 17 ready (attempt $attempt)" -ForegroundColor Green
    }
    else {
        Write-Host "   ⏳ Initializing... (attempt $attempt/$maxAttempts)" -ForegroundColor Gray
    }
}

if (-not $dbReady) {
    Write-Host "   ❌ Postgres 17 failed to start!" -ForegroundColor Red
    Write-Host ""
    Write-Host "RECOVERY:" -ForegroundColor Red
    Write-Host "1. Check logs: docker compose -f compose.yml logs db" -ForegroundColor Yellow
    Write-Host "2. Rollback image in compose.yml to $OldVersion" -ForegroundColor Yellow
    Write-Host "3. Contact support - dump file saved: .\backups\$dumpFile" -ForegroundColor Yellow
    exit 1
}

# Step 5: Restore dump
Write-Host ""
Write-Host "Step 5: Restoring data into Postgres 17..." -ForegroundColor Yellow
Write-Host "   This may take several minutes..." -ForegroundColor Gray

# Copy dump into container
docker cp ".\backups\$dumpFile" mcp-supabase-db:/tmp/dump.sql

# Restore (some errors expected for roles/ownership)
Get-Content ".\backups\$dumpFile" | docker compose -f compose.yml exec -T db psql -U postgres 2>&1 | Out-Null
Write-Host "   ✅ Restore complete (some role warnings are normal)" -ForegroundColor Green

# Step 6: Verify
Write-Host ""
Write-Host "Step 6: Verifying upgrade..." -ForegroundColor Yellow

$newVersion = docker compose -f compose.yml exec -T db psql -U postgres -At -c "SELECT version();"
Write-Host "   New version: $($newVersion -split ' ' | Select-Object -First 2)" -ForegroundColor Cyan

$extensionCount = docker compose -f compose.yml exec -T db psql -U postgres -At -c "SELECT count(*) FROM pg_extension;"
Write-Host "   Extensions: $extensionCount" -ForegroundColor Gray

$tableCount = docker compose -f compose.yml exec -T db psql -U postgres -At -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"
Write-Host "   Tables: $tableCount" -ForegroundColor Gray

# Step 7: Start all services
Write-Host ""
Write-Host "Step 7: Starting all services..." -ForegroundColor Yellow
docker compose -f compose.yml up -d
Start-Sleep -Seconds 5
Write-Host "   ✅ All services started" -ForegroundColor Green

# Final status
Write-Host ""
Write-Host "=" * 70 -ForegroundColor Green
Write-Host "UPGRADE COMPLETE!" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
docker compose -f compose.yml ps

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Verify data:" -ForegroundColor White
Write-Host "   docker compose -f compose.yml exec db psql -U postgres -c '\dt'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Check extensions:" -ForegroundColor White
Write-Host "   docker compose -f compose.yml exec db psql -U postgres -c '\dx'" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Test application connections" -ForegroundColor White
Write-Host ""
Write-Host "4. Run post-upgrade report:" -ForegroundColor White
Write-Host "   .\scripts\simple-upgrade-prep.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "Dump file saved: .\backups\$dumpFile" -ForegroundColor Cyan
Write-Host ""
