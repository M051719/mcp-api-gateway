param(
  [Parameter(Mandatory=$true)][string]$InFile,
  [Parameter(Mandatory=$false)][string]$OutFile = (if ($InFile.EndsWith('.enc')) { $InFile.Substring(0, $InFile.Length - 4) } else { "$InFile.dec" }),
  [switch]$UseStore,
  [string]$StoreFile = '.passphrase'
)

try {
  if (-not (Test-Path $InFile)) { throw "Input file not found: $InFile" }
  Write-Host "Decrypting $InFile -> $OutFile"

  if ($UseStore) {
    $script = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) 'openssl-passphrase-store.ps1'
    if (-not (Test-Path $script)) { throw "Passphrase store helper not found: $script" }
    $plaintext = & pwsh -NoProfile -NoLogo -Command "$script -Action get -File '$StoreFile'"
    if ($LASTEXITCODE -ne 0 -or -not $plaintext) { throw "Failed to read passphrase from store" }
  } else {
    $pass = Read-Host -AsSecureString "Enter decryption passphrase"
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pass)
    $plaintext = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
  }

  $openssl = "openssl"
  $cmd = "$openssl enc -d -aes-256-cbc -pbkdf2 -in \"$InFile\" -out \"$OutFile\" -pass pass:$plaintext"
  iex $cmd
  Write-Host "Done."
} catch {
  Write-Error $_.Exception.Message
  exit 1
}
