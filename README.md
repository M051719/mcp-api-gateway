# mcp-api-gateway

## Database migrations

This project uses Umzug (Sequelize) for database migrations. A simple migration runner is included at `scripts/migrate.js`.

Common migration commands (run from project root):

 - Run all pending migrations:

   npm run migrate

 - Rollback all migrations:

   npm run migrate:down

 - Show migration status:

   npm run migrate:status

Migrations will also run automatically on container startup (the container entrypoint executes `scripts/start.sh` which runs migrations and then starts the app).

Environment variable to control migrations at startup:

- `RUN_MIGRATIONS` (default: `true`) — set to `false` to prevent migrations from running when the container starts.

Example (disable migrations):

```
RUN_MIGRATIONS=false docker compose up -d
```

To disable migrations using the production compose override file, run:

```
docker compose -f compose.yml -f compose.prod.yml up -d
```

Automated tests

Run the migration/seeding verification tests with the standard test command. Set `TEST_DATABASE_URL` to point to a test database to avoid altering your development/production DB:

```
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test_db npm test
```

The tests check that migrations ran, the expected tables exist, seed data exists, and unique indexes are present.


Migrations live in the `migrations/` directory and Sequelize models are in `models/`.

# mcp/api-gateway

[![Build](https://github.com/rflpazini/mcp-api-gateway/actions/workflows/build.yml/badge.svg)](https://github.com/rflpazini/mcp-api-gateway/actions/workflows/build.yml)

A universal MCP (Model Context Protocol) server to integrate any API with Claude Desktop using only Docker configurations.

## Quick Installation

### 1. Using Docker Hub (Recommended)

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-api": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i", "--pull", "always",
        "-e", "API_1_NAME=my-api",
        "-e", "API_1_SWAGGER_URL=https://api.example.com/swagger.json",
        "-e", "API_1_BASE_URL=https://api.example.com/v1",
        "-e", "API_1_HEADER_AUTHORIZATION=Bearer YOUR_TOKEN",
        "rflpazini/mcp-api-gateway:latest"
      ]
    }
  }
}
```

### 2. Local Build

```bash
# Clone the repository
git clone https://github.com/rflpazini/mcp-api-gateway
cd mcp-api-gateway

# Build the image
docker build -t mcp-api-gateway .

# Local test
docker run --rm -it \
  -e API_1_NAME=test \
  -e API_1_SWAGGER_URL=https://petstore.swagger.io/v2/swagger.json \
  -e API_1_BASE_URL=https://petstore.swagger.io/v2 \
  mcp-api-gateway
```

## API Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `API_N_NAME` | Unique API name | Yes |
| `API_N_SWAGGER_URL` | Swagger/OpenAPI file URL | Yes |
| `API_N_BASE_URL` | API base URL (overrides Swagger) | No |
| `API_N_HEADER_*` | Custom headers | No |
| `API_N_HEADERS` | JSON with multiple headers | No |

### Configuration Examples

#### Simple API with Authentication
```json
{
  "mcpServers": {
    "github-api": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "API_1_NAME=github",
        "-e", "API_1_SWAGGER_URL=https://api.github.com/swagger.json",
        "-e", "API_1_HEADER_AUTHORIZATION=token ghp_xxxxxxxxxxxx",
        "mcp-api-gateway:latest"
      ]
    }
  }
}
```

#### Multiple APIs
```json
{
  "mcpServers": {
    "company-apis": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        // Users API
        "-e", "API_1_NAME=users",
        "-e", "API_1_SWAGGER_URL=https://api.company.com/users/swagger.json",
        "-e", "API_1_HEADER_X_API_KEY=users_key_123",
        
        // Products API  
        "-e", "API_2_NAME=products",
        "-e", "API_2_SWAGGER_URL=https://api.company.com/products/openapi.yaml",
        "-e", "API_2_HEADER_AUTHORIZATION=Bearer products_token",
        
        // Orders API (with multiple headers)
        "-e", "API_3_NAME=orders",
        "-e", "API_3_SWAGGER_URL=https://api.company.com/orders/spec.json",
        "-e", "API_3_HEADERS={\"Authorization\":\"Bearer token\",\"X-Tenant\":\"company123\"}",
        
        "mcp-api-gateway:latest"
      ]
    }
  }
}
```

## Using in Claude

### Available Commands

1. **View available APIs**
   - "What APIs are configured?"
   - "Show me the available endpoints"

2. **Explore endpoints**
   - "How do I create a user?"
   - "What parameters do I need to search for products?"

3. **Execute operations**
   - "Create a user named John with email john@email.com"
   - "List all orders from today"
   - "Update product ID 123 with new price $99.90"

### Conversation Examples

**You**: "Create a new customer named Mary Smith"

**Claude**: "I'll create the customer for you. Using the customers API..."
```json
{
  "id": "12345",
  "name": "Mary Smith",
  "createdAt": "2024-01-15T10:30:00Z"
}
```
"Customer Mary Smith created successfully! ID: 12345"

## Publishing to Docker Hub

```bash
# Build for multiple architectures
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 \
  -t your-username/mcp-api-gateway:latest \
  -t your-username/mcp-api-gateway:1.0.0 \
  --push .
