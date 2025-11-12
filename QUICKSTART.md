# Quick Start Guide: Testing & MCP Integration

Complete this checklist to prepare for Supabase upgrade and integrate MCP tools.

## ✅ Step 1: Verify Stack is Healthy

```powershell
docker compose -f compose.yml ps
```

**Expected:** db, kong, meta showing `(healthy)`, app `Up`

**If app is restarting:** App exits cleanly when no APIs configured (by design). This is normal.

---

## ✅ Step 2: Test Database Connectivity

```powershell
docker compose -f compose.yml exec db psql -U postgres -c "SELECT extname, extversion FROM pg_extension ORDER BY extname;"
```

**Expected output:**
- pgcrypto, uuid-ossp (required)
- pgjwt, pg_graphql, pgsodium (Supabase)
- pg_stat_statements (monitoring)

**Save this output** for post-upgrade comparison.

---

## ✅ Step 3: Run Extension Backup Script

```powershell
# Create backup directory
New-Item -ItemType Directory -Path .\pre_upgrade_backups -Force

# Run backup
.\scripts\extension-backup.ps1 `
  -DatabaseUrl "postgresql://postgres:postgres@localhost:5432/postgres" `
  -IncludePlv8Functions `
  -IncludeTimescaleMetadata `
  -OutputDir ".\pre_upgrade_backups"
```

**Expected:**
- Creates `pre_upgrade_backups\plv8_functions_backup.sql`
- May be empty if no plv8 functions exist (normal)
- TimescaleDB files only if extension installed

**Verify:**
```powershell
Get-ChildItem .\pre_upgrade_backups
```

---

## ✅ Step 4: Run Upgrade Prep Script

```powershell
.\scripts\staging_upgrade_prep.ps1 `
  -DatabaseUrl "postgresql://postgres:postgres@localhost:5432/postgres"
```

**What this checks:**
- Archives pg_cron jobs (if present)
- Reports Postgres version
- Lists extension versions
- Validates upgrade readiness

**Review output** for any warnings.

---

## ✅ Step 5: Test Extension Recovery (Dry Run)

```powershell
.\scripts\extension-recovery.ps1 `
  -DatabaseUrl "postgresql://postgres:postgres@localhost:5432/postgres"
```

**Expected:**
- Ensures TimescaleDB installed/updated (or reports not available)
- Ensures plv8 installed/updated (or reports not available)
- No errors for existing extensions

---

## ✅ Step 6: Test MCP Integration

### 6a. Test db_health Tool Directly

```powershell
# Make sure the app container is running
docker compose -f compose.yml up -d app

# Test db_health via docker exec
docker exec -i mcp-api-gateway node -e '
import("./config/database.js").then(m => 
  m.default.query("SELECT version() as v, now() as t")
).then(([rows]) => {
  console.log("Version:", rows[0].v);
  console.log("Time:", rows[0].t);
  process.exit(0);
}).catch(e => {
  console.error("Error:", e.message);
  process.exit(1);
});
'
```

**Expected:** Shows Postgres version and timestamp.

### 6b. Enable MCP in Claude Desktop

**Edit config file:**

Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mcp-api-gateway": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "mcp-api-gateway",
        "node",
        "/app/index.js"
      ]
    }
  }
}
```

**Restart Claude Desktop:**
1. System tray → Right-click Claude → Quit
2. Task Manager → End any remaining Claude processes
3. Restart Claude Desktop

**Test in Claude:**
Ask: "Can you check the database health using the db_health tool?"

---

## ✅ Step 7: Create Full Database Backup

**CRITICAL before any upgrade:**

```powershell
# Create backup directory
New-Item -ItemType Directory -Path .\backups -Force

# Generate timestamped backup filename
$timestamp = Get-Date -Format 'yyyy-MM-dd_HHmmss'
$backupFile = "backup_$timestamp.sql"

# Create backup (custom format for selective restore)
docker compose -f compose.yml exec -T db pg_dump -U postgres -Fc postgres > ".\backups\$backupFile"

# Verify backup was created
Get-Item ".\backups\$backupFile" | Select-Object Name, Length, LastWriteTime
```

**Expected:** Non-zero file size (several KB minimum).

**Test restore (optional but recommended):**
```powershell
# Create test DB
docker compose -f compose.yml exec db psql -U postgres -c "CREATE DATABASE test_restore;"

# Copy backup into container
docker cp ".\backups\$backupFile" mcp-supabase-db:/tmp/backup.sql

# Restore
docker compose -f compose.yml exec db pg_restore -U postgres -d test_restore /tmp/backup.sql

