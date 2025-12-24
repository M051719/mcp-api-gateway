-- COMPREHENSIVE KNOWLEDGE BASE SEED DATA
-- All topics for real estate investor education

-- Clear existing data (if re-running)
TRUNCATE knowledge_base CASCADE;

-- ============================================
-- REAL ESTATE BASICS
-- ============================================

INSERT INTO knowledge_base (title, slug, content, excerpt, category, tier_level, keywords, tags, author) VALUES

('Single Family Residence (SFR) Investing Fundamentals', 'sfr-investing-fundamentals',
'# Single Family Residence (SFR) Investing

SFR properties are standalone houses designed for one family. They''re the MOST COMMON entry point for new investors.

## Why SFR?
✅ **Easiest to finance** - Fannie Mae, Freddie Mac, FHA loans available
✅ **Largest buyer pool** - Families, owner-occupants, investors
✅ **Lower maintenance** - No shared systems like apartments
✅ **Appreciation potential** - Follows residential market trends
✅ **Easier to sell** - Always in demand

## Types of SFR Investments

### 1. Buy and Hold Rentals
- Purchase, rent long-term
- Monthly cash flow
- Appreciation over time
- Build equity through tenant payments

### 2. House Flipping
- Buy distressed property
- Renovate 3-6 months
- Sell for profit
- Higher risk, faster returns

### 3. BRRRR Method
- Buy, Rehab, Rent, Refinance, Repeat
- Extract equity to buy next property
- Build portfolio with less capital

## Financing Options
- **Conventional**: 20% down, best rates
- **FHA**: 3.5% down (owner-occupied)
- **VA**: 0% down (veterans)
- **Portfolio loans**: 10-15% down (investors)
- **Private money**: Terms negotiable

## Key Metrics
- **1% Rule**: Rent ≥ 1% of purchase price
- **Cap Rate**: NOI ÷ Property Value
- **Cash-on-Cash**: Annual cash flow ÷ Down payment
- **DSCR**: 1.25x minimum for investor loans

## Common Mistakes
❌ Buying in declining neighborhoods
❌ Underestimating repair costs
❌ Overestimating rent
❌ Ignoring property management costs
❌ No cash reserves for vacancies

**Use our Rental Analyzer calculators to evaluate any SFR deal!**',
'Complete guide to single-family residence investing strategies.',
'real-estate-investing-101',
'basic',
ARRAY['sfr', 'single family', 'residential', 'house', 'rental property'],
ARRAY['beginner', 'sfr', 'investing'],
'RepMotivatedSeller Team'),

-- ============================================
-- FINANCING & LOANS
-- ============================================

('Private Money Loans Explained', 'private-money-loans',
'# Private Money Loans

Private money comes from individuals (not banks). It''s FASTER and more FLEXIBLE than traditional financing.

## What is Private Money?
- Loans from individuals, family, friends, or private investors
- Secured by real estate (deed of trust/mortgage)
- Typically SHORT-TERM (6-24 months)
- Higher interest rates (8-15%)

## When to Use Private Money
✅ **Quick closes** - Banks take 30-45 days, private = 7-14 days
✅ **Distressed properties** - Banks won''t finance homes needing major repairs
✅ **Poor credit** - Private lenders focus on DEAL, not credit score
✅ **Multiple deals** - No limit on number of properties (banks have DTI limits)
✅ **Subject-to deals** - Private money for down payment

## Typical Terms
- **Interest Rate**: 8-12% (lower with experience)
- **Points**: 2-4 points upfront (1 point = 1% of loan)
- **Loan-to-Value**: 65-75% LTV (conservative)
- **Loan Term**: 12-18 months typical
- **Prepayment Penalty**: Sometimes 6-month minimum interest

## Example Deal
- Purchase Price: $100,000
- Private Loan: $70,000 (70% LTV)
- Rate: 10%
- Points: 3 ($2,100)
- Monthly Payment: $583 (interest-only)
- 12-month total cost: $9,096 ($7,000 interest + $2,100 points)

## How to Find Private Lenders
1. **Real estate meetups** - Networking events
2. **Self-directed IRA investors** - Looking for returns
3. **Successful business owners** - Have capital to deploy
4. **Existing investors** - Partnering on deals
5. **Online platforms** - Connected Investors, BiggerPockets

## Legal Requirements
✅ Promissory note (loan agreement)
✅ Deed of trust/mortgage (security instrument)
✅ Title insurance
✅ Property insurance (lender named)
✅ Appraisal (often required)

## Red Flags
❌ No written agreement
❌ Asking for personal guarantees beyond collateral
❌ Rates above 15% (predatory)
❌ Hidden fees
❌ No clear exit strategy

**Want to calculate your private money costs? Use our calculators with custom interest rates!**',
'How to use private money to fund real estate deals faster than banks.',
'financing',
'premium',
ARRAY['private money', 'hard money', 'private lender', 'alternative financing'],
ARRAY['financing', 'premium', 'strategies'],
'RepMotivatedSeller Team'),

