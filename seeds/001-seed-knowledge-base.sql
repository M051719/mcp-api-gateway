-- Seed Knowledge Base with Essential Content
-- Based on existing calculator and business logic

-- ============================================
-- BASIC TIER (Free) - Fundamentals
-- ============================================

INSERT INTO knowledge_base (title, slug, content, excerpt, category, tier_level, keywords, tags) VALUES

-- ROI Basics
('Understanding ROI (Return on Investment)', 'understanding-roi', 
'# ROI (Return on Investment) Explained

ROI shows how much profit you make compared to your investment. It''s THE most important metric for real estate investors.

## Formula
**ROI = (Profit - Cost) ÷ Cost × 100%**

## Example
- Purchase Price: $200,000
- Down Payment: $40,000 (20%)
- Annual Cash Flow: $4,800
- Annual Appreciation: $6,000
- **Total Gain**: $10,800
- **ROI**: $10,800 ÷ $40,000 = **27%**

## What Our Calculators Show
💰 **Cash-on-Cash Return** - Annual cash flow ÷ Down payment
📊 **Total ROI** - Including appreciation and equity buildup
📈 **Cap Rate** - Net Operating Income ÷ Property Value
🏦 **DSCR** - Debt Service Coverage Ratio for lender approval

## Good ROI Targets
- ✅ **15%+** = Excellent investment
- 🟡 **10-15%** = Good investment
- ⚠️ **5-10%** = Marginal (consider other options)
- ❌ **Below 5%** = Poor investment

Visit our Calculators page to analyze any property!',
'Learn how to calculate and evaluate ROI on rental properties.',
'real-estate-investing-101',
'basic',
ARRAY['roi', 'return on investment', 'profit', 'calculate', 'formula'],
ARRAY['beginner', 'calculators', 'fundamentals']),

-- 1% Rule
('The 1% Rule for Rental Properties', 'one-percent-rule',
'# The 1% Rule Explained

Monthly rent should be **at least 1%** of the purchase price. This is a quick screening tool used by investors nationwide.

## Formula
**Monthly Rent ÷ Purchase Price × 100%**

## Examples

### ✅ Meets 1% Rule
- Purchase Price: $200,000
- Monthly Rent: $2,000
- **Result**: $2,000 ÷ $200,000 = **1.0%** ✅

### ⚠️ Below 1% Rule  
- Purchase Price: $250,000
- Monthly Rent: $2,000
- **Result**: $2,000 ÷ $250,000 = **0.8%** ❌

## Why It Matters
- Rent below 1% usually means **negative cash flow**
- Property expenses eat up too much rental income
- Hard to cover mortgage, taxes, insurance, repairs

## Our Calculator Shows
When you use our Rental Analyzer, we calculate:
- Your exact 1% Rule percentage
- How much more rent you need to hit 1%
- Whether the property passes this screening test

## Pro Tip
Some expensive markets (CA, NY) rarely hit 1%. In those cases, look for at least **0.7%** and strong appreciation potential.

**Want to test a property?** Use our Rental Analyzer (Basic) calculator!',
'Quick screening tool: Monthly rent should equal 1% of purchase price.',
'real-estate-investing-101',
'basic',
ARRAY['1% rule', 'one percent rule', 'rental income', 'screening', 'cash flow'],
ARRAY['beginner', 'calculators', 'rental-properties']),

-- DSCR
('DSCR: Debt Service Coverage Ratio', 'dscr-debt-service-coverage',
'# DSCR (Debt Service Coverage Ratio)

DSCR tells lenders if the property generates enough income to cover the mortgage. **Critical for investor loans.**

## Formula
**DSCR = Net Operating Income (NOI) ÷ Annual Debt Payment**

## Example
- NOI: $15,000/year
- Annual Mortgage Payment: $12,000
- **DSCR**: $15,000 ÷ $12,000 = **1.25x**

## Lender Requirements
- ✅ **1.25x or higher** - Excellent (most lenders approve)
- 🟡 **1.0x - 1.24x** - Acceptable (some lenders)
- ❌ **Below 1.0x** - Property won''t cover debt payments

## What It Means
- **1.25x** = Property makes 25% MORE than debt payment
- **1.0x** = Property EXACTLY covers debt (breakeven)
- **0.8x** = Property makes 20% LESS than needed

## How to Improve DSCR
1. **Increase rent** (most direct)
2. **Reduce expenses** (lower insurance, taxes, management fees)
3. **Larger down payment** (reduces mortgage amount)
4. **Better interest rate** (shop lenders)

Our calculators show your DSCR automatically and tell you if the property qualifies for financing!',
'Lender requirement: Property income must cover mortgage payments by 1.25x.',
'real-estate-investing-101',
'basic',
ARRAY['dscr', 'debt service coverage', 'lender', 'financing', 'qualify'],
ARRAY['beginner', 'calculators', 'financing']),

