# Quick Reference - RepMotivatedSeller Payment Integration

## 🚀 One-Page Quick Start

### 1. Create Accounts (30 minutes)
```
✅ Stripe: https://stripe.com → Sign up → Get API keys
✅ PayPal: https://paypal.com/business → Sign up → Get Client ID/Secret  
✅ Calendly: Already done! ✓
✅ Zoom: Already connected! ✓
```

### 2. Install Dependencies (5 minutes)
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js stripe
npm install @paypal/checkout-server-sdk @paypal/react-paypal-js
npm install react-calendly framer-motion react-hot-toast date-fns
```

### 3. Environment Setup (10 minutes)
```bash
# Copy template
cp docs/.env.template .env

# Edit .env and add:
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
VITE_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
CALENDLY_API_KEY=...
```

### 4. Test Payments (15 minutes)
```
Stripe test card: 4242 4242 4242 4242
PayPal: Use sandbox account
Expected: Subscription created, webhook fires, database updates
```

---

## 💳 Stripe Cheat Sheet

### Test Cards
```
Success:        4242 4242 4242 4242
Declined:       4000 0000 0000 9995
Requires Auth:  4000 0025 0000 3155
Expiry: Any future date | CVC: Any 3 digits
```

### Key URLs
```
Dashboard:      https://dashboard.stripe.com
API Keys:       Dashboard → Developers → API keys
Webhooks:       Dashboard → Developers → Webhooks
Products:       Dashboard → Products
Test Mode:      Toggle in top-left corner
```

### Quick Code
```tsx
import { loadStripe } from '@stripe/stripe-js'
const stripe = await loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY)

// Create checkout
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{ price: 'price_xxx', quantity: 1 }],
  success_url: 'https://yoursite.com/success',
  cancel_url: 'https://yoursite.com/cancel'
})
```

---

## 💰 PayPal Cheat Sheet

### Sandbox Testing
```
Sandbox Dashboard: https://developer.paypal.com/dashboard
Create Test Accounts: Sandbox → Accounts
Test Login: Use sandbox personal account
```

### Quick Code
```tsx
import { PayPalButtons } from '@paypal/react-paypal-js'

<PayPalButtons
  createSubscription={(data, actions) => {
    return actions.subscription.create({
      plan_id: 'P-xxx'
    })
  }}
  onApprove={(data) => {
    console.log('Subscription ID:', data.subscriptionID)
  }}
/>
```

---

## 📅 Calendly Cheat Sheet

### Embed Code
```html
<!-- Inline Widget -->
<div 
  class="calendly-inline-widget"
  data-url="https://calendly.com/your-username/consultation"
  style="min-width:320px;height:700px;">
</div>
<script src="https://assets.calendly.com/assets/external/widget.js"></script>
```

### React Component
```tsx
import { InlineWidget } from 'react-calendly'

<InlineWidget url="https://calendly.com/your-username/consultation" />
```

### Event URLs
```
Free:     calendly.com/repmotivatedseller/free-assessment
30-min:   calendly.com/repmotivatedseller/strategy-session
60-min:   calendly.com/repmotivatedseller/vip-session
```

---

## 🔑 Environment Variables (Essential)

```bash
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
VITE_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox  # or 'live'

# Calendly
CALENDLY_API_KEY=...
CALENDLY_WEBHOOK_SECRET=...

# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

---

## 📊 Pricing Quick Reference

| Tier | Price | Consultations | Stripe Price ID | PayPal Plan ID |
|------|-------|---------------|-----------------|----------------|
| Free | $0 | Pay per use | - | - |
| Basic | $29/mo | 0 | price_basic | P-basic |
| Premium | $49/mo | 2/month | price_premium | P-premium |
| VIP | $97/mo | Unlimited | price_vip | P-vip |

**Consultation Pricing (Non-members):**
- 15-min: Free
- 30-min: $49
- 60-min: $97

---

## 🔧 Common Commands