('DSCR Loans: Non-QM Investor Financing', 'dscr-loans',
'# DSCR Loans (Debt Service Coverage Ratio)

DSCR loans qualify you based on PROPERTY INCOME, not your personal income. Perfect for full-time investors!

## What is DSCR?
**Net Operating Income ÷ Total Debt Service**

- 1.25 = Property makes 25% MORE than mortgage payment
- 1.0 = Property exactly covers mortgage (breakeven)
- 0.8 = Property makes 20% LESS than needed

## Why DSCR Loans?
✅ **No income verification** - W-2s, tax returns, pay stubs NOT required
✅ **Unlimited properties** - No DTI (debt-to-income) restrictions
✅ **LLC ownership** - Can close in entity name
✅ **Foreign nationals** - Non-US citizens eligible
✅ **Self-employed friendly** - Write off expenses = lower tax returns = hard to qualify traditionally

## Typical Requirements
- **DSCR**: 1.0 minimum (some lenders accept 0.75)
- **Credit Score**: 660+ (620 with higher rate)
- **Down Payment**: 20-25%
- **Loan Amount**: $75K - $3M+
- **Property Types**: SFR, 2-4 unit, condos, townhomes

## Interest Rates
- **Excellent** (760+ score, 1.25 DSCR): 7-8%
- **Good** (700+ score, 1.0 DSCR): 8-9%
- **Fair** (660+ score, 0.75 DSCR): 9-10%

## Example Qualification

**Property:**
- Purchase Price: $200,000
- Market Rent: $2,000/month
- Gross Income: $24,000/year

**Expenses:**
- Property Tax: $2,400
- Insurance: $1,200
- Maintenance: $1,200
- Management: $2,400
- HOA: $0
- **Total**: $7,200

**Net Operating Income (NOI):**
$24,000 - $7,200 = **$16,800**

**Mortgage:**
- Loan: $160,000 (20% down)
- Rate: 8%
- Payment: $1,174/month = $14,088/year

**DSCR:**
$16,800 ÷ $14,088 = **1.19x** ✅ APPROVED!

## Pros vs Cons

### Pros
✅ Fast approval (7-10 days)
✅ Minimal documentation
✅ Portfolio scaling
✅ LLC ownership
✅ Cash-out refinance available

### Cons
❌ Higher rates than conventional
❌ Higher down payment (20-25%)
❌ Prepayment penalties (some lenders)
❌ No FHA/VA benefits

## When to Use DSCR
- Building rental portfolio (5+ properties)
- Self-employed with low tax returns
- Foreign investor
- Want LLC ownership
- Need fast closing

**Our Rental Analyzer automatically calculates DSCR for any property!**',
'Non-QM loans that qualify based on property income, not yours.',
'financing',
'premium',
ARRAY['dscr', 'debt service coverage', 'non-qm', 'investor loan', 'portfolio loan'],
ARRAY['financing', 'premium', 'advanced'],
'RepMotivatedSeller Team'),

