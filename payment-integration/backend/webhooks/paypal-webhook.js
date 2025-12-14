/**
 * PayPal Webhook Handler
 * Processes PayPal IPN (Instant Payment Notification) events
 */

import express from 'express';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

/**
 * Verify PayPal webhook signature
 */
async function verifyWebhookSignature(headers, body) {
  try {
    const accessToken = await getPayPalAccessToken();

    const response = await axios.post(
      `${PAYPAL_API}/v1/notifications/verify-webhook-signature`,
      {
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: body
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('Error verifying webhook:', error);
    return false;
  }
}

/**
 * Get PayPal OAuth access token
 */
async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_API_CLIENT_ID}:${process.env.PAYPAL_API_SECRET}`
  ).toString('base64');

  const response = await axios.post(
    `${PAYPAL_API}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data.access_token;
}

/**
 * POST /api/webhooks/paypal
 * Handles PayPal webhook events
 */
router.post('/paypal', express.json(), async (req, res) => {
  try {
    // Verify webhook signature
    if (process.env.NODE_ENV === 'production') {
      const isValid = await verifyWebhookSignature(req.headers, req.body);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const event = req.body;
    const eventType = event.event_type;

    console.log('PayPal webhook received:', eventType);

    // Handle different event types
    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.CREATED':
        await handleSubscriptionCreated(event);
        break;

      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(event);
        break;

      case 'BILLING.SUBSCRIPTION.UPDATED':
        await handleSubscriptionUpdated(event);
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(event);
        break;

      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handleSubscriptionSuspended(event);
        break;

      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await handleSubscriptionExpired(event);
        break;

      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(event);
        break;

      case 'PAYMENT.SALE.REFUNDED':
        await handlePaymentRefunded(event);
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Error handling PayPal webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

/**
 * Handle BILLING.SUBSCRIPTION.CREATED
 */
async function handleSubscriptionCreated(event) {
  const subscription = event.resource;
  const userId = subscription.custom_id;

  if (!userId) {
    console.error('No custom_id (user_id) in subscription');
    return;
  }

  console.log(`PayPal subscription created: ${subscription.id} for user ${userId}`);
}

/**
 * Handle BILLING.SUBSCRIPTION.ACTIVATED
 */
async function handleSubscriptionActivated(event) {
  const subscription = event.resource;
  const userId = subscription.custom_id;

  if (!userId) {
    console.error('No custom_id (user_id) in subscription');
    return;
  }

  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      provider: 'paypal',
      paypal_subscription_id: subscription.id,
      plan_type: subscription.plan_type || 'basic',
      status: 'active',
      created_at: new Date(subscription.create_time).toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('Error creating subscription record:', error);
    throw error;
  }

  console.log(`PayPal subscription activated: ${subscription.id}`);
}

/**
 * Handle BILLING.SUBSCRIPTION.UPDATED
 */
async function handleSubscriptionUpdated(event) {
  const subscription = event.resource;

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.status.toLowerCase(),
      updated_at: new Date().toISOString()
    })
    .eq('paypal_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
  }

  console.log(`PayPal subscription updated: ${subscription.id}`);
}

/**
 * Handle BILLING.SUBSCRIPTION.CANCELLED
 */
async function handleSubscriptionCancelled(event) {
  const subscription = event.resource;

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('paypal_subscription_id', subscription.id);

  if (error) {
    console.error('Error canceling subscription:', error);
  }

  console.log(`PayPal subscription canceled: ${subscription.id}`);
}

/**
 * Handle BILLING.SUBSCRIPTION.SUSPENDED
 */
async function handleSubscriptionSuspended(event) {
  const subscription = event.resource;

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'suspended',
      updated_at: new Date().toISOString()
    })
    .eq('paypal_subscription_id', subscription.id);

  if (error) {
    console.error('Error suspending subscription:', error);
  }

  console.log(`PayPal subscription suspended: ${subscription.id}`);
}

/**
 * Handle BILLING.SUBSCRIPTION.EXPIRED
 */
async function handleSubscriptionExpired(event) {
  const subscription = event.resource;

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'expired',
      updated_at: new Date().toISOString()
    })
    .eq('paypal_subscription_id', subscription.id);

  if (error) {
    console.error('Error expiring subscription:', error);
  }

  console.log(`PayPal subscription expired: ${subscription.id}`);
}

/**
 * Handle PAYMENT.SALE.COMPLETED
 */
async function handlePaymentCompleted(event) {
  const sale = event.resource;
  const subscriptionId = sale.billing_agreement_id;

  if (!subscriptionId) return;

  // Get user_id from subscription
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('paypal_subscription_id', subscriptionId)
    .single();

  if (!subscription) {
    console.error('Subscription not found:', subscriptionId);
    return;
  }

  // Log payment
  await supabase
    .from('payment_history')
    .insert({
      user_id: subscription.user_id,
      provider: 'paypal',
      transaction_id: sale.id,
      amount: parseFloat(sale.amount.total) * 100, // Convert to cents
      currency: sale.amount.currency,
      status: 'completed',
      created_at: new Date(sale.create_time).toISOString()
    });

  // Update last payment date
  await supabase
    .from('user_subscriptions')
    .update({
      last_payment_date: new Date(sale.create_time).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('paypal_subscription_id', subscriptionId);

  console.log(`PayPal payment completed: ${sale.id}`);
}

/**
 * Handle PAYMENT.SALE.REFUNDED
 */
async function handlePaymentRefunded(event) {
  const refund = event.resource;
  const saleId = refund.sale_id;

  // Update payment history
  await supabase
    .from('payment_history')
    .update({
      status: 'refunded',
      refunded_at: new Date().toISOString()
    })
    .eq('transaction_id', saleId);

  console.log(`PayPal payment refunded: ${refund.id}`);
}

export default router;