-- Foreclosure Prevention Basics
('Foreclosure Prevention 101', 'foreclosure-prevention-basics',
'# Foreclosure Prevention Options

If you''re facing foreclosure, you have MORE OPTIONS than you think. Here are the main strategies:

## 1. Loan Modification
**What it is**: Negotiate new loan terms with your lender
- Lower interest rate
- Extend loan term (30yr → 40yr)
- Add missed payments to end of loan

**Best for**: Temporary hardship, want to keep home

## 2. Forbearance Agreement
**What it is**: Temporarily pause or reduce payments (3-12 months)
**Best for**: Short-term financial crisis (job loss, medical emergency)

## 3. Repayment Plan
**What it is**: Catch up on missed payments over 6-12 months
- Example: $10,000 behind = add $833/month for 12 months

**Best for**: Back on track financially, can afford extra

## 4. Short Sale
**What it is**: Sell home for less than mortgage balance (lender forgives difference)
**Best for**: Can''t afford home long-term, want to avoid foreclosure on credit

## 5. Deed in Lieu of Foreclosure
**What it is**: Voluntarily transfer property to lender
**Best for**: Can''t sell, want to minimize credit damage

## 6. Bankruptcy (Chapter 13)
**What it is**: Court-ordered repayment plan, stops foreclosure
**Best for**: Multiple debts, need time to reorganize

## Our Assistance
Use our **Foreclosure Questionnaire** (SPIN methodology) to:
- Assess your situation
- Identify best options for YOU
- Connect with our team for personalized help

**Act fast!** More options are available BEFORE you receive a Notice of Default.',
'6 strategies to stop foreclosure and save your credit.',
'pre-foreclosure-basics',
'basic',
ARRAY['foreclosure', 'prevent foreclosure', 'stop foreclosure', 'loan modification', 'forbearance'],
ARRAY['beginner', 'foreclosure', 'assistance']),

-- Credit Repair Fundamentals
('Credit Repair Fundamentals', 'credit-repair-basics',
'# Credit Repair: The Complete Guide

Your credit score affects EVERYTHING: mortgage rates, rental applications, job offers, insurance premiums.

## What Impacts Your Credit

### Payment History (35%)
- **Most important factor**
- 30+ days late = -60 to -110 points
- Foreclosure = -250 points

### Credit Utilization (30%)
- Amount of credit you''re using
- **Keep below 30%** (under 10% is ideal)
- Example: $10,000 limit → use max $3,000

### Length of Credit History (15%)
- Age of oldest account
- Average age of all accounts
- DON''T close old cards

### Credit Mix (10%)
- Types of credit: revolving (cards), installment (loans), mortgage
- Diverse mix = higher score

### New Credit (10%)
- Recent applications (hard inquiries)
- Each inquiry = -5 to -10 points

## How to Improve Your Score

### Step 1: Get Your Reports (FREE)
- AnnualCreditReport.com
- Check all 3 bureaus: Experian, Equifax, TransUnion

### Step 2: Dispute Errors
- 79% of reports contain errors!
- Late payments wrongly reported
- Accounts that aren''t yours
- Incorrect balances

### Step 3: Pay Down Balances
- Target: Below 30% utilization
- Pay more than minimum
- Consider debt consolidation

### Step 4: Set Up Payment Reminders
- NEVER miss a payment (35% of score!)
- Auto-pay minimum amount
- Calendar reminders

### Step 5: Don''t Close Old Cards
- Hurts credit age and utilization
- Keep them open with small recurring charge

## Our Tools
- Credit score monitoring
- Automated dispute letters
- Payment tracking
- Personalized action plans

**Want help?** Our credit repair dashboard has everything you need!',
'Complete guide to understanding and improving your credit score.',
'credit-repair-fundamentals',
'basic',
ARRAY['credit repair', 'credit score', 'improve credit', 'dispute', 'credit report'],
ARRAY['beginner', 'credit', 'fundamentals']);

