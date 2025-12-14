// Backend API endpoint for PayPal integration
// This should be integrated into your Express/Node.js backend

import axios from 'axios';

const PAYPAL_API = process.env.PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

/**
 * Get PayPal OAuth access token
 */
async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_API_CLIENT_ID}:${process.env.PAYPAL_API_SECRET}`
  ).toString('base64');

  try {
    const response = await axios.post(
      `${PAYPAL_API}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('PayPal OAuth error:', error.response?.data || error.message);
    throw new Error('Failed to get PayPal access token');
  }
}

/**
 * Save PayPal subscription to database
 * POST /api/paypal-subscription
 */
export async function savePayPalSubscription(req, res) {
  try {
    const { subscriptionId, userId, email, planName, planId } = req.body;

    // Get subscription details from PayPal
    const accessToken = await getPayPalAccessToken();
    const response = await axios.get(
      `${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const subscription = response.data;

    // Save to your database
    // await saveSubscriptionToDatabase({
    //   userId,
    //   subscriptionId: subscription.id,
    //   planId,
    //   planName,
    //   status: subscription.status,
    //   email,
    //   provider: 'paypal',
    //   subscriberInfo: subscription.subscriber,
    //   billingInfo: subscription.billing_info,
    // });

    console.log('PayPal subscription saved:', {
      id: subscription.id,
      status: subscription.status,
      planId,
      userId,
    });

    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        planId,
      },
    });
  } catch (error) {
    console.error('PayPal subscription save error:', error.response?.data || error.message);
    res.status(400).json({ error: error.message });
  }
}

/**
 * Handle PayPal webhooks
 * POST /api/paypal-webhook
 */
export async function handlePayPalWebhook(req, res) {
  try {
    const webhookEvent = req.body;
    
    // Verify webhook signature
    const accessToken = await getPayPalAccessToken();
    const verifyResponse = await axios.post(
      `${PAYPAL_API}/v1/notifications/verify-webhook-signature`,
      {
        auth_algo: req.headers['paypal-auth-algo'],
        cert_url: req.headers['paypal-cert-url'],
        transmission_id: req.headers['paypal-transmission-id'],
        transmission_sig: req.headers['paypal-transmission-sig'],
        transmission_time: req.headers['paypal-transmission-time'],
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: webhookEvent,
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (verifyResponse.data.verification_status !== 'SUCCESS') {
      return res.status(400).json({ error: 'Webhook verification failed' });
    }

    // Handle different event types
    switch (webhookEvent.event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED':
        console.log('Subscription created:', webhookEvent.resource.id);
        // Update database
        break;

      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        console.log('Subscription activated:', webhookEvent.resource.id);
        // Update database, grant access
        break;

      case 'BILLING.SUBSCRIPTION.UPDATED':
        console.log('Subscription updated:', webhookEvent.resource.id);
        // Update database
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        console.log('Subscription cancelled:', webhookEvent.resource.id);
        // Update database, revoke access
        break;

      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        console.log('Subscription suspended:', webhookEvent.resource.id);
        // Update database, suspend access
        break;

      case 'PAYMENT.SALE.COMPLETED':
        console.log('Payment completed:', webhookEvent.resource.id);
        // Update database, send confirmation
        break;

      case 'PAYMENT.SALE.REFUNDED':
        console.log('Payment refunded:', webhookEvent.resource.id);
        // Update database, send notification
        break;

      default:
        console.log(`Unhandled webhook event: ${webhookEvent.event_type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error.response?.data || error.message);
    res.status(400).json({ error: error.message });
  }
}

/**
 * Cancel PayPal subscription
 * POST /api/cancel-paypal-subscription
 */
export async function cancelPayPalSubscription(req, res) {
  try {
    const { subscriptionId, reason } = req.body;

    const accessToken = await getPayPalAccessToken();
    
    await axios.post(
      `${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}/cancel`,
      {
        reason: reason || 'Customer requested cancellation',
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Update database
    // await updateSubscriptionInDatabase(subscriptionId, {
    //   status: 'cancelled',
    //   cancelledAt: new Date(),
    // });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error) {
    console.error('PayPal cancellation error:', error.response?.data || error.message);
    res.status(400).json({ error: error.message });
  }
}

/**
 * Get subscription details
 * GET /api/paypal-subscription/:subscriptionId
 */
export async function getPayPalSubscription(req, res) {
  try {
    const { subscriptionId } = req.params;

    const accessToken = await getPayPalAccessToken();
    
    const response = await axios.get(
      `${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('PayPal get subscription error:', error.response?.data || error.message);
    res.status(400).json({ error: error.message });
  }
}

/**
 * Suspend subscription (for failed payments)
 * POST /api/suspend-paypal-subscription
 */
export async function suspendPayPalSubscription(req, res) {
  try {
    const { subscriptionId, reason } = req.body;

    const accessToken = await getPayPalAccessToken();
    
    await axios.post(
      `${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}/suspend`,
      {
        reason: reason || 'Payment failed',
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      success: true,
      message: 'Subscription suspended',
    });
  } catch (error) {
    console.error('PayPal suspend error:', error.response?.data || error.message);
    res.status(400).json({ error: error.message });
  }
}
