// Express server routes for payment integration
// Add these routes to your main server file (e.g., index.js)

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
  getPayPalSubscription,
  suspendPayPalSubscription
} from './components/api/paypal.js';

const router = express.Router();

// ============================================
// STRIPE ROUTES
// ============================================

/**
 * Create Stripe payment intent
 * POST /api/create-payment-intent
 * Body: { priceId, userId, email }
 */
router.post('/create-payment-intent', express.json(), createPaymentIntent);

/**
 * Create Stripe subscription
 * POST /api/create-subscription
 * Body: { priceId, userId, email, planName }
 */
router.post('/create-subscription', express.json(), createSubscription);

/**
 * Stripe webhook endpoint
 * POST /api/stripe-webhook
 * Note: Use raw body parser for webhook signature verification
 */
router.post('/stripe-webhook', 
  express.raw({ type: 'application/json' }), 
  handleStripeWebhook
);

/**
 * Cancel Stripe subscription
 * POST /api/cancel-subscription
 * Body: { subscriptionId }
 */
router.post('/cancel-subscription', express.json(), cancelSubscription);

/**
 * Create customer portal session
 * POST /api/customer-portal
 * Body: { customerId }
 */
router.post('/customer-portal', express.json(), createCustomerPortalSession);

// ============================================
// PAYPAL ROUTES
// ============================================

/**
 * Save PayPal subscription
 * POST /api/paypal-subscription
 * Body: { subscriptionId, userId, email, planName, planId }
 */
router.post('/paypal-subscription', express.json(), savePayPalSubscription);

/**
 * PayPal webhook endpoint
 * POST /api/paypal-webhook
 */
router.post('/paypal-webhook', express.json(), handlePayPalWebhook);

/**
 * Cancel PayPal subscription
 * POST /api/cancel-paypal-subscription
 * Body: { subscriptionId, reason }
 */
router.post('/cancel-paypal-subscription', express.json(), cancelPayPalSubscription);

/**
 * Get PayPal subscription details
 * GET /api/paypal-subscription/:subscriptionId
 */
router.get('/paypal-subscription/:subscriptionId', getPayPalSubscription);

/**
 * Suspend PayPal subscription
 * POST /api/suspend-paypal-subscription
 * Body: { subscriptionId, reason }
 */
router.post('/suspend-paypal-subscription', express.json(), suspendPayPalSubscription);

// ============================================
// HEALTH CHECK
// ============================================

/**
 * API health check
 * GET /api/health
 */
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      stripe: !!process.env.STRIPE_API_KEY,
      paypal: !!process.env.PAYPAL_API_CLIENT_ID
    }
  });
});

export default router;

// ============================================
// EXAMPLE SERVER SETUP
// ============================================

/*
// In your main server file (e.g., index.js):

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentRoutes from './routes/payment.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser - JSON for most routes
app.use(express.json());

// Mount payment routes
app.use('/api', paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`Stripe configured: ${!!process.env.STRIPE_API_KEY}`);
  console.log(`PayPal configured: ${!!process.env.PAYPAL_API_CLIENT_ID}`);
});
*/
