# MCP Tools Integration Guide

This guide covers integrating your MCP API Gateway with Claude Desktop and using the database health tools.

## What is MCP?

Model Context Protocol (MCP) allows AI assistants like Claude to access external tools and data sources. Your `mcp-api-gateway` exposes:
- Dynamic API tools from Swagger/OpenAPI specs
- Custom database health inspection (`db_health`)

## Architecture

```
Claude Desktop
    ↓ (stdio/HTTP)
MCP Servers:
  - mcp-api-gateway (this repo) → Your APIs + db_health tool
  - supabase MCP server → Supabase management
  - docker MCP gateway → Multi-tool orchestrator
    ↓
Your Databases & APIs
```

## Setup: Claude Desktop Configuration

### 1. Locate Your Config File

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### 2. Add MCP Servers

Edit `claude_desktop_config.json`:

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
    },
    "supabase": {
      "url": "https://mcp.usesupabase.com",
      "transport": "http",
      "headers": {
        "Authorization": "Bearer YOUR_SUPABASE_ACCESS_TOKEN"
      }
    },
    "mcp-docker": {
      "command": "docker",
      "args": [
        "mcp",
        "gateway",
        "run"
      ],
      "cwd": "C:\\Users\\monte\\Documents\\cert api token keys ids\\GITHUB FOLDER\\GitHub\\mcp-api-gateway"
    }
  }
}
```

**Notes:**
- Ensure Docker stack is running before starting Claude Desktop
- Update `cwd` path to match your repository location
- Replace `YOUR_SUPABASE_ACCESS_TOKEN` with actual token

### 3. Restart Claude Desktop

**Complete shutdown required:**
1. Right-click Claude Desktop in system tray → Quit
2. If still running: Open Task Manager → End "Claude Desktop" process
3. Restart Claude Desktop

### 4. Verify MCP Servers Connected

In Claude Desktop:
- Open Settings → Developer
- Look for "Connected MCP Servers" section
- Should see: mcp-api-gateway, supabase, mcp-docker

## Using the db_health Tool

### Via Claude Desktop

In a conversation with Claude, ask:
```
Can you check the database health using the db_health tool?
```

Claude will invoke the tool and return:
- Postgres version
- Current timestamp
- List of installed extensions with versions

### Expected Response Format

```json
{
  "version": "PostgreSQL 15.1 on x86_64-pc-linux-gnu...",
  "current_time": "2025-11-10 18:30:45.123456+00",
  "extensions": [
    {"name": "pg_graphql", "version": "1.2.3"},
    {"name": "pgcrypto", "version": "1.3"},
    {"name": "pgjwt", "version": "0.2.0"},
    {"name": "uuid-ossp", "version": "1.1"}
  ]
}
```

## Testing MCP Integration (Command Line)

### Test the MCP Server Directly

Run the gateway in stdio mode:
```powershell
docker exec -i mcp-api-gateway node /app/index.js
```

Send a test request (JSON-RPC 2.0 format):
```json
{"jsonrpc":"2.0","id":1,"method":"tools/list"}
```

Expected response includes `db_health` tool definition.

### Test db_health Tool

Send tool call request:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "db_health",
    "arguments": {}
  }
}
```

Should return database health information.

## Dynamic API Tools

### Adding APIs to Your Gateway

Set environment variables in `compose.yml`:

```yaml
app:
  environment:
    # Existing vars...
    - API_1_NAME=github
    - API_1_SWAGGER_URL=https://api.github.com/swagger.json
    - API_1_HEADER_AUTHORIZATION=token ghp_yourtoken
    
    - API_2_NAME=petstore
    - API_2_SWAGGER_URL=https://petstore.swagger.io/v2/swagger.json
    - API_2_BASE_URL=https://petstore.swagger.io/v2
```

Restart the app:
```powershell
docker compose -f compose.yml restart app
```

### Using Dynamic API Tools in Claude

Ask Claude:
```
What APIs are available through the MCP gateway?
```

Then use them:
```
Using the petstore API, list available pets
```

Claude will automatically discover and call the appropriate endpoint.

## Troubleshooting

### MCP Server Not Appearing

**Check logs:**
```powershell
# Windows: Check Claude Desktop logs
Get-Content "$env:APPDATA\Claude\logs\mcp*.log" -Tail 50

# Check if container is running
docker ps | Select-String mcp-api-gateway
```

