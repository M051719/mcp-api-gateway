# Payment Integration Quick Start Guide

## ✅ What's Been Configured

### Payment Providers
- ✅ **Stripe**: 3 subscription products created (Basic $29, Premium $49, VIP $97)
- ✅ **PayPal**: 3 subscription plans created (matching Stripe tiers)
- ✅ **Environment Variables**: All IDs added to .env files

### Components Created
- ✅ Frontend React components
- ✅ Backend API handlers
- ✅ Express server setup
- ✅ Success page

## 🚀 Quick Start (5 Steps)

### Step 1: Install Dependencies

```powershell
# Navigate to components directory
cd components

# Install all dependencies
npm install
```

### Step 2: Verify Environment Variables

Make sure your `.env` file has:

```env
# Stripe
STRIPE_API_KEY=sk_test_51QNr83DRW9Q4RSm0...
VITE_STRIPE_PUBLIC_KEY=pk_test_51QNr83DRW9Q4RSm0...
VITE_STRIPE_BASIC_PRICE_ID=price_1SdTiFDRW9Q4RSm0EzCBBI1e
VITE_STRIPE_PREMIUM_PRICE_ID=price_1SdTifDRW9Q4RSm08vtIEUvJ
VITE_STRIPE_VIP_PRICE_ID=price_1SdTj3DRW9Q4RSm0hq9WyGSM

# PayPal
PAYPAL_API_CLIENT_ID=AcKlz_2MuLcTHhmYDtOwfaGq0QXu-yEszqm6pIzWrYxYkx-k_LmbDBFcq8SEVTMfIiR6FY08_OKEkBpb
PAYPAL_API_SECRET=your_secret_here
VITE_PAYPAL_CLIENT_ID=AcKlz_2MuLcTHhmYDtOwfaGq0QXu-yEszqm6pIzWrYxYkx-k_LmbDBFcq8SEVTMfIiR6FY08_OKEkBpb
PAYPAL_BASIC_PLAN_ID=P-21N811060X660120DNE57DEQ
PAYPAL_PREMIUM_PLAN_ID=P-25550538XW8386712NE57DEY
PAYPAL_VIP_PLAN_ID=P-9WJ403558X8607434NE57DFA
PAYPAL_MODE=sandbox

# App
FRONTEND_URL=http://localhost:5173
PORT=3000
```

### Step 3: Start the Backend Server

```powershell
# In the components directory
npm run server:dev
```

You should see:
```
🚀 RepMotivatedSeller Payment Server
📍 Server: http://localhost:3000
💳 Stripe: ✅ Configured
💰 PayPal: ✅ Configured
```

### Step 4: Add Components to Your React App

#### Option A: Copy to Your Existing React Project

```powershell
# Copy components to your React app
Copy-Item -Recurse .\components\*.jsx "C:\path\to\your\react\app\src\components\"
```

#### Option B: Use as Standalone

The components are ready to use as-is. Just import them:

```jsx
import MembershipPlans from './components/MembershipPlans';

function App() {
  const userId = 'user_123'; // Get from your auth system
  const userEmail = 'user@example.com'; // Get from your auth system

  return (
    <MembershipPlans 
      userId={userId}
      userEmail={userEmail}
    />
  );
}
```

### Step 5: Configure Webhooks

#### Stripe Webhooks (Test Mode)

```powershell
# Install Stripe CLI (if not already installed)
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

This will give you a webhook secret like `whsec_...`. Add it to your `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### PayPal Webhooks

1. Go to https://developer.paypal.com/dashboard/webhooks
2. Create webhook pointing to: `http://localhost:3000/api/paypal-webhook` (for testing)
3. Add the webhook ID to `.env`:

```env
PAYPAL_WEBHOOK_ID=your_webhook_id
```

## 🧪 Testing

### Test Stripe Payments

1. Navigate to http://localhost:5173 (your frontend)
2. Select a plan and click "Pay with Card"
3. Use test card: `4242 4242 4242 4242`
4. Any future date and CVC

### Test PayPal Payments

1. Select a plan and click "Pay with PayPal"
2. Use PayPal sandbox credentials from: https://developer.paypal.com/dashboard/accounts
3. Complete the subscription flow

