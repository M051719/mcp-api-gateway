# Extension Upgrade Plan

This document outlines the exact sequence for upgrading critical extensions (TimescaleDB, plv8) during a Postgres major version upgrade. Always test this sequence in staging first.

## Pre-upgrade checklist

1. Check current versions:
```sql
SELECT extname, extversion FROM pg_extension 
WHERE extname IN ('timescaledb', 'plv8');
```

2. Document dependencies (run before making any changes):
```sql
-- TimescaleDB hypertables
SELECT format('%I.%I', schemaname, tablename) as hypertable,
       chunk_count, compression_state
FROM timescaledb_information.hypertables;

-- plv8 functions
SELECT n.nspname as schema,
       p.proname as function,
       pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.prolang = (SELECT oid FROM pg_language WHERE lanname = 'plv8');
```

## Upgrade sequence

### Step 1: Pre-upgrade preparation

```sql
-- Backup plv8 function definitions
\o plv8_functions_backup.sql
SELECT format(
  'CREATE OR REPLACE FUNCTION %I.%I(%s) RETURNS %s AS %L LANGUAGE plv8;',
  nspname,
  proname,
  pg_get_function_arguments(p.oid),
  pg_get_function_result(p.oid),
  prosrc
)
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.prolang = (SELECT oid FROM pg_language WHERE lanname = 'plv8');
\o

-- Document TimescaleDB settings
SELECT * FROM timescaledb_information.job_stats;
SELECT * FROM timescaledb_information.compression_settings;
```

### Step 2: Extension removal (if required)

```sql
-- Disable TimescaleDB jobs first
SELECT timescaledb_pre_restore();

-- Drop extensions (only if required by upgrade)
DROP EXTENSION IF EXISTS timescaledb CASCADE;
DROP EXTENSION IF EXISTS plv8 CASCADE;
```

### Step 3: Postgres upgrade
- Let Supabase perform the in-place upgrade
- Or follow your upgrade process
- Verify Postgres version after upgrade:
```sql
SELECT version();
```

### Step 4: Extension reinstallation

```sql
-- Install TimescaleDB (specific version if needed)
CREATE EXTENSION IF NOT EXISTS timescaledb VERSION '2.16.1';
ALTER EXTENSION timescaledb UPDATE; -- Gets latest compatible

-- Install plv8 (specific version if needed)
CREATE EXTENSION IF NOT EXISTS plv8 VERSION '3.1.10';
ALTER EXTENSION plv8 UPDATE; -- Gets latest compatible
```

### Step 5: Post-install configuration

```sql
-- Re-enable TimescaleDB jobs
SELECT timescaledb_post_restore();

-- Verify TimescaleDB hypertables
SELECT format('%I.%I', schemaname, tablename) as hypertable,
       chunk_count, compression_state
FROM timescaledb_information.hypertables;

-- Restore any plv8 functions from backup
\i plv8_functions_backup.sql

-- Verify plv8 functions
SELECT nspname, proname, prosrc 
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.prolang = (SELECT oid FROM pg_language WHERE lanname = 'plv8');
```

## Version-specific notes

