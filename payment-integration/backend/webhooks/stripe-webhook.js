/**
 * Stripe Webhook Handler
 * Processes Stripe webhook events for subscription lifecycle
 */

import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2024-11-20.acacia',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * POST /api/webhooks/stripe
 * Handles all Stripe webhook events
 */
router.post('/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({received: true});

  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({error: 'Webhook handler failed'});
  }
});

/**
 * Handle checkout.session.completed
 * Fired when a customer completes the checkout process
 */
async function handleCheckoutSessionCompleted(session) {
  console.log('Checkout session completed:', session.id);

  const userId = session.metadata.user_id;
  const planType = session.metadata.plan_type;
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  if (!userId) {
    console.error('No user_id in session metadata');
    return;
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Create or update subscription record
  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      provider: 'stripe',
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan_type: planType,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('Error creating subscription record:', error);
    throw error;
  }

  // Log payment
  await supabase
    .from('payment_history')
    .insert({
      user_id: userId,
      provider: 'stripe',
      transaction_id: session.id,
      amount: session.amount_total,
      currency: session.currency,
      status: 'completed',
      created_at: new Date().toISOString()
    });

  console.log(`Subscription created for user ${userId}`);
}

/**
 * Handle customer.subscription.created
 * Fired when a new subscription is created
 */
async function handleSubscriptionCreated(subscription) {
  console.log('Subscription created:', subscription.id);

  const userId = subscription.metadata.user_id;
  
  if (!userId) {
    console.error('No user_id in subscription metadata');
    return;
  }

  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      provider: 'stripe',
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      plan_type: subscription.metadata.plan_type,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('Error updating subscription:', error);
  }
}

/**
 * Handle customer.subscription.updated
 * Fired when a subscription is updated (e.g., plan change)
 */
async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      canceled_at: subscription.canceled_at 
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
  }
}

/**
 * Handle customer.subscription.deleted
 * Fired when a subscription is canceled or expires
 */
async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error canceling subscription:', error);
  }
}

/**
 * Handle invoice.paid
 * Fired when an invoice payment succeeds
 */
async function handleInvoicePaid(invoice) {
  console.log('Invoice paid:', invoice.id);

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata.user_id;

  if (!userId) return;

  // Log successful payment
  await supabase
    .from('payment_history')
    .insert({
      user_id: userId,
      provider: 'stripe',
      transaction_id: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'completed',
      created_at: new Date().toISOString()
    });

  // Update subscription status
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'active',
      last_payment_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', invoice.subscription);
}

/**
 * Handle invoice.payment_failed
 * Fired when an invoice payment fails
 */
async function handleInvoicePaymentFailed(invoice) {
  console.log('Invoice payment failed:', invoice.id);

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata.user_id;

  if (!userId) return;

  // Log failed payment
  await supabase
    .from('payment_history')
    .insert({
      user_id: userId,
      provider: 'stripe',
      transaction_id: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      created_at: new Date().toISOString()
    });

  // Update subscription status
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', invoice.subscription);

  // TODO: Send notification email to user
}

export default router;
