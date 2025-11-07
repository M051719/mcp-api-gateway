-- check_extensions.sql
-- Run this file to produce an extensions + reg* usage report

-- 1) List extension versions for target extensions
SELECT extname, extversion
FROM pg_extension
WHERE extname IN ('timescaledb', 'plv8', 'pg_cron', 'pgjwt');

-- 2) List all extensions (useful to audit other extensions)
SELECT extname, extversion FROM pg_extension ORDER BY extname;

-- 3) Find columns using reg* types
SELECT
  n.nspname AS schema,
  c.relname AS table,
  a.attname AS column,
  t.typname AS type
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_type t ON a.atttypid = t.oid
WHERE t.typname LIKE 'reg%'
  AND a.attnum > 0
  AND NOT a.attisdropped
ORDER BY n.nspname, c.relname, a.attname;

-- 4) Find functions using reg* types in args or return type
SELECT
  n.nspname AS schema,
  p.proname AS function,
  pg_get_function_arguments(p.oid) AS args,
  coalesce(rt.typname, '(internal)') AS return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
LEFT JOIN pg_type rt ON p.prorettype = rt.oid
WHERE (rt.typname LIKE 'reg%')
   OR EXISTS (
     SELECT 1
     FROM unnest(p.proargtypes) at(oid)
     JOIN pg_type pt ON at = pt.oid
     WHERE pt.typname LIKE 'reg%'
   )
ORDER BY n.nspname, p.proname;

-- 5) Show pg_cron job counts if cron schema exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'cron') THEN
    RAISE INFO 'cron.job count: %', (SELECT count(*) FROM cron.job);
    RAISE INFO 'cron.job_run_details count: %', (SELECT count(*) FROM cron.job_run_details);
  ELSE
    RAISE INFO 'cron schema not present';
  END IF;
END$$;

-- 6) Output are meant to be redirected to a file using psql
-- Example: psql "$DATABASE_URL" -f scripts/check_extensions.sql > extension_report.txt