**Common issues:**
1. Container not running: `docker compose -f compose.yml up -d`
2. Config file syntax error: Validate JSON at jsonlint.com
3. Path issues: Use absolute paths in `cwd` field

### db_health Tool Returns Error

**Check database connectivity:**
```powershell
docker exec mcp-api-gateway node --input-type=module -e "import('./config/database.js').then(m=>m.default.authenticate()).then(()=>console.log('OK')).catch(e=>console.log('ERR:',e.message))"
```

**Expected output:** `OK`

**If error:**
1. Check DATABASE_URL in compose.yml
2. Verify db container is healthy: `docker compose ps`
3. Check app logs: `docker compose logs app`

### Docker MCP Gateway Issues

**Error: "Failed to connect"**

Ensure Docker Desktop has MCP gateway feature enabled:
```powershell
docker mcp gateway --version
```

If not available, update Docker Desktop to latest version.

## Advanced: Custom MCP Tools

### Adding New Tools to index.js

Edit `index.js` to add custom tools:

```javascript
// In ListTools handler
case 'tools/list':
  return {
    tools: [
      // Existing db_health tool...
      {
        name: 'run_migration',
        description: 'Run pending database migrations',
        inputSchema: {
          type: 'object',
          properties: {
            direction: {
              type: 'string',
              enum: ['up', 'down'],
              description: 'Migration direction'
            }
          },
          required: ['direction']
        }
      }
    ]
  };

// In CallTool handler
case 'run_migration':
  const { direction } = params.arguments;
  // Implement migration logic
  return { result: 'Migration completed' };
```

Rebuild and restart:
```powershell
docker compose -f compose.yml up -d --build app
```

## Security Best Practices

### 1. Secure API Keys

Never commit tokens to git. Use environment variables:

```yaml
# compose.yml
app:
  environment:
    - API_1_HEADER_AUTHORIZATION=${GITHUB_TOKEN}
```

Set in `.env` file (add to .gitignore):
```
GITHUB_TOKEN=ghp_yourtoken
```

### 2. Limit MCP Access

Only expose tools Claude actually needs. Comment out unused API configurations.

### 3. Database Credentials

For production:
- Use read-only database user for health checks
- Store passwords in Docker secrets or vault
- Never expose DATABASE_URL with passwords in logs

### 4. Network Isolation

Run MCP servers in isolated Docker networks when possible.

## Monitoring MCP Usage

### Check Tool Invocations

Add logging to tool handlers in `index.js`:

```javascript
case 'tools/call':
  console.log(`[MCP] Tool called: ${params.name} at ${new Date().toISOString()}`);
  // ... rest of handler
```

View logs:
```powershell
docker compose logs -f app | Select-String "\[MCP\]"
```

### Track Database Health Checks

Query your usage logs (if you've implemented logging):
```sql
SELECT * FROM usage_logs 
WHERE tool_name = 'db_health' 
ORDER BY created_at DESC 
LIMIT 10;
```

## Integration with CI/CD

### GitHub Actions Workflow

Add MCP health checks to your CI pipeline:

```yaml
name: MCP Health Check
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Start stack
        run: docker compose up -d
        
      - name: Wait for services
        run: sleep 30
        
      - name: Test db_health tool
        run: |
          docker exec -i mcp-api-gateway node -e '
          import("./config/database.js").then(m => 
            m.default.authenticate()
          ).then(() => {
            console.log("Health check passed");
            process.exit(0);
          }).catch(e => {
            console.error("Health check failed:", e);
            process.exit(1);
          });
          '
```

## Next Steps

1. **Explore Available Tools**: Ask Claude "What tools do you have access to?"
2. **Test Database Operations**: Use db_health during upgrades for monitoring
3. **Add Custom Tools**: Extend index.js with project-specific tools
4. **Integrate with Workflows**: Use MCP tools in your daily development

## Reference

- MCP Specification: https://modelcontextprotocol.io/
- Claude Desktop Docs: https://docs.anthropic.com/claude/docs
- Docker MCP Gateway: https://docs.docker.com/mcp/
- Your MCP Server: `c:\Users\monte\Documents\cert api token keys ids\GITHUB FOLDER\GitHub\mcp-api-gateway\index.js`
