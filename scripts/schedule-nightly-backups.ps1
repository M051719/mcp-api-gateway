#!/usr/bin/env pwsh
<#!
Registers (or removes) a Windows Scheduled Task to run nightly database backups.
By default runs daily at 02:00 using backup-nightly.ps1 located in the same repository.
Requires: Windows PowerShell with permission to register scheduled tasks.
Usage:
  pwsh ./scripts/schedule-nightly-backups.ps1 [-Time '02:00'] [-TaskName 'McpNightlyBackups'] [-RetentionDays 7]
  pwsh ./scripts/schedule-nightly-backups.ps1 -Remove [-TaskName 'McpNightlyBackups']
Note: If running in a non-interactive automation context you may need to specify -User and -Password parameters; this script uses the current user context by default.
#!>
param(
  [string]$Time = '02:00',
  [string]$TaskName = 'McpNightlyBackups',
  [int]$RetentionDays = 7,
  [switch]$Remove
)

$ErrorActionPreference = 'Stop'

if ($Remove) {
  if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Write-Host "Removing scheduled task '$TaskName'..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "✅ Removed task." -ForegroundColor Green
  } else {
    Write-Host "Task '$TaskName' not found." -ForegroundColor DarkGray
  }
  exit 0
}

if (-not ($Time -match '^(\d{2}):(\d{2})$')) { Write-Host "Invalid -Time format. Use HH:MM (24h)." -ForegroundColor Red; exit 1 }
$hour = [int]$Matches[1]; $minute = [int]$Matches[2]
if ($hour -gt 23 -or $minute -gt 59) { Write-Host "Invalid time components." -ForegroundColor Red; exit 1 }

$scriptPath = Join-Path (Get-Location) 'scripts/backup-nightly.ps1'
if (-not (Test-Path $scriptPath)) { Write-Host "Could not locate backup-nightly.ps1 at $scriptPath" -ForegroundColor Red; exit 1 }

Write-Host "Registering scheduled task '$TaskName' to run $Time daily..." -ForegroundColor Cyan
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
  Write-Host "Existing task found. Updating..." -ForegroundColor Yellow
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

$action = New-ScheduledTaskAction -Execute 'pwsh.exe' -Argument "-NoLogo -NoProfile -File `"$scriptPath`" -RetentionDays $RetentionDays"
$trigger = New-ScheduledTaskTrigger -Daily -At ([datetime]::Today.AddHours($hour).AddMinutes($minute).TimeOfDay)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -Action $action -Trigger $trigger -TaskName $TaskName -Description "Nightly DB backups (full + public-only)" -Settings $settings | Out-Null

Write-Host "✅ Scheduled task '$TaskName' registered for daily execution at $Time." -ForegroundColor Green
Write-Host "To test immediately: pwsh $scriptPath" -ForegroundColor DarkGray
Write-Host "To remove: pwsh ./scripts/schedule-nightly-backups.ps1 -Remove -TaskName $TaskName" -ForegroundColor DarkGray

exit 0
