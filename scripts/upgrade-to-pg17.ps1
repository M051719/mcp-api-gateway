#!/usr/bin/env pwsh
# Postgres 15 → 17 Upgrade Procedure
# CRITICAL: Ensure all backups are complete before running

param(
    [string]$OldVersion = "15.1.0.117",
    [string]$NewVersion = "17.0.0.141",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "SUPABASE POSTGRES UPGRADE: 15 → 17" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Cyan
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
    if ($backupAge.TotalHours -gt 24) {
        Write-Host "   ⚠️  Backup is over 24 hours old - consider creating fresh backup" -ForegroundColor Yellow
    }
}
else {
    Write-Host "   ❌ No backup found in ./backups/" -ForegroundColor Red
    Write-Host "   Run: .\scripts\simple-upgrade-prep.ps1 first!" -ForegroundColor Red
    exit 1
}

# 2. Check container status
Write-Host ""
Write-Host "2. Checking container status..." -ForegroundColor White
$dbStatus = docker ps -a --filter "name=mcp-supabase-db" --format "{{.Status}}"
if ($dbStatus -match "Up") {
    Write-Host "   ✅ Database container running" -ForegroundColor Green
}
else {
    Write-Host "   ⚠️  Database container not running: $dbStatus" -ForegroundColor Yellow
}

# 3. Document current state
Write-Host ""
Write-Host "3. Documenting current state..." -ForegroundColor White
$preUpgradeVersion = docker compose -f compose.yml exec -T db psql -U postgres -At -c "SELECT version();" 2>$null
Write-Host "   Current: $($preUpgradeVersion -split ' ' | Select-Object -First 2)" -ForegroundColor Gray

# 4. Check compose.yml current image
Write-Host ""
Write-Host "4. Checking compose.yml configuration..." -ForegroundColor White
$currentImage = Select-String -Path .\compose.yml -Pattern "image:\s*supabase/postgres:(\S+)" | ForEach-Object { $_.Matches.Groups[1].Value }
Write-Host "   Current image: supabase/postgres:$currentImage" -ForegroundColor Gray
Write-Host "   Target image:  supabase/postgres:$NewVersion" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host ""
    Write-Host "=" * 70 -ForegroundColor Yellow
    Write-Host "DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host "=" * 70 -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Upgrade steps that would be performed:" -ForegroundColor Cyan
    Write-Host "1. Stop all containers" -ForegroundColor Gray
    Write-Host "2. Create final pre-upgrade backup" -ForegroundColor Gray
    Write-Host "3. Update compose.yml image to supabase/postgres:$NewVersion" -ForegroundColor Gray
    Write-Host "4. Pull new image" -ForegroundColor Gray
    Write-Host "5. Start database container" -ForegroundColor Gray
    Write-Host "6. Verify extensions and data" -ForegroundColor Gray
    Write-Host "7. Start remaining services" -ForegroundColor Gray
    exit 0
}

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Red
Write-Host "⚠️  READY TO UPGRADE - FINAL CONFIRMATION" -ForegroundColor Red
Write-Host "=" * 70 -ForegroundColor Red
Write-Host ""
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  • Stop all Docker containers" -ForegroundColor White
Write-Host "  • Upgrade Postgres from 15.1 → 17.0" -ForegroundColor White
Write-Host "  • Restart with new image" -ForegroundColor White
Write-Host ""
Write-Host "Backup available: $($latestBackup.Name)" -ForegroundColor Cyan
Write-Host ""
$confirmation = Read-Host "Type 'UPGRADE' to proceed"

