-- archive_pg_cron.sql
-- Usage: set the threshold_days variable before running or pass as psql variable
-- Example: psql "$DATABASE_URL" -v threshold_days=90 -f scripts/archive_pg_cron.sql

\set threshold_days 90

-- 1) Create archive table if not exists (same structure)
CREATE TABLE IF NOT EXISTS cron.job_run_details_archive (LIKE cron.job_run_details INCLUDING ALL);

-- 2) Insert older rows into archive (use threshold_days variable)
INSERT INTO cron.job_run_details_archive
SELECT * FROM cron.job_run_details
WHERE finished_at IS NOT NULL
  AND finished_at < now() - (:'threshold_days')::interval || ' days';

-- Note: above expression mixes psql var; ensure correct invocation
-- Safer to pass a literal interval param via your client if psql var interpolation is tricky.

-- 3) After verifying archive, delete archived rows in batches (see prune script for batching)

-- 4) VACUUM analyze
VACUUM (VERBOSE, ANALYZE) cron.job_run_details;
VACUUM (VERBOSE, ANALYZE) cron.job_run_details_archive;