```bash
# Development
npm run dev

# Build
npm run build

# Supabase
supabase start
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase migration up

# Database
supabase db reset
supabase db push

# Testing webhooks locally
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

---

## 🐛 Quick Troubleshooting

### Stripe checkout not loading
```javascript
// Check
console.log('Key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
// Should start with pk_test_ or pk_live_
```

### PayPal button not showing
```javascript
// Check
console.log('ID:', import.meta.env.VITE_PAYPAL_CLIENT_ID)
// Verify script loaded
console.log('PayPal SDK:', window.paypal)
```

### Webhook not receiving events
```bash
# Check webhook endpoint is accessible
curl https://yoursite.com/api/webhooks/stripe

# Verify webhook secret matches
# Check webhook event logs in provider dashboard
```

### Database not updating
```sql
-- Check profile exists
SELECT * FROM profiles WHERE email = 'user@example.com';

-- Check payment logs
SELECT * FROM payment_logs ORDER BY created_at DESC LIMIT 10;

-- Check subscriptions
SELECT * FROM profiles WHERE subscription_status = 'active';
```

---

## 🔒 Security Checklist

```
✅ All secrets in .env file
✅ .env file in .gitignore
✅ Using test keys in development
✅ Webhook signatures verified
✅ HTTPS enabled
✅ CORS configured
✅ Rate limiting enabled
✅ 2FA on all accounts
```

---

## 📞 Support Quick Links

| Service | Dashboard | Support | Docs |
|---------|-----------|---------|------|
| Stripe | [dashboard.stripe.com](https://dashboard.stripe.com) | support@stripe.com | [stripe.com/docs](https://stripe.com/docs) |
| PayPal | [developer.paypal.com](https://developer.paypal.com) | [Support](https://developer.paypal.com/support) | [PayPal Docs](https://developer.paypal.com/docs) |
| Calendly | [calendly.com](https://calendly.com) | [Help Center](https://help.calendly.com) | [API Docs](https://developer.calendly.com) |
| Supabase | [app.supabase.com](https://app.supabase.com) | [Support](https://supabase.com/support) | [Docs](https://supabase.com/docs) |

---

## 🎯 Implementation Priority

```
Week 1: ⭐⭐⭐ (Critical)
  - Create accounts
  - Get API keys
  - Set up .env

Week 2: ⭐⭐ (Important)
  - Implement Stripe
  - Create products
  - Test payments

Week 3: ⭐⭐ (Important)
  - Add PayPal
  - Set up webhooks
  - Test both providers

Week 4: ⭐ (Nice to have)
  - Enhance Calendly
  - Polish UI/UX
  - Full testing

Week 5: ⭐⭐⭐ (Critical)
  - Production deployment
  - Monitoring
  - Go live!
```

---

## 📱 Test Workflow

### 1. Stripe Payment Test
```
1. Visit pricing page
2. Click "Choose Premium" ($49/mo)
3. Select "Credit Card"
4. Enter: 4242 4242 4242 4242
5. Expiry: 12/25, CVC: 123
6. Submit
✅ Expected: Success page, email sent, DB updated
```

### 2. PayPal Payment Test
```
1. Visit pricing page
2. Click "Choose VIP" ($97/mo)
3. Select "PayPal"
4. Login to sandbox account
5. Approve subscription
✅ Expected: Success page, webhook fires, DB updated
```

### 3. Calendly Booking Test
```
1. Go to /consultation
2. Select time slot
3. Fill in details
4. Book appointment
✅ Expected: Zoom link created, confirmation email sent
```

---

## 🚨 Emergency Contacts

```
Stripe Support:     support@stripe.com
PayPal Support:     1-888-221-1161
Calendly Support:   help.calendly.com
Supabase Discord:   supabase.com/discord

Business Emergencies:
- Disable payments: Set FEATURE_FLAG_PAYMENTS=false
- Rollback: git revert HEAD
- Contact users: Use email blast feature
```

---

## ✅ Pre-Launch Checklist (Last Minute)

```
□ Test payment works (small real amount)
□ Webhooks receiving events
□ Database updating correctly
□ Email notifications sending
□ Error logging working
□ Monitoring dashboard active
□ Support team briefed
□ Rollback plan ready
□ Legal docs updated
□ Launch announcement ready
```

---

## 🎉 Success Metrics

**Day 1:**
- First successful payment ✓
- No critical errors ✓
- All webhooks firing ✓

**Week 1:**
- 10+ successful payments
- <1% error rate
- Positive user feedback

**Month 1:**
- 100+ subscribers
- <5% churn rate
- Smooth operations

---

**Print this page and keep it handy during implementation!** 📄

---

*Quick Reference Guide | RepMotivatedSeller | December 2024*
