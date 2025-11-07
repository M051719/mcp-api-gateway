param(
  [string]$env = ''
)

# PowerShell wrapper that runs the Node switch-env script from the repository root
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path "$scriptDir\.."

if (-not (Test-Path "$repoRoot\scripts\switch-env.js")) {
  Write-Error "switch-env.js not found in $repoRoot\scripts. Run this from the repository scripts folder or ensure files are present."
  exit 1
}

Push-Location $repoRoot
try {
  if ($env -ne '') {
    node ./scripts/switch-env.js --env $env
  } else {
    node ./scripts/switch-env.js
  }
} finally {
  Pop-Location
}
