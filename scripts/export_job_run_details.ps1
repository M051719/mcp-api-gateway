# export_job_run_details.ps1
# Export cron.job_run_details older than X days to CSV then optionally delete in batches.
# Usage: $env:DATABASE_URL='...'; .\scripts\export_job_run_details.ps1 -Days 90 -Delete:$false
param(
    [int]$Days = 90,
    [switch]$Delete
)
if (-not $env:DATABASE_URL) { throw 'Please set DATABASE_URL environment variable' }

$OutDir = Join-Path -Path (Resolve-Path .) -ChildPath 'tmp\upgrade_report'
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
$csv = Join-Path $OutDir ("job_run_details_older_than_{0}_days.csv" -f $Days)

$copyCmd = "\\copy (SELECT * FROM cron.job_run_details WHERE finished_at IS NOT NULL AND finished_at < now() - interval '{0} days') TO '{1}' CSV HEADER" -f $Days, $csv
Write-Host "Exporting rows older than $Days days to $csv"
psql $env:DATABASE_URL -c $copyCmd
Write-Host "Export complete"

if ($Delete) {
    Write-Host "Deleting exported rows in batches..."
    # Call the SQL batch delete script with psql var
    psql $env:DATABASE_URL -v days=$Days -f scripts/prune_pg_cron_batch_delete.sql
    Write-Host "Deletion complete. Run VACUUM manually or let maintenance run." 
}