-- ============================================
-- PREMIUM TIER - Advanced Strategies
-- ============================================

INSERT INTO knowledge_base (title, slug, content, excerpt, category, tier_level, keywords, tags) VALUES

('Advanced Property Analysis Strategies', 'advanced-property-analysis',
'# Advanced Property Analysis

Beyond the 1% Rule and Cap Rate, serious investors use these metrics:

## GRM (Gross Rent Multiplier)
**Purchase Price ÷ Annual Gross Rent**

- 4-7 = Excellent market
- 8-11 = Average market
- 12+ = Expensive market (high appreciation potential)

## Break-Even Ratio
**( Operating Expenses + Debt Service) ÷ Gross Income**

- Below 85% = Good
- 85-95% = Acceptable
- Above 95% = Risky (no buffer for vacancies)

## Operating Expense Ratio
**Operating Expenses ÷ Gross Income**

- 35-45% = Typical for residential
- 50-60% = Typical for commercial
- Use to compare similar properties

## Cash-on-Cash Return vs Total ROI
- **Cash-on-Cash**: Actual cash flow ÷ Cash invested
- **Total ROI**: All gains (cash flow + appreciation + equity) ÷ Investment

Both matter! High cash flow = income. High total ROI = wealth building.

## Advanced Tips
1. **Factor in tax benefits** (depreciation, mortgage interest deduction)
2. **Calculate IRR** (Internal Rate of Return) for long holds
3. **Sensitivity analysis** - test different scenarios (rent drops, vacancy increases)
4. **Opportunity cost** - compare to stock market returns

Our **Rental Analyzer (Full)** includes all these metrics!',
'Deep dive into GRM, break-even ratio, and advanced ROI calculations.',
'property-analysis',
'premium',
ARRAY['grm', 'gross rent multiplier', 'break-even', 'cash-on-cash', 'advanced'],
ARRAY['advanced', 'calculators', 'premium']),

('Direct Mail Campaign Best Practices', 'direct-mail-best-practices',
'# Direct Mail Campaigns That Convert

Direct mail works when done right. Here''s how to get motivated sellers to call YOU.

## Message Formula
1. **Hook**: "Is your property becoming a burden?"
2. **Problem**: "Behind on payments? Vacant? Need repairs?"
3. **Solution**: "We buy houses AS-IS. Close in 7 days. No fees."
4. **Call to Action**: "Call now: 555-CASH-NOW"

## List Targeting
- Pre-foreclosure (NOD/NTS)
- Tax delinquent
- Out-of-state owners
- High equity (50%+)
- Probate

## Campaign Strategy
- **First touch**: Yellow letter (handwritten style)
- **Follow-up 1** (7 days): Postcard with property photo
- **Follow-up 2** (14 days): Official-looking letter
- **Follow-up 3** (30 days): Final notice ("Last chance")

## Legal Compliance (Critical!)
✅ Include opt-out instructions
✅ Honor Do Not Mail requests
✅ Disclose you''re an investor/wholesaler
✅ Follow TCPA guidelines
✅ State-specific disclosures

Our Direct Mail tool handles compliance automatically!

## Premium Features (100 postcards/month)
- Lob API integration
- Automatic mailing list updates
- Campaign tracking
- Response rate analytics

## Elite Features (Unlimited)
- Multi-touch campaigns
- A/B testing
- Custom designs
- Priority support

**Ready to start?** Go to Direct Mail page!',
'Convert motivated sellers with proven direct mail strategies.',
'direct-mail',
'premium',
ARRAY['direct mail', 'postcards', 'marketing', 'motivated sellers', 'campaigns'],
ARRAY['premium', 'marketing', 'direct-mail']);

-- Track total articles seeded
DO $$
BEGIN
  RAISE NOTICE 'Seeded % knowledge base articles', (SELECT COUNT(*) FROM knowledge_base);
END $$;