```

## Use Cases

### 1. Internal Company API
```json
"-e", "API_1_NAME=erp",
"-e", "API_1_SWAGGER_URL=https://erp.company.local/api/swagger.json",
"-e", "API_1_BASE_URL=https://erp.company.local/api",
"-e", "API_1_HEADER_X_COMPANY_ID=company123",
"-e", "API_1_HEADER_AUTHORIZATION=Bearer internal_token"
```

### 2. API with Local Swagger
```json
// Mount local Swagger file
"-v", "/path/to/swagger.yaml:/swagger.yaml",
"-e", "API_1_NAME=local-api",
"-e", "API_1_SWAGGER_URL=file:///swagger.yaml",
"-e", "API_1_BASE_URL=http://localhost:3000"
```

### 3. GraphQL API (via REST wrapper)
```json
"-e", "API_1_NAME=graphql",
"-e", "API_1_SWAGGER_URL=https://api.example.com/graphql-swagger.json",
"-e", "API_1_BASE_URL=https://api.example.com/graphql"
```

## Security

### Best Practices

1. **Never commit tokens**: Use environment variables or secrets
2. **Use limited scope tokens**: Only necessary permissions
3. **Rotate tokens regularly**: Update your tokens periodically
4. **Always use HTTPS**: Ensure your APIs use HTTPS

### Example with Docker Secrets
```bash
# Create the secret
echo "your_token_here" | docker secret create api_token -

