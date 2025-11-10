function Invoke-ContainerPsql {
  param(
    [string]$ContainerName = 'mcp-supabase-db',
    [string]$Database = 'postgres',
    [string]$User = 'postgres',
    [string]$Sql
  )
  $dockerArgs = @('exec', $ContainerName, 'psql', '-U', $User, '-d', $Database, '-At', '-F', '|', '-c', $Sql)
  $result = & docker @dockerArgs 2>$null
  return $result
}

function Invoke-PostgresQuery {
  param([string]$DatabaseUrl, [string]$Sql)
  $result = & psql $DatabaseUrl -At -F '|' -c $Sql 2>$null
  return $result
}

function Get-ExtensionVersions {
  param([string]$DatabaseUrl)
  $sql = "SELECT extname, extversion FROM pg_extension ORDER BY extname;"
  (Invoke-PostgresQuery -DatabaseUrl $DatabaseUrl -Sql $sql) | ForEach-Object {
    $parts = $_.Split('|'); [PSCustomObject]@{ name=$parts[0]; version=$parts[1] }
  }
}
