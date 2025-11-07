param(
  [Parameter(Mandatory=$true)][string]$InFile,
  [Parameter(Mandatory=$false)][string]$OutFile = "${InFile}.enc",
  [switch]$UseStore,
  [string]$StoreFile = '.passphrase'
)

try {
  if (-not (Test-Path $InFile)) { throw "Input file not found: $InFile" }
  Write-Host "Encrypting $InFile -> $OutFile"

  if ($UseStore) {
    # Use stored passphrase (DPAPI-protected)
    $script = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) 'openssl-passphrase-store.ps1'
    if (-not (Test-Path $script)) { throw "Passphrase store helper not found: $script" }
    $plaintext = & pwsh -NoProfile -NoLogo -Command "$script -Action get -File '$StoreFile'"
    if ($LASTEXITCODE -ne 0 -or -not $plaintext) { throw "Failed to read passphrase from store" }
  } else {
    # Prompt for passphrase
    $pass = Read-Host -AsSecureString "Enter encryption passphrase"
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pass)
    $plaintext = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
  }

  # Use OpenSSL for encryption
  $openssl = "openssl"
  $cmd = "$openssl enc -aes-256-cbc -pbkdf2 -salt -in \"$InFile\" -out \"$OutFile\" -pass pass:$plaintext"
  iex $cmd
  Write-Host "Done. Keep the passphrase secure."
} catch {
  Write-Error $_.Exception.Message
  exit 1
}
