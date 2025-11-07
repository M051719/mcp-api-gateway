#!/usr/bin/env bash
# report_extensions.sh
# Usage: DATABASE_URL=... ./scripts/report_extensions.sh
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Please set DATABASE_URL environment variable"
  exit 2
fi

OUT_DIR="./tmp/upgrade_report"
mkdir -p "$OUT_DIR"

echo "Running extension & reg* inventory..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/check_extensions.sql > "$OUT_DIR/extension_report.txt"

echo "Report written to $OUT_DIR/extension_report.txt"

# Optional: Fetch the first N rows of cron.job_run_details for inspection (if cron schema exists)
psql "$DATABASE_URL" -c "\copy (SELECT * FROM cron.job_run_details LIMIT 100) TO '$OUT_DIR/cron_job_run_details_sample.csv' CSV HEADER" || true

echo "Sample export (if any) saved to $OUT_DIR/cron_job_run_details_sample.csv"

echo "Done." 
