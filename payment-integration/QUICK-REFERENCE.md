# 🚀 Quick Reference Card

**Payment Integration - RepMotivatedSeller**

## ⚡ Installation (60 seconds)

```powershell
# 1. Run installer
cd mcp-api-gateway
.\payment-integration\install-to-project.ps1

# 2. Start dev server
cd ..\rep-motivated-seller
npm run dev

# 3. Visit pricing page
# http://localhost:5173/pricing
```

## 📝 App.tsx Updates

```tsx
// Add imports
import MembershipPlans from './components/payment/MembershipPlans'
import PaymentSuccess from './components/payment/PaymentSuccess'

// Add routes (inside <Routes>)
<Route path="/pricing" element={<MembershipPlans />} />
<Route path="/payment/success" element={<PaymentSuccess />} />
```

## 💳 Test Credentials

### Stripe Test Cards
```
Success:  4242 4242 4242 4242
Decline:  4000 0000 0000 9995
3D Auth:  4000 0025 0000 3155
```

### PayPal Sandbox
```
Login: developer.paypal.com → Sandbox Accounts
Create personal account for testing
```

## 🔑 Environment Variables (Required)

```bash
# Stripe
STRIPE_API_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_BASIC_PRICE_ID=price_1SdTiFDRW9Q4RSm0EzCBBI1e
STRIPE_PREMIUM_PRICE_ID=price_1SdTifDRW9Q4RSm08vtIEUvJ
STRIPE_VIP_PRICE_ID=price_1SdTj3DRW9Q4RSm0hq9WyGSM

# PayPal
PAYPAL_API_CLIENT_ID=AcKlz_...
VITE_PAYPAL_CLIENT_ID=AcKlz_...
PAYPAL_MODE=sandbox
PAYPAL_BASIC_PLAN_ID=P-21N811060X660120DNE57DEQ
PAYPAL_PREMIUM_PLAN_ID=P-25550538XW8386712NE57DEY
PAYPAL_VIP_PLAN_ID=P-9WJ403558X8607434NE57DFA
```

## 🗄️ Database Migration

```sql
-- Option A: Supabase CLI
supabase db push

-- Option B: Dashboard
1. Supabase Dashboard → SQL Editor
2. Paste: payment-integration/database/migrations/create-subscriptions.sql
3. Execute
```

## 🔔 Webhook Setup

### Stripe
```
URL: https://your-domain.com/api/webhooks/stripe
Events: 
  - checkout.session.completed
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.paid
  - invoice.payment_failed
```

### PayPal
```
URL: https://your-domain.com/api/webhooks/paypal
Events:
  - BILLING.SUBSCRIPTION.CREATED
  - BILLING.SUBSCRIPTION.ACTIVATED
  - BILLING.SUBSCRIPTION.CANCELLED
  - PAYMENT.SALE.COMPLETED
```

## 🧪 Local Testing

```bash
# Stripe webhooks
stripe listen --forward-to localhost:5173/api/webhooks/stripe

# Test events
stripe trigger payment_intent.succeeded
```

## 📊 Subscription Tiers

| Tier | Price | Features |
|------|-------|----------|
| Basic | $29/mo | Core features |
| Premium | $49/mo | Advanced tools |
| VIP | $97/mo | Everything + priority support |

## 🐛 Troubleshooting

**Stripe not loading?**
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

**PayPal buttons missing?**
```bash
npm install @paypal/react-paypal-js
```

**Database errors?**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('user_subscriptions', 'payment_history');
```

**Webhook failing?**
- Check endpoint is publicly accessible
- Verify webhook secret is correct
- Review logs in provider dashboard

## 📞 Quick Links

- [Full Integration Guide](docs/INTEGRATION-GUIDE.md)
- [Implementation Summary](IMPLEMENTATION-SUMMARY.md)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [PayPal Developer](https://developer.paypal.com)
- [Supabase Dashboard](https://supabase.com/dashboard)

## 🎯 Files Overview

```
payment-integration/
├── components/
│   ├── MembershipPlans.jsx       # Main pricing UI
│   ├── StripeCheckout.jsx        # Stripe payment
│   ├── PayPalCheckout.jsx        # PayPal payment
│   └── PaymentSuccess.jsx        # Success page
├── backend/
│   ├── routes/
│   │   ├── stripe.js             # Stripe API
│   │   └── paypal.js             # PayPal API
│   └── webhooks/
│       ├── stripe-webhook.js     # Stripe events
│       └── paypal-webhook.js     # PayPal events
├── database/
│   └── migrations/
│       └── create-subscriptions.sql
└── docs/
    ├── INTEGRATION-GUIDE.md      # Full guide
    └── QUICK-REFERENCE.md        # This file
```

## ✅ Pre-Deployment Checklist

- [ ] Install dependencies
- [ ] Update App.tsx routes
- [ ] Run database migration
- [ ] Set environment variables
- [ ] Configure webhooks
- [ ] Test Stripe payment
- [ ] Test PayPal payment
- [ ] Verify database updates
- [ ] Check success page
- [ ] Test subscription cancellation

## 🚀 Production Deployment

1. **Update to live keys**
   - STRIPE_API_KEY → sk_live_...
   - PAYPAL_MODE → live

2. **Create live products**
   - Run setup scripts in live mode
   - Update price/plan IDs

3. **Configure live webhooks**
   - Point to production URL
   - Update webhook secrets

4. **Deploy & monitor**
   - Push to production
   - Monitor first transactions
   - Check webhook logs

---

**Need Help?**
- Read: [docs/INTEGRATION-GUIDE.md](docs/INTEGRATION-GUIDE.md)
- Email: support@repmotivatedseller.com

**Version:** 1.0.0  
**Last Updated:** December 12, 2025
