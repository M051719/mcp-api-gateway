// Simple Express server for payment processing
// server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentRoutes from './routes/payment.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser - JSON for most routes
// Note: Stripe webhooks require raw body, handled in routes
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe-webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'RepMotivatedSeller Payment API',
    version: '1.0.0',
    status: 'online'
  });
});

// Mount payment routes
app.use('/api', paymentRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// SERVER STARTUP
// ============================================

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 RepMotivatedSeller Payment Server');
  console.log('========================================');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || 'Not configured'}`);
  console.log(`💳 Stripe: ${process.env.STRIPE_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`💰 PayPal: ${process.env.PAYPAL_API_CLIENT_ID ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`🔧 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log('========================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
