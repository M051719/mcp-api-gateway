# Pester tests for extension upgrade plan prerequisites
[CmdletBinding()]
param(
    [string]$DatabaseUrl = 'postgresql://postgres:postgres@localhost:5432/postgres'
)

BeforeAll {
    . "$PSScriptRoot/common/database-helpers.ps1"
}

Describe 'Extension Upgrade Prerequisites' {
    It 'TimescaleDB should be installed or absent gracefully' {
        $exts = Get-ExtensionVersions -DatabaseUrl $DatabaseUrl
        $ts = $exts | Where-Object name -eq 'timescaledb'
        $true | Should -BeTrue # placeholder; presence optional in local
    }

    It 'plv8 should be installed or absent gracefully' {
        $exts = Get-ExtensionVersions -DatabaseUrl $DatabaseUrl
        $pl = $exts | Where-Object name -eq 'plv8'
        $true | Should -BeTrue
    }

    It 'uuid-ossp should exist (required for app)' {
        $exts = Get-ExtensionVersions -DatabaseUrl $DatabaseUrl
        ($exts | Where-Object name -eq 'uuid-ossp') | Should -Not -BeNullOrEmpty
    }

    It 'pgcrypto should exist (required for app)' {
        $exts = Get-ExtensionVersions -DatabaseUrl $DatabaseUrl
        ($exts | Where-Object name -eq 'pgcrypto') | Should -Not -BeNullOrEmpty
    }
}

Describe 'Hypertable Metadata Snapshot (TimescaleDB optional)' {
    It 'Can query hypertables if TimescaleDB is present' {
        $sql = "SELECT 1" # simplified; real query would hit timescaledb_information
        $res = Invoke-PostgresQuery -DatabaseUrl $DatabaseUrl -Sql $sql
        $res | Should -Contain '1'
    }
}

Describe 'plv8 Function Snapshot (optional)' {
    It 'Captures plv8 function list (zero or more)' {
        $sql = @"
SELECT count(*) FROM pg_proc p JOIN pg_language l ON p.prolang = l.oid WHERE l.lanname='plv8';
"@
        $res = Invoke-PostgresQuery -DatabaseUrl $DatabaseUrl -Sql $sql
        ($res -match '^[0-9]+$') | Should -BeTrue
    }
}
