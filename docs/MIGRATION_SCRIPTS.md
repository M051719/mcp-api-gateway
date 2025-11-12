# Migration Automation Scripts
## RepMotivatedSeller Netlify to Supabase Migration

This document contains PowerShell and batch scripts to automate the migration process.

---

## Script 1: File Organization and Conversion

### PowerShell Script: `migrate-files.ps1`

```powershell
# RepMotivatedSeller File Migration Script
# Converts Netlify .txt files to proper TypeScript/React structure

param(
    [string]$SourceDir = "C:\Users\monte\Documents\cert api token keys ids\ORIGINAL FILES FOLDER FROM NETLIFY",
    [string]$TargetDir = "c:\users\monte\documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"
)

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "RepMotivatedSeller Migration Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Create directory structure
function Create-DirectoryStructure {
    Write-Host "Creating directory structure..." -ForegroundColor Yellow
    
    $directories = @(
        "src/components/Admin",
        "src/components/Auth",
        "src/components/Contracts",
        "src/components/Foreclosure",
        "src/components/Layout",
        "src/components/Membership",
        "src/pages",
        "src/types",
        "src/store",
        "src/lib",
        "src/utils",
        "supabase/migrations",
        "supabase/functions/send-notification-email",
        "supabase/functions/create-checkout-session",
        "supabase/functions/stripe-webhook"
    )
    
    foreach ($dir in $directories) {
        $fullPath = Join-Path $TargetDir $dir
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
            Write-Host "  ✓ Created: $dir" -ForegroundColor Green
        }
    }
}

# File mapping configuration
$fileMappings = @{
    # Pages
    "AdminDashboard.txt" = "src/pages/AdminPage.tsx"
    "DASHBOARD.txt" = "src/App.tsx"
    "ProfilePage.txt" = "src/pages/ProfilePage.tsx"
    "PrivacyPolicyPage.txt" = "src/pages/PrivacyPolicyPage.tsx"
    "TermsOfServicePage.txt" = "src/pages/TermsOfServicePage.tsx"
    "type AuthMode = login signup reset-password.txt" = "src/pages/AuthPage.tsx"
    "type ContractType = wholesale fix-flip cashout-refi.txt" = "src/pages/ContractsPage.tsx"
    "types membership= PricingCard SubscriptionManager.txt" = "src/pages/PricingPage.tsx"
    
    # Layout Components
    "export const Header.txt" = "src/components/Layout/Header.tsx"
    "export const Footer.txt" = "src/components/Layout/Footer.tsx"
    "export const FinancingBanner.txt" = "src/components/Layout/FinancingBanner.tsx"
    "NEED TO CREATE FILEsrc-components-Layout.txt" = "src/components/Layout/Layout.tsx"
    
    # Admin Components
    "AdminStats.txt" = "src/components/Admin/AdminStats.tsx"
    "CallRecord.txt" = "src/components/Admin/CallRecord.tsx"
    "ForeclosureResponse.txt" = "src/components/Admin/ForeclosureResponse.tsx"
    "USER.txt" = "src/components/Admin/UserManagement.tsx"
    "PROPERTY.txt" = "src/components/Admin/PropertyManagement.tsx"
    
    # Form Components
    "interface FormData.txt" = "src/components/Foreclosure/ForeclosureQuestionnaire.tsx"
    "interface FixFlipFormData.txt" = "src/components/Contracts/FixFlipContractForm.tsx"
    "interface CashoutRefiFormData.txt" = "src/components/Contracts/CashoutRefiForm.tsx"
    
    # Types
    "MEMBERSHIP TIERS.txt" = "src/types/membership.ts"
    
    # Services
    "createCheckoutSession.txt" = "src/lib/stripe.ts"
}

function Copy-AndConvertFiles {
    Write-Host ""
    Write-Host "Converting and copying files..." -ForegroundColor Yellow
    
    $converted = 0
    $skipped = 0
    
    foreach ($sourceFile in $fileMappings.Keys) {
        $sourcePath = Join-Path $SourceDir $sourceFile
        $targetPath = Join-Path $TargetDir $fileMappings[$sourceFile]
        
        if (Test-Path $sourcePath) {
            # Create target directory if needed
            $targetDir = Split-Path $targetPath -Parent
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            }
            
            # Copy file
            Copy-Item -Path $sourcePath -Destination $targetPath -Force
            Write-Host "  ✓ $sourceFile → $($fileMappings[$sourceFile])" -ForegroundColor Green
            $converted++
        } else {
            Write-Host "  ✗ Not found: $sourceFile" -ForegroundColor Red
            $skipped++
        }
    }
    
    Write-Host ""
    Write-Host "Converted: $converted files" -ForegroundColor Green
    Write-Host "Skipped: $skipped files" -ForegroundColor Yellow
}

function Create-TypeDefinitions {
    Write-Host ""
    Write-Host "Creating type definition files..." -ForegroundColor Yellow
    
    # Create auth types
    $authTypes = @"
// Authentication types
export type AuthMode = 'login' | 'signup' | 'reset-password';

export interface User {
  id: string;
  email: string;
  name: string;
  membershipTier: MembershipTier;
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
}

export interface LoginFormProps {
  onToggleMode: () => void;
  onForgotPassword: () => void;
}

export interface SignupFormProps {
  onToggleMode: () => void;
}

export interface ResetPasswordFormProps {
  onBack: () => void;
}
"@
    
    Set-Content -Path (Join-Path $TargetDir "src/types/auth.ts") -Value $authTypes
    Write-Host "  ✓ Created: src/types/auth.ts" -ForegroundColor Green
    
    # Create contract types
    $contractTypes = @"
// Contract types
export type ContractType = 'wholesale' | 'fix-flip' | 'cashout-refi';

export interface ContractData {
  id: string;
  type: ContractType;
  data: any;
  createdAt: string;
  updatedAt: string;
}
"@
    
    Set-Content -Path (Join-Path $TargetDir "src/types/contracts.ts") -Value $contractTypes
    Write-Host "  ✓ Created: src/types/contracts.ts" -ForegroundColor Green
    
    # Create foreclosure types
    $foreclosureTypes = @"
// Foreclosure questionnaire types
export interface ForeclosureFormData {
  // Contact Information
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  
  // Situation Assessment
  situation_length: string;
  payment_difficulty_date: string;
  lender: string;
  payment_status: string;
  missed_payments: string;
  nod: string;
  property_type: string;
  relief_contacted: string;
  home_value: string;
  mortgage_balance: string;
  liens: string;
  
  // Problem Identification
  challenge: string;
  lender_issue: string;
  impact: string;
  options_narrowing: string;
  third_party_help: string;
  overwhelmed: string;
  
  // Impact Analysis
  implication_credit: string;
  implication_loss: string;
  implication_stay_duration: string;
  legal_concerns: string;
  future_impact: string;
  financial_risk: string;
  
  // Solution Planning
  interested_solution: string;
  negotiation_help: string;
  sell_feelings: string;
  credit_importance: string;
  resolution_peace: string;
  open_options: string;
}
"@
    
    Set-Content -Path (Join-Path $TargetDir "src/types/foreclosure.ts") -Value $foreclosureTypes
    Write-Host "  ✓ Created: src/types/foreclosure.ts" -ForegroundColor Green
}

function Create-SupabaseMigrations {
    Write-Host ""
    Write-Host "Creating Supabase migration files..." -ForegroundColor Yellow
    
    # Migration 1: Profiles
    $migration1 = @"
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  membership_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  subscription_id TEXT,
  subscription_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admin policy
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND email = 'admin@repmotivatedseller.org'
    )
  );

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS `$`$`
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
`$`$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
"@
    
    Set-Content -Path (Join-Path $TargetDir "supabase/migrations/20251111000001_create_profiles.sql") -Value $migration1
    Write-Host "  ✓ Created: migration for profiles table" -ForegroundColor Green
    
    # Migration 2: Foreclosure responses
    $migration2 = @"
