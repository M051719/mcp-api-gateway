# Complete Payment Integration Guide

**Stripe + PayPal Integration for RepMotivatedSeller**

## 🎯 Overview

This guide covers the complete implementation of dual payment provider integration (Stripe + PayPal) for subscription-based revenue on the RepMotivatedSeller platform.

## 📦 What's Included

- ✅ 4 React UI Components (membership plans, checkout flows, success pages)
- ✅ 2 Backend Route Handlers (Stripe + PayPal APIs)
- ✅ 2 Webhook Handlers (payment event processing)
- ✅ Database Schema (subscriptions + payment history)
- ✅ Automated Installation Script
- ✅ Complete Documentation

## 🚀 Quick Start (5 Minutes)

### 1. Run Automated Installer

```powershell
cd "C:\Users\monte\Documents\cert api token keys ids\GITHUB FOLDER\GitHub\mcp-api-gateway"
.\payment-integration\install-to-project.ps1
```

This will:
- Copy all components to your project
- Install required npm packages
- Set up database migrations
- Validate environment variables

### 2. Update App.tsx

Add these imports:

```tsx
import MembershipPlans from './components/payment/MembershipPlans'
import PaymentSuccess from './components/payment/PaymentSuccess'
```

Add these routes inside `<Routes>`:

```tsx
<Route path="/pricing" element={<MembershipPlans />} />
<Route path="/payment/success" element={<PaymentSuccess />} />
```

### 3. Run Database Migration

Option A - Supabase CLI:
```bash
cd "C:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"
supabase db push
```

Option B - Supabase Dashboard:
1. Open Supabase Dashboard → SQL Editor
2. Copy/paste contents of `payment-integration/database/migrations/create-subscriptions.sql`
3. Execute

### 4. Test It!

```bash
npm run dev
```

Visit: http://localhost:5173/pricing

## 📋 Detailed Implementation Steps

### Component Architecture

```
src/
├── components/
│   └── payment/
│       ├── MembershipPlans.jsx       # Main pricing page
│       ├── StripeCheckout.jsx        # Stripe payment flow
│       ├── PayPalCheckout.jsx        # PayPal payment flow
│       └── PaymentSuccess.jsx        # Confirmation page
├── routes/
│   └── payment/
│       ├── stripe.js                 # Stripe API endpoints
│       └── paypal.js                 # PayPal API endpoints
└── webhooks/
    ├── stripe-webhook.js             # Stripe event handler
    └── paypal-webhook.js             # PayPal event handler
```

### Backend Integration

#### Express Server Setup

Add to your main server file (e.g., `src/server.js` or `index.js`):

```javascript
import express from 'express';
import stripeRoutes from './routes/payment/stripe.js';
import paypalRoutes from './routes/payment/paypal.js';
import stripeWebhook from './webhooks/stripe-webhook.js';
import paypalWebhook from './webhooks/paypal-webhook.js';

const app = express();

// Important: Stripe webhooks need raw body
app.use('/api/webhooks/stripe', stripeWebhook);

// Regular JSON parsing for other routes
app.use(express.json());

// Payment routes
app.use('/api/stripe', stripeRoutes);
app.use('/api/paypal', paypalRoutes);
app.use('/api/webhooks/paypal', paypalWebhook);
```

#### Supabase Functions Alternative

If using Supabase Edge Functions:

1. Create `supabase/functions/stripe-webhook/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY')!, {
  apiVersion: '2024-11-20.acacia',
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
    
    // Handle event...
    console.log(`Processing: ${event.type}`)
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(err.message, { status: 400 })
  }
})
```

2. Deploy:
```bash
supabase functions deploy stripe-webhook
```

### Frontend Integration Details

#### MembershipPlans Component

The main pricing page component handles:
- Display of 3 tiers (Basic, Premium, VIP)
- Provider toggle (Stripe/PayPal)
- User authentication check
- Redirect to appropriate checkout flow

**Usage:**

```tsx
import MembershipPlans from './components/payment/MembershipPlans'

function App() {
  return (
    <Routes>
      <Route path="/pricing" element={<MembershipPlans />} />
    </Routes>
  )
}
```

**Props:**
```tsx
// All props are optional - component is self-contained
<MembershipPlans />

// Optional: Override default user/auth
<MembershipPlans 
  userId="custom-user-id"
  userEmail="user@example.com"
/>
```

#### StripeCheckout Component

Handles Stripe payment flow using Stripe Elements.

**Features:**
- Card input with validation
- Real-time error handling
- Loading states
- Redirect to success page

