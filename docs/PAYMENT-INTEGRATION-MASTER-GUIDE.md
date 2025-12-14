# RepMotivatedSeller Payment Integration - Complete Setup Guide

## 🎯 Quick Start Summary

You asked about setting up payment options on RepMotivatedSeller after connecting your Zoom account to Calendly. This guide provides everything you need to integrate Stripe and PayPal payments for your site.

## ✅ What's Been Created

I've created comprehensive documentation for your RepMotivatedSeller site:

### 1. **R2 Storage Analytics Review** ([r2-storage-analytics-review.md](./r2-storage-analytics-review.md))
   - ⚠️ **Security fix needed**: Remove hardcoded credentials
   - Move credentials to environment variables
   - Analytics code is solid but needs environment setup
   - Recommendations for dashboard integration

### 2. **Stripe Integration Guide** ([stripe-integration-guide.md](./stripe-integration-guide.md))
   - Complete account setup instructions
   - Membership tier configuration (Basic $29, Premium $49, VIP $97)
   - React components with Stripe Elements
   - Webhook handlers for subscriptions
   - Testing guide with test card numbers

### 3. **PayPal Integration Guide** ([paypal-integration-guide.md](./paypal-integration-guide.md))
   - PayPal Business account setup
   - Subscription plans creation
   - React PayPal buttons integration
   - Payment option selector component
   - Webhook configuration

### 4. **Calendly-Zoom Integration** ([calendly-zoom-integration-guide.md](./calendly-zoom-integration-guide.md))
   - ✅ Congratulations on connecting Zoom to Calendly!
   - Event types for different consultation lengths
   - Embed codes for your website
   - Webhook integration for bookings
   - Member dashboard components

### 5. **Environment Configuration** ([.env.template](./.env.template))
   - Complete environment variable template
   - All API keys and secrets needed
   - Development and production configurations
   - Security best practices

---

## 🚀 Implementation Roadmap

### Phase 1: Setup Accounts (Week 1)