-- Create foreclosure_responses table
CREATE TABLE IF NOT EXISTS foreclosure_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contact Information
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Situation Assessment
  situation_length TEXT,
  payment_difficulty_date DATE,
  lender TEXT,
  payment_status TEXT,
  missed_payments INTEGER,
  nod TEXT,
  property_type TEXT,
  relief_contacted TEXT,
  home_value NUMERIC,
  mortgage_balance NUMERIC,
  liens TEXT,
  
  -- Problem Identification
  challenge TEXT,
  lender_issue TEXT,
  impact TEXT,
  options_narrowing TEXT,
  third_party_help TEXT,
  overwhelmed TEXT,
  
  -- Impact Analysis
  implication_credit TEXT,
  implication_loss TEXT,
  implication_stay_duration TEXT,
  legal_concerns TEXT,
  future_impact TEXT,
  financial_risk TEXT,
  
  -- Solution Planning
  interested_solution TEXT,
  negotiation_help TEXT,
  sell_feelings TEXT,
  credit_importance TEXT,
  resolution_peace TEXT,
  open_options TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE foreclosure_responses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own responses"
  ON foreclosure_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create responses"
  ON foreclosure_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin policy
CREATE POLICY "Admins can view all responses"
  ON foreclosure_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND email = 'admin@repmotivatedseller.org'
    )
  );

