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
Write-Host "Source: $SourceDir" -ForegroundColor White
Write-Host "Target: $TargetDir" -ForegroundColor White
Write-Host ""

# Verify directories exist
if (-not (Test-Path $SourceDir)) {
    Write-Host "ERROR: Source directory not found!" -ForegroundColor Red
    Write-Host $SourceDir -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $TargetDir)) {
    Write-Host "WARNING: Target directory not found. Creating it..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
}

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
        "supabase/functions/stripe-webhook",
        "public",
        "docs"
    )
    
    foreach ($dir in $directories) {
        $fullPath = Join-Path $TargetDir $dir
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
            Write-Host "  ✓ Created: $dir" -ForegroundColor Green
        }
        else {
            Write-Host "  - Exists: $dir" -ForegroundColor Gray
        }
    }
    Write-Host ""
}

# File mapping configuration
$fileMappings = @{
    # Pages
    "AdminDashboard.txt"                                      = "src/pages/AdminPage.tsx"
    "DASHBOARD.txt"                                           = "src/App.tsx"
    "ProfilePage.txt"                                         = "src/pages/ProfilePage.tsx"
    "PrivacyPolicyPage.txt"                                   = "src/pages/PrivacyPolicyPage.tsx"
    "TermsOfServicePage.txt"                                  = "src/pages/TermsOfServicePage.tsx"
    "type AuthMode = login signup reset-password.txt"         = "src/pages/AuthPage.tsx"
    "type ContractType = wholesale fix-flip cashout-refi.txt" = "src/pages/ContractsPage.tsx"
    "types membership= PricingCard SubscriptionManager.txt"   = "src/pages/PricingPage.tsx"
    "RentalAnalysisPage.tsx"                                  = "src/pages/RentalAnalysisPage.tsx"
    
    # Layout Components
    "export const Header.txt"                                 = "src/components/Layout/Header.tsx"
    "export const Footer.txt"                                 = "src/components/Layout/Footer.tsx"
    "export const FinancingBanner.txt"                        = "src/components/Layout/FinancingBanner.tsx"
    "NEED TO CREATE FILEsrc-components-Layout.txt"            = "src/components/Layout/Layout.tsx"
    
    # Admin Components
    "AdminStats.txt"                                          = "src/components/Admin/AdminStats.tsx"
    "CallRecord.txt"                                          = "src/components/Admin/CallRecord.tsx"
    "ForeclosureResponse.txt"                                 = "src/components/Admin/ForeclosureResponse.tsx"
    "USER.txt"                                                = "src/components/Admin/UserManagement.tsx"
    "PROPERTY.txt"                                            = "src/components/Admin/PropertyManagement.tsx"
    
    # Form Components
    "interface FormData.txt"                                  = "src/components/Foreclosure/ForeclosureQuestionnaire.tsx"
    "interface FixFlipFormData.txt"                           = "src/components/Contracts/FixFlipContractForm.tsx"
    "interface CashoutRefiFormData.txt"                       = "src/components/Contracts/CashoutRefiForm.tsx"
    
    # Types
    "MEMBERSHIP TIERS.txt"                                    = "src/types/membership.ts"
    
    # Services
    "createCheckoutSession.txt"                               = "src/lib/stripe.ts"
    
    # Documentation
    "Cash-Out Refinance Application Legal Guide.txt"          = "docs/cashout-refi-legal-guide.md"
    "Fix-and-Flip Real Estate Contract Legal Guide.txt"       = "docs/fix-flip-legal-guide.md"
    "foreclosure crm setup.txt"                               = "docs/foreclosure-crm-setup.md"
}

