# Supabase Upgrade Success Guide

This guide walks through preparing for and executing a Supabase Postgres upgrade using the tooling in this repository.

## Prerequisites

- PowerShell 7+ (`pwsh`)
- Pester 5+ for testing (`Install-Module -Name Pester -Force`)
- `psql` client accessible in PATH
- Docker compose stack running (db, kong, meta, app)

## Phase 1: Pre-Upgrade Validation

### 1.1 Verify Current Database State

Check all services are healthy:
```powershell
docker compose -f compose.yml ps
```

Expected: db, kong, meta, app all showing (healthy) or Up.

### 1.2 Run Extension Health Tests

Execute Pester tests to validate current extension state:
```powershell
Invoke-Pester -Path .\scripts\tests\Extensions.Tests.ps1 -Output Detailed
```

This verifies:
- Required extensions (uuid-ossp, pgcrypto) exist
- Optional extensions (timescaledb, plv8) are present or gracefully absent
- Extension version queries work

### 1.3 Document Current Versions

Query installed extensions:
```powershell
docker compose -f compose.yml exec db psql -U postgres -c "SELECT extname, extversion FROM pg_extension ORDER BY extname;"
```

Save output for comparison after upgrade.

## Phase 2: Backup Extension Metadata

### 2.1 Run Extension Backup Script

Create backups of extension-specific data:
```powershell
.\scripts\extension-backup.ps1 `
  -DatabaseUrl "postgresql://postgres:postgres@localhost:5432/postgres" `
  -IncludePlv8Functions `
  -IncludeTimescaleMetadata `
  -OutputDir "./pre_upgrade_backups"
```

**What this does:**
- Exports plv8 function definitions to `plv8_functions_backup.sql`
- Exports TimescaleDB hypertable metadata to CSV (if TimescaleDB present)
- Exports TimescaleDB job stats to CSV

### 2.2 Verify Backups Created

```powershell
Get-ChildItem .\pre_upgrade_backups
```

Expected files:
- `plv8_functions_backup.sql` (may be empty if no plv8 functions)
- `timescaledb_hypertables.csv` (if TimescaleDB installed)
- `timescaledb_jobs.csv` (if TimescaleDB installed)

### 2.3 Run Staging Upgrade Prep Script

Execute the comprehensive pre-upgrade check:
```powershell
.\scripts\staging_upgrade_prep.ps1 `
  -DatabaseUrl "postgresql://postgres:postgres@localhost:5432/postgres"
```

**What this does:**
- Archives pg_cron scheduled jobs (if pg_cron present)
- Checks current Postgres version
- Reports extension versions
- Validates upgrade readiness

Review output for warnings or errors.

## Phase 3: Database Backup (CRITICAL)

**BEFORE upgrading Supabase, take a full database backup:**

### 3.1 Full Database Dump

```powershell
$backupFile = "backup_$(Get-Date -Format 'yyyy-MM-dd_HHmmss').sql"
docker compose -f compose.yml exec -T db pg_dump -U postgres -Fc -f "/tmp/$backupFile" postgres
docker cp mcp-supabase-db:/tmp/$backupFile "./backups/$backupFile"
```

### 3.2 Verify Backup Size

```powershell
Get-Item "./backups/$backupFile" | Select-Object Name, Length
```

Should be non-zero size.

### 3.3 Test Restore (Optional but Recommended)

Create a test database and restore to verify backup integrity:
```powershell
# Create test DB
docker compose -f compose.yml exec db psql -U postgres -c "CREATE DATABASE test_restore;"

# Restore
docker cp "./backups/$backupFile" mcp-supabase-db:/tmp/
docker compose -f compose.yml exec db pg_restore -U postgres -d test_restore "/tmp/$backupFile"

# Verify
docker compose -f compose.yml exec db psql -U postgres -d test_restore -c "\dt"

# Cleanup
docker compose -f compose.yml exec db psql -U postgres -c "DROP DATABASE test_restore;"
```

## Phase 4: Supabase Upgrade Execution

### 4.1 Trigger Supabase Upgrade

**For Supabase Cloud:**
1. Go to your project dashboard
2. Navigate to Settings → Infrastructure
3. Click "Upgrade Postgres"
4. Select target version (e.g., Postgres 16)
5. Confirm upgrade

**For Self-Hosted:**
1. Update docker-compose.yml db image tag:
   ```yaml
   db:
     image: supabase/postgres:16.x.x.xxx  # New version
   ```
2. Run upgrade:
   ```powershell
   docker compose -f compose.yml down
   docker compose -f compose.yml up -d
   ```

### 4.2 Monitor Upgrade Progress

Watch logs during upgrade:
```powershell
docker compose -f compose.yml logs -f db
```

Wait for "database system is ready to accept connections" message.

## Phase 5: Post-Upgrade Validation

### 5.1 Verify Postgres Version

```powershell
docker compose -f compose.yml exec db psql -U postgres -c "SELECT version();"
```

Confirm new version is active.

### 5.2 Check Extension Status

```powershell
docker compose -f compose.yml exec db psql -U postgres -c "SELECT extname, extversion FROM pg_extension ORDER BY extname;"
```

Compare with Phase 1.3 output.

### 5.3 Run Extension Recovery (If Needed)

If any extensions are missing or need updating:
```powershell
.\scripts\extension-recovery.ps1 `
  -DatabaseUrl "postgresql://postgres:postgres@localhost:5432/postgres"
```