# Use in claude_desktop_config.json
"args": [
  "run", "--rm", "-i",
  "-e", "API_1_HEADER_AUTHORIZATION=Bearer $(cat /run/secrets/api_token)",
  "--secret", "api_token",
  "mcp-api-gateway:latest"
]
```

## Troubleshooting

### API not showing up
- Check if the Swagger URL is accessible
- Confirm environment variables are correct
- Check logs: `docker logs <container_id>`

### Authentication error
- Verify token is correct
- Confirm header format (Bearer, Basic, etc)
- Test the API directly first

### Slow performance
- Use `--pull always` only the first time
- Consider caching the image locally
- Check API latency

## Contributing

PRs are welcome! Some ideas:

- [ ] OAuth authentication support
- [ ] Smart response caching
- [ ] WebSocket support
- [ ] Web configuration interface
- [ ] Metrics and observability

## License

MIT License - see [LICENSE](https://rflpazini.mit-license.org/) file for details.

## Backup & Integrity Verification

Robust database backups ensure you can upgrade Postgres versions and recover quickly. This project includes scripts for full cluster backups, schema‑scoped public exports, row count integrity, compression, and cryptographic manifests.

### Artifact Types
| Type | Purpose | Created By |
|------|---------|------------|
| `backup_<ts>.sql.gz` | Full cluster logical dump (pg_dumpall) | `scripts/backup-nightly.ps1` |
| `public_only_<ts>.dump.gz` | Custom format restore-capable (pg_dump -Fc -n public) | `scripts/create-public-dump.ps1` / nightly |
| `public_only_<ts>.sql.gz` | Portable SQL with `--column-inserts` (public schema only) | same as above |
| `public_only_<ts>_counts.csv` | Table row counts snapshot for integrity diff | same as above |
| `public_only_<ts>_counts.json` | JSON summary (tables + total rows + per table counts) | same as above |
| `manifest_public_only_<ts>.sha256` | SHA256 hashes for that public-only run | `create-public-dump.ps1` |
| `manifest_<ts>.sha256` | Master manifest (full + public artifacts) | `backup-nightly.ps1` |

### Quick Manual Backup
```powershell
pwsh ./scripts/create-public-dump.ps1
```

### Nightly Automated Backup
```powershell
pwsh ./scripts/backup-nightly.ps1 -RetentionDays 7
```

Schedule nightly (default 02:00):
```powershell
pwsh ./scripts/schedule-nightly-backups.ps1 -Time '02:00'
```

Remove scheduled task:
```powershell
pwsh ./scripts/schedule-nightly-backups.ps1 -Remove
```

### Integrity Verification (Counts Diff)
After creating a public-only dump, validate restore integrity in an ephemeral container:
```powershell
pwsh ./scripts/test-restore.ps1 -StrictCounts
```
If table counts differ from the captured `public_only_*_counts.csv` the script exits non-zero with a diff summary.

### Hash Verification
To confirm artifact integrity later:
```powershell
Get-Content .\backups\manifest_<timestamp>.sha256 | ForEach-Object {
  $parts = $_ -split '\s+'; if ($parts.Length -ge 2) { $expected=$parts[0]; $file=$parts[-1];
    $actual=(Get-FileHash -Algorithm SHA256 -Path .\backups\$file).Hash.ToLower();
    if ($actual -eq $expected) { "OK  $file" } else { "MISMATCH  $file" }
  }
}
```

### Recommended Workflow
1. Run nightly backups (retention enforced) or manual `create-public-dump.ps1` before risky changes.
2. Verify counts integrity with `test-restore.ps1 -StrictCounts`.
3. Optionally store manifests off-host (cloud storage, S3, etc.).
4. Periodically test restore using latest full + public-only artifacts.

### Design Notes
* Gzip compression reduces storage footprint; manifests store hashes post-compression.
* Counts CSV provides a lightweight data quality guard beyond structural restore.
* Portable SQL (`--column-inserts`) allows selective manual inspection or cherry-pick recovery.
* Custom format `.dump.gz` enables fast single-table targeted pg_restore operations.
* Separate manifest files allow independent verification of public-only set vs full cluster.

### Future Enhancements (Ideas)
* Optional encryption (openssl age or gpg) prior to offsite sync.
* Parallel compression for large datasets.
* Automatic retention of only manifests + latest N days to further reduce space.
* Differential backups (requires external tooling / WAL archiving).

### Encryption (Optional)
You can encrypt artifacts during creation (Age or GPG). Provide one recipient; add `-RemovePlaintext` to delete originals post-encryption.

Age example:
```powershell
pwsh ./scripts/create-public-dump.ps1 -Encrypt -AgeRecipient 'age1qyq...publickey...' -RemovePlaintext
```

GPG example:
```powershell
pwsh ./scripts/backup-nightly.ps1 -Encrypt -GpgRecipient 'DB Backup Key <dba@example.com>' -RemovePlaintext
```

Artifacts receive `.age` or `.gpg` suffixes. Manifests are hashed pre-encryption; keep encrypted manifests for tamper evidence.

### Offsite Upload (S3)
Upload a full set for a specific timestamp (plaintext and optionally encrypted files) using AWS CLI:
```powershell
pwsh ./scripts/upload-backup-s3.ps1 -Timestamp 20251111_230100 -Bucket my-backup-bucket -Prefix prod/db -IncludeEncrypted
```

Dry run:
```powershell
pwsh ./scripts/upload-backup-s3.ps1 -Timestamp 20251111_230100 -Bucket my-backup-bucket -DryRun
```

Ensure `aws` CLI is configured (`aws configure` or env vars). Prefix defaults to `backups`.

### Verify Integrity from Manifests
To re-check the local artifacts against their manifests:
```powershell
pwsh ./scripts/verify-backup-integrity.ps1 -Timestamp 20251111_230100 -IncludePublicOnlyManifest -IncludeFullManifest
```
Or let the script auto-pick the latest:
```powershell
pwsh ./scripts/verify-backup-integrity.ps1
```

Prerequisites for optional features:
- Encryption: age or gpg installed on PATH
- S3 upload: aws CLI configured with credentials/profile

### Configuration File & Env Overrides

Instead of passing command-line arguments each time, create `scripts/backup.config.psd1` (copy from `backup.config.psd1.example`). Environment variables (prefixed `BACKUP_*`) override both config file and parameters.

**Config keys** (`backup.config.psd1`):
| Key | Default | Description |
|-----|---------|-------------|
| `Service` | `'db'` | Docker Compose service name |
| `Database` | `'postgres'` | Database name |
| `User` | `'postgres'` | Postgres user |
| `RetentionDaysPlaintext` | `7` | Days to keep plaintext artifacts before pruning |
| `RetentionDaysEncrypted` | `30` | Days to keep encrypted artifacts before pruning |
| `PruneMode` | `'all'` | Prune mode: `'all'` \| `'plaintext-only'` \| `'encrypted-only'` |
| `CompressionLevel` | `'Optimal'` | Compression level: `'Optimal'` \| `'Fastest'` \| `'NoCompression'` |
| `Encrypt` | `$false` | Enable encryption |
| `AgeRecipient` | `''` | Age public key (e.g., `age1qyq...`) |
| `GpgRecipient` | `''` | GPG key ID or email |
| `RemovePlaintext` | `$false` | Remove plaintext after encryption |
| `AwsProfile` | `''` | AWS CLI profile name |
| `Bucket` | `''` | S3 bucket for uploads |
| `Prefix` | `'backups'` | S3 prefix path |
| `SmtpServer` | `''` | SMTP server hostname (e.g., `smtp.gmail.com`) |
| `SmtpPort` | `587` | SMTP port |
| `SmtpFrom` | `''` | From email address |
| `SmtpUser` | `''` | SMTP auth username (optional; leave empty for anonymous) |
| `SmtpPassword` | `''` | SMTP auth password (optional) |
| `AlertRecipients` | `@()` | Array of alert recipient emails (e.g., `@('admin@example.com')`) |
| `WalArchiveRetentionDays` | `14` | Days to keep WAL archive files |

**Environment overrides** (examples):
```powershell
$env:BACKUP_RETENTION_PLAIN = 14
$env:BACKUP_COMPRESSION_LEVEL = 'Fastest'
$env:BACKUP_ENCRYPT = 'true'
$env:BACKUP_AGE_RECIPIENT = 'age1qyq...'
$env:BACKUP_ALERT_SMTP_SERVER = 'smtp.gmail.com'
$env:BACKUP_ALERT_RECIPIENTS = 'admin@example.com,dba@example.com'
$env:BACKUP_WAL_RETENTION_DAYS = 21
pwsh ./scripts/backup-nightly.ps1
```

All scripts respect these settings (backup-nightly.ps1, create-public-dump.ps1, upload-backup-s3.ps1, send-backup-alert.ps1, wal-prune.ps1).

### Compression Level Tuning

Choose compression level per backup to balance speed vs. size:
- **Optimal** (default): Best compression ratio (smallest files), slower
- **Fastest**: Faster compression, larger files
- **NoCompression**: Maximum speed, no size reduction (archive for structure only)

Example:
```powershell
pwsh ./scripts/backup-nightly.ps1 -CompressionLevel Fastest
```
Or set in config:
```powershell
CompressionLevel = 'Fastest'
```

### Email Alerts on Backup Failures

When integrity verification fails (hash mismatch, missing artifacts), the harness can send email alerts to a configurable list of recipients.

**Configuration** (in `backup.config.psd1`):
```powershell
SmtpServer = 'smtp.gmail.com'
SmtpPort = 587
SmtpFrom = 'backups@example.com'
SmtpUser = 'backups@example.com'        # Optional; omit for anonymous SMTP
SmtpPassword = 'your-smtp-password'      # Optional
AlertRecipients = @('admin@example.com', 'dba@example.com')
```

**Manual alert test**:
```powershell
pwsh ./scripts/send-backup-alert.ps1 -Subject "Test Alert" -Body "This is a test"
```

**Automatic alerts**: The `run-backup-upload-verify.ps1` harness now sends alerts automatically when verification detects issues (exit code > 0). The email includes the verification output and timestamp for investigation.

Environment overrides (prefix `BACKUP_ALERT_*`):
```powershell
$env:BACKUP_ALERT_SMTP_SERVER = 'smtp.office365.com'
$env:BACKUP_ALERT_SMTP_PORT = 587
$env:BACKUP_ALERT_SMTP_FROM = 'backups@company.com'
$env:BACKUP_ALERT_RECIPIENTS = 'admin@company.com,oncall@company.com'
```

### Point-In-Time Recovery (WAL Archiving)

The database now archives Write-Ahead Log (WAL) files to the `wal_archive` volume, enabling point-in-time recovery (PITR). WAL archiving captures every transaction, allowing you to restore to any second between full backups.

**WAL configuration** (already enabled in `compose.yml`):
```yaml
volumes:
  - wal_archive:/wal_archive
