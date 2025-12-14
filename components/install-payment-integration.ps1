# Payment Integration Installation Script
# Run this script to set up the payment integration in your React app

param(
    [string]$ReactAppPath = "",
    [switch]$InstallDependencies = $true,
    [switch]$CopyEnv = $true
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RepMotivatedSeller Payment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get React app path if not provided
if ([string]::IsNullOrWhiteSpace($ReactAppPath)) {
    Write-Host "Enter the path to your React app:" -ForegroundColor Yellow
    Write-Host "Example: C:\Users\monte\Documents\my-react-app" -ForegroundColor Gray
    $ReactAppPath = Read-Host "Path"
}

# Validate path
if (-not (Test-Path $ReactAppPath)) {
    Write-Host "❌ Error: Path not found: $ReactAppPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ React app found: $ReactAppPath" -ForegroundColor Green
Write-Host ""

# Create components directory if it doesn't exist
$componentsDir = Join-Path $ReactAppPath "src\components\payment"
if (-not (Test-Path $componentsDir)) {
    Write-Host "Creating components directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $componentsDir -Force | Out-Null
    Write-Host "✅ Directory created: $componentsDir" -ForegroundColor Green
}
else {
    Write-Host "✅ Components directory exists" -ForegroundColor Green
}

# Copy React components
Write-Host ""
Write-Host "Copying React components..." -ForegroundColor Yellow
$componentFiles = @(
    "MembershipPlans.jsx",
    "StripeCheckout.jsx",
    "PayPalCheckout.jsx",
    "PaymentSuccess.jsx"
)

foreach ($file in $componentFiles) {
    $source = Join-Path $PSScriptRoot $file
    $destination = Join-Path $componentsDir $file
    
    if (Test-Path $source) {
        Copy-Item $source $destination -Force
        Write-Host "  ✅ Copied: $file" -ForegroundColor Green
    }
    else {
        Write-Host "  ⚠️  Not found: $file" -ForegroundColor Yellow
    }
}

# Create API directory
$apiDir = Join-Path $ReactAppPath "src\api"
if (-not (Test-Path $apiDir)) {
    New-Item -ItemType Directory -Path $apiDir -Force | Out-Null
}

# Copy API handlers
Write-Host ""
Write-Host "Copying API handlers..." -ForegroundColor Yellow
$apiSource = Join-Path $PSScriptRoot "api"
if (Test-Path $apiSource) {
    Copy-Item "$apiSource\*" $apiDir -Recurse -Force
    Write-Host "  ✅ Copied API handlers" -ForegroundColor Green
}
else {
    Write-Host "  ⚠️  API directory not found" -ForegroundColor Yellow
}

# Copy routes
$routesDir = Join-Path $ReactAppPath "src\routes"
if (-not (Test-Path $routesDir)) {
    New-Item -ItemType Directory -Path $routesDir -Force | Out-Null
}

$routesSource = Join-Path $PSScriptRoot "routes"
if (Test-Path $routesSource) {
    Copy-Item "$routesSource\*" $routesDir -Recurse -Force
    Write-Host "  ✅ Copied routes" -ForegroundColor Green
}

# Copy server.js to root of React app
Write-Host ""
Write-Host "Copying server files..." -ForegroundColor Yellow
$serverSource = Join-Path $PSScriptRoot "server.js"
if (Test-Path $serverSource) {
    Copy-Item $serverSource (Join-Path $ReactAppPath "server.js") -Force
    Write-Host "  ✅ Copied: server.js" -ForegroundColor Green
}

# Copy environment file if requested
if ($CopyEnv) {
    Write-Host ""
    Write-Host "Copying environment variables..." -ForegroundColor Yellow
    
    $envSource = Join-Path $PSScriptRoot "..\..\.env.development"
    $envDest = Join-Path $ReactAppPath ".env"
    
    if (Test-Path $envSource) {
        # Read source env
        $envContent = Get-Content $envSource
        
        # If .env exists, append; otherwise create
        if (Test-Path $envDest) {
            Write-Host "  ℹ️  .env exists, appending payment variables..." -ForegroundColor Cyan
            
            # Extract payment-related variables
            $paymentVars = $envContent | Where-Object {
                $_ -match "STRIPE|PAYPAL|PAYMENT"
            }
            
            Add-Content $envDest "`n# Payment Integration Variables"
            Add-Content $envDest $paymentVars
            Write-Host "  ✅ Appended to: .env" -ForegroundColor Green
        }
        else {
            Copy-Item $envSource $envDest -Force
            Write-Host "  ✅ Created: .env" -ForegroundColor Green
        }
    }
    else {
        Write-Host "  ⚠️  Source .env not found" -ForegroundColor Yellow
    }
}

# Install dependencies if requested
if ($InstallDependencies) {
    Write-Host ""
    Write-Host "Installing NPM dependencies..." -ForegroundColor Yellow
    
    $currentDir = Get-Location
    Set-Location $ReactAppPath
    
    try {
        # Check if package.json exists
        if (Test-Path "package.json") {
            Write-Host ""
            Write-Host "Installing:" -ForegroundColor Cyan
            Write-Host "  • @stripe/stripe-js" -ForegroundColor Gray
            Write-Host "  • @stripe/react-stripe-js" -ForegroundColor Gray
            Write-Host "  • @paypal/react-paypal-js" -ForegroundColor Gray
            Write-Host "  • stripe" -ForegroundColor Gray
            Write-Host "  • axios" -ForegroundColor Gray
            Write-Host "  • express" -ForegroundColor Gray
            Write-Host "  • cors" -ForegroundColor Gray
            Write-Host "  • dotenv" -ForegroundColor Gray
            Write-Host ""
            
            npm install @stripe/stripe-js @stripe/react-stripe-js @paypal/react-paypal-js stripe axios express cors dotenv
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Dependencies installed successfully" -ForegroundColor Green
            }
            else {
                Write-Host "  ⚠️  Some dependencies may have failed to install" -ForegroundColor Yellow
            }
        }
        else {
            Write-Host "  ⚠️  package.json not found, skipping npm install" -ForegroundColor Yellow
        }
    }
    finally {
        Set-Location $currentDir
    }
}

# Create usage example
Write-Host ""
Write-Host "Creating usage example..." -ForegroundColor Yellow

$exampleContent = @"
// Example: How to use MembershipPlans component
// Add this to your App.jsx or routing file

import MembershipPlans from './components/payment/MembershipPlans';
import PaymentSuccess from './components/payment/PaymentSuccess';

function App() {
  // Get user info from your auth system
  const userId = 'user_123';  // Replace with actual user ID
  const userEmail = 'user@example.com';  // Replace with actual email

  return (
    <div>
      {/* Pricing page */}
      <MembershipPlans 
        userId={userId}
        userEmail={userEmail}
      />

      {/* Success page - use with React Router */}
      {/* <Route path="/payment/success" element={<PaymentSuccess />} /> */}
    </div>
  );
}

export default App;
"@

$examplePath = Join-Path $componentsDir "USAGE_EXAMPLE.jsx"
Set-Content $examplePath $exampleContent
Write-Host "  ✅ Created: USAGE_EXAMPLE.jsx" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Complete! 🎉" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📂 Files installed in:" -ForegroundColor Yellow
Write-Host "   $componentsDir" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Review .env file and update credentials" -ForegroundColor White
Write-Host "   2. Check USAGE_EXAMPLE.jsx for integration guide" -ForegroundColor White
Write-Host "   3. Start backend server: node server.js" -ForegroundColor White
Write-Host "   4. Start frontend: npm run dev" -ForegroundColor White
Write-Host "   5. Test payments at http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   • Quick Start: components\QUICK-START.md" -ForegroundColor White
Write-Host "   • Full Guide: docs\PAYMENT-INTEGRATION-MASTER-GUIDE.md" -ForegroundColor White
Write-Host "   • Component Docs: components\README.md" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test Cards:" -ForegroundColor Yellow
Write-Host "   • Success: 4242 4242 4242 4242" -ForegroundColor White
Write-Host "   • Decline: 4000 0000 0000 0002" -ForegroundColor White
Write-Host ""
Write-Host "✅ Ready to accept payments!" -ForegroundColor Green
Write-Host ""

# Open browser to documentation
$openDocs = Read-Host "Open documentation in browser? (Y/N)"
if ($openDocs -eq "Y" -or $openDocs -eq "y") {
    $quickStartPath = Join-Path $PSScriptRoot "QUICK-START.md"
    if (Test-Path $quickStartPath) {
        Start-Process $quickStartPath
    }
}

Write-Host "Done! 🚀" -ForegroundColor Green
