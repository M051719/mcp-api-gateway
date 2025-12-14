/**
 * Stripe Payment Routes
 * Handles Stripe checkout sessions, subscriptions, and customer management
 */

import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2024-11-20.acacia',
});

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/stripe/config
 * Returns public Stripe configuration
 */
router.get('/config', (req, res) => {
  res.json({
    publicKey: process.env.VITE_STRIPE_PUBLIC_KEY,
    plans: {
      basic: {
        productId: process.env.STRIPE_BASIC_PRODUCT_ID,
        priceId: process.env.STRIPE_BASIC_PRICE_ID,
        price: 2900, // $29 in cents
        interval: 'month'
      },
      premium: {
        productId: process.env.STRIPE_PREMIUM_PRODUCT_ID,
        priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
        price: 4900, // $49 in cents
        interval: 'month'
      },
      vip: {
        productId: process.env.STRIPE_VIP_PRODUCT_ID,
        priceId: process.env.STRIPE_VIP_PRICE_ID,
        price: 9700, // $97 in cents
        interval: 'month'
      }
    }
  });
});

/**
 * POST /api/stripe/create-checkout-session
 * Creates a Stripe checkout session for subscription
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId, userId, userEmail, planType } = req.body;

    if (!priceId || !userId || !userEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: priceId, userId, userEmail' 
      });
    }

    // Create or get Stripe customer
    let customer;
    const { data: existingCustomer } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (existingCustomer?.stripe_customer_id) {
      customer = await stripe.customers.retrieve(existingCustomer.stripe_customer_id);
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabase_user_id: userId
        }
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.VITE_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL}/pricing?canceled=true`,
      metadata: {
        user_id: userId,
        plan_type: planType
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan_type: planType
        }
      }
    });

    res.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
});

/**
 * GET /api/stripe/session/:sessionId
 * Retrieves checkout session details
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId,
      {
        expand: ['subscription', 'customer']
      }
    );

    res.json({
      status: session.payment_status,
      customer_email: session.customer_details?.email,
      subscription: session.subscription
    });

  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

/**
 * POST /api/stripe/cancel-subscription
 * Cancels a user's subscription
 */
router.post('/cancel-subscription', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Get user's subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!subscription?.stripe_subscription_id) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Cancel in Stripe
    const canceledSubscription = await stripe.subscriptions.cancel(
      subscription.stripe_subscription_id
    );

    // Update in database (handled by webhook, but update immediately for UX)
    await supabase
      .from('user_subscriptions')
      .update({ 
        status: 'canceled',
        canceled_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.stripe_subscription_id);

    res.json({ 
      success: true,
      message: 'Subscription canceled successfully',
      subscription: canceledSubscription
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ 
      error: 'Failed to cancel subscription',
      message: error.message
    });
  }
});

/**
 * GET /api/stripe/subscription/:userId
 * Gets user's current subscription status
 */
router.get('/subscription/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!subscription) {
      return res.json({ subscription: null });
    }

    // Get live status from Stripe
    if (subscription.stripe_subscription_id) {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripe_subscription_id
      );

      res.json({
        subscription: {
          ...subscription,
          stripe_status: stripeSubscription.status,
          current_period_end: stripeSubscription.current_period_end,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end
        }
      });
    } else {
      res.json({ subscription });
    }

  } catch (error) {
    console.error('Error retrieving subscription:', error);
    res.status(500).json({ error: 'Failed to retrieve subscription' });
  }
});

/**
 * POST /api/stripe/create-portal-session
 * Creates a customer portal session for managing subscription
 */
router.post('/create-portal-session', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (!subscription?.stripe_customer_id) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.VITE_APP_URL}/profile`,
    });

    res.json({ url: portalSession.url });

  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

export default router;
