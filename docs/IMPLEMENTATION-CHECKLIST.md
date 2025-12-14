# RepMotivatedSeller Payment Integration - Implementation Checklist

## ✅ Pre-Implementation Setup

### Accounts & Access
- [ ] Stripe account created and verified
- [ ] PayPal Business account created
- [ ] Calendly account with Zoom connected ✅ (Already done!)
- [ ] Zoom Pro/Business account active
- [ ] Supabase project created
- [ ] Domain configured (repmotivatedseller.org)

### Development Environment
- [ ] Node.js installed (v18+)
- [ ] Git configured
- [ ] Code editor ready (VS Code recommended)
- [ ] `.env` file created from template
- [ ] Dependencies installed: `npm install`

---

## 🔑 API Keys Collection

### Stripe
- [ ] Test Publishable Key: `pk_test_...`
- [ ] Test Secret Key: `sk_test_...`
- [ ] Live Publishable Key: `pk_live_...`
- [ ] Live Secret Key: `sk_live_...`
- [ ] Webhook Secret: `whsec_...`

### PayPal
- [ ] Sandbox Client ID
- [ ] Sandbox Secret
- [ ] Live Client ID
- [ ] Live Secret
- [ ] Webhook ID

### Calendly
- [ ] API Token
- [ ] Webhook Signing Key
- [ ] Username confirmed

### Zoom
- [ ] API Key
- [ ] API Secret
- [ ] Webhook Token

### Supabase
- [ ] Project URL
- [ ] Anon Key
- [ ] Service Role Key

---

## 💻 Frontend Implementation

### Install Dependencies
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js stripe
npm install @paypal/checkout-server-sdk @paypal/react-paypal-js
npm install react-calendly
npm install framer-motion react-hot-toast
npm install date-fns
```

### Create Components

#### Payment Components
- [ ] `src/components/payments/StripeCheckout.tsx`
- [ ] `src/components/payments/PayPalCheckout.tsx`
- [ ] `src/components/payments/PaymentSelector.tsx`
- [ ] `src/lib/stripe.ts`

#### Calendly Components
- [ ] `src/pages/ConsultationPage.tsx`
- [ ] `src/components/CalendlyPopup.tsx`
- [ ] `src/components/dashboard/UpcomingConsultations.tsx`

#### Payment Success/Cancel Pages
- [ ] `src/pages/PaymentSuccessPage.tsx`
- [ ] `src/pages/PaymentCancelPage.tsx`

### Update Existing Components
- [ ] Add payment links to pricing page
- [ ] Add consultation booking to member dashboard
- [ ] Update navigation with consultation link

---

## 🔧 Backend Implementation

### Supabase Edge Functions

Create functions:
```bash
supabase functions new create-checkout-session
supabase functions new stripe-webhook
supabase functions new paypal-webhook
supabase functions new calendly-webhook
```

Implementation checklist:
- [ ] `create-checkout-session/index.ts` - Stripe session creation
- [ ] `stripe-webhook/index.ts` - Handle Stripe events
- [ ] `paypal-webhook/index.ts` - Handle PayPal events
- [ ] `calendly-webhook/index.ts` - Handle Calendly bookings

### Database Schema

Run migration:
```bash
supabase migration new add_payment_tables
```

Tables to create:
- [ ] Update `profiles` table with payment fields
- [ ] Create `payment_logs` table
- [ ] Create `consultations` table
- [ ] Add indexes for performance

SQL to execute:
```sql
-- Extend profiles
ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN paypal_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN membership_tier TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE profiles ADD COLUMN payment_provider TEXT;
ALTER TABLE profiles ADD COLUMN consultations_used INTEGER DEFAULT 0;

-- Payment logs table
CREATE TABLE payment_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  provider TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultations table
CREATE TABLE consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  calendly_event_id TEXT UNIQUE NOT NULL,
  invitee_email TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  zoom_meeting_url TEXT,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- [ ] Migration file created
- [ ] Migration tested locally
- [ ] Migration deployed to Supabase

---

## 🎯 Stripe Configuration

### Dashboard Setup
- [ ] Business information completed
- [ ] Bank account linked
- [ ] Tax settings configured
- [ ] Branding customized

### Create Products
- [ ] Basic Membership ($29/mo)
- [ ] Premium Membership ($49/mo)
- [ ] VIP Membership ($97/mo)

For each product:
- [ ] Product created in Stripe
- [ ] Monthly price created
- [ ] Price ID saved to `.env`

### Webhooks
- [ ] Webhook endpoint created: `/api/webhooks/stripe`
- [ ] Events selected:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Webhook secret saved
- [ ] Test webhook sent

---

## 💰 PayPal Configuration

### Dashboard Setup
- [ ] Business verified
- [ ] Bank account linked
- [ ] App created

### Create Subscription Plans
Script to run:
```bash
node scripts/setup-paypal-plans.js
```

Plans to create:
- [ ] Basic Plan ($29/mo)
- [ ] Premium Plan ($49/mo)
- [ ] VIP Plan ($97/mo)
- [ ] Plan IDs saved to `.env`

### Webhooks
- [ ] Webhook URL configured: `/api/webhooks/paypal`
- [ ] Events selected:
  - [ ] `BILLING.SUBSCRIPTION.CREATED`
  - [ ] `BILLING.SUBSCRIPTION.ACTIVATED`
  - [ ] `BILLING.SUBSCRIPTION.CANCELLED`
  - [ ] `PAYMENT.SALE.COMPLETED`
- [ ] Webhook ID saved

---

## 📅 Calendly Configuration

### Event Types
- [ ] Free Assessment (15 min)
  - [ ] Zoom integration enabled
  - [ ] Questions configured
  - [ ] Email reminders set
