# Postgres Major Upgrade Checklist (repo helpers)

This document summarizes the recommended steps and shows how to use the helper scripts included in this repository to prepare for a Postgres major upgrade (e.g. moving to Postgres 16/17 or Supabase's in-place upgrade).

Important: Always test the full flow on a staging copy of your database before touching production.

## What these scripts do
- `scripts/check_extensions.sql` — Inventory extensions, list reg* type usage, and show counts for `cron.job` and `cron.job_run_details`.
- `scripts/archive_pg_cron.sql` — Create an archive table for `cron.job_run_details` and insert older rows.
- `scripts/prune_pg_cron_batch_delete.sql` — Delete old rows in safe batches to avoid massive transactions.
- `scripts/migrate_md5_roles.sql` — Find roles using `md5` hashed passwords and generate `ALTER ROLE` suggestions.
- `scripts/report_extensions.sh` / `scripts/report_extensions.ps1` — Convenience scripts to run the inventory and create a `tmp/upgrade_report` with outputs.
- `scripts/export_job_run_details.ps1` — PowerShell helper to export old `job_run_details` rows to CSV and optionally delete them.

## Quick start (staging)
1. Set `DATABASE_URL` to the staging DB connection string (PG-style):

```powershell
$env:DATABASE_URL = 'postgresql://user:pass@host:5432/dbname'
# or in bash
export DATABASE_URL='postgresql://user:pass@host:5432/dbname'
```

2. Run the inventory and save report (bash):

```bash
./scripts/report_extensions.sh
# or PowerShell (Windows)
powershell -File .\scripts\report_extensions.ps1
```

3. Inspect `tmp/upgrade_report/extension_report.txt` for any `reg*` type usage or problematic extensions.

4. If `cron.job_run_details` is large, archive old rows first:

```bash
# Export to CSV (PowerShell helper)
$env:DATABASE_URL = '...'
# export only (no delete):
powershell -File .\scripts\export_job_run_details.ps1 -Days 90

# To export and delete (careful):
powershell -File .\scripts\export_job_run_details.ps1 -Days 90 -Delete
```

Or use SQL archiving directly (psql):
```bash
psql "$DATABASE_URL" -v threshold_days=90 -f scripts/archive_pg_cron.sql
```

After archiving, run the batch delete script if you choose to delete:
```bash
psql "$DATABASE_URL" -v days=90 -f scripts/prune_pg_cron_batch_delete.sql
```

5. Check extension versions:

```bash
psql "$DATABASE_URL" -c "SELECT extname, extversion FROM pg_extension;"
```

Compare `timescaledb` and `plv8` versions to the minimums required by your target Postgres version. If they are older than required, plan to drop and recreate these extensions as part of the upgrade workflow.

6. Find roles using md5 and plan migration

```bash
psql "$DATABASE_URL" -f scripts/migrate_md5_roles.sql
```

This prints `ALTER ROLE` suggestions. DO NOT run them until you have verified application credential updates. When ready, run `ALTER ROLE some_user WITH PASSWORD '<new-password>';` to move that role to `scram-sha-256`.

## Backup recommendations
- Take a Supabase snapshot and verify restore on staging.
- Take logical backups:
  - `pg_dumpall -g > globals.sql` (global objects & roles)
  - `pg_dump -Fc -f db.dump <dbname>` (database dump)
- Keep a copy off-cluster.

## Simulate duplication scenario
If `cron.job_run_details` is very large, test duplicating it on staging to verify you have sufficient disk space during the in-place duplicate step used by the upgrade.

## Post-upgrade checks
- Re-run `scripts/check_extensions.sql` and verify all extensions and reg* references.
- Recreate or update any extensions if the upgrade process required dropping them.
- Confirm application connectivity and that roles using `md5` were migrated or updated.

## Notes & caveats
- Dropping extensions with `CASCADE` can remove dependent objects. Always test on staging and have backups.
- For TimescaleDB and plv8, follow vendor upgrade guidance for binary dependencies and extension-specific upgrade steps.

## Example environment variables for CI / StackHawk
Add these to your environment when running scans or CI checks (example values):

```
# StackHawk
STACKHAWK_API_KEY=hawk.your_stackhawk_api_key_here
STACKHAWK_APP_ID=your_app_id_here
STACKHAWK_ENVIRONMENT=development
STACKHAWK_TEST_EMAIL=test@repmotivatedseller.org
STACKHAWK_TEST_PASSWORD=SecureTestPassword123!
STACKHAWK_SLACK_WEBHOOK=https://hooks.slack.com/your/slack/webhook
```

## Next steps I can do for you
- Create a tested staging runbook (step-by-step script) to perform the archive and extension drop/recreate process.
- Create a small CI job that runs `report_extensions.sh` on PRs and fails if `cron.job_run_details` exceeds a threshold.

If you want, I can now:
- (1) add a PR-check GitHub Actions job that runs `report_extensions.sh` and fails when `cron.job_run_details` size > threshold, and
- (2) create a staging runbook script that automates the archive -> delete -> vacuum -> backup steps.

Pick which follow-up you want next.
