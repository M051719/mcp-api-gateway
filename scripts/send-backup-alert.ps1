#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Send email alert on backup integrity failure
.DESCRIPTION
    Sends an SMTP email notification when backup verification detects issues.
    Uses config file and environment variable overrides for SMTP settings.
.PARAMETER Subject
    Email subject line
.PARAMETER Body
    Email body (plain text)
.PARAMETER ConfigPath
    Path to backup config (psd1). Defaults to ./scripts/backup.config.psd1
#>
param(
    [string]$Subject = "Backup Integrity Verification Failed",
    [string]$Body,
    [string]$ConfigPath = './scripts/backup.config.psd1'
)

$ErrorActionPreference = 'Stop'

# Load config
$cfg = @{}
if (Test-Path $ConfigPath) {
    try { $cfg = Import-PowerShellDataFile -Path $ConfigPath } 
    catch { Write-Host "⚠️ Failed to load config: $($_.Exception.Message)" -ForegroundColor Yellow }
}

# Merge config values with env overrides
$smtpServer = $cfg.SmtpServer
$smtpPort = $cfg.SmtpPort
$smtpFrom = $cfg.SmtpFrom
$smtpUser = $cfg.SmtpUser
$smtpPassword = $cfg.SmtpPassword
$recipients = $cfg.AlertRecipients

# Environment overrides (PREFIX: BACKUP_ALERT_*)
function EnvOverride {
    param([string]$name, [scriptblock]$apply)
    $val = [Environment]::GetEnvironmentVariable($name)
    if ($val) { & $apply $val }
}
EnvOverride 'BACKUP_ALERT_SMTP_SERVER' { param($v) $script:smtpServer = $v }
EnvOverride 'BACKUP_ALERT_SMTP_PORT' { param($v) $script:smtpPort = [int]$v }
EnvOverride 'BACKUP_ALERT_SMTP_FROM' { param($v) $script:smtpFrom = $v }
EnvOverride 'BACKUP_ALERT_SMTP_USER' { param($v) $script:smtpUser = $v }
EnvOverride 'BACKUP_ALERT_SMTP_PASSWORD' { param($v) $script:smtpPassword = $v }
EnvOverride 'BACKUP_ALERT_RECIPIENTS' { param($v) $script:recipients = $v -split ',' }

# Validate
if (-not $smtpServer) { Write-Host "❌ SmtpServer not configured. Skipping alert." -ForegroundColor Red; exit 1 }
if (-not $smtpFrom) { Write-Host "❌ SmtpFrom not configured. Skipping alert." -ForegroundColor Red; exit 1 }
if (-not $recipients -or $recipients.Count -eq 0) { Write-Host "❌ AlertRecipients not configured. Skipping alert." -ForegroundColor Red; exit 1 }

Write-Host "Sending backup alert email..." -ForegroundColor Yellow
Write-Host "  Server: $smtpServer:$smtpPort" -ForegroundColor Gray
Write-Host "  From: $smtpFrom" -ForegroundColor Gray
Write-Host "  To: $($recipients -join ', ')" -ForegroundColor Gray

try {
    $mailParams = @{
        SmtpServer = $smtpServer
        Port       = $smtpPort
        From       = $smtpFrom
        To         = $recipients
        Subject    = $Subject
        Body       = $Body
        UseSsl     = $true
    }
    
    # Add credentials if provided
    if ($smtpUser -and $smtpPassword) {
        $secPass = ConvertTo-SecureString $smtpPassword -AsPlainText -Force
        $cred = New-Object System.Management.Automation.PSCredential($smtpUser, $secPass)
        $mailParams['Credential'] = $cred
    }

    Send-MailMessage @mailParams
    Write-Host "✅ Alert email sent successfully." -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to send alert email: $($_.Exception.Message)" -ForegroundColor Red
    exit 2
}

exit 0