function Copy-AndConvertFiles {
    Write-Host "Converting and copying files..." -ForegroundColor Yellow
    
    $converted = 0
    $skipped = 0
    $errors = @()
    
    foreach ($sourceFile in $fileMappings.Keys) {
        $sourcePath = Join-Path $SourceDir $sourceFile
        $targetPath = Join-Path $TargetDir $fileMappings[$sourceFile]
        
        if (Test-Path $sourcePath) {
            try {
                # Create target directory if needed
                $targetDir = Split-Path $targetPath -Parent
                if (-not (Test-Path $targetDir)) {
                    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
                }
                
                # Copy file
                Copy-Item -Path $sourcePath -Destination $targetPath -Force
                Write-Host "  ✓ $sourceFile" -ForegroundColor Green
                Write-Host "    → $($fileMappings[$sourceFile])" -ForegroundColor Gray
                $converted++
            }
            catch {
                Write-Host "  ✗ ERROR copying $sourceFile" -ForegroundColor Red
                $errors += "Failed to copy $sourceFile : $_"
                $skipped++
            }
        }
        else {
            Write-Host "  ⚠ Not found: $sourceFile" -ForegroundColor Yellow
            $skipped++
        }
    }
    
    Write-Host ""
    Write-Host "Converted: $converted files" -ForegroundColor Green
    if ($skipped -gt 0) {
        Write-Host "Skipped: $skipped files" -ForegroundColor Yellow
    }
    if ($errors.Count -gt 0) {
        Write-Host "Errors:" -ForegroundColor Red
        $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    }
    Write-Host ""
}