# Quick verification
docker compose -f compose.yml exec db psql -U postgres -d test_restore -c "\dt"

# Cleanup
docker compose -f compose.yml exec db psql -U postgres -c "DROP DATABASE test_restore;"
```

---

## 🎯 You're Ready For Upgrade When:

- [x] All services healthy
- [x] Extensions documented (saved output from Step 2)
- [x] Extension metadata backed up
- [x] Upgrade prep script ran without errors
- [x] Full database backup created and verified
- [x] MCP db_health tool working (optional)

---

## 📖 Next Steps

### For Supabase Cloud Upgrade:
1. Go to Supabase Dashboard → Settings → Infrastructure
2. Click "Upgrade Postgres"
3. Select target version
4. Monitor upgrade progress
5. After upgrade completes, run validation (see below)

### For Self-Hosted Docker Upgrade:
1. Update `compose.yml` db image tag to new version
2. `docker compose down`
3. `docker compose up -d`
4. Monitor logs: `docker compose logs -f db`

---

## ✅ Post-Upgrade Validation

```powershell
# 1. Verify new Postgres version
docker compose -f compose.yml exec db psql -U postgres -c "SELECT version();"

# 2. Check extensions still present
docker compose -f compose.yml exec db psql -U postgres -c "SELECT extname, extversion FROM pg_extension ORDER BY extname;"

# 3. Run recovery if needed (ensures extensions updated)
.\scripts\extension-recovery.ps1 `
  -DatabaseUrl "postgresql://postgres:postgres@localhost:5432/postgres"

# 4. Restart app to reconnect
docker compose -f compose.yml restart app

# 5. Check app logs
docker compose -f compose.yml logs --tail=50 app
```

**Look for:**
- `[DB] Connection established`
- `Migrations applied: []` or list of migrations
- `MCP API Gateway Server running...`

---

## 🔧 Troubleshooting

### App Container Keeps Restarting

**Normal if:** No APIs configured (expected behavior - app starts, connects DB, then exits cleanly)

**Fix for testing:** Add a test API to keep it running:
```yaml
# In compose.yml app service
environment:
  - API_1_NAME=petstore
  - API_1_SWAGGER_URL=https://petstore.swagger.io/v2/swagger.json
```

### Pester Tests Failing

**Workaround:** Test manually with psql instead:
```powershell
# Check extensions
psql "postgresql://postgres:postgres@localhost:5432/postgres" -c "SELECT extname, extversion FROM pg_extension ORDER BY extname;"

# Count plv8 functions
psql "postgresql://postgres:postgres@localhost:5432/postgres" -c "SELECT count(*) FROM pg_proc p JOIN pg_language l ON p.prolang = l.oid WHERE l.lanname='plv8';"
```

### MCP Tool Not Showing in Claude

1. Verify container running: `docker ps | findstr mcp-api-gateway`
2. Check Claude config syntax: Use JSON validator
3. Check Claude logs: `%APPDATA%\Claude\logs\`
4. Ensure complete restart (Task Manager → End all Claude processes)

### Extension Missing After Upgrade

```powershell
# Re-run recovery with drop flags (caution: loses dependent objects)
.\scripts\extension-recovery.ps1 `
  -DatabaseUrl "postgresql://postgres:postgres@localhost:5432/postgres" `
  -DropTimescale `
  -DropPlv8
```

---

## 📚 Reference Documentation

- **Full upgrade workflow:** `docs\SUPABASE_UPGRADE_HOWTO.md`
- **MCP integration details:** `docs\MCP_INTEGRATION_HOWTO.md`
- **Extension procedures:** `docs\EXTENSION_UPGRADE_PLAN.md`
- **Backup script:** `scripts\extension-backup.ps1`
- **Recovery script:** `scripts\extension-recovery.ps1`
- **Prep script:** `scripts\staging_upgrade_prep.ps1`

---

## 💡 Pro Tips

1. **Always backup before upgrade** - Can't stress this enough
2. **Test in staging first** - If you have a separate environment
3. **Document everything** - Save terminal output for troubleshooting
4. **Monitor after upgrade** - Watch logs for 24-48 hours
5. **Keep backups** - Don't delete pre-upgrade backups immediately

---

## ✨ Success Indicators

After upgrade, you should see:
- ✅ New Postgres version reported
- ✅ All previous extensions still present (possibly newer versions)
- ✅ App connects without errors
- ✅ MCP db_health returns valid data
- ✅ No "invalid object" warnings in database

---

**You now have:**
- Complete backup tooling ✅
- Recovery procedures ✅
- MCP integration ready ✅
- Validation scripts ✅

Ready to proceed with confidence! 🚀