if ($confirmation -ne 'UPGRADE') {
    Write-Host ""
    Write-Host "Upgrade cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "STARTING UPGRADE PROCESS" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Cyan

# Step 1: Stop all services
Write-Host ""
Write-Host "Step 1: Stopping all services..." -ForegroundColor Yellow
docker compose -f compose.yml down
Write-Host "   ✅ Services stopped" -ForegroundColor Green

# Step 2: Create final backup
Write-Host ""
Write-Host "Step 2: Creating final pre-upgrade backup..." -ForegroundColor Yellow
docker compose -f compose.yml up -d db
Start-Sleep -Seconds 10
$finalBackup = "backup_pre_pg17_${timestamp}.sql"
docker compose -f compose.yml exec -T db pg_dump -U postgres -Fc postgres > ".\backups\$finalBackup"
$backupSize = (Get-Item ".\backups\$finalBackup").Length / 1KB
Write-Host "   ✅ Created $finalBackup ($([math]::Round($backupSize, 1)) KB)" -ForegroundColor Green
docker compose -f compose.yml down

# Step 3: Update compose.yml
Write-Host ""
Write-Host "Step 3: Updating compose.yml..." -ForegroundColor Yellow
$composeContent = Get-Content .\compose.yml -Raw
$composeContent = $composeContent -replace "supabase/postgres:$currentImage", "supabase/postgres:$NewVersion"
Set-Content .\compose.yml -Value $composeContent
Write-Host "   ✅ Updated image to supabase/postgres:$NewVersion" -ForegroundColor Green

# Step 4: Pull new image
Write-Host ""
Write-Host "Step 4: Pulling Postgres 17 image..." -ForegroundColor Yellow
docker compose -f compose.yml pull db
Write-Host "   ✅ Image pulled" -ForegroundColor Green

# Step 5: Start database
Write-Host ""
Write-Host "Step 5: Starting database with Postgres 17..." -ForegroundColor Yellow
docker compose -f compose.yml up -d db
Write-Host "   Waiting for database to be ready..." -ForegroundColor Gray

# Wait for database
$maxAttempts = 30
$attempt = 0
$dbReady = $false

while ($attempt -lt $maxAttempts -and -not $dbReady) {
    Start-Sleep -Seconds 2
    $attempt++
    $healthCheck = docker compose -f compose.yml exec -T db pg_isready -U postgres 2>&1
    if ($healthCheck -match "accepting connections") {
        $dbReady = $true
        Write-Host "   ✅ Database accepting connections (attempt $attempt)" -ForegroundColor Green
    }
    else {
        Write-Host "   ⏳ Waiting... (attempt $attempt/$maxAttempts)" -ForegroundColor Gray
    }
}

if (-not $dbReady) {
    Write-Host "   ❌ Database failed to start!" -ForegroundColor Red
    Write-Host ""
    Write-Host "ROLLBACK INSTRUCTIONS:" -ForegroundColor Red
    Write-Host "1. docker compose -f compose.yml down" -ForegroundColor Yellow
    Write-Host "2. Edit compose.yml - change image back to supabase/postgres:$currentImage" -ForegroundColor Yellow
    Write-Host "3. docker compose -f compose.yml up -d" -ForegroundColor Yellow
    exit 1
}

# Step 6: Verify upgrade
Write-Host ""
Write-Host "Step 6: Verifying upgrade..." -ForegroundColor Yellow

$newVersion = docker compose -f compose.yml exec -T db psql -U postgres -At -c "SELECT version();"
Write-Host "   New version: $($newVersion -split ' ' | Select-Object -First 2)" -ForegroundColor Cyan

$extensionCount = docker compose -f compose.yml exec -T db psql -U postgres -At -c "SELECT count(*) FROM pg_extension;"
Write-Host "   Extensions: $extensionCount installed" -ForegroundColor Gray

$tableCount = docker compose -f compose.yml exec -T db psql -U postgres -At -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"
Write-Host "   Tables: $tableCount in public schema" -ForegroundColor Gray

# Step 7: Start remaining services
Write-Host ""
Write-Host "Step 7: Starting remaining services..." -ForegroundColor Yellow
docker compose -f compose.yml up -d
Start-Sleep -Seconds 5
Write-Host "   ✅ All services started" -ForegroundColor Green

# Final status
Write-Host ""
Write-Host "=" * 70 -ForegroundColor Green
Write-Host "UPGRADE COMPLETE!" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Green
Write-Host ""
Write-Host "Post-upgrade verification:" -ForegroundColor Yellow
docker compose -f compose.yml ps

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run: .\scripts\simple-upgrade-prep.ps1" -ForegroundColor White
Write-Host "   (Compare extension versions before/after)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test MCP integration:" -ForegroundColor White
Write-Host "   .\scripts\test-mcp-integration.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Monitor logs for errors:" -ForegroundColor White
Write-Host "   docker compose -f compose.yml logs -f db" -ForegroundColor Gray
Write-Host ""
