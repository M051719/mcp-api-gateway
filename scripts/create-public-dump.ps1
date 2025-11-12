#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Create public-only database dumps with row counts
.DESCRIPTION
    Generates three artifacts from the running compose db:
    - Custom format dump (-Fc) for pg_restore
    - Portable SQL with --column-inserts 
    - Row counts CSV snapshot
#>
param(
    [string]$Service = "db",
    [string]$Database = "postgres",
    [string]$User = "postgres",
    [string]$Timestamp,
    [ValidateSet('Optimal', 'Fastest', 'NoCompression')] [string]$CompressionLevel = 'Optimal',
    [switch]$Encrypt,
    [string]$AgeRecipient,
    [string]$GpgRecipient,
    [switch]$RemovePlaintext
)
$ErrorActionPreference = "Stop"

if (-not (Test-Path './backups')) { New-Item -ItemType Directory -Path './backups' | Out-Null }
$ts = if ($Timestamp) { $Timestamp } else { Get-Date -Format 'yyyyMMdd_HHmmss' }
$outFile = Join-Path (Get-Location) ("backups/public_only_${ts}.dump")

Write-Host "Creating public-only dumps from compose service '$Service'..." -ForegroundColor Yellow
$remote = "/tmp/public_only_${ts}.dump"

Write-Host "Ensuring database service is up..." -ForegroundColor Gray
try { docker compose up -d $Service | Out-Null } catch {}
Start-Sleep -Seconds 2

# 1) Custom format (-Fc)
Write-Host "Creating custom format dump..." -ForegroundColor Gray
$cmdFc = "pg_dump -U $User -d $Database -n public -Fc -f $remote"
docker compose exec -T $Service sh -lc $cmdFc

# 2) Portable SQL with --column-inserts
Write-Host "Creating portable SQL dump..." -ForegroundColor Gray
$remoteSql = "/tmp/public_only_${ts}.sql"
$cmdSql = "pg_dump -U $User -d $Database -n public --column-inserts -f $remoteSql"
docker compose exec -T $Service sh -lc $cmdSql

# 3) Row counts snapshot - direct to filesystem
Write-Host "Capturing row counts..." -ForegroundColor Gray
$countsPath = Join-Path (Get-Location) ("backups/public_only_${ts}_counts.csv")
docker compose exec -T $Service psql -U $User -d $Database -At -F ',' -c "SELECT schemaname||'.'||relname, n_live_tup FROM pg_stat_user_tables WHERE schemaname='public' ORDER BY relname;" | Out-File -Encoding utf8 "$countsPath"

# Derive JSON summary from counts CSV
$jsonPath = Join-Path (Get-Location) ("backups/public_only_${ts}_counts.json")
$countsMap = @{}
$totalRows = 0
if (Test-Path $countsPath) {
    Get-Content $countsPath | Where-Object { $_ -match '^[^,]+,\d+$' } | ForEach-Object {
        $parts = $_.Split(',')
        $table = $parts[0]
        $count = [int]$parts[1]
        $countsMap[$table] = $count
        $totalRows += $count
    }
}
$summary = [ordered]@{
    timestamp = $ts
    database  = $Database
    schema    = 'public'
    tables    = $countsMap.Keys.Count
    totalRows = $totalRows
    counts    = $countsMap
}
$summary | ConvertTo-Json -Depth 4 | Out-File -Encoding utf8 $jsonPath

# Copy back
Write-Host "Copying dumps to backups ..." -ForegroundColor Gray
docker cp "mcp-supabase-${Service}:$remote" "$outFile"
docker cp "mcp-supabase-${Service}:$remoteSql" "$($outFile -replace '\.dump$','.sql')"

# Cleanup
try { docker compose exec -T $Service sh -lc "rm -f $remote $remoteSql" | Out-Null } catch {}

# Helper: gzip compression
function Compress-Gzip {
    param([string]$InputPath, [string]$OutputPath, [string]$Level = 'Optimal')
    $inStream = [System.IO.File]::OpenRead($InputPath)
    $outStream = [System.IO.File]::Create($OutputPath)
    try {
        $compressionLevel = switch ($Level) {
            'Optimal' { [System.IO.Compression.CompressionLevel]::Optimal }
            'Fastest' { [System.IO.Compression.CompressionLevel]::Fastest }
            'NoCompression' { [System.IO.Compression.CompressionLevel]::NoCompression }
            default { [System.IO.Compression.CompressionLevel]::Optimal }
        }
        $gzip = New-Object System.IO.Compression.GZipStream($outStream, $compressionLevel)
        try { $inStream.CopyTo($gzip) } finally { $gzip.Dispose() }
    }
    finally { $inStream.Dispose(); $outStream.Dispose() }
}