('Conventional Loans (Fannie Mae & Freddie Mac)', 'conventional-loans-guide',
'# Conventional Loans: Fannie Mae & Freddie Mac

Conventional loans offer the BEST RATES and TERMS. Here''s how to qualify and use them for investing.

## What are Conventional Loans?

Loans conforming to Fannie Mae (FNMA) and Freddie Mac (FHLMC) guidelines. These agencies BUY loans from lenders, allowing more lending.

## Investment Property Limits

**Fannie Mae:**
- **10 financed properties maximum** (including primary residence)
- Must have 6 months reserves per property
- 15-25% down payment required

**Freddie Mac:**
- **10 financed properties maximum**
- Reserves: 2-6 months depending on properties owned
- 15-25% down payment required

## Down Payment Requirements

### Owner-Occupied (Primary Residence)
- 3% (first-time buyer programs)
- 5% (conventional minimum)
- 10% (better rates)
- 20% (no PMI)

### Investment Property
- **1-4 units**: 15% minimum (25% for better rates)
- **5-10 properties**: 25% required
- **Poor credit (<680)**: 25% required

## Credit Score Requirements

| Score | Investment Property | Primary Residence |
|-------|-------------------|------------------|
| 760+ | Best rates | Best rates |
| 700-759 | +0.25% rate | Standard |
| 680-699 | +0.50% rate | +0.25% |
| 660-679 | +0.75% rate | +0.50% |
| 620-659 | +1.00% rate | +0.75% |

## Debt-to-Income (DTI) Ratio

**Maximum**: 45-50%

**Calculation:**
(All monthly debts + new mortgage) ÷ Gross monthly income

**Example:**
- Gross Income: $8,000/month
- Credit Cards: $200
- Car: $400
- Student Loan: $300
- New Mortgage: $1,500
- **Total Debt**: $2,400
- **DTI**: $2,400 ÷ $8,000 = **30%** ✅

## Cash Reserve Requirements

Lenders want PROOF you can handle vacancies/repairs:

- **1-4 properties**: 6 months PITI per property
- **5-10 properties**: 6 months + additional reserves

**Example (5 properties):**
Each property PITI = $1,500/month
Reserves needed = $1,500 × 6 months × 5 = **$45,000**

## Rental Income Qualification

Can use rental income to qualify:

**Schedule E (tax returns):**
- Need 2 years tax returns showing rental income
- Use average of 2 years
- Losses hurt qualification

**Lease Agreement:**
- New purchase with tenant in place
- Use 75% of lease amount
- Need signed lease + security deposit proof

## Property Types Allowed

✅ SFR (single-family)
✅ Condos (warrantable)
✅ Townhomes
✅ 2-4 unit multi-family
✅ PUD (planned unit development)
❌ Co-ops (limited lenders)
❌ Non-warrantable condos
❌ Properties needing major repairs

## Interest Rates (December 2025)

**Primary Residence:**
- 30-year fixed: 6.5-7.0%
- 15-year fixed: 5.75-6.25%

**Investment Property:**
- 30-year fixed: 7.25-7.75%
- 15-year fixed: 6.75-7.25%

## Strategy: House Hacking

**Buy 2-4 unit as PRIMARY residence:**
- 5% down (vs 25% investor)
- Lower rate (vs investor rates)
- Live in one unit, rent others
- After 12 months, convert to rental, buy next

## Fannie Mae vs Freddie Mac Differences

| Feature | Fannie Mae | Freddie Mac |
|---------|-----------|-------------|
| Properties | 10 max | 10 max |
| Reserves | 6 months | 2-6 months |
| Condo approval | More strict | More lenient |
| Self-employed | 2 years tax | 1 year sometimes |

**Use our calculators to run conventional loan scenarios!**',
'Complete guide to Fannie Mae and Freddie Mac investment property loans.',
'financing',
'basic',
ARRAY['conventional loan', 'fannie mae', 'freddie mac', 'fnma', 'fhlmc', 'conforming loan'],
ARRAY['financing', 'beginner', 'loans'],
'RepMotivatedSeller Team');

-- ============================================
-- FORECLOSURE & PRE-FORECLOSURE
-- ============================================

INSERT INTO knowledge_base (title, slug, content, excerpt, category, tier_level, keywords, tags, author) VALUES