-- Updated at trigger
CREATE TRIGGER update_foreclosure_responses_updated_at
  BEFORE UPDATE ON foreclosure_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
"@
    
    Set-Content -Path (Join-Path $TargetDir "supabase/migrations/20251111000002_create_foreclosure_responses.sql") -Value $migration2
    Write-Host "  ✓ Created: migration for foreclosure_responses table" -ForegroundColor Green
    
    # Migration 3: Contracts
    $migration3 = @"
-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('wholesale', 'fix-flip', 'cashout-refi')),
  contract_data JSONB NOT NULL,
  generated_html TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'downloaded', 'signed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own contracts"
  ON contracts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create contracts"
  ON contracts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contracts"
  ON contracts FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin policy
CREATE POLICY "Admins can view all contracts"
  ON contracts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND email = 'admin@repmotivatedseller.org'
    )
  );

-- Updated at trigger
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_contracts_user_id ON contracts(user_id);
CREATE INDEX idx_contracts_type ON contracts(contract_type);
CREATE INDEX idx_contracts_created_at ON contracts(created_at DESC);
"@
    
    Set-Content -Path (Join-Path $TargetDir "supabase/migrations/20251111000003_create_contracts.sql") -Value $migration3
    Write-Host "  ✓ Created: migration for contracts table" -ForegroundColor Green
}

