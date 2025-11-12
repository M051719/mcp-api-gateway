# RepMotivatedSeller Migration Guide
## Netlify to Supabase Project Integration

This guide will help you integrate the RepMotivatedSeller Netlify application files into your Supabase project deployment.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Detailed Migration Steps](#detailed-migration-steps)
5. [Post-Migration Configuration](#post-migration-configuration)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### What This Migration Does

This migration process will:
- ✅ Convert 39 Netlify .txt files to proper TypeScript/React components
- ✅ Create organized directory structure
- ✅ Set up Supabase database schema
- ✅ Configure Supabase Edge Functions
- ✅ Integrate Stripe payment processing
- ✅ Set up authentication and authorization
- ✅ Create admin dashboard and CRM features

### What You'll Get

- **Frontend**: Full React + TypeScript application
- **Backend**: Supabase (Auth, Database, Functions)
- **Payments**: Stripe integration
- **Features**:
  - Foreclosure assistance questionnaire (SPIN methodology)
  - Wholesale real estate contracts
  - Fix-and-flip contract generator
  - Cash-out refinance applications
  - Membership tiers (Free, Pro $49.99/mo, Enterprise)
  - Admin dashboard with CRM
  - Private money financing information

---

## ✅ Prerequisites

### Required Software

```bash
# Node.js (v18 or later)
node --version

# Supabase CLI
supabase --version

# Git
git --version
```

### Required Accounts

- [ ] Supabase account (https://supabase.com)
- [ ] Stripe account (https://stripe.com)
- [ ] Email service (for notifications)

### Required Information

- [ ] Supabase project URL
- [ ] Supabase anon key
- [ ] Supabase service role key
- [ ] Stripe publishable key
- [ ] Stripe secret key
- [ ] Stripe webhook secret

---

## 🚀 Quick Start

### Option 1: Automated Migration (Recommended)

```powershell
# 1. Run the migration script
cd "c:\Users\monte\Documents\cert api token keys ids\GITHUB FOLDER\GitHub\mcp-api-gateway"
.\scripts\migrate-netlify-files.ps1

# 2. Navigate to your project
cd "c:\users\monte\documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"

# 3. Install dependencies
npm install

# 4. Set up environment
cp .env.example .env
# Edit .env with your credentials

# 5. Start Supabase
supabase start

# 6. Run migrations
supabase db push

# 7. Deploy Edge Functions
supabase functions deploy send-notification-email
supabase functions deploy create-checkout-session

# 8. Start development server
npm run dev
```

### Option 2: Manual Migration

See [Detailed Migration Steps](#detailed-migration-steps) below.

---

## 📖 Detailed Migration Steps

### Step 1: Prepare Your Environment

```powershell
# Create target directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "c:\users\monte\documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"

# Navigate to target directory
cd "c:\users\monte\documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"
```

### Step 2: Run Migration Script

```powershell
# From the mcp-api-gateway directory
cd "c:\Users\monte\Documents\cert api token keys ids\GITHUB FOLDER\GitHub\mcp-api-gateway"

# Execute migration script
.\scripts\migrate-netlify-files.ps1
```

**What this script does:**
- Creates proper directory structure
- Converts .txt files to .tsx/.ts files
- Organizes components by type
- Creates TypeScript type definitions
- Sets up configuration files

### Step 3: Install Dependencies

```bash
cd "c:\users\monte\documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"

npm install
```

### Step 4: Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your credentials
notepad .env
```

**Required environment variables:**

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Price IDs
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxx
STRIPE_PRICE_ENTERPRISE_YEARLY=price_xxx
```

### Step 5: Set Up Supabase Project

#### 5.1 Initialize Supabase (if not already)

```bash
supabase init
```

#### 5.2 Link to Your Supabase Project

```bash
supabase link --project-ref your-project-ref
```

#### 5.3 Create Database Tables

The migration script already created migration files in `supabase/migrations/`. Run them:

```bash
supabase db push
```

This will create:
- `profiles` table
- `foreclosure_responses` table
- `contracts` table
- `call_records` table (if needed)
- `properties` table (if needed)

#### 5.4 Verify Database Setup

```bash
supabase db diff
```

### Step 6: Deploy Edge Functions

```bash
# Deploy email notification function
supabase functions deploy send-notification-email

# Deploy Stripe checkout function
supabase functions deploy create-checkout-session

# Deploy webhook handler (if created)
supabase functions deploy stripe-webhook
```

### Step 7: Set Edge Function Secrets

```bash
# Set Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx

# Set other secrets as needed
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Step 8: Configure Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
4. Copy webhook signing secret to `.env`

### Step 9: Create Admin User

```sql
-- In Supabase SQL Editor
INSERT INTO profiles (id, email, name, membership_tier)
VALUES (
  'your-user-id',
  'admin@repmotivatedseller.org',
  'Admin',
  'enterprise'
);
```

### Step 10: Start Development Server

```bash
npm run dev
```

Visit: http://localhost:5173

---

## ⚙️ Post-Migration Configuration

### Configure Authentication

1. Go to Supabase Dashboard → Authentication → Settings
2. Enable email authentication
3. Configure email templates
4. Set site URL and redirect URLs

### Set Up Email Service

Configure email notifications for:
- New foreclosure submissions
- Urgent cases (3+ missed payments or NOD)
- User signups
- Password resets

### Configure Custom Domain

1. In Supabase Dashboard → Settings → Custom Domains
2. Add your domain
3. Update DNS records
4. Configure SSL certificate

### Set Up Monitoring

```bash
# View function logs
supabase functions logs send-notification-email

# View database logs
supabase db logs
```

---

## 🧪 Testing

### Test Authentication

```bash
# 1. Sign up new user
# 2. Verify email
# 3. Log in
# 4. Test password reset
```

### Test Foreclosure Form

```bash
# 1. Fill out foreclosure questionnaire
# 2. Submit form
# 3. Check database for entry
# 4. Verify email notification sent
```

### Test Contract Generation

```bash
# 1. Create wholesale contract
# 2. Create fix-flip contract
# 3. Create cash-out refi application
# 4. Verify PDF generation
# 5. Test download functionality
```

### Test Subscriptions

```bash
# 1. View pricing page
# 2. Select Pro plan
# 3. Complete Stripe checkout
# 4. Verify subscription in database
# 5. Test subscription management
# 6. Test plan upgrade/downgrade
```

### Test Admin Dashboard

```bash
# 1. Log in as admin@repmotivatedseller.org
# 2. Access admin dashboard
# 3. View foreclosure submissions
# 4. Test CRM call records
# 5. View user management
```

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: "Module not found"

```bash
# Solution: Install missing dependencies
npm install @stripe/stripe-js @stripe/react-stripe-js
npm install @supabase/supabase-js
npm install lucide-react
npm install zustand
```

#### Issue: "Supabase connection failed"

```bash
# Solution: Check environment variables
cat .env | grep SUPABASE

# Verify Supabase project is running
supabase status
```

#### Issue: "Stripe checkout not working"

```bash
# Solution: Verify Stripe keys
cat .env | grep STRIPE

# Test Stripe connection
supabase functions logs create-checkout-session
```

#### Issue: "Database migration failed"

```bash
# Solution: Reset database and re-run migrations
supabase db reset

# Re-run migrations
supabase db push
```

#### Issue: "Edge Function deployment failed"

```bash
# Solution: Check function logs
supabase functions logs function-name

# Redeploy with verbose output
supabase functions deploy function-name --debug
```

### Getting Help

- **Documentation**: See `docs/NETLIFY_TO_SUPABASE_MIGRATION_ANALYSIS.md`
- **Scripts**: See `docs/MIGRATION_SCRIPTS.md`
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs

---

## 📁 Project Structure

After migration, your project will have this structure:

```
rep-motivated-seller/
├── src/
│   ├── components/
│   │   ├── Admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminStats.tsx
│   │   │   ├── CallRecord.tsx
│   │   │   ├── ForeclosureResponse.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   └── PropertyManagement.tsx
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── ResetPasswordForm.tsx
│   │   ├── Contracts/
│   │   │   ├── FixFlipContractForm.tsx
│   │   │   └── CashoutRefiForm.tsx
│   │   ├── Foreclosure/
│   │   │   └── ForeclosureQuestionnaire.tsx
│   │   ├── Layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── FinancingBanner.tsx
│   │   └── Membership/
│   │       ├── PricingCard.tsx
│   │       └── SubscriptionManager.tsx
│   ├── pages/
│   │   ├── AdminPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── ContractsPage.tsx
│   │   ├── ForeclosurePage.tsx
│   │   ├── PricingPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── PrivacyPolicyPage.tsx
│   │   └── TermsOfServicePage.tsx
│   ├── types/
│   │   ├── auth.ts
│   │   ├── contracts.ts
│   │   ├── foreclosure.ts
│   │   ├── membership.ts
│   │   └── property.ts
│   ├── store/
│   │   └── authStore.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── stripe.ts
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── migrations/
│   │   ├── 20251111000001_create_profiles.sql
│   │   ├── 20251111000002_create_foreclosure_responses.sql
│   │   └── 20251111000003_create_contracts.sql
│   └── functions/
│       ├── send-notification-email/
│       └── create-checkout-session/
├── public/
├── docs/
├── package.json
├── .env
└── .env.example
```

---

## ✅ Migration Checklist

### Pre-Migration
- [x] Analyzed Netlify files
- [x] Created migration documentation
- [x] Created migration scripts
- [ ] Backed up existing data
- [ ] Set up Supabase project
- [ ] Set up Stripe account

### Migration
- [ ] Run migration script
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Set up database schema
- [ ] Deploy Edge Functions
- [ ] Configure webhooks

### Testing
- [ ] Test authentication
- [ ] Test foreclosure form
- [ ] Test contract generation
- [ ] Test subscriptions
- [ ] Test admin dashboard
- [ ] Test all payment flows

### Deployment
- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Configure email service
- [ ] Set up monitoring
- [ ] Deploy to production
- [ ] Update DNS records

### Post-Deployment
- [ ] Monitor error logs
- [ ] Test production deployment
- [ ] Create user documentation
- [ ] Train support team

---

## 🎉 Success Criteria

Your migration is successful when:

1. ✅ Users can sign up and log in
2. ✅ Foreclosure questionnaire submits successfully
3. ✅ Contract generation works for all types
4. ✅ Stripe payments process correctly
5. ✅ Subscription management works
6. ✅ Admin dashboard is accessible
7. ✅ Email notifications are sent
8. ✅ All pages load without errors

---

## 📝 Notes

### Key Features to Verify

1. **SPIN Methodology Questionnaire** - Situation, Problem, Implication, Need-payoff
2. **Multi-Contract System** - Wholesale, Fix-Flip, Cash-Out Refi
3. **Private Money Financing** - 8-15% rates, $30K-FHA cap
4. **36-State Coverage** - Excludes MN, NV, SD, UT, VT
5. **Admin Role Checking** - Email-based admin access

### Security Considerations

- Row Level Security (RLS) policies are enforced
- Admin access controlled by email address
- Stripe keys stored securely in environment
- User data encrypted at rest
- HTTPS enforced in production

---

## 🔗 Resources

- **Migration Analysis**: `docs/NETLIFY_TO_SUPABASE_MIGRATION_ANALYSIS.md`
- **Migration Scripts**: `docs/MIGRATION_SCRIPTS.md`
- **Supabase Documentation**: https://supabase.com/docs
- **Stripe Documentation**: https://stripe.com/docs
- **React Documentation**: https://react.dev

---

## 📞 Support

For migration assistance:
1. Check troubleshooting section above
2. Review migration analysis document
3. Check Supabase/Stripe logs
4. Verify environment configuration

---

**Last Updated**: November 11, 2025  
**Version**: 1.0.0  
**Author**: Migration Assistant