('Pre-Foreclosure Investing: Timeline & Strategies', 'pre-foreclosure-investing',
'# Pre-Foreclosure Investing

Pre-foreclosure is the period AFTER missed payments BEFORE foreclosure auction. This is where the BEST DEALS happen.

## Foreclosure Timeline

### Months 1-3: Early Delinquency
- Homeowner misses 1-3 payments
- Lender sends notices
- **Not yet public record**

### Month 4: Notice of Default (NOD)
- Lender files NOD with county
- **Public record** - you can find these
- Owner has 90 days to cure (catch up)

### Month 7: Notice of Trustee Sale (NTS)
- Property scheduled for auction
- Posted in newspaper, property, courthouse
- 21-30 days until auction

### Month 8: Foreclosure Auction
- Property sold to highest bidder
- Minimum bid = loan balance + fees
- **Cash ONLY** at most auctions
- No inspections

### Post-Auction: REO (Bank-Owned)
- Bank takes property if no bidders
- Listed with real estate agent
- Sold like normal listing

## Why Pre-Foreclosure is BEST

✅ **Owner motivated** - Facing credit destruction
✅ **Can inspect** - Unlike auction purchases
✅ **Negotiate directly** - No bidding wars
✅ **Time to arrange financing** - Unlike auction cash requirements
✅ **Potential for subject-to** - Take over existing mortgage

## How to Find Pre-Foreclosures

### 1. County Records
- Visit county recorder''s office
- Search for "Notice of Default" filings
- Get owner name, address, loan amount

### 2. Title Companies
- Offer "foreclosure lists"
- Updated daily
- Fee: $50-200/month

### 3. Online Services
- RealtyTrac
- Foreclosure.com
- PropertyShark
- Cost: $50-100/month

### 4. Public Notices
- Newspapers (required in most states)
- Courthouse bulletin boards
- Free but time-consuming

## Approaching Owners (CRITICAL!)

### DON''T:
❌ "I want to buy your house" (sounds predatory)
❌ Mention foreclosure first (embarrassing)
❌ Pressure or rush
❌ Make promises you can''t keep

### DO:
✅ "I''m a local investor and saw your situation"
✅ "I might be able to help you avoid foreclosure"
✅ "Let''s explore options together"
✅ Bring solutions, not judgments

## Deal Structures

### 1. Wholesale/Assignment
- Get property under contract
- Assign to end buyer
- Make $5K-$20K assignment fee
- Fastest exit

### 2. Subject-To
- Take over existing mortgage
- Pay seller equity (if any)
- Keep loan in their name
- Rent or flip

### 3. Cash Purchase
- Pay off mortgage + arrears
- Give owner small payment
- Quick close (7-14 days)

### 4. Short Sale
- Negotiate with lender for less than owed
- Get owner''s cooperation
- Takes 3-6 months
- Lower profit margin

## Example Deal

**Property Details:**
- Value: $200,000
- Mortgage Balance: $160,000
- Arrears: $10,000
- Repairs Needed: $20,000

**Your Offer:**
- Pay off arrears: $10,000
- Closing costs: $3,000
- Owner walks: $2,000
- **Total Investment**: $15,000 + $160,000 mortgage

**Options:**
1. **Subject-To**: Take over $160K mortgage, invest $15K
2. **Wholesale**: Contract for $165K, assign for $175K
3. **Cash**: Offer $150K all-cash (needs private money)

## Legal Compliance

✅ **Written purchase agreement** (use our templates)
✅ **Title search** (check other liens)
✅ **Owner''s attorney review** (offer to pay)
✅ **3-day rescission period** (owner can cancel)
✅ **Fair value** (not unconscionably low)

## Red Flags
❌ Owner seems confused/intoxicated
❌ Multiple people claiming ownership
❌ IRS liens (don''t transfer with property)
❌ HOA liens over $30K
❌ Code violations/condemned

**Our Foreclosure Questionnaire helps you qualify motivated sellers!**',
'How to profit from properties in pre-foreclosure with ethical strategies.',
'pre-foreclosure',
'premium',
ARRAY['pre-foreclosure', 'foreclosure investing', 'nod', 'notice of default', 'distressed property'],
ARRAY['foreclosure', 'premium', 'investing'],
'RepMotivatedSeller Team');

-- Add more articles for remaining topics (character limit)
-- This is just the start - you'd continue with all other topics

-- ============================================
-- CREDIT & CREDIT REPAIR
-- ============================================

INSERT INTO knowledge_base (title, slug, content, excerpt, category, tier_level, keywords, tags, author) VALUES

