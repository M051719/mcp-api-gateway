/**
 * PayPal Payment Routes
 * Handles PayPal subscriptions and customer management
 */

import express from 'express';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// PayPal API base URL
const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

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
 * GET /api/paypal/config
 * Returns public PayPal configuration
 */
router.get('/config', (req, res) => {
  res.json({
    clientId: process.env.VITE_PAYPAL_CLIENT_ID,
    mode: process.env.PAYPAL_MODE || 'sandbox',
    plans: {
      basic: {
        planId: process.env.PAYPAL_BASIC_PLAN_ID,
        price: 29,
        interval: 'month'
      },
      premium: {
        planId: process.env.PAYPAL_PREMIUM_PLAN_ID,
        price: 49,
        interval: 'month'
      },
      vip: {
        planId: process.env.PAYPAL_VIP_PLAN_ID,
        price: 97,
        interval: 'month'
      }
    }
  });
});

/**
 * POST /api/paypal/create-subscription
 * Creates a PayPal subscription
 */
router.post('/create-subscription', async (req, res) => {
  try {
    const { planId, userId, userEmail, planType } = req.body;

    if (!planId || !userId || !userEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: planId, userId, userEmail' 
      });
    }

    const accessToken = await getPayPalAccessToken();

    const subscription = await axios.post(
      `${PAYPAL_API}/v1/billing/subscriptions`,
      {
        plan_id: planId,
        subscriber: {
          email_address: userEmail
        },
        application_context: {
          brand_name: 'RepMotivatedSeller',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
          },
          return_url: `${process.env.VITE_APP_URL}/payment/success?provider=paypal`,
          cancel_url: `${process.env.VITE_APP_URL}/pricing?canceled=true`
        },
        custom_id: userId,
        plan_type: planType
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Prefer': 'return=representation'
        }
      }
    );

    const approvalLink = subscription.data.links.find(
      link => link.rel === 'approve'
    );

    res.json({
      subscriptionId: subscription.data.id,
      approvalUrl: approvalLink.href
    });

  } catch (error) {
    console.error('Error creating PayPal subscription:', error.response?.data || error);
    res.status(500).json({ 
      error: 'Failed to create PayPal subscription',
      message: error.response?.data?.message || error.message
    });
  }
});

/**
 * GET /api/paypal/subscription/:subscriptionId
 * Gets PayPal subscription details
 */
router.get('/subscription/:subscriptionId', async (req, res) => {
  try {
    const accessToken = await getPayPalAccessToken();

    const response = await axios.get(
      `${PAYPAL_API}/v1/billing/subscriptions/${req.params.subscriptionId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    console.error('Error retrieving PayPal subscription:', error);
    res.status(500).json({ error: 'Failed to retrieve subscription' });
  }
});

/**
 * POST /api/paypal/cancel-subscription
 * Cancels a PayPal subscription
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
      .select('paypal_subscription_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!subscription?.paypal_subscription_id) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const accessToken = await getPayPalAccessToken();

    // Cancel in PayPal
    await axios.post(
      `${PAYPAL_API}/v1/billing/subscriptions/${subscription.paypal_subscription_id}/cancel`,
      {
        reason: 'User requested cancellation'
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update in database
    await supabase
      .from('user_subscriptions')
      .update({ 
        status: 'canceled',
        canceled_at: new Date().toISOString()
      })
      .eq('paypal_subscription_id', subscription.paypal_subscription_id);

    res.json({ 
      success: true,
      message: 'Subscription canceled successfully'
    });

  } catch (error) {
    console.error('Error canceling PayPal subscription:', error);
    res.status(500).json({ 
      error: 'Failed to cancel subscription',
      message: error.response?.data?.message || error.message
    });
  }
});

/**
 * POST /api/paypal/activate-subscription
 * Activates a subscription after user approval
 */
router.post('/activate-subscription', async (req, res) => {
  try {
    const { subscriptionId, userId, planType } = req.body;

    if (!subscriptionId || !userId) {
      return res.status(400).json({ error: 'Missing subscriptionId or userId' });
    }

    const accessToken = await getPayPalAccessToken();

    // Get subscription details from PayPal
    const response = await axios.get(
      `${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const subscription = response.data;

    // Store in database
    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        provider: 'paypal',
        paypal_subscription_id: subscriptionId,
        plan_type: planType,
        status: subscription.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;

    res.json({ 
      success: true,
      subscription 
    });

  } catch (error) {
    console.error('Error activating subscription:', error);
    res.status(500).json({ 
      error: 'Failed to activate subscription',
      message: error.response?.data?.message || error.message
    });
  }
});

export default router;
