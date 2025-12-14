// Backend API endpoint for Stripe integration
// This should be integrated into your Express/Node.js backend

import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_API_KEY);

/**
 * Create a payment intent for subscription
 * POST /api/create-payment-intent
 */
export async function createPaymentIntent(req, res) {
  try {
    const { priceId, userId, email } = req.body;

    // Create a customer if not exists
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(400).json({ error: error.message });
  }
}

/**
 * Create a subscription
 * POST /api/create-subscription
 */
export async function createSubscription(req, res) {
  try {
    const { priceId, userId, email, planName } = req.body;

    // Check if customer already exists
    let customer;
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
          planName,
        },
      });
    }

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId,
        planName,
      },
    });

    // Save subscription to your database
    // await saveSubscriptionToDatabase({
    //   userId,
    //   subscriptionId: subscription.id,
    //   customerId: customer.id,
    //   planName,
    //   status: subscription.status,
    // });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    console.error('Stripe subscription error:', error);
    res.status(400).json({ error: error.message });
  }
}

/**
 * Handle Stripe webhooks
 * POST /api/stripe-webhook
 */
export async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
      const subscriptionCreated = event.data.object;
      console.log('Subscription created:', subscriptionCreated.id);
      // Update database
      break;

    case 'customer.subscription.updated':
      const subscriptionUpdated = event.data.object;
      console.log('Subscription updated:', subscriptionUpdated.id);
      // Update database
      break;

    case 'customer.subscription.deleted':
      const subscriptionDeleted = event.data.object;
      console.log('Subscription cancelled:', subscriptionDeleted.id);
      // Update database
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log('Payment succeeded:', invoice.id);
      // Update database, send confirmation email
      break;

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log('Payment failed:', failedInvoice.id);
      // Update database, send payment failure email
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}

/**
 * Cancel a subscription
 * POST /api/cancel-subscription
 */
export async function cancelSubscription(req, res) {
  try {
    const { subscriptionId } = req.body;

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update database
    // await updateSubscriptionInDatabase(subscriptionId, {
    //   cancelAtPeriodEnd: true,
    // });

    res.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error('Stripe cancellation error:', error);
    res.status(400).json({ error: error.message });
  }
}

/**
 * Get customer portal session
 * POST /api/customer-portal
 */
export async function createCustomerPortalSession(req, res) {
  try {
    const { customerId } = req.body;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/account`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Customer portal error:', error);
    res.status(400).json({ error: error.message });
  }
}