**Required Environment Variables:**
```
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_VIP_PRICE_ID=price_...
```

#### PayPalCheckout Component

Handles PayPal subscription flow using PayPal Smart Buttons.

**Features:**
- PayPal buttons integration
- Subscription creation
- Error handling
- Success confirmation

**Required Environment Variables:**
```
VITE_PAYPAL_CLIENT_ID=AcKlz_...
PAYPAL_MODE=sandbox
PAYPAL_BASIC_PLAN_ID=P-...
PAYPAL_PREMIUM_PLAN_ID=P-...
PAYPAL_VIP_PLAN_ID=P-...
```

#### PaymentSuccess Component

Displays after successful payment with:
- Confirmation message
- Subscription details
- Next steps guidance
- Link to user profile

## 🗄️ Database Schema

### user_subscriptions Table

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  provider VARCHAR(20), -- 'stripe' or 'paypal'
  
  -- Stripe fields
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  
  -- PayPal fields
  paypal_subscription_id VARCHAR(255),
  
  -- Common fields
  plan_type VARCHAR(20), -- 'basic', 'premium', 'vip'
  status VARCHAR(20), -- 'active', 'canceled', etc.
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  last_payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### payment_history Table

```sql
CREATE TABLE payment_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  provider VARCHAR(20),
  transaction_id VARCHAR(255),
  amount INTEGER, -- in cents
  currency VARCHAR(3),
  status VARCHAR(20), -- 'completed', 'failed', 'refunded'
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

## 🔔 Webhook Configuration

### Stripe Webhooks

1. **Create Webhook in Dashboard:**
   - Go to https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`

2. **Get Webhook Secret:**
   - Copy the signing secret (starts with `whsec_`)
   - Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`

3. **Test Locally:**
   ```bash
   stripe listen --forward-to localhost:5173/api/webhooks/stripe
   ```

### PayPal Webhooks

1. **Create Webhook:**
   - Go to https://developer.paypal.com/dashboard/webhooks
   - Click "Create Webhook"
   - URL: `https://your-domain.com/api/webhooks/paypal`
   - Events to listen for:
     - `BILLING.SUBSCRIPTION.CREATED`
     - `BILLING.SUBSCRIPTION.ACTIVATED`
     - `BILLING.SUBSCRIPTION.UPDATED`
     - `BILLING.SUBSCRIPTION.CANCELLED`
     - `PAYMENT.SALE.COMPLETED`
     - `PAYMENT.SALE.REFUNDED`

2. **Get Webhook ID:**
   - Copy the Webhook ID
   - Add to `.env`: `PAYPAL_WEBHOOK_ID=...`

## 🧪 Testing

### Test Stripe Payments

Use these test card numbers:

```
Success:
4242 4242 4242 4242  (Visa)
5555 5555 5555 4444  (Mastercard)

Decline:
4000 0000 0000 9995  (Insufficient funds)

Authentication Required:
4000 0025 0000 3155  (3D Secure)
```

**Expiry:** Any future date  
**CVC:** Any 3 digits  
**ZIP:** Any 5 digits

### Test PayPal Payments

Use PayPal Sandbox accounts:

1. Go to https://developer.paypal.com/dashboard/accounts
2. Create test accounts:
   - Personal Account (buyer)
   - Business Account (seller)

Example credentials:
```
Email: sb-buyer@personal.example.com
Password: Test1234
```

### Test Webhooks Locally

**Stripe:**
```bash
stripe listen --forward-to localhost:5173/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

**PayPal:**
Use PayPal's webhook simulator in the developer dashboard.

## 🔐 Security Best Practices

### Environment Variables

Never commit these to version control:

```env
# .env (add to .gitignore)
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_API_SECRET=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Webhook Verification

Both webhook handlers include signature verification:

**Stripe:**
```javascript
const event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  endpointSecret
);
```

**PayPal:**
```javascript
const isValid = await verifyWebhookSignature(
  req.headers,
  req.body
);
```

### API Key Management

- Use test keys in development
- Use live keys only in production
- Rotate keys periodically
- Monitor key usage in dashboards

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] Replace all test keys with live keys
- [ ] Update webhook URLs to production domain
- [ ] Configure webhooks in live Stripe dashboard
- [ ] Switch PayPal from sandbox to live mode
- [ ] Run database migrations on production
- [ ] Test payment flow end-to-end
- [ ] Set up monitoring/alerting
- [ ] Configure CORS for production domain
- [ ] Enable SSL/TLS (HTTPS required)
- [ ] Test subscription cancellation
- [ ] Verify email notifications work
- [ ] Document customer support procedures

