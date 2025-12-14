# Stripe Payment Integration Guide - RepMotivatedSeller

## Overview
Complete guide to integrating Stripe payments for memberships, consultations, and property services on RepMotivatedSeller.

## Table of Contents
1. [Stripe Account Setup](#stripe-account-setup)
2. [API Configuration](#api-configuration)
3. [Webhook Setup](#webhook-setup)
4. [Integration Code](#integration-code)
5. [Testing](#testing)
6. [Production Deployment](#production-deployment)

---

## 1. Stripe Account Setup

### Create Stripe Account
1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up with your business email
3. Complete business verification:
   - Business type: LLC/Sole Proprietor
   - Business name: RepMotivatedSeller
   - Tax ID/EIN
   - Bank account for payouts

### Enable Payment Methods
1. In Stripe Dashboard → Settings → Payment Methods
2. Enable:
   - ✅ Cards (Visa, Mastercard, Amex, Discover)
   - ✅ Apple Pay
   - ✅ Google Pay
   - ✅ ACH Direct Debit (for larger payments)

### Get API Keys
1. Dashboard → Developers → API keys
2. Copy these keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

---

## 2. API Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_51QrVNcH2rnPeJ1234567890abcdefghijklmnopqrstuvwxyz
STRIPE_SECRET_KEY=sk_test_51QrVNcH2rnPeJ1234567890abcdefghijklmnopqrstuvwxyz
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz

# For production
# STRIPE_PUBLISHABLE_KEY=pk_live_...
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

### Install Stripe SDK

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js stripe
```

**Or with yarn:**
```bash
yarn add @stripe/stripe-js @stripe/react-stripe-js stripe
```

---

## 3. Webhook Setup

### Create Webhook Endpoint

1. **In Stripe Dashboard:**
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://repmotivatedseller.org/api/webhooks/stripe`
   - Events to listen for:
     ```
     checkout.session.completed
     customer.subscription.created
     customer.subscription.updated
     customer.subscription.deleted
     invoice.payment_succeeded
     invoice.payment_failed
     payment_intent.succeeded
     payment_intent.payment_failed
     ```

2. **Get Webhook Secret:**
   - After creating, copy the signing secret (starts with `whsec_`)
   - Add to `.env` as `STRIPE_WEBHOOK_SECRET`

### Webhook Handler Code

Create `supabase/functions/stripe-webhook/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    console.log(`🔔 Webhook received: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object)
        break
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object)
        break
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('❌ Webhook error:', err.message)
    return new Response(`Webhook Error: ${err.message}`, {
      status: 400,
    })
  }
})

async function handleCheckoutCompleted(session: any) {
  const { customer, subscription, metadata } = session
  
  // Update user's membership in database
  const { error } = await supabase
    .from('profiles')
    .update({
      stripe_customer_id: customer,
      stripe_subscription_id: subscription,
      membership_tier: metadata.tier || 'premium',
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', metadata.user_id)

  if (error) {
    console.error('Error updating profile:', error)
  } else {
    console.log(`✅ Updated membership for user ${metadata.user_id}`)
  }
}

async function handleSubscriptionUpdate(subscription: any) {
  const customerId = subscription.customer
  
  // Find user by stripe customer ID
  const { data: user } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (user) {
    await supabase
      .from('profiles')
      .update({
        subscription_status: subscription.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  const customerId = subscription.customer
  
  const { data: user } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (user) {
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'canceled',
        membership_tier: 'free',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  // Log successful payment
  await supabase.from('payment_logs').insert({
    stripe_invoice_id: invoice.id,
    amount: invoice.amount_paid,
    status: 'succeeded',
    created_at: new Date().toISOString(),
  })
}

async function handleInvoicePaymentFailed(invoice: any) {
  // Send notification to user about failed payment
  console.log(`⚠️ Payment failed for invoice ${invoice.id}`)
  
  await supabase.from('payment_logs').insert({
    stripe_invoice_id: invoice.id,
    amount: invoice.amount_due,
    status: 'failed',
    created_at: new Date().toISOString(),
  })
}
```

---

## 4. Integration Code

### Create Products in Stripe

Use Stripe CLI or Dashboard to create products:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

stripe login

# Create products
stripe products create \
  --name="Basic Membership" \
  --description="Access to educational content and community"

stripe prices create \
  --product=prod_xxxxx \
  --unit-amount=2900 \
  --currency=usd \
  --recurring[interval]=month

# Repeat for Premium and VIP tiers
```

### Frontend: Stripe Payment Component

Create `src/components/payments/StripeCheckout.tsx`:

```tsx
import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { supabase } from '../../lib/supabase'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

interface CheckoutFormProps {
  planId: 'basic' | 'premium' | 'vip'
  onSuccess: () => void
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ planId, onSuccess }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const plans = {
    basic: { price: 29, priceId: 'price_xxxxx' },
    premium: { price: 49, priceId: 'price_xxxxx' },
    vip: { price: 97, priceId: 'price_xxxxx' }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create checkout session
      const { data, error: sessionError } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            priceId: plans[planId].priceId,
            userId: user.id,
            tier: planId
          }
        }
      )

      if (sessionError) throw sessionError

      // Redirect to Stripe Checkout
      const { error: redirectError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      })

      if (redirectError) throw redirectError

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : `Subscribe for $${plans[planId].price}/month`}
      </button>

      <div className="text-center text-sm text-gray-500">
        <p>🔒 Secure payment powered by Stripe</p>
        <p>Cancel anytime • 30-day money-back guarantee</p>
      </div>
    </form>
  )
}

export const StripeCheckout: React.FC<CheckoutFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  )
}

export default StripeCheckout
```

### Backend: Create Checkout Session

Create `supabase/functions/create-checkout-session/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  try {
    const { priceId, userId, tier } = await req.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/pricing`,
      metadata: {
        user_id: userId,
        tier: tier,
      },
    })

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

---

## 5. Testing

### Test Mode
1. Use test API keys (pk_test_... and sk_test_...)
2. Test card numbers:
   - Success: `4242 4242 4242 4242`
   - Requires auth: `4000 0025 0000 3155`
   - Declined: `4000 0000 0000 9995`
   - Any future expiry date
   - Any 3-digit CVC

### Test Webhooks Locally
```bash
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

stripe trigger checkout.session.completed
```

---

## 6. Production Deployment

### Pre-launch Checklist
- [ ] Switch to live API keys
- [ ] Update webhook URL to production domain
- [ ] Enable live mode in Stripe Dashboard
- [ ] Test real payment flow
- [ ] Set up email notifications
- [ ] Configure billing portal
- [ ] Add terms of service links

### Go Live
1. Dashboard → Get started → Activate account
2. Complete business verification
3. Add bank account
4. Submit for review
5. Once approved, switch keys in production

### Monitoring
- Set up Stripe Dashboard notifications
- Monitor failed payments
- Track subscription metrics
- Review dispute/chargeback alerts

---

## Membership Tiers

| Tier | Price | Stripe Product ID | Features |
|------|-------|-------------------|----------|
| Basic | $29/mo | `prod_basic` | Educational content, webinars, email support |
| Premium | $49/mo | `prod_premium` | + 2 consultations/month, priority support |
| VIP | $97/mo | `prod_vip` | + Unlimited consultations, white-glove service |

---

## Support & Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Elements](https://stripe.com/docs/stripe-js/react)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing](https://stripe.com/docs/testing)

---

## Next Steps

1. ✅ Set up Stripe account
2. ✅ Get API keys
3. ✅ Configure webhooks
4. ✅ Integrate frontend
5. ⏭️ Add PayPal as alternative
6. ⏭️ Set up Calendly for consultations