# Helper: sha256
function Write-HashLine {
    param([string]$Path, [System.IO.StreamWriter]$Writer)
    $h = Get-FileHash -Algorithm SHA256 -Path $Path
    $name = Split-Path -Leaf $Path
    $Writer.WriteLine("$($h.Hash.ToLower())  $name")
}

$sqlPath = ($outFile -replace '\.dump$', '.sql')
$sizeCountsKB = [math]::Round((Get-Item $countsPath).Length / 1KB, 2)
$sizeJsonKB = [math]::Round((Get-Item $jsonPath).Length / 1KB, 2)

# Compress large artifacts
$dumpGz = "$outFile.gz"
$sqlGz = "$sqlPath.gz"
Compress-Gzip -InputPath $outFile -OutputPath $dumpGz -Level $CompressionLevel
Compress-Gzip -InputPath $sqlPath -OutputPath $sqlGz -Level $CompressionLevel
Remove-Item $outFile, $sqlPath -Force

# Manifest
$manifestPath = Join-Path (Get-Location) ("backups/manifest_public_only_${ts}.sha256")
$writer = New-Object System.IO.StreamWriter($manifestPath, $false, (New-Object System.Text.UTF8Encoding($false)))
try {
    Write-HashLine -Path $dumpGz -Writer $writer
    Write-HashLine -Path $sqlGz -Writer $writer
    if (Test-Path $countsPath) { Write-HashLine -Path $countsPath -Writer $writer }
    if (Test-Path $jsonPath) { Write-HashLine -Path $jsonPath   -Writer $writer }
}
finally { $writer.Dispose() }

# Optional encryption
function Test-CommandAvailable {
    param([string]$Name)
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Protect-BackupFile {
    param(
        [string]$InputPath,
        [string]$AgeRecipient,
        [string]$GpgRecipient
    )
    if ($AgeRecipient) {
        if (-not (Test-CommandAvailable 'age')) { throw "'age' not found in PATH" }
        $outPath = "$InputPath.age"
        & age -r $AgeRecipient -o $outPath $InputPath | Out-Null
        return $outPath
    }
    elseif ($GpgRecipient) {
        if (-not (Test-CommandAvailable 'gpg')) { throw "'gpg' not found in PATH" }
        $outPath = "$InputPath.gpg"
        & gpg --yes --batch --output $outPath --encrypt --recipient $GpgRecipient $InputPath | Out-Null
        return $outPath
    }
    else {
        throw "Protect-BackupFile called without recipient"
    }
}

if ($Encrypt) {
    if (-not ($AgeRecipient -or $GpgRecipient)) { throw "Encryption requested but no -AgeRecipient or -GpgRecipient provided." }
    Write-Host "Encrypting public-only artifacts..." -ForegroundColor Yellow
    $encTargets = @()
    foreach ($p in @($dumpGz, $sqlGz, $countsPath, $jsonPath, $manifestPath)) { if (Test-Path $p) { $encTargets += $p } }
    $encOutputs = @()
    foreach ($p in $encTargets) {
        try { $encOutputs += (Protect-BackupFile -InputPath $p -AgeRecipient $AgeRecipient -GpgRecipient $GpgRecipient) }
        catch { Write-Host "  ⚠️  Failed to encrypt $(Split-Path -Leaf $p): $($_.Exception.Message)" -ForegroundColor Yellow }
    }
    if ($RemovePlaintext) {
        foreach ($p in $encTargets) { try { Remove-Item $p -Force } catch {} }
    }
}

Write-Host "`n✅ CREATED:" -ForegroundColor Green
Write-Host "   $(Split-Path -Leaf $dumpGz) ($([math]::Round((Get-Item $dumpGz).Length/1KB,2)) KB)" -ForegroundColor White
Write-Host "   $(Split-Path -Leaf $sqlGz) ($([math]::Round((Get-Item $sqlGz).Length/1KB,2)) KB)" -ForegroundColor White
Write-Host "   $(Split-Path -Leaf $countsPath) ($sizeCountsKB KB)" -ForegroundColor White
Write-Host "   $(Split-Path -Leaf $jsonPath) ($sizeJsonKB KB)" -ForegroundColor White
Write-Host "   $(Split-Path -Leaf $manifestPath)" -ForegroundColor White
Write-Host "   Summary: tables=$($summary.tables) totalRows=$($summary.totalRows)" -ForegroundColor Cyan
