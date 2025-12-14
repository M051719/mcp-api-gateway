# Payment Integration Components

This directory contains the frontend React components and backend API handlers for Stripe and PayPal payment integration.

## Components

### Frontend Components (React)

1. **MembershipPlans.jsx**
   - Main pricing page displaying all membership tiers
   - Allows users to select payment method (Stripe or PayPal)
   - Responsive grid layout with feature comparisons

2. **StripeCheckout.jsx**
   - Stripe Elements integration for card payments
   - Handles subscription creation and payment confirmation
   - Includes loading states and error handling

3. **PayPalCheckout.jsx**
   - PayPal Buttons integration for PayPal payments
   - Subscription creation via PayPal SDK
   - Feature summary and secure payment badges

### Backend API Handlers (Node.js)

4. **api/stripe.js**
   - `createPaymentIntent` - Initialize Stripe payment
   - `createSubscription` - Create Stripe subscription
   - `handleStripeWebhook` - Process Stripe webhook events
   - `cancelSubscription` - Cancel active subscription
   - `createCustomerPortalSession` - Generate customer portal link

5. **api/paypal.js**
   - `savePayPalSubscription` - Save PayPal subscription to database
   - `handlePayPalWebhook` - Process PayPal webhook events
   - `cancelPayPalSubscription` - Cancel PayPal subscription
   - `getPayPalSubscription` - Retrieve subscription details
   - `suspendPayPalSubscription` - Suspend subscription for failed payments

## Installation

### Frontend Dependencies

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js @paypal/react-paypal-js
```

### Backend Dependencies

```bash
npm install stripe axios
```

## Environment Variables

Make sure these are set in your `.env` files:

```env
# Stripe
STRIPE_API_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Product/Price IDs
VITE_STRIPE_BASIC_PRICE_ID=price_1SdTiFDRW9Q4RSm0EzCBBI1e
VITE_STRIPE_PREMIUM_PRICE_ID=price_1SdTifDRW9Q4RSm08vtIEUvJ
VITE_STRIPE_VIP_PRICE_ID=price_1SdTj3DRW9Q4RSm0hq9WyGSM

# PayPal
PAYPAL_API_CLIENT_ID=...
PAYPAL_API_SECRET=...
VITE_PAYPAL_CLIENT_ID=...
PAYPAL_MODE=sandbox
PAYPAL_WEBHOOK_ID=...

# PayPal Plan IDs
VITE_PAYPAL_BASIC_PLAN_ID=P-21N811060X660120DNE57DEQ
VITE_PAYPAL_PREMIUM_PLAN_ID=P-25550538XW8386712NE57DEY
VITE_PAYPAL_VIP_PLAN_ID=P-9WJ403558X8607434NE57DFA

# App
FRONTEND_URL=http://localhost:5173
```

## Usage

### Frontend Integration

```jsx
import MembershipPlans from './components/MembershipPlans';

function App() {
  return (
    <MembershipPlans 
      userId="user_123"
      userEmail="user@example.com"
    />
  );
}
```

### Backend Integration (Express)

```javascript
import express from 'express';
import { 
  createPaymentIntent, 
  createSubscription,
  handleStripeWebhook,
  cancelSubscription,
  createCustomerPortalSession
} from './components/api/stripe.js';
import {
  savePayPalSubscription,
  handlePayPalWebhook,
  cancelPayPalSubscription,
  getPayPalSubscription
} from './components/api/paypal.js';

const app = express();

// Stripe routes
app.post('/api/create-payment-intent', createPaymentIntent);
app.post('/api/create-subscription', createSubscription);
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), handleStripeWebhook);
app.post('/api/cancel-subscription', cancelSubscription);
app.post('/api/customer-portal', createCustomerPortalSession);

// PayPal routes
app.post('/api/paypal-subscription', savePayPalSubscription);
app.post('/api/paypal-webhook', handlePayPalWebhook);
app.post('/api/cancel-paypal-subscription', cancelPayPalSubscription);
app.get('/api/paypal-subscription/:subscriptionId', getPayPalSubscription);
```

## Webhook Setup

### Stripe Webhooks

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/stripe-webhook`
4. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### PayPal Webhooks

1. Go to https://developer.paypal.com/dashboard/webhooks
2. Click "Create Webhook"
3. Enter your webhook URL: `https://yourdomain.com/api/paypal-webhook`
4. Select these events:
   - `BILLING.SUBSCRIPTION.CREATED`
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.SALE.REFUNDED`
5. Copy the webhook ID to `PAYPAL_WEBHOOK_ID`

## Testing

### Stripe Test Cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

### PayPal Sandbox

Use PayPal sandbox accounts from https://developer.paypal.com/dashboard/accounts

## Database Schema

You'll need to store subscription data. Suggested schema:

```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  subscription_id VARCHAR(255) UNIQUE NOT NULL,
  customer_id VARCHAR(255),
  plan_id VARCHAR(255) NOT NULL,
  plan_name VARCHAR(50) NOT NULL,
  provider VARCHAR(20) NOT NULL, -- 'stripe' or 'paypal'
  status VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscription_id ON subscriptions(subscription_id);
```

## Security Notes

1. **Never expose secret keys** - Only use `VITE_` prefixed variables in frontend
2. **Verify webhooks** - Always verify webhook signatures
3. **Use HTTPS** - Webhooks require HTTPS in production
4. **Validate user input** - Sanitize all user inputs on backend
5. **Rate limiting** - Implement rate limiting on API endpoints

## Production Checklist

- [ ] Replace test/sandbox credentials with live credentials
- [ ] Update webhook URLs to production domain
- [ ] Configure SSL certificate
- [ ] Set up webhook monitoring
- [ ] Test payment flows end-to-end
- [ ] Configure customer email notifications
- [ ] Set up subscription management dashboard
- [ ] Implement proper error logging
- [ ] Add analytics tracking
- [ ] Review and test cancellation flows

## Support

For more information, see:
- [docs/stripe-integration-guide.md](../docs/stripe-integration-guide.md)
- [docs/paypal-integration-guide.md](../docs/paypal-integration-guide.md)
- [docs/PAYMENT-INTEGRATION-MASTER-GUIDE.md](../docs/PAYMENT-INTEGRATION-MASTER-GUIDE.md)
