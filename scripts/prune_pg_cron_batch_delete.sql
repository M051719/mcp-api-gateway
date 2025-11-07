-- prune_pg_cron_batch_delete.sql
-- Deletes old rows from cron.job_run_details in batches to avoid huge transactions / long locks
-- Usage: psql "$DATABASE_URL" -v days=90 -f scripts/prune_pg_cron_batch_delete.sql
\set days 90
DO $$
DECLARE
  rows_deleted INT := 1;
  batch_size INT := 10000; -- tune as needed
BEGIN
  WHILE rows_deleted > 0 LOOP
    WITH del AS (
      DELETE FROM cron.job_run_details
      WHERE finished_at IS NOT NULL
        AND finished_at < now() - (:'days')::interval || ' days'
      RETURNING 1
      LIMIT batch_size
    )
    SELECT COUNT(*) INTO rows_deleted FROM del;

    RAISE INFO 'Deleted batch rows: %', rows_deleted;

    PERFORM pg_sleep(0.1); -- small pause to reduce IO pressure
  END LOOP;
END$$;

VACUUM (VERBOSE, ANALYZE) cron.job_run_details;