### TimescaleDB
- 2.16.1+ required for Postgres 15+
- Dropping CASCADE will remove hypertables - ensure backup
- May need to run `timescaledb-tune` after upgrade
- Check [TimescaleDB upgrade docs](https://docs.timescale.com/update-timescaledb/latest/) for version-specific steps

### plv8
- 3.1.10+ required for Postgres 15+
- Requires compatible V8 engine version
- Functions need explicit recreation if extension dropped
- Check system V8 requirements in target Postgres version

## Recovery procedures

If extension recreation fails:

1. TimescaleDB:
```sql
-- Try forcing specific version
CREATE EXTENSION timescaledb VERSION '2.16.1';

-- If still failing, check logs for
SELECT * FROM pg_catalog.pg_depend 
WHERE refobjid = (
    SELECT oid FROM pg_extension WHERE extname = 'timescaledb'
);
```

2. plv8:
```sql
-- Check for binary compatibility
SELECT plv8_version();

-- If binary issues, may need to
DROP EXTENSION plv8 CASCADE;
-- Then reinstall system package before
CREATE EXTENSION plv8;
```

## Monitoring queries

Monitor extension health after upgrade:

### TimescaleDB Health Checks

```sql
-- 1. Job status and history
SELECT job_id,
       application_name,
       schedule_interval,
       max_runtime,
       max_retries,
       retry_period,
       next_start,
       total_runs,
       total_successes,
       total_failures
FROM timescaledb_information.job_stats;

-- 2. Hypertable status and size
SELECT format('%I.%I', h.schema_name, h.table_name) as hypertable,
       count(c.*) as chunk_count,
       pg_size_pretty(sum(pg_total_relation_size(
         format('%I.%I', c.schema_name, c.table_name)::regclass
       ))) as total_size,
       h.compression_state,
       CASE 
         WHEN h.compression_state = 'Compressed' 
         THEN round(h.compression_ratio::numeric, 2)
         ELSE null
       END as compression_ratio
FROM timescaledb_information.hypertables h
LEFT JOIN timescaledb_information.chunks c 
  ON h.hypertable_id = c.hypertable_id
GROUP BY h.schema_name, h.table_name, h.compression_state, h.compression_ratio;

-- 3. Chunk distribution
SELECT time_bucket('1 day', chunk_creation_time) as creation_day,
       count(*) as chunks_created,
       pg_size_pretty(sum(pg_total_relation_size(
         format('%I.%I', schema_name, table_name)::regclass
       ))) as size
FROM timescaledb_information.chunks
GROUP BY creation_day
ORDER BY creation_day DESC
LIMIT 30;

-- 4. Continuous aggregate status
SELECT format('%I.%I', mat_hypertable_schema, mat_hypertable_name) as cagg_name,
       format('%I.%I', raw_hypertable_schema, raw_hypertable_name) as source_hypertable,
       refresh_lag,
       max_interval_per_job,
       materialization_count,
       pg_size_pretty(pg_total_relation_size(
         format('%I.%I', mat_hypertable_schema, mat_hypertable_name)::regclass
       )) as size
FROM timescaledb_information.continuous_aggregates;

-- 5. Policy status
SELECT format('%I.%I', ht.schema_name, ht.table_name) as hypertable,
       p.job_id,
       p.proc_name as policy_type,
       p.config as policy_config,
       p.scheduled as is_scheduled,
       js.next_start,
       js.last_run_status,
       js.total_failures
FROM timescaledb_information.policies p
JOIN timescaledb_information.hypertables ht 
  ON p.hypertable_id = ht.hypertable_id
LEFT JOIN timescaledb_information.job_stats js 
  ON p.job_id = js.job_id;
```

### plv8 Health Checks

```sql
-- 1. Function details and validation
SELECT 
    n.nspname as schema,
    p.proname as function,
    l.lanname as language,
    p.provolatile as volatility,
    p.pronargs as num_args,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as returns,
    obj_description(p.oid, 'pg_proc') as description
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE l.lanname = 'plv8'
ORDER BY n.nspname, p.proname;

-- 2. Function dependencies
WITH RECURSIVE function_deps AS (
  SELECT DISTINCT
    p.oid as func_oid,
    d.refobjid as dep_oid,
    1 as level
  FROM pg_proc p
  JOIN pg_depend d ON d.objid = p.oid
  WHERE p.prolang = (SELECT oid FROM pg_language WHERE lanname = 'plv8')
    AND d.deptype = 'n'
  UNION ALL
  SELECT
    fd.func_oid,
    d.refobjid,
    fd.level + 1
  FROM function_deps fd
  JOIN pg_depend d ON d.objid = fd.dep_oid
  WHERE d.deptype = 'n'
    AND fd.level < 5
)
SELECT DISTINCT
  n.nspname as function_schema,
  p.proname as function_name,
  dn.nspname as dependency_schema,
  CASE 
    WHEN dp.proname IS NOT NULL THEN dp.proname
    WHEN dt.typname IS NOT NULL THEN dt.typname
    ELSE 'unknown'
  END as dependency_object,
  fd.level as dependency_level
FROM function_deps fd
JOIN pg_proc p ON p.oid = fd.func_oid
JOIN pg_namespace n ON n.oid = p.pronamespace
LEFT JOIN pg_proc dp ON dp.oid = fd.dep_oid
LEFT JOIN pg_type dt ON dt.oid = fd.dep_oid
LEFT JOIN pg_namespace dn ON dn.oid = COALESCE(dp.pronamespace, dt.typnamespace)
WHERE fd.dep_oid != fd.func_oid
ORDER BY function_schema, function_name, dependency_level;

-- 3. plv8 memory usage
SELECT 
    pid,
    usename,
    application_name,
    pg_size_pretty(total_exec_time) as total_time,
    pg_size_pretty(memory_usage) as mem_usage
FROM pg_stat_activity
WHERE backend_type = 'client backend'
  AND query LIKE '%plv8%'
  AND state != 'idle';
```

### General Extension Health

```sql
-- 1. Extension versions and locations
SELECT 
    e.extname,
    e.extversion,
    n.nspname as schema,
    CASE WHEN e.extrelocatable THEN 'yes' ELSE 'no' END as relocatable,
    e.extconfiguration IS NOT NULL as has_config,
    obj_description(e.oid, 'pg_extension') as description
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
ORDER BY e.extname;

-- 2. Extension dependencies
WITH RECURSIVE ext_deps AS (
    SELECT 
        e.extname as extension,
        r.objid as dep_id,
        r.refobjid as ref_id,
        1 as depth
    FROM pg_depend r
    JOIN pg_extension e ON r.objid = e.oid
    WHERE r.deptype = 'e'
    UNION ALL
    SELECT 
        d.extension,
        r.objid,
        r.refobjid,
        d.depth + 1
    FROM pg_depend r
    JOIN ext_deps d ON r.objid = d.ref_id
    WHERE r.deptype = 'e'
        AND d.depth < 5
)
SELECT DISTINCT
    d.extension,
    e.extname as depends_on,
    d.depth as dependency_depth
FROM ext_deps d
JOIN pg_extension e ON e.oid = d.ref_id
WHERE d.extension != e.extname
ORDER BY d.extension, d.depth;

-- 3. Extension-owned objects
SELECT 
    e.extname as extension,
    n.nspname as schema,
    CASE c.relkind
        WHEN 'r' THEN 'table'
        WHEN 'i' THEN 'index'
        WHEN 'S' THEN 'sequence'
        WHEN 'v' THEN 'view'
        WHEN 'm' THEN 'materialized view'
        ELSE c.relkind::text
    END as object_type,
    c.relname as object_name,
    pg_size_pretty(pg_total_relation_size(c.oid)) as total_size
FROM pg_depend d
JOIN pg_extension e ON d.refobjid = e.oid
JOIN pg_class c ON d.objid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE d.deptype = 'e'
ORDER BY e.extname, n.nspname, c.relkind, c.relname;

-- 4. Invalid objects after upgrade
SELECT 
    n.nspname as schema,
    c.relname as relation,
    CASE c.relkind
        WHEN 'r' THEN 'table'
        WHEN 'i' THEN 'index'
        WHEN 'S' THEN 'sequence'
        WHEN 'v' THEN 'view'
        WHEN 'm' THEN 'materialized view'
        ELSE c.relkind::text
    END as type,
    case when i.indisvalid then 'valid' else 'INVALID' end as status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_index i ON i.indexrelid = c.oid
WHERE c.relkind IN ('i', 'v', 'm')
    AND (not COALESCE(i.indisvalid, true) 
         OR not COALESCE(c.relisvalid, true))
    AND n.nspname NOT LIKE 'pg_%'
ORDER BY n.nspname, c.relname;
```

## Rollback plan

If upgrade fails:

1. Document exact failure point and errors
2. Restore database from pre-upgrade backup
3. If partial extension recreation succeeded:
```sql
-- Remove partially created extensions
DROP EXTENSION IF EXISTS timescaledb CASCADE;
DROP EXTENSION IF EXISTS plv8 CASCADE;

-- Restore from verified backup
-- Then retry extension creation with explicit versions
```

Contact support if:
- Binary compatibility issues persist
- Hypertable recreation fails
- plv8 functions fail with V8 engine errors

## Additional resources

- [TimescaleDB upgrade docs](https://docs.timescale.com/update-timescaledb/latest/)
- [plv8 compatibility matrix](https://github.com/plv8/plv8#compatibility)
- Postgres extension compatibility lists for [15](https://www.postgresql.org/docs/15/release-15.html#id-1.11.6.5.4) and [16](https://www.postgresql.org/docs/16/release-16.html#id-1.11.6.4.4)