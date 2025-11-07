<#
.SYNOPSIS
  Simple local passphrase store using Windows DPAPI via ConvertFrom-SecureString.

USAGE
  Save a passphrase for reuse (scoped to the current user):
    ./scripts/openssl-passphrase-store.ps1 -Action save -File .passphrase

  Retrieve and print the passphrase (for piping into other scripts):
    ./scripts/openssl-passphrase-store.ps1 -Action get -File .passphrase

  Remove stored passphrase:
    ./scripts/openssl-passphrase-store.ps1 -Action remove -File .passphrase

NOTES
  - The file is protected by DPAPI and can only be decrypted by the same Windows user account.
  - This is intended as a convenience for local development only. For production, use a proper secret store.
#>

[param(
  [Parameter(Mandatory=$true)]
  [ValidateSet('save','get','remove')]
  [string]$Action,
  [string]$File = '.passphrase'
)]

function Save-Passphrase {
  param($Path)
  $cred = Read-Host -AsSecureString "Enter passphrase to save (input hidden)"
  try {
    $enc = $cred | ConvertFrom-SecureString
    Set-Content -Path $Path -Value $enc -Encoding UTF8 -Force
    # Restrict file permissions to current user
    try {
      icacls $Path /inheritance:r | Out-Null
      icacls $Path /grant:r "$env:USERNAME:(R)" | Out-Null
    } catch {
      # Non-fatal on systems without icacls
    }
    Write-Host "Passphrase saved to $Path (DPAPI-protected, user-scoped)"
  } catch {
    Write-Error "Failed to save passphrase: $_"
    exit 1
  }
}

function Get-Passphrase {
  param($Path)
  if (-not (Test-Path $Path)) { Write-Error "Passphrase file not found: $Path"; exit 2 }
  try {
    $enc = Get-Content -Path $Path -Raw
    $secure = $enc | ConvertTo-SecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $plain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    Write-Output $plain
  } catch {
    Write-Error "Failed to read passphrase: $_"
    exit 1
  }
}

function Remove-Passphrase {
  param($Path)
  if (Test-Path $Path) { Remove-Item -Path $Path -Force; Write-Host "Removed $Path" } else { Write-Host "No passphrase file at $Path" }
}

switch ($Action) {
  'save'   { Save-Passphrase -Path $File }
  'get'    { Get-Passphrase -Path $File }
  'remove' { Remove-Passphrase -Path $File }
}