function Create-EdgeFunctions {
    Write-Host ""
    Write-Host "Creating Supabase Edge Functions..." -ForegroundColor Yellow
    
    # Email notification function
    $emailFunction = @"
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { submissionId, type } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Fetch submission details
    const { data: submission, error } = await supabase
      .from('foreclosure_responses')
      .select('*, profiles(*)')
      .eq('id', submissionId)
      .single()
    
    if (error) throw error
    
    // Determine if urgent
    const isUrgent = submission.nod === 'yes' || submission.missed_payments >= 3
    
    // Send email (integrate with your email service)
    // For now, just log
    console.log(`Sending ${type} notification for submission ${submissionId}`)
    console.log(`Urgent: ${isUrgent}`)
    
    return new Response(
      JSON.stringify({ success: true, urgent: isUrgent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
"@
    
    Set-Content -Path (Join-Path $TargetDir "supabase/functions/send-notification-email/index.ts") -Value $emailFunction
    Write-Host "  ✓ Created: send-notification-email Edge Function" -ForegroundColor Green
    
    # Stripe checkout function
    $stripeFunction = @"
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priceId, customerId } = await req.json()
    
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/success`,
      cancel_url: `${req.headers.get('origin')}/pricing`,
    })
    
    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
"@
    
    Set-Content -Path (Join-Path $TargetDir "supabase/functions/create-checkout-session/index.ts") -Value $stripeFunction
    Write-Host "  ✓ Created: create-checkout-session Edge Function" -ForegroundColor Green
}

function Create-ConfigFiles {
    Write-Host ""
    Write-Host "Creating configuration files..." -ForegroundColor Yellow
    
    # package.json
    $packageJson = @"
{
  "name": "rep-motivated-seller",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:status": "supabase status"
  },
  "dependencies": {
    "@stripe/react-stripe-js": "^2.4.0",
    "@stripe/stripe-js": "^2.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "lucide-react": "^0.294.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
"@
    
    Set-Content -Path (Join-Path $TargetDir "package.json") -Value $packageJson
    Write-Host "  ✓ Created: package.json" -ForegroundColor Green
    
    # .env.example
    $envExample = @"
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Price IDs
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxx
STRIPE_PRICE_ENTERPRISE_YEARLY=price_xxx
"@
    
    Set-Content -Path (Join-Path $TargetDir ".env.example") -Value $envExample
    Write-Host "  ✓ Created: .env.example" -ForegroundColor Green
}

function Show-Summary {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "Migration Summary" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✓ Directory structure created" -ForegroundColor Green
    Write-Host "✓ Files converted and organized" -ForegroundColor Green
    Write-Host "✓ Type definitions created" -ForegroundColor Green
    Write-Host "✓ Database migrations generated" -ForegroundColor Green
    Write-Host "✓ Edge Functions created" -ForegroundColor Green
    Write-Host "✓ Configuration files added" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Review converted files in $TargetDir" -ForegroundColor White
    Write-Host "2. Install dependencies: npm install" -ForegroundColor White
    Write-Host "3. Set up environment variables in .env" -ForegroundColor White
    Write-Host "4. Run Supabase migrations: supabase db push" -ForegroundColor White
    Write-Host "5. Deploy Edge Functions: supabase functions deploy" -ForegroundColor White
    Write-Host "6. Test the application: npm run dev" -ForegroundColor White
    Write-Host ""
}

# Execute migration
Create-DirectoryStructure
Copy-AndConvertFiles
Create-TypeDefinitions
Create-SupabaseMigrations
Create-EdgeFunctions
Create-ConfigFiles
Show-Summary
```

---

## Script 2: Database Setup

### PowerShell Script: `setup-database.ps1`

```powershell
# Database setup and migration script

param(
    [string]$ProjectRef = "",
    [string]$DbPassword = ""
)

Write-Host "Supabase Database Setup" -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrEmpty($ProjectRef)) {
    $ProjectRef = Read-Host "Enter your Supabase project reference"
}

if ([string]::IsNullOrEmpty($DbPassword)) {
    $DbPassword = Read-Host "Enter your database password" -AsSecureString
    $DbPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DbPassword)
    )
}

Write-Host ""
Write-Host "Running migrations..." -ForegroundColor Yellow

# Run migrations
supabase db push --project-ref $ProjectRef --password $DbPassword

Write-Host ""
Write-Host "✓ Migrations completed" -ForegroundColor Green
```

---

## Script 3: Quick Deploy

### Batch Script: `quick-deploy.bat`

```batch
@echo off
echo =====================================
echo RepMotivatedSeller Quick Deploy
echo =====================================
echo.

echo [1/5] Installing dependencies...
call npm install
if errorlevel 1 goto error

echo.
echo [2/5] Building application...
call npm run build
if errorlevel 1 goto error

echo.
echo [3/5] Deploying Edge Functions...
call supabase functions deploy send-notification-email
call supabase functions deploy create-checkout-session
if errorlevel 1 goto error

echo.
echo [4/5] Running database migrations...
call supabase db push
if errorlevel 1 goto error

echo.
echo [5/5] Deployment complete!
echo.
echo Next: Test your application at your Supabase URL
goto end

:error
echo.
echo ERROR: Deployment failed
exit /b 1

:end
```

---

## Usage Instructions

### 1. Run File Migration

```powershell
# Navigate to scripts directory
cd "c:\Users\monte\Documents\cert api token keys ids\GITHUB FOLDER\GitHub\mcp-api-gateway\docs"

# Run migration script
.\migrate-files.ps1
```

### 2. Set Up Database

```powershell
# Navigate to project
cd "c:\users\monte\documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"

# Run database setup
.\setup-database.ps1 -ProjectRef "your-project-ref" -DbPassword "your-password"
```

### 3. Quick Deploy

```batch
# Navigate to project
cd "c:\users\monte\documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"

# Run quick deploy
quick-deploy.bat
```

---

## Manual Steps Checklist

- [ ] Copy scripts to appropriate locations
- [ ] Make scripts executable
- [ ] Update environment variables
- [ ] Configure Stripe webhook URLs
- [ ] Set up custom domain
- [ ] Configure email service
- [ ] Test all features
- [ ] Monitor error logs

---

## Rollback Plan

If migration fails:

1. Keep original Netlify deployment active
2. Restore from backup
3. Review error logs
4. Fix issues
5. Re-run migration scripts

---

## Support

For issues during migration:
- Check Supabase logs: `supabase functions logs`
- Verify environment variables
- Test database connections
- Review migration file syntax