#### Day 1-2: Payment Providers
- [ ] Create Stripe account at [stripe.com](https://stripe.com)
- [ ] Get Stripe API keys (test mode)
- [ ] Create PayPal Business account
- [ ] Get PayPal API credentials (sandbox mode)

#### Day 3-4: Integrations
- [ ] ✅ Calendly account created
- [ ] ✅ Zoom connected to Calendly
- [ ] Create consultation event types
- [ ] Get Calendly API key

#### Day 5-7: Environment Setup
- [ ] Copy `.env.template` to `.env`
- [ ] Fill in all API keys
- [ ] Test environment variables loading
- [ ] Secure `.env` file (add to `.gitignore`)

---

### Phase 2: Frontend Integration (Week 2)

#### Stripe Integration
```bash
# Install dependencies
npm install @stripe/stripe-js @stripe/react-stripe-js stripe

# Create components (already documented in guides):
# - src/components/payments/StripeCheckout.tsx
# - src/components/payments/PaymentSelector.tsx
```

#### PayPal Integration
```bash
# Install dependencies
npm install @paypal/checkout-server-sdk @paypal/react-paypal-js

# Create components:
# - src/components/payments/PayPalCheckout.tsx
# - src/components/payments/PaymentSelector.tsx
```

#### Calendly Widgets
```bash
# Install Calendly SDK
npm install react-calendly

# Create components:
# - src/pages/ConsultationPage.tsx
# - src/components/CalendlyPopup.tsx
# - src/components/dashboard/UpcomingConsultations.tsx
```

---

### Phase 3: Backend Setup (Week 3)

#### Supabase Functions

Create these edge functions:

1. **Stripe Checkout Session**
   ```bash
   supabase functions new create-checkout-session
   # Copy code from stripe-integration-guide.md
   ```

2. **Stripe Webhooks**
   ```bash
   supabase functions new stripe-webhook
   # Copy code from stripe-integration-guide.md
   ```

3. **PayPal Webhooks**
   ```bash
   supabase functions new paypal-webhook
   # Copy code from paypal-integration-guide.md
   ```

4. **Calendly Webhooks**
   ```bash
   supabase functions new calendly-webhook
   # Copy code from calendly-zoom-integration-guide.md
   ```

#### Database Schema

Add these tables to Supabase:

```sql
-- Add to existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_provider TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consultations_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_consultation_at TIMESTAMPTZ;

-- Payment logs
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  provider TEXT NOT NULL,
  stripe_invoice_id TEXT,
  stripe_payment_id TEXT,
  paypal_sale_id TEXT,
  subscription_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultations
CREATE TABLE IF NOT EXISTS consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  calendly_event_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  invitee_email TEXT NOT NULL,
  invitee_name TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  event_type TEXT NOT NULL,
  zoom_meeting_url TEXT,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id ON payment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_email ON consultations(invitee_email);
```

---

### Phase 4: Testing (Week 4)

#### Test Stripe
```javascript
// Use test cards:
// Success: 4242 4242 4242 4242
// Requires auth: 4000 0025 0000 3155
// Declined: 4000 0000 0000 9995
```

Test flow:
1. Select membership tier
2. Choose Stripe payment
3. Enter test card
4. Verify subscription created
5. Check webhook received
6. Confirm database updated

#### Test PayPal
1. Use PayPal sandbox account
2. Complete subscription
3. Verify webhook
4. Check database

#### Test Calendly
1. Book test consultation
2. Verify Zoom link generated
3. Check webhook received
4. Confirm appears in dashboard

---

### Phase 5: Production Deployment

#### Pre-launch Checklist

**Stripe:**
- [ ] Complete business verification
- [ ] Switch to live API keys
- [ ] Update webhook URLs
- [ ] Test live payment (small amount)

**PayPal:**
- [ ] Complete business verification
- [ ] Link bank account
- [ ] Switch to live credentials
- [ ] Test live payment

**Calendly:**
- [ ] Verify Zoom integration works
- [ ] Set proper availability hours
- [ ] Test booking flow end-to-end
- [ ] Set up automated emails

**Security:**
- [ ] All secrets in environment variables
- [ ] `.env` not in version control
- [ ] HTTPS enabled on all endpoints
- [ ] Webhook signatures verified
- [ ] Rate limiting enabled

**Legal:**
- [ ] Terms of Service updated
- [ ] Privacy Policy includes payment info
- [ ] Refund policy clearly stated
- [ ] GDPR/CCPA compliance reviewed

---

## 💳 Pricing Structure

| Tier | Monthly | Features | Consultations |
|------|---------|----------|---------------|
| **Free** | $0 | Basic content | Pay per use |
| **Basic** | $29 | Educational content, community | 0/month |
| **Premium** | $49 | + Analytics, priority support | 2/month |
| **VIP** | $97 | + Unlimited consultations | Unlimited |

**Consultation Pricing (Non-members):**
- 15-min assessment: Free
- 30-min strategy session: $49
- 60-min VIP session: $97

---

## 🔒 Security Best Practices

### Environment Variables
```bash
# NEVER commit these files:
.env
.env.local
.env.production
.env.development

# Add to .gitignore:
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore
echo "!.env.template" >> .gitignore
```

### Webhook Security
```typescript
// Always verify webhook signatures
const signature = req.headers.get('stripe-signature')
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  webhookSecret
)
```

### API Keys
- Use test keys in development
- Rotate production keys quarterly
- Enable 2FA on all accounts
- Use environment-specific keys

---

## 📊 Analytics & Monitoring

### Track These Metrics

**Payments:**
- Conversion rate (visitors → paid members)
- Monthly Recurring Revenue (MRR)
- Churn rate
- Average customer lifetime value
- Failed payment rate

**Consultations:**
- Booking rate
- Show-up rate
- Cancellation rate
- Booking-to-sale conversion

**By Channel:**
- Stripe vs PayPal preference
- Most popular membership tier
- Consultation type distribution

---

## 🆘 Troubleshooting

### Common Issues

**Stripe checkout not loading:**
```javascript
// Check publishable key is correct
console.log('Stripe key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

// Ensure Stripe is loaded
if (!stripe) {
  console.error('Stripe failed to load')
}
```

**PayPal button not showing:**
```javascript
// Verify client ID
console.log('PayPal ID:', import.meta.env.VITE_PAYPAL_CLIENT_ID)

// Check script loaded
if (window.paypal) {
  console.log('PayPal SDK loaded')
}
```

**Webhooks not receiving events:**
1. Check webhook URL is publicly accessible
2. Verify webhook secret matches
3. Check webhook signature validation
4. Review webhook event logs in dashboard

**Calendly not embedding:**
1. Verify username is correct
2. Check script tag is loaded
3. Ensure embed div exists
4. Test with direct link first

---

## 📚 Additional Resources

### Documentation
- [Stripe Docs](https://stripe.com/docs)
- [PayPal Developer](https://developer.paypal.com)
- [Calendly API](https://developer.calendly.com)
- [Zoom API](https://marketplace.zoom.us/docs/api-reference)

### Support
- **Stripe:** support@stripe.com
- **PayPal:** developer.paypal.com/support
- **Calendly:** help.calendly.com
- **Zoom:** support.zoom.us

---

## 🎉 Next Steps

1. **Immediate (This Week):**
   - [ ] Review all guides
   - [ ] Set up test accounts
   - [ ] Get API keys
   - [ ] Configure environment variables

2. **Short-term (Next 2 Weeks):**
   - [ ] Implement payment components
   - [ ] Set up webhooks
   - [ ] Create database tables
   - [ ] Test thoroughly in sandbox

3. **Before Launch:**
   - [ ] Complete business verification
   - [ ] Switch to production keys
   - [ ] Security audit
   - [ ] Legal review

4. **Post-Launch:**
   - [ ] Monitor analytics
   - [ ] Gather user feedback
   - [ ] Optimize conversion funnel
   - [ ] A/B test pricing

---

## 📞 Need Help?

If you have questions about implementation:

1. **Code issues:** Check the guides for detailed examples
2. **API problems:** Consult provider documentation
3. **Security concerns:** Review security best practices section
4. **Business decisions:** Consider A/B testing different approaches

---

**Good luck with your RepMotivatedSeller payment integration! 🚀**

Remember: Start with test/sandbox accounts, test thoroughly, then switch to production when confident.
