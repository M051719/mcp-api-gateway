# report_extensions.ps1
# PowerShell version of the report script. Usage: $env:DATABASE_URL = '...' ; .\scripts\report_extensions.ps1
param()

if (-not $env:DATABASE_URL) {
    Write-Error "Please set DATABASE_URL environment variable"
    exit 2
}

$OutDir = Join-Path -Path $PSScriptRoot -ChildPath '..\tmp\upgrade_report'
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
$OutDir = Resolve-Path -LiteralPath $OutDir

Write-Host "Running extension & reg* inventory..."
$reportPath = Join-Path $OutDir 'extension_report.txt'
$sqlFile = Join-Path $PSScriptRoot 'check_extensions.sql'
psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -f "$sqlFile" | Out-File -FilePath $reportPath -Encoding utf8
Write-Host "Report written to $reportPath"

# Try to export a small sample of cron.job_run_details
$sampleCsv = Join-Path $OutDir 'cron_job_run_details_sample.csv'
try {
    $copyCmd = "\copy (SELECT * FROM cron.job_run_details LIMIT 100) TO '$sampleCsv' CSV HEADER"
    psql "$env:DATABASE_URL" -c $copyCmd
    Write-Host "Sample export saved to $sampleCsv"
}
catch {
    Write-Host "cron schema or table not present or export failed: $_"
}

Write-Host "Done."