/**
 * Main Server Entry Point
 * Credit Repair & Pre-Foreclosure Service
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import API routes
const membershipRoutes = require('./api/membership');
const propertyLookupRoutes = require('./api/property-lookup');
const creditRepairRoutes = require('./api/credit-repair');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/components', express.static(path.join(__dirname, 'components')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// API Routes
app.use('/api/membership', membershipRoutes);
app.use('/api/property', propertyLookupRoutes);
app.use('/api/credit-repair', creditRepairRoutes);

// Page Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'landing', 'main-landing.html'));
});

app.get('/services/credit-repair', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'services', 'credit-repair.html'));
});

app.get('/services/property-lookup', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'services', 'property-lookup.html'));
});

app.get('/pricing', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'landing', 'main-landing.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'credit-repair-service',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  Credit Repair & Pre-Foreclosure Service Platform        ║
║  Server running on port ${PORT}                             ║
║  Environment: ${process.env.NODE_ENV || 'development'}                            ║
║                                                           ║
║  Main Landing:    http://localhost:${PORT}/                  ║
║  Credit Repair:   http://localhost:${PORT}/services/credit-repair  ║
║  Property Lookup: http://localhost:${PORT}/services/property-lookup║
║  API Health:      http://localhost:${PORT}/health            ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