### Verify Webhooks

```powershell
# Check webhook events
stripe events list --limit 10
```

## 📁 Project Structure

```
components/
├── MembershipPlans.jsx       # Main pricing page
├── StripeCheckout.jsx         # Stripe payment form
├── PayPalCheckout.jsx         # PayPal payment form
├── PaymentSuccess.jsx         # Success page after payment
├── server.js                  # Express server
├── package.json               # Dependencies
├── README.md                  # Documentation
├── api/
│   ├── stripe.js             # Stripe API handlers
│   └── paypal.js             # PayPal API handlers
└── routes/
    └── payment.js            # Express routes
```

## 🔗 API Endpoints

### Stripe
- `POST /api/create-payment-intent` - Create payment intent
- `POST /api/create-subscription` - Create subscription
- `POST /api/stripe-webhook` - Webhook handler
- `POST /api/cancel-subscription` - Cancel subscription
- `POST /api/customer-portal` - Customer portal link

### PayPal
- `POST /api/paypal-subscription` - Save subscription
- `POST /api/paypal-webhook` - Webhook handler
- `POST /api/cancel-paypal-subscription` - Cancel subscription
- `GET /api/paypal-subscription/:id` - Get subscription details

### Health
- `GET /api/health` - Check API status

## 🎨 Customization

### Change Colors

Edit the styles in each component. Main colors used:
- Primary: `#667eea` (purple)
- Success: `#48bb78` (green)
- Stripe: `#635bff` (indigo)
- PayPal: `#ffc439` (yellow)

### Add More Plans

Edit `MembershipPlans.jsx`:

```jsx
const PLANS = [
  // Add your custom plan here
  {
    name: 'Enterprise',
    price: 197,
    stripePriceId: 'price_xxx',
    paypalPlanId: 'P-xxx',
    features: ['Custom features...']
  }
];
```

### Customize Success Page

Edit `PaymentSuccess.jsx` to match your brand and add custom actions.

## 🔐 Security Checklist

Before going live:

- [ ] Replace all test/sandbox credentials with live credentials
- [ ] Set up HTTPS (required for production webhooks)
- [ ] Configure production webhook URLs
- [ ] Enable webhook signature verification
- [ ] Implement rate limiting on API endpoints
- [ ] Add authentication middleware
- [ ] Set up error logging (e.g., Sentry)
- [ ] Test all payment flows end-to-end
- [ ] Review and test cancellation/refund flows
- [ ] Set up monitoring alerts

## 📊 Database Integration

You'll need to store subscriptions. Example with Supabase:

```javascript
// In your API handlers, add:
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Save subscription
await supabase.from('subscriptions').insert({
  user_id: userId,
  subscription_id: subscriptionId,
  plan_name: planName,
  provider: 'stripe', // or 'paypal'
  status: 'active',
  created_at: new Date()
});
```

## 🐛 Troubleshooting

### "Stripe is not defined"

Make sure you installed dependencies:
```powershell
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

### "PayPal buttons not showing"

1. Check console for errors
2. Verify `VITE_PAYPAL_CLIENT_ID` is set
3. Make sure PayPal SDK loaded properly

### Webhooks not working

1. Check webhook secret is correct
2. Verify webhook URL is accessible
3. Check server logs for errors
4. Use `stripe listen` for local testing

### CORS errors

Update `server.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));
```

## 📚 Additional Resources

- [Stripe Integration Guide](../docs/stripe-integration-guide.md)
- [PayPal Integration Guide](../docs/paypal-integration-guide.md)
- [Master Guide](../docs/PAYMENT-INTEGRATION-MASTER-GUIDE.md)
- [Implementation Checklist](../docs/IMPLEMENTATION-CHECKLIST.md)

## 🆘 Support

Need help? Check:
1. Component README: `components/README.md`
2. Stripe docs: https://stripe.com/docs
3. PayPal docs: https://developer.paypal.com/docs
4. Email support: support@repmotivatedseller.com

## 🎉 You're All Set!

Your payment integration is ready. Start the server, test the flows, and you're good to go!

```powershell
# Start backend
npm run server:dev

# Start frontend (in your React app directory)
npm run dev
```

Visit http://localhost:5173 and start accepting payments! 🚀
