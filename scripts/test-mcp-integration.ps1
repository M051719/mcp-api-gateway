#!/usr/bin/env pwsh
# Test MCP db_health tool directly
Write-Host "🧪 Testing MCP db_health tool..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Check container is running
Write-Host "1. Checking container status..." -ForegroundColor Yellow
$containerStatus = docker ps --filter "name=mcp-api-gateway" --format "{{.Status}}"
if ($containerStatus -match "Up") {
    Write-Host "   ✅ Container is running" -ForegroundColor Green
}
else {
    Write-Host "   ❌ Container not running!" -ForegroundColor Red
    exit 1
}

# Test 2: Test MCP protocol initialization
Write-Host ""
Write-Host "2. Testing MCP protocol handshake..." -ForegroundColor Yellow
$initRequest = '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0"}}}'
$initResponse = $initRequest | docker exec -i mcp-api-gateway node /app/index.js 2>$null | Select-String -Pattern '^\{.*"result".*\}$' -Raw
if ($initResponse) {
    Write-Host "   ✅ MCP server initialized" -ForegroundColor Green
}
else {
    Write-Host "   ⚠️  Could not parse response" -ForegroundColor Yellow
}

# Test 3: Test db_health via direct Node execution
Write-Host ""
Write-Host "3. Testing db_health via direct database query..." -ForegroundColor Yellow
$testScript = @'
import('./config/database.js').then(async ({ default: sequelize }) => {
  const [v] = await sequelize.query('SELECT version()');
  const [t] = await sequelize.query('SELECT now() as server_time');
  const [e] = await sequelize.query('SELECT extname, extversion FROM pg_extension ORDER BY extname');
  console.log(JSON.stringify({
    version: v[0].version,
    server_time: t[0].server_time,
    extension_count: e.length,
    extensions: e.map(x => `${x.extname} ${x.extversion}`).join(', ')
  }, null, 2));
  process.exit(0);
}).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
'@

$result = docker exec mcp-api-gateway node --input-type=module -e $testScript 2>&1 | Where-Object { $_ -match '^\{' -or $_ -match 'version|extensions' }

if ($result) {
    Write-Host "   ✅ Database health check successful:" -ForegroundColor Green
    $result | ForEach-Object { Write-Host "      $_" -ForegroundColor Cyan }
}
else {
    Write-Host "   ❌ Health check failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Claude Desktop Configuration..." -ForegroundColor Yellow
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
if (Test-Path $configPath) {
    Write-Host "   ✅ Config file exists: $configPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "   📋 Current configuration:" -ForegroundColor Cyan
    Get-Content $configPath | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
}
else {
    Write-Host "   ❌ Config file not found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "1. Restart Claude Desktop completely:" -ForegroundColor White
Write-Host "   - System tray → Right-click Claude → Quit" -ForegroundColor Gray
Write-Host "   - Task Manager → End any remaining Claude processes" -ForegroundColor Gray
Write-Host "   - Start Claude Desktop" -ForegroundColor Gray
Write-Host ""
Write-Host "2. In Claude Desktop, ask:" -ForegroundColor White
Write-Host '   "Can you check the database health using the db_health tool?"' -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Expected response should include:" -ForegroundColor White
Write-Host "   - PostgreSQL version (15.1)" -ForegroundColor Gray
Write-Host "   - Server timestamp" -ForegroundColor Gray
Write-Host "   - List of 8 installed extensions" -ForegroundColor Gray
Write-Host ""