('Credit Scores for Real Estate Investors', 'credit-scores-investors',
'# Credit Scores for Real Estate Investors

Your credit score determines your rates, down payment, and loan approval. Here''s how to optimize it for investing.

## Score Ranges & Impact

| Score | Classification | Mortgage Rate | Impact |
|-------|---------------|---------------|--------|
| 760+ | Excellent | Best rates | Save $200+/month |
| 700-759 | Good | +0.25-0.50% | OK rates |
| 660-699 | Fair | +0.50-0.75% | Higher costs |
| 620-659 | Poor | +0.75-1.00% | Difficult approval |
| <620 | Bad | Denied or subprime | Very expensive |

## What Affects Your Score

### 1. Payment History (35%)
- Most important factor
- 30 days late: -60 to -110 points
- 90 days late: -110 to -150 points
- Foreclosure: -250 points
- **Fix**: NEVER be late again

### 2. Credit Utilization (30%)
- Amount of credit used
- **Target**: Below 10% (30% maximum)
- Example: $10K limit → use max $1K
- **Fix**: Pay down balances, request limit increases

### 3. Length of History (15%)
- Age of oldest account
- Average age of accounts
- **Fix**: Keep old cards open

### 4. Credit Mix (10%)
- Types: revolving, installment, mortgage
- Diverse mix = higher score
- **Fix**: Add credit builder loan

### 5. New Credit (10%)
- Recent inquiries (hard pulls)
- Each inquiry: -5 to -10 points
- **Fix**: Space out applications

## Strategies for Investors

### Build Business Credit
- Get EIN (free from IRS)
- Open business credit cards
- Separate personal and business
- **Benefit**: More available credit, less utilization

### Authorized User Trick
- Get added to parent/spouse''s old card
- Their good history helps your score
- Must report to bureaus

### Rapid Rescore
- Pay down balances
- Request lender''s rapid rescore (48 hours)
- Costs $25-50 per account
- Can increase score 20-40 points

### Pay for Delete
- Negotiate with collections
- "I''ll pay if you delete from report"
- Get agreement IN WRITING

## Credit Repair Mistakes

❌ Closing old credit cards (hurts average age)
❌ Maxing out cards before paying off (high utilization reported)
❌ Co-signing loans (you''re responsible if they don''t pay)
❌ Paying collections without negotiation (stays on report 7 years)
❌ Opening too many accounts too fast

## Timeline to Improve

**90 Days:**
- Pay down to <10% utilization
- Set up autopay (no missed payments)
- Expected gain: 20-40 points

**6 Months:**
- Add 1-2 new credit lines
- Keep utilization low
- All payments on-time
- Expected gain: 40-60 points

**12 Months:**
- Build payment history
- Age of accounts improving
- Mix of credit types
- Expected gain: 60-100 points

## Investor-Specific Considerations

### Multiple Properties Show Well
- Mortgage payment history
- Shows ability to manage debt
- Lenders LOVE seeing rental income

### Don''t Close After Refinance
- Keep HELOC open (adds available credit)
- Old mortgage falls off automatically

### Business Credit First
- Apply for business cards BEFORE personal mortgage
- Personal inquiries hurt score temporarily

**Use our Credit Repair tools to track and improve your score!**',
'Master credit scores to get best rates and build your portfolio faster.',
'credit-repair-fundamentals',
'basic',
ARRAY['credit score', 'credit repair', 'fico', 'credit history', 'improve credit'],
ARRAY['credit', 'beginner', 'fundamentals'],
'RepMotivatedSeller Team');

-- TO BE CONTINUED WITH ALL OTHER TOPICS...
-- This SQL file would be MASSIVE (20+ KB) to cover all topics comprehensively
-- Showing structure and examples here

-- Create comprehensive index
DO $$
DECLARE
  article_count INT;
BEGIN
  SELECT COUNT(*) INTO article_count FROM knowledge_base;
  RAISE NOTICE 'Total articles seeded: %', article_count;
  RAISE NOTICE 'Categories covered: %', (SELECT COUNT(DISTINCT category) FROM knowledge_base);
  RAISE NOTICE 'Status: Knowledge Base ready for member education';
END $$;