This will:
- Ensure TimescaleDB is installed and updated
- Ensure plv8 is installed and updated
- Report any issues

### 5.4 Restore plv8 Functions (If Applicable)

If you had plv8 functions and extension was recreated:
```powershell
docker cp "./pre_upgrade_backups/plv8_functions_backup.sql" mcp-supabase-db:/tmp/
docker compose -f compose.yml exec db psql -U postgres -f /tmp/plv8_functions_backup.sql
```

### 5.5 Re-run Health Tests

```powershell
Invoke-Pester -Path .\scripts\tests\Extensions.Tests.ps1 -Output Detailed
```

All tests should pass.

### 5.6 Application Smoke Test

Restart app to reconnect with upgraded DB:
```powershell
docker compose -f compose.yml restart app
```

Check app logs:
```powershell
docker compose -f compose.yml logs --tail=50 app
```

Look for:
- `[DB] Connection established`
- No migration errors
- `MCP API Gateway Server running...`

## Phase 6: Post-Upgrade Monitoring

### 6.1 Run Extension Health Queries

Execute monitoring queries from EXTENSION_UPGRADE_PLAN.md:

**Check for invalid objects:**
```sql
SELECT 
    n.nspname as schema,
    c.relname as relation,
    CASE c.relkind
        WHEN 'r' THEN 'table'
        WHEN 'i' THEN 'index'
        WHEN 'v' THEN 'view'
    END as type
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_index i ON i.indexrelid = c.oid
WHERE c.relkind IN ('i', 'v', 'm')
    AND (not COALESCE(i.indisvalid, true) 
         OR not COALESCE(c.relisvalid, true))
    AND n.nspname NOT LIKE 'pg_%';
```

Should return 0 rows.

### 6.2 Monitor Application Performance

Watch for connection issues or slow queries:
```powershell
docker compose -f compose.yml logs -f app
```

### 6.3 Document Upgrade Results

Record:
- Old Postgres version → New Postgres version
- Extension version changes
- Any issues encountered and resolutions
- Total downtime duration

## Rollback Plan

If upgrade fails or shows critical issues:

### Option 1: Restore from Backup

```powershell
# Stop services
docker compose -f compose.yml down

# Remove data volume
docker volume rm mcp-api-gateway_postgres_data

# Recreate and restore
docker compose -f compose.yml up -d db
Start-Sleep -Seconds 15

# Restore backup
docker cp "./backups/$backupFile" mcp-supabase-db:/tmp/
docker compose -f compose.yml exec db pg_restore -U postgres -d postgres "/tmp/$backupFile" --clean --if-exists

# Restart stack
docker compose -f compose.yml up -d
```

### Option 2: Supabase Cloud Rollback

Contact Supabase support immediately if cloud upgrade fails.

## Success Criteria Checklist

- [ ] All extensions show correct versions post-upgrade
- [ ] Pester tests pass
- [ ] Application connects successfully
- [ ] No invalid database objects
- [ ] plv8 functions restored (if applicable)
- [ ] TimescaleDB hypertables intact (if applicable)
- [ ] No error logs in application
- [ ] Performance metrics stable

## Troubleshooting

### Extensions Missing After Upgrade

Run recovery script with drop flags:
```powershell
.\scripts\extension-recovery.ps1 `
  -DatabaseUrl "postgresql://postgres:postgres@localhost:5432/postgres" `
  -DropTimescale `
  -DropPlv8
```

### Migration Failures

Check migration status:
```powershell
docker compose -f compose.yml exec app node scripts/migrate.js status
```

Manually fix failed migrations if needed.

### Connection Refused Errors

Verify Postgres is listening on all interfaces:
```powershell
docker compose -f compose.yml exec db psql -U postgres -c "SHOW listen_addresses;"
```

Should show `*` not `localhost`.

## Next Steps

After successful upgrade:
1. Update documentation with new Postgres version
2. Schedule follow-up monitoring (1 week, 1 month)
3. Consider performance tuning for new Postgres version
4. Update CI/CD pipelines to match new version

---

**Reference Documents:**
- `docs/EXTENSION_UPGRADE_PLAN.md` - Detailed extension upgrade procedures
- `scripts/tests/Extensions.Tests.ps1` - Automated validation tests
- Supabase upgrade docs: https://supabase.com/docs/guides/platform/migrating-and-upgrading-projects