### Environment Updates

**Production .env:**
```env
# Stripe Live Keys
STRIPE_API_KEY=sk_live_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Live Product IDs (create new products in live mode)
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_VIP_PRICE_ID=price_...

# PayPal Live Credentials
PAYPAL_MODE=live
PAYPAL_API_CLIENT_ID=...
PAYPAL_API_SECRET=...
VITE_PAYPAL_CLIENT_ID=...

# PayPal Live Plan IDs (create new plans in live mode)
PAYPAL_BASIC_PLAN_ID=P-...
PAYPAL_PREMIUM_PLAN_ID=P-...
PAYPAL_VIP_PLAN_ID=P-...

# Production URLs
VITE_APP_URL=https://your-domain.com
WEBHOOK_URL=https://your-domain.com/api/webhooks
```

### Create Live Products

**Stripe:**
```bash
stripe products create --name="Basic Membership" --description="$29/month"
stripe prices create --product=<PRODUCT_ID> --unit-amount=2900 --currency=usd -d recurring[interval]=month
```

**PayPal:**
Run the setup script in live mode:
```powershell
$env:PAYPAL_MODE="live"
.\setup-paypal-plans.ps1
```

## 📊 Monitoring & Analytics

### Key Metrics to Track

1. **Conversion Rate**
   - Pricing page visits → subscriptions
   - Trial signups → paid conversions

2. **MRR (Monthly Recurring Revenue)**
   - Total active subscriptions by tier
   - Growth rate month-over-month

3. **Churn Rate**
   - Canceled subscriptions / total subscriptions
   - Reason for cancellation

4. **Payment Success Rate**
   - Successful payments / total attempts
   - Failed payment reasons

### Database Queries

**Active Subscriptions by Tier:**
```sql
SELECT 
  plan_type,
  COUNT(*) as count,
  SUM(CASE 
    WHEN plan_type = 'basic' THEN 29
    WHEN plan_type = 'premium' THEN 49
    WHEN plan_type = 'vip' THEN 97
  END) as mrr
FROM user_subscriptions
WHERE status = 'active'
GROUP BY plan_type;
```

**Failed Payments (Last 30 Days):**
```sql
SELECT 
  COUNT(*) as failed_count,
  SUM(amount) / 100.0 as failed_amount_usd
FROM payment_history
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '30 days';
```

## 🐛 Troubleshooting

### Common Issues

**1. "Stripe is not defined"**
- Ensure `@stripe/stripe-js` is installed
- Check public key is set in environment
- Verify import: `import { loadStripe } from '@stripe/stripe-js'`

**2. PayPal Buttons Not Showing**
- Check client ID is correct
- Verify sandbox mode matches account type
- Check browser console for errors
- Ensure `@paypal/react-paypal-js` is installed

**3. Webhook Not Receiving Events**
- Verify endpoint URL is publicly accessible
- Check webhook secret is correct
- Review webhook logs in provider dashboard
- Ensure endpoint uses POST method

**4. Database Connection Errors**
- Verify Supabase URL and keys
- Check RLS policies allow service role access
- Ensure tables were created successfully

**5. CORS Errors**
- Configure CORS in backend:
  ```javascript
  app.use(cors({
    origin: process.env.VITE_APP_URL,
    credentials: true
  }));
  ```

### Debug Mode

Enable detailed logging:

```javascript
// In webhook handlers
console.log('Webhook received:', JSON.stringify(event, null, 2));

// In API routes
console.log('Request body:', req.body);
console.log('User:', userId);
```

### Testing Tools

**Stripe CLI:**
```bash
stripe logs tail
stripe events list --limit=10
```

**PayPal Developer Tools:**
- Sandbox accounts: https://developer.paypal.com/dashboard/accounts
- Webhook simulator: https://developer.paypal.com/dashboard/webhooks
- Transaction search: https://developer.paypal.com/dashboard/transactions

## 📞 Support Resources

### Documentation
- Stripe Docs: https://stripe.com/docs
- PayPal Docs: https://developer.paypal.com/docs
- Supabase Docs: https://supabase.com/docs

### Community
- Stripe Discord: https://stripe.com/discord
- PayPal Developer Forum: https://www.paypal-community.com/
- Supabase Discord: https://discord.supabase.com

### Contact
For project-specific issues:
- Email: support@repmotivatedseller.com
- GitHub Issues: [Repository URL]

---

**Last Updated:** December 12, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