function Create-TypeDefinitions {
    Write-Host "Creating type definition files..." -ForegroundColor Yellow
    
    # Create auth types
    $authTypes = @"
// Authentication types
import { MembershipTier } from './membership';

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
    
    $authTypesPath = Join-Path $TargetDir "src/types/auth.ts"
    Set-Content -Path $authTypesPath -Value $authTypes -Encoding UTF8
    Write-Host "  ✓ Created: src/types/auth.ts" -ForegroundColor Green
    
    # Create contract types
    $contractTypes = @"
// Contract types
export type ContractType = 'wholesale' | 'fix-flip' | 'cashout-refi';

export interface ContractData {
  id: string;
  userId: string;
  type: ContractType;
  data: WholesaleContractData | FixFlipFormData | CashoutRefiFormData;
  generatedHtml?: string;
  status: 'draft' | 'generated' | 'downloaded' | 'signed';
  createdAt: string;
  updatedAt: string;
}

export interface WholesaleContractData {
  propertyAddress: string;
  legalDescription: string;
  parcelNumber: string;
  sellerName: string;
  sellerAddress: string;
  buyerName: string;
  buyerAddress: string;
  purchasePrice: number;
  wholesaleFee: number;
  closingDate: string;
}

export interface FixFlipFormData {
  propertyAddress: string;
  legalDescription: string;
  parcelNumber: string;
  propertyType: string;
  yearBuilt: string;
  squareFootage: string;
  bedrooms: string;
  bathrooms: string;
  lotSize: string;
  zoning: string;
  sellerName: string;
  sellerAddress: string;
  sellerPhone: string;
  sellerEmail: string;
  sellerEntityType: string;
  buyerName: string;
  buyerAddress: string;
  buyerPhone: string;
  buyerEmail: string;
  buyerEntityType: string;
  buyerLicense: string;
  purchasePrice: string;
  earnestMoney: string;
  downPayment: string;
  financingType: string;
  loanAmount: string;
  interestRate: string;
  loanTerm: string;
  estimatedRehabCost: string;
  rehabTimeline: string;
  contractorLicense: string;
  permitRequired: string;
  renovationScope: string;
  afterRepairValue: string;
  comparableSales: string;
  marketConditions: string;
  holdingPeriod: string;
  inspectionPeriod: string;
  financingContingency: string;
  appraisalContingency: string;
  titleContingency: string;
  closingDate: string;
  closingLocation: string;
  titleCompany: string;
  disclosures: string[];
  warranties: string[];
  defaultRemedies: string[];
}

export interface CashoutRefiFormData {
  borrowerName: string;
  borrowerAddress: string;
  borrowerPhone: string;
  borrowerEmail: string;
  borrowerSSN: string;
  borrowerDOB: string;
  borrowerEmployer: string;
  borrowerIncome: string;
  borrowerCreditScore: string;
  coBorrowerName: string;
  coBorrowerAddress: string;
  coBorrowerPhone: string;
  coBorrowerEmail: string;
  coBorrowerSSN: string;
  coBorrowerDOB: string;
  coBorrowerEmployer: string;
  coBorrowerIncome: string;
  coBorrowerCreditScore: string;
  propertyAddress: string;
  propertyType: string;
  propertyValue: string;
  yearBuilt: string;
  squareFootage: string;
  occupancyType: string;
  propertyUse: string;
  currentLender: string;
  currentBalance: string;
  currentRate: string;
  currentPayment: string;
  originalLoanDate: string;
  requestedLoanAmount: string;
  cashoutAmount: string;
  newLoanTerm: string;
  desiredRate: string;
  loanProgram: string;
  monthlyIncome: string;
  monthlyDebts: string;
  assets: string;
  liabilities: string;
  cashoutPurpose: string;
  purposeDetails: string;
  lenderName: string;
  lenderAddress: string;
  lenderPhone: string;
  lenderEmail: string;
  loanOfficer: string;
  lenderLicense: string;
}
"@
    
    $contractTypesPath = Join-Path $TargetDir "src/types/contracts.ts"
    Set-Content -Path $contractTypesPath -Value $contractTypes -Encoding UTF8
    Write-Host "  ✓ Created: src/types/contracts.ts" -ForegroundColor Green
    
    # Create foreclosure types
    $foreclosureTypes = @"
// Foreclosure questionnaire types
export interface ForeclosureFormData {
  contact_name: string;
  contact_email: string;
  contact_phone: string;
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
  challenge: string;
  lender_issue: string;
  impact: string;
  options_narrowing: string;
  third_party_help: string;
  overwhelmed: string;
  implication_credit: string;
  implication_loss: string;
  implication_stay_duration: string;
  legal_concerns: string;
  future_impact: string;
  financial_risk: string;
  interested_solution: string;
  negotiation_help: string;
  sell_feelings: string;
  credit_importance: string;
  resolution_peace: string;
  open_options: string;
}
"@
    
    $foreclosureTypesPath = Join-Path $TargetDir "src/types/foreclosure.ts"
    Set-Content -Path $foreclosureTypesPath -Value $foreclosureTypes -Encoding UTF8
    Write-Host "  ✓ Created: src/types/foreclosure.ts" -ForegroundColor Green
    
    # Create property types
    $propertyTypes = @"
// Property types
export interface Property {
  id: string;
  userId: string;
  address: string;
  propertyType: 'single-family' | 'multi-family' | 'condo' | 'townhouse' | 'land';
  analysisType: 'flip' | 'rental' | 'wholesale';
  analysisData: any;
  createdAt: string;
  updatedAt: string;
}
"@
    
    $propertyTypesPath = Join-Path $TargetDir "src/types/property.ts"
    Set-Content -Path $propertyTypesPath -Value $propertyTypes -Encoding UTF8
    Write-Host "  ✓ Created: src/types/property.ts" -ForegroundColor Green
    
    Write-Host ""
}

# Main execution
try {
    Create-DirectoryStructure
    Copy-AndConvertFiles
    Create-TypeDefinitions
    
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "Migration Complete!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Navigate to project: cd '$TargetDir'" -ForegroundColor White
    Write-Host "2. Review converted files" -ForegroundColor White
    Write-Host "3. Install dependencies: npm install" -ForegroundColor White
    Write-Host "4. Set up environment: Copy .env.example to .env" -ForegroundColor White
    Write-Host "5. Configure Supabase and Stripe credentials" -ForegroundColor White
    Write-Host "6. Run database migrations" -ForegroundColor White
    Write-Host "7. Start development server: npm run dev" -ForegroundColor White
    Write-Host ""
}
catch {
    Write-Host "ERROR: Migration failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
