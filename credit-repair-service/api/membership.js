const express = require('express');
const router = express.Router();
const { MEMBERSHIP_TIERS } = require('../config/membership-tiers');

/**
 * Membership API Routes
 */

// Get all membership tiers
router.get('/tiers', (req, res) => {
  try {
    res.json({
      success: true,
      data: MEMBERSHIP_TIERS
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific tier information
router.get('/tiers/:tierId', (req, res) => {
  try {
    const { tierId } = req.params;
    const tier = MEMBERSHIP_TIERS[tierId.toUpperCase()];
    
    if (!tier) {
      return res.status(404).json({
        success: false,
        error: 'Membership tier not found'
      });
    }
    
    res.json({
      success: true,
      data: tier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check user's current membership
router.get('/current', async (req, res) => {
  try {
    // This would integrate with your authentication system
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Mock response - replace with actual database query
    const userMembership = {
      userId,
      tier: 'PREMIUM',
      status: 'active',
      startDate: '2025-01-01',
      renewalDate: '2025-02-01',
      features: MEMBERSHIP_TIERS.PREMIUM.features
    };
    
    res.json({
      success: true,
      data: userMembership
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Upgrade membership
router.post('/upgrade', async (req, res) => {
  try {
    const { targetTier, billingCycle } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const tier = MEMBERSHIP_TIERS[targetTier.toUpperCase()];
    
    if (!tier) {
      return res.status(400).json({
        success: false,
        error: 'Invalid membership tier'
      });
    }
    
    // Here you would:
    // 1. Process payment
    // 2. Update user's membership in database
    // 3. Send confirmation email
    
    res.json({
      success: true,
      message: `Successfully upgraded to ${tier.name}`,
      data: {
        tier: targetTier,
        billingCycle,
        amount: billingCycle === 'annual' ? tier.annualPrice : tier.price
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cancel membership
router.post('/cancel', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Process cancellation
    // Update database
    // Send confirmation
    
    res.json({
      success: true,
      message: 'Membership cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
