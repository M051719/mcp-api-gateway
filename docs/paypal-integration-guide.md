# PayPal Payment Integration Guide - RepMotivatedSeller

## Overview
Complete guide to integrating PayPal as an alternative payment method alongside Stripe for RepMotivatedSeller memberships and services.

## Table of Contents
1. [PayPal Account Setup](#paypal-account-setup)
2. [API Configuration](#api-configuration)
3. [Subscription Plans](#subscription-plans)
4. [Integration Code](#integration-code)
5. [Webhook Configuration](#webhook-configuration)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)

---

## 1. PayPal Account Setup

### Create PayPal Business Account
1. Go to [https://www.paypal.com/us/business](https://www.paypal.com/us/business)
2. Click "Sign Up" → Business Account
3. Complete verification:
   - Business type: LLC/Sole Proprietor
   - Business name: RepMotivatedSeller
   - Tax ID/EIN
   - Bank account

### Get API Credentials

1. **Login to PayPal Developer Portal:**
   - Go to [https://developer.paypal.com](https://developer.paypal.com)
   - Sign in with your PayPal business account

2. **Create App:**
   - Dashboard → My Apps & Credentials
   - Click "Create App"
   - App Name: "RepMotivatedSeller Payments"
   - App Type: Merchant
   - Click "Create App"

3. **Get Client ID and Secret:**
   - **Sandbox** (for testing):
     - Client ID: `xxxxx-xxxxx-xxxxx`
     - Secret: `xxxxx-xxxxx-xxxxx`
   
   - **Live** (for production):
     - Switch to "Live" tab
     - Client ID: `xxxxx-xxxxx-xxxxx`
     - Secret: `xxxxx-xxxxx-xxxxx`

### Enable Features

In your App Settings, enable:
- ✅ Accept payments
- ✅ Subscriptions
- ✅ Vault (for storing payment methods)
- ✅ Invoicing

---

## 2. API Configuration

### Environment Variables

Add to your `.env` file:

```bash
# PayPal Configuration
PAYPAL_CLIENT_ID=AeA1QIZXiflr1_JZpjS3sdgEk8KTbJsJ_lF8-7LqEc4M_wDOxHI5J_wxxxxxxxxx
PAYPAL_CLIENT_SECRET=EKzP9dqN8vJ5KxxxxxxxxxJqDc9K_OB4aYxxxxxxxxx
PAYPAL_MODE=sandbox  # Use 'live' for production
PAYPAL_WEBHOOK_ID=xxxxx-xxxxx-xxxxx

# For production
# PAYPAL_MODE=live
# PAYPAL_CLIENT_ID=xxxxx (live credentials)
# PAYPAL_CLIENT_SECRET=xxxxx (live credentials)
```

### Install PayPal SDK

```bash
npm install @paypal/checkout-server-sdk @paypal/react-paypal-js
```

**Or with yarn:**
```bash
yarn add @paypal/checkout-server-sdk @paypal/react-paypal-js
```

---

## 3. Subscription Plans

### Create Subscription Products in PayPal

Use PayPal API or Dashboard to create billing plans:

#### Via PayPal Dashboard
1. Dashboard → Products & Services → Subscriptions
2. Click "Create Plan"
3. Create three plans:

**Basic Plan:**
- Name: Basic Membership
- Price: $29/month
- Description: Educational content and community access

**Premium Plan:**
- Name: Premium Membership
- Price: $49/month
- Description: Premium features with consultations

**VIP Plan:**
- Name: VIP Membership
- Price: $97/month
- Description: All features with white-glove service

#### Via API (Automated Setup Script)

Create `scripts/setup-paypal-plans.js`:

```javascript
const paypal = require('@paypal/checkout-server-sdk');

// PayPal environment
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  return process.env.PAYPAL_MODE === 'live'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

const client = new paypal.core.PayPalHttpClient(environment());

async function createProduct(name, description) {
  const request = new paypal.catalogs.ProductsCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    name: name,
    description: description,
    type: 'SERVICE',
    category: 'SOFTWARE'
  });

  const response = await client.execute(request);
  return response.result.id;
}

async function createPlan(productId, name, price) {
  const request = new paypal.subscriptions.PlansCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    product_id: productId,
    name: name,
    billing_cycles: [{
      frequency: {
        interval_unit: 'MONTH',
        interval_count: 1
      },
      tenure_type: 'REGULAR',
      sequence: 1,
      total_cycles: 0,
      pricing_scheme: {
        fixed_price: {
          value: price.toString(),
          currency_code: 'USD'
        }
      }
    }],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee_failure_action: 'CONTINUE',
      payment_failure_threshold: 3
    }
  });

  const response = await client.execute(request);
  return response.result.id;
}

async function setupPlans() {
  try {
    console.log('Creating PayPal subscription plans...');
    
    // Create products
    const basicProductId = await createProduct(
      'Basic Membership',
      'Access to educational content and community'
    );
    const premiumProductId = await createProduct(
      'Premium Membership',
      'Premium features with consultations'
    );
    const vipProductId = await createProduct(
      'VIP Membership',
      'All features with white-glove service'
    );
    
    // Create plans
    const basicPlanId = await createPlan(basicProductId, 'Basic Monthly', 29);
    const premiumPlanId = await createPlan(premiumProductId, 'Premium Monthly', 49);
    const vipPlanId = await createPlan(vipProductId, 'VIP Monthly', 97);
    
    console.log('✅ Plans created successfully!');
    console.log('\nAdd these to your .env file:');
    console.log(`PAYPAL_BASIC_PLAN_ID=${basicPlanId}`);
    console.log(`PAYPAL_PREMIUM_PLAN_ID=${premiumPlanId}`);
    console.log(`PAYPAL_VIP_PLAN_ID=${vipPlanId}`);
    
  } catch (error) {
    console.error('Error creating plans:', error);
  }
}

setupPlans();
```

Run the script:
```bash
node scripts/setup-paypal-plans.js
```

---

## 4. Integration Code

### Frontend: PayPal Button Component

Create `src/components/payments/PayPalCheckout.tsx`:

```tsx
import React, { useEffect } from 'react'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

interface PayPalCheckoutProps {
  planId: 'basic' | 'premium' | 'vip'
  onSuccess: () => void
  onError?: (error: any) => void
}

const planMapping = {
  basic: {
    paypalPlanId: process.env.VITE_PAYPAL_BASIC_PLAN_ID,
    price: 29,
    name: 'Basic Membership'
  },
  premium: {
    paypalPlanId: process.env.VITE_PAYPAL_PREMIUM_PLAN_ID,
    price: 49,
    name: 'Premium Membership'
  },
  vip: {
    paypalPlanId: process.env.VITE_PAYPAL_VIP_PLAN_ID,
    price: 97,
    name: 'VIP Membership'
  }
}

export const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  planId,
  onSuccess,
  onError
}) => {
  const plan = planMapping[planId]

  const createSubscription = async (data: any, actions: any) => {
    return actions.subscription.create({
      plan_id: plan.paypalPlanId,
      application_context: {
        brand_name: 'RepMotivatedSeller',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
      }
    })
  }

  const onApprove = async (data: any, actions: any) => {
    try {
      // Get subscription details
      const details = await actions.subscription.get()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Update user's profile with PayPal subscription
      const { error } = await supabase
        .from('profiles')
        .update({
          paypal_subscription_id: data.subscriptionID,
          membership_tier: planId,
          subscription_status: 'active',
          payment_provider: 'paypal',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      // Log payment
      await supabase.from('payment_logs').insert({
        user_id: user.id,
        provider: 'paypal',
        subscription_id: data.subscriptionID,
        amount: plan.price * 100,
        currency: 'usd',
        status: 'active',
        created_at: new Date().toISOString()
      })

      toast.success('Subscription activated! Welcome aboard! 🎉')
      onSuccess()
      
    } catch (error: any) {
      toast.error('Failed to activate subscription')
      onError?.(error)
    }
  }

  const onCancel = () => {
    toast('Subscription cancelled', { icon: 'ℹ️' })
  }

  const onErrorHandler = (err: any) => {
    console.error('PayPal error:', err)
    toast.error('Payment error. Please try again.')
    onError?.(err)
  }

  return (
    <PayPalScriptProvider
      options={{
        'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID,
        vault: true,
        intent: 'subscription',
      }}
    >
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900">{plan.name}</h3>
          <p className="text-2xl font-bold text-blue-600">
            ${plan.price}/month
          </p>
        </div>

        <PayPalButtons
          createSubscription={createSubscription}
          onApprove={onApprove}
          onCancel={onCancel}
          onError={onErrorHandler}
          style={{
            shape: 'rect',
            color: 'blue',
            layout: 'vertical',
            label: 'subscribe'
          }}
        />

        <div className="text-center text-sm text-gray-500">
          <p>💳 Secure payment via PayPal</p>
          <p>Cancel anytime • 30-day money-back guarantee</p>
        </div>
      </div>
    </PayPalScriptProvider>
  )
}

export default PayPalCheckout
```

### Payment Option Selector

Create `src/components/payments/PaymentSelector.tsx`:

```tsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import StripeCheckout from './StripeCheckout'
import PayPalCheckout from './PayPalCheckout'

interface PaymentSelectorProps {
  planId: 'basic' | 'premium' | 'vip'
  onSuccess: () => void
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  planId,
  onSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe')

  return (
    <div className="max-w-2xl mx-auto">
      {/* Payment Method Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose Payment Method
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setPaymentMethod('stripe')}
            className={`p-4 border-2 rounded-lg transition-all ${
              paymentMethod === 'stripe'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">💳</span>
              <span className="font-semibold">Credit Card</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">via Stripe</p>
          </button>

          <button
            onClick={() => setPaymentMethod('paypal')}
            className={`p-4 border-2 rounded-lg transition-all ${
              paymentMethod === 'paypal'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">🅿️</span>
              <span className="font-semibold">PayPal</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Account or Card</p>
          </button>
        </div>
      </div>

      {/* Payment Form */}
      <motion.div
        key={paymentMethod}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {paymentMethod === 'stripe' ? (
          <StripeCheckout planId={planId} onSuccess={onSuccess} />
        ) : (
          <PayPalCheckout planId={planId} onSuccess={onSuccess} />
        )}
      </motion.div>

      {/* Security Badges */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
          <span className="flex items-center">
            <span className="mr-2">🔒</span>
            SSL Encrypted
          </span>
          <span className="flex items-center">
            <span className="mr-2">✅</span>
            PCI Compliant
          </span>
          <span className="flex items-center">
            <span className="mr-2">💯</span>
            Money-back Guarantee
          </span>
        </div>
      </div>
    </div>
  )
}

export default PaymentSelector
```

---

## 5. Webhook Configuration

### Create Webhook

1. **In PayPal Developer Dashboard:**
   - Go to Apps & Credentials → Your App
   - Scroll to "Webhooks"
   - Click "Add Webhook"
   - URL: `https://repmotivatedseller.org/api/webhooks/paypal`

2. **Select Events:**
   ```
   BILLING.SUBSCRIPTION.CREATED
   BILLING.SUBSCRIPTION.ACTIVATED
   BILLING.SUBSCRIPTION.UPDATED
   BILLING.SUBSCRIPTION.CANCELLED
   BILLING.SUBSCRIPTION.SUSPENDED
   BILLING.SUBSCRIPTION.EXPIRED
   PAYMENT.SALE.COMPLETED
   PAYMENT.SALE.REFUNDED
   ```

3. **Get Webhook ID:**
   - Copy the Webhook ID
   - Add to `.env` as `PAYPAL_WEBHOOK_ID`

### Webhook Handler

Create `supabase/functions/paypal-webhook/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  try {
    const body = await req.json()
    const event_type = body.event_type
    
    console.log(`🔔 PayPal Webhook: ${event_type}`)

    switch (event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED':
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(body.resource)
        break
        
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(body.resource)
        break
        
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handleSubscriptionSuspended(body.resource)
        break
        
      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(body.resource)
        break
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('❌ PayPal webhook error:', err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400 }
    )
  }
})

async function handleSubscriptionActivated(resource: any) {
  const subscriptionId = resource.id
  
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('paypal_subscription_id', subscriptionId)

  if (error) console.error('Error updating subscription:', error)
}

async function handleSubscriptionCancelled(resource: any) {
  const subscriptionId = resource.id
  
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'cancelled',
      membership_tier: 'free',
      updated_at: new Date().toISOString()
    })
    .eq('paypal_subscription_id', subscriptionId)
}

async function handleSubscriptionSuspended(resource: any) {
  const subscriptionId = resource.id
  
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'suspended',
      updated_at: new Date().toISOString()
    })
    .eq('paypal_subscription_id', subscriptionId)
}

async function handlePaymentCompleted(resource: any) {
  await supabase.from('payment_logs').insert({
    paypal_sale_id: resource.id,
    amount: parseFloat(resource.amount.total) * 100,
    currency: resource.amount.currency,
    status: 'completed',
    created_at: new Date().toISOString()
  })
}
```

---

## 6. Testing

### Sandbox Testing

1. **Create Test Account:**
   - PayPal Developer → Sandbox → Accounts
   - Create personal test account
   - Note the email and password

2. **Test PayPal Button:**
   - Use sandbox client ID
   - Click PayPal button
   - Login with test account
   - Complete subscription

3. **Test Webhooks:**
   ```bash
   # Install PayPal CLI if needed
   npm install -g @paypal/paypal-cli
   
   # Listen for webhooks locally
   paypal webhook listen --forward-to http://localhost:54321/functions/v1/paypal-webhook
   ```

---

## 7. Production Deployment

### Pre-launch Checklist
- [ ] Switch to live client ID and secret
- [ ] Update webhook URL to production
- [ ] Verify bank account is connected
- [ ] Test real transaction
- [ ] Enable email notifications
- [ ] Add refund policy

### Go Live
1. Complete business verification
2. Link bank account for withdrawals
3. Switch API credentials from sandbox to live
4. Update environment variables
5. Test with small real transaction

---

## Environment Variables Summary

```bash
# PayPal
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_CLIENT_SECRET=xxxxx
PAYPAL_MODE=sandbox  # or 'live'
PAYPAL_WEBHOOK_ID=xxxxx
PAYPAL_BASIC_PLAN_ID=P-xxxxx
PAYPAL_PREMIUM_PLAN_ID=P-xxxxx
PAYPAL_VIP_PLAN_ID=P-xxxxx
```

---

## Support & Resources

- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [Subscriptions API](https://developer.paypal.com/docs/subscriptions/)
- [React PayPal JS](https://paypal.github.io/react-paypal-js/)
- [Webhooks Guide](https://developer.paypal.com/api/rest/webhooks/)

---

## Next Steps

1. ✅ Create PayPal business account
2. ✅ Get API credentials
3. ✅ Set up subscription plans
4. ✅ Integrate PayPal buttons
5. ✅ Configure webhooks
6. ⏭️ Test sandbox thoroughly
7. ⏭️ Go live with production credentials