- [ ] Strategy Session (30 min)
  - [ ] Pricing: $49 (or free for members)
  - [ ] Zoom integration enabled
- [ ] VIP Session (60 min)
  - [ ] Pricing: $97 (or free for VIP)
  - [ ] Zoom integration enabled

### Settings
- [ ] Availability hours set
- [ ] Buffer times configured
- [ ] Cancellation policy set
- [ ] Email templates customized

### Webhooks
- [ ] Webhook created: `/api/webhooks/calendly`
- [ ] Events enabled:
  - [ ] `invitee.created`
  - [ ] `invitee.canceled`
  - [ ] `invitee.rescheduled`

---

## 🧪 Testing Phase

### Test in Sandbox/Development

#### Stripe Testing
- [ ] Select Basic membership
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Verify subscription in Stripe dashboard
- [ ] Check webhook received
- [ ] Confirm database updated
- [ ] Verify user can access member features

Test cards to try:
- [ ] Success: `4242 4242 4242 4242`
- [ ] Decline: `4000 0000 0000 9995`
- [ ] 3D Secure: `4000 0025 0000 3155`

#### PayPal Testing
- [ ] Login to sandbox account
- [ ] Select Premium membership
- [ ] Choose PayPal payment
- [ ] Complete in sandbox
- [ ] Verify webhook
- [ ] Check database

#### Calendly Testing
- [ ] Book free consultation
- [ ] Verify Zoom link generated
- [ ] Check confirmation email
- [ ] Verify webhook received
- [ ] Check consultation appears in dashboard
- [ ] Test cancellation flow
- [ ] Test rescheduling

### Edge Cases to Test
- [ ] Payment fails → user sees error
- [ ] Webhook delayed → eventual consistency
- [ ] User cancels during checkout
- [ ] Duplicate subscription attempt
- [ ] Expired card
- [ ] Insufficient funds

---

## 🚀 Production Deployment

### Pre-Launch Security Audit
- [ ] All secrets in environment variables
- [ ] `.env` files not committed to Git
- [ ] Webhook signatures verified
- [ ] HTTPS enforced
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] SQL injection prevention
- [ ] XSS protection enabled

### Switch to Production

#### Stripe
- [ ] Complete business verification
- [ ] Switch environment variables to live keys
- [ ] Update webhook URL to production domain
- [ ] Test with real $1 payment (refund after)
- [ ] Monitor Stripe dashboard

#### PayPal
- [ ] Complete business verification
- [ ] Switch to live credentials
- [ ] Update webhook URL
- [ ] Test real payment
- [ ] Monitor PayPal dashboard

#### Supabase
- [ ] Run migrations on production database
- [ ] Deploy edge functions
- [ ] Configure production secrets
- [ ] Test functions

### DNS & Domain
- [ ] Domain pointing to production
- [ ] SSL certificate active
- [ ] Webhook URLs accessible
- [ ] Test all endpoints

### Legal & Compliance
- [ ] Terms of Service updated
- [ ] Privacy Policy includes payment info
- [ ] Refund policy published
- [ ] GDPR consent banner (if EU traffic)
- [ ] Cookie policy updated

---

## 📊 Post-Launch Monitoring

### Week 1
- [ ] Monitor payment success rate
- [ ] Check webhook delivery
- [ ] Review error logs
- [ ] Track conversion rate
- [ ] Respond to user feedback

### Ongoing
- [ ] Weekly analytics review
- [ ] Monthly revenue reports
- [ ] Quarterly security audit
- [ ] Customer satisfaction surveys
- [ ] A/B test pricing/features

### Metrics to Track
- [ ] Monthly Recurring Revenue (MRR)
- [ ] Churn rate
- [ ] Customer Acquisition Cost (CAC)
- [ ] Lifetime Value (LTV)
- [ ] Payment success rate
- [ ] Consultation booking rate
- [ ] Show-up rate

---

## 🆘 Rollback Plan

If issues arise:

### Emergency Contacts
- Stripe: support@stripe.com
- PayPal: 1-888-221-1161
- Calendly: help.calendly.com
- Supabase: support@supabase.com

### Rollback Steps
1. [ ] Disable payment buttons (feature flag)
2. [ ] Redirect to contact form
3. [ ] Notify affected users
4. [ ] Investigate issue
5. [ ] Fix and re-test
6. [ ] Re-enable gradually

### Backup Plan
- [ ] Manual payment processing available
- [ ] Backup webhook endpoint ready
- [ ] Database backups recent
- [ ] Contact support numbers saved

---

## 📚 Documentation

### Internal Docs
- [ ] Payment flow diagram
- [ ] Webhook event handling guide
- [ ] Troubleshooting guide
- [ ] API reference
- [ ] Database schema docs

### User Docs
- [ ] How to subscribe
- [ ] How to cancel
- [ ] How to update payment method
- [ ] How to book consultations
- [ ] FAQ page

---

## ✅ Final Checklist

Before going live:
- [ ] All tests passing
- [ ] Security audit complete
- [ ] Legal review done
- [ ] Monitoring in place
- [ ] Support ready
- [ ] Rollback plan documented
- [ ] Team trained
- [ ] Soft launch with beta users
- [ ] Full launch announcement ready

---

## 🎉 Success Criteria

You'll know it's working when:
- ✅ Users can select and purchase memberships
- ✅ Both Stripe and PayPal work smoothly
- ✅ Webhooks update database correctly
- ✅ Consultations can be booked
- ✅ Zoom links generate automatically
- ✅ Email notifications sent
- ✅ Member features activate instantly
- ✅ Analytics tracking all events
- ✅ No errors in logs
- ✅ Users are happy! 😊

---

**Ready to launch! 🚀**

Start with Phase 1 and work through systematically. Don't rush to production - thorough testing will save headaches later!