command:
  - "-c" 
  - "archive_mode=on"
  - "-c"
  - "archive_command=test ! -f /wal_archive/%f && cp %p /wal_archive/%f"
```

**WAL archive pruning** (automatic retention):
```powershell
pwsh ./scripts/wal-prune.ps1 -RetentionDays 14
```
Or configure in `backup.config.psd1`:
```powershell
WalArchiveRetentionDays = 14
```
Environment override:
```powershell
$env:BACKUP_WAL_RETENTION_DAYS = 21
pwsh ./scripts/wal-prune.ps1
```

**Performing a Point-In-Time Recovery**:

1. **Stop the database** (if running):
   ```powershell
   docker compose down db
   ```

2. **Restore the base backup** (latest full backup before your target time):
   ```powershell
   # Extract the full cluster backup
   gunzip -c backups/backup_<timestamp>.sql.gz | docker compose exec -T db psql -U postgres
   ```

3. **Configure recovery** (create `recovery.conf` or set recovery target in compose):
   ```yaml
   # Add to db command in compose.yml (temporary, for recovery only)
   command:
     - "postgres"
     - "-c"
     - "restore_command=cp /wal_archive/%f %p"
     - "-c"
     - "recovery_target_time=2025-11-11 15:30:00"
   ```

4. **Start recovery**:
   ```powershell
   docker compose up -d db
   ```
   Postgres will replay WAL files from `/wal_archive` up to the target time.

5. **Promote to primary** (after recovery completes):
   Remove recovery settings from `compose.yml` and restart:
   ```powershell
   docker compose restart db
   ```

**Best practices**:
- Schedule `wal-prune.ps1` nightly (after backup-nightly) to prevent unbounded growth.
- Keep WAL retention >= 2× full backup interval (e.g., if backups are weekly, retain 14 days of WAL).
- Test PITR recovery periodically in a non-production environment.
- Archive WAL files to S3 for long-term retention (similar to backup uploads).

**Troubleshooting WAL archiving**:
- Check WAL archive directory inside container: `docker compose exec db ls -lh /wal_archive`
- Verify archive_command success: `docker compose exec db psql -U postgres -c "SHOW archive_mode;"`
- Monitor for failed archive attempts in Postgres logs: `docker compose logs db | grep archive`

