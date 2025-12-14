# Payment Integration Installation Script
# Automates installation of payment components into RepMotivatedSeller project

param(
    [Parameter(Mandatory = $false)]
    [string]$ProjectPath = "C:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller",
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipDependencies,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipMigration
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Payment Integration Installer" -ForegroundColor Cyan
Write-Host "RepMotivatedSeller Platform" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Validate project path
if (-not (Test-Path $ProjectPath)) {
    Write-Host "❌ Error: Project path not found: $ProjectPath" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Target Project: $ProjectPath" -ForegroundColor Green
Write-Host ""

$currentDir = Get-Location
$sourceDir = Join-Path $currentDir "payment-integration"

if (-not (Test-Path $sourceDir)) {
    Write-Host "❌ Error: payment-integration directory not found" -ForegroundColor Red
    Write-Host "   Expected at: $sourceDir" -ForegroundColor Yellow
    exit 1
}

# Step 1: Copy React components
Write-Host "📦 Step 1: Installing React components..." -ForegroundColor Cyan

$componentsTarget = Join-Path $ProjectPath "src\components\payment"
if (-not (Test-Path $componentsTarget)) {
    New-Item -ItemType Directory -Path $componentsTarget -Force | Out-Null
}

$componentFiles = Get-ChildItem (Join-Path $sourceDir "components") -Filter "*.jsx"
foreach ($file in $componentFiles) {
    Copy-Item $file.FullName -Destination $componentsTarget -Force
    Write-Host "  ✓ Copied $($file.Name)" -ForegroundColor Green
}

# Step 2: Copy backend routes
Write-Host "`n📡 Step 2: Installing backend routes..." -ForegroundColor Cyan

$routesTarget = Join-Path $ProjectPath "src\routes\payment"
if (-not (Test-Path $routesTarget)) {
    New-Item -ItemType Directory -Path $routesTarget -Force | Out-Null
}

$routeFiles = Get-ChildItem (Join-Path $sourceDir "backend\routes") -Filter "*.js"
foreach ($file in $routeFiles) {
    Copy-Item $file.FullName -Destination $routesTarget -Force
    Write-Host "  ✓ Copied $($file.Name)" -ForegroundColor Green
}

# Step 3: Copy webhook handlers
Write-Host "`n🔔 Step 3: Installing webhook handlers..." -ForegroundColor Cyan

$webhooksTarget = Join-Path $ProjectPath "src\webhooks"
if (-not (Test-Path $webhooksTarget)) {
    New-Item -ItemType Directory -Path $webhooksTarget -Force | Out-Null
}

$webhookFiles = Get-ChildItem (Join-Path $sourceDir "backend\webhooks") -Filter "*.js"
foreach ($file in $webhookFiles) {
    Copy-Item $file.FullName -Destination $webhooksTarget -Force
    Write-Host "  ✓ Copied $($file.Name)" -ForegroundColor Green
}

# Step 4: Install NPM dependencies
if (-not $SkipDependencies) {
    Write-Host "`n📚 Step 4: Installing dependencies..." -ForegroundColor Cyan
    
    Push-Location $ProjectPath
    
    $dependencies = @(
        "@stripe/stripe-js",
        "@stripe/react-stripe-js",
        "@paypal/react-paypal-js",
        "stripe"
    )
    
    foreach ($dep in $dependencies) {
        Write-Host "  Installing $dep..." -ForegroundColor Yellow
        npm install $dep --silent 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $dep installed" -ForegroundColor Green
        }
        else {
            Write-Host "  ⚠ Warning: Failed to install $dep" -ForegroundColor Yellow
        }
    }
    
    Pop-Location
}
else {
    Write-Host "`n⏭ Step 4: Skipping dependency installation" -ForegroundColor Yellow
}

# Step 5: Copy database migration
Write-Host "`n🗄 Step 5: Setting up database migration..." -ForegroundColor Cyan

$migrationSource = Join-Path $sourceDir "database\migrations\create-subscriptions.sql"
$migrationTarget = Join-Path $ProjectPath "supabase\migrations"

if (-not (Test-Path $migrationTarget)) {
    New-Item -ItemType Directory -Path $migrationTarget -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$migrationFile = Join-Path $migrationTarget "${timestamp}_create_subscriptions.sql"
Copy-Item $migrationSource -Destination $migrationFile -Force
Write-Host "  ✓ Migration file created: $migrationFile" -ForegroundColor Green

if (-not $SkipMigration) {
    Write-Host "`n  Running migration..." -ForegroundColor Yellow
    Write-Host "  (You can also run this manually in Supabase SQL editor)" -ForegroundColor Gray
    
    # Check if Supabase CLI is available
    $supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue
    if ($supabaseCli) {
        Push-Location $ProjectPath
        supabase db push
        Pop-Location
        Write-Host "  ✓ Migration applied" -ForegroundColor Green
    }
    else {
        Write-Host "  ⚠ Supabase CLI not found. Please run migration manually:" -ForegroundColor Yellow
        Write-Host "    1. Open Supabase Dashboard > SQL Editor" -ForegroundColor Gray
        Write-Host "    2. Paste contents of: $migrationFile" -ForegroundColor Gray
        Write-Host "    3. Run the query" -ForegroundColor Gray
    }
}
else {
    Write-Host "  ⏭ Skipping migration execution" -ForegroundColor Yellow
}

# Step 6: Update App.tsx with routes
Write-Host "`n🔧 Step 6: Updating App.tsx..." -ForegroundColor Cyan

$appFile = Join-Path $ProjectPath "src\App.tsx"
if (Test-Path $appFile) {
    $appContent = Get-Content $appFile -Raw
    
    # Check if imports already exist
    if ($appContent -notmatch "MembershipPlans") {
        Write-Host "  Adding route imports..." -ForegroundColor Yellow
        Write-Host "  ⚠ Manual step required:" -ForegroundColor Yellow
        Write-Host "    Add these imports to App.tsx:" -ForegroundColor Gray
        Write-Host ""
        Write-Host "    import MembershipPlans from './components/payment/MembershipPlans'" -ForegroundColor White
        Write-Host "    import PaymentSuccess from './components/payment/PaymentSuccess'" -ForegroundColor White
        Write-Host ""
        Write-Host "    Add these routes inside <Routes>:" -ForegroundColor Gray
        Write-Host ""
        Write-Host "    <Route path='/pricing' element={<MembershipPlans />} />" -ForegroundColor White
        Write-Host "    <Route path='/payment/success' element={<PaymentSuccess />} />" -ForegroundColor White
        Write-Host ""
    }
    else {
        Write-Host "  ✓ Routes already configured" -ForegroundColor Green
    }
}
else {
    Write-Host "  ⚠ App.tsx not found at: $appFile" -ForegroundColor Yellow
}

# Step 7: Verify environment variables
Write-Host "`n🔐 Step 7: Checking environment variables..." -ForegroundColor Cyan

$envFile = Join-Path $ProjectPath ".env.development"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    
    $requiredVars = @(
        "STRIPE_API_KEY",
        "VITE_STRIPE_PUBLIC_KEY",
        "STRIPE_BASIC_PRICE_ID",
        "STRIPE_PREMIUM_PRICE_ID",
        "STRIPE_VIP_PRICE_ID",
        "PAYPAL_API_CLIENT_ID",
        "VITE_PAYPAL_CLIENT_ID",
        "PAYPAL_BASIC_PLAN_ID",
        "PAYPAL_PREMIUM_PLAN_ID",
        "PAYPAL_VIP_PLAN_ID"
    )
    
    $missing = @()
    foreach ($var in $requiredVars) {
        if ($envContent -notmatch $var) {
            $missing += $var
        }
    }
    
    if ($missing.Count -eq 0) {
        Write-Host "  ✓ All required environment variables found" -ForegroundColor Green
    }
    else {
        Write-Host "  ⚠ Missing environment variables:" -ForegroundColor Yellow
        foreach ($var in $missing) {
            Write-Host "    - $var" -ForegroundColor Gray
        }
    }
}
else {
    Write-Host "  ⚠ .env.development not found" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ Installation Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Update App.tsx with payment routes (see instructions above)" -ForegroundColor White
Write-Host "2. Run database migration if not auto-applied" -ForegroundColor White
Write-Host "3. Configure webhooks in Stripe and PayPal dashboards:" -ForegroundColor White
Write-Host "   - Stripe: https://dashboard.stripe.com/webhooks" -ForegroundColor Gray
Write-Host "   - PayPal: https://developer.paypal.com/dashboard/webhooks" -ForegroundColor Gray
Write-Host "4. Test payment flow with test cards/sandbox accounts" -ForegroundColor White
Write-Host "5. Review documentation in payment-integration/docs/" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test URLs:" -ForegroundColor Yellow
Write-Host "   Pricing Page: http://localhost:5173/pricing" -ForegroundColor Gray
Write-Host "   Success Page: http://localhost:5173/payment/success" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   - Integration Guide: payment-integration/docs/INTEGRATION-GUIDE.md" -ForegroundColor Gray
Write-Host "   - API Reference: payment-integration/docs/API-REFERENCE.md" -ForegroundColor Gray
Write-Host "   - Troubleshooting: payment-integration/docs/TROUBLESHOOTING.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Cyan
