const express = require('express');
const router = express.Router();

/**
 * Property Lookup API Routes
 */

// Search properties
router.get('/search', async (req, res) => {
  try {
    const { query, type, status, minPrice, maxPrice, city, state, zip } = req.query;
    const userId = req.user?.id;
    const userTier = req.user?.tier || 'FREE';
    
    // Check usage limits based on tier
    const limits = {
      FREE: 10,
      PREMIUM: 100,
      ELITE: Infinity
    };
    
    // Mock property data - replace with actual database/API
    const properties = [
      {
        id: '1',
        address: '1234 Main Street',
        city: 'Phoenix',
        state: 'AZ',
        zip: '85001',
        type: 'Single Family',
        status: 'Pre-Foreclosure',
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1800,
        estimatedValue: 245000,
        arv: 285000,
        daysListed: 45,
        roi: 16.3
      },
      {
        id: '2',
        address: '5678 Oak Avenue',
        city: 'Scottsdale',
        state: 'AZ',
        zip: '85250',
        type: 'Single Family',
        status: 'Auction',
        bedrooms: 4,
        bathrooms: 3,
        sqft: 2400,
        estimatedValue: 385000,
        startingBid: 385000,
        arv: 450000,
        auctionDate: '2025-12-15',
        roi: 17.2
      }
    ];
    
    res.json({
      success: true,
      data: {
        properties,
        count: properties.length,
        userLimit: limits[userTier],
        remainingSearches: limits[userTier] - 5 // Mock remaining
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get property details
router.get('/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userTier = req.user?.tier || 'FREE';
    
    // Mock detailed property data
    const property = {
      id: propertyId,
      address: '1234 Main Street',
      city: 'Phoenix',
      state: 'AZ',
      zip: '85001',
      type: 'Single Family',
      status: 'Pre-Foreclosure',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1800,
      yearBuilt: 1995,
      lotSize: 7200,
      estimatedValue: 245000,
      arv: 285000,
      taxAssessedValue: 230000,
      owner: {
        name: 'John Doe',
        ownershipYears: 10
      },
      mortgage: {
        balance: 180000,
        lender: 'ABC Bank'
      },
      coordinates: {
        lat: 33.4484,
        lng: -112.0740
      }
    };
    
    // Include comps only for Premium and Elite
    if (userTier !== 'FREE') {
      property.comparables = [
        {
          address: '1240 Main Street',
          soldPrice: 250000,
          soldDate: '2025-10-15',
          sqft: 1750,
          similarity: 92
        },
        {
          address: '1300 Main Street',
          soldPrice: 248000,
          soldDate: '2025-09-20',
          sqft: 1820,
          similarity: 88
        }
      ];
    }
    
    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get property comps
router.get('/:propertyId/comps', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userTier = req.user?.tier || 'FREE';
    
    if (userTier === 'FREE') {
      return res.status(403).json({
        success: false,
        error: 'Premium or Elite membership required for property comps',
        upgradeUrl: '/pricing'
      });
    }
    
    const compLimit = userTier === 'PREMIUM' ? 5 : Infinity;
    
    const comps = [
      {
        address: '1240 Main Street',
        soldPrice: 250000,
        soldDate: '2025-10-15',
        sqft: 1750,
        beds: 3,
        baths: 2,
        similarity: 92,
        pricePerSqft: 143
      },
      {
        address: '1300 Main Street',
        soldPrice: 248000,
        soldDate: '2025-09-20',
        sqft: 1820,
        beds: 3,
        baths: 2,
        similarity: 88,
        pricePerSqft: 136
      }
    ];
    
    res.json({
      success: true,
      data: {
        comps: comps.slice(0, compLimit),
        limit: compLimit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Run deal analysis
router.post('/:propertyId/analyze', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { purchasePrice, repairCosts, holdingMonths } = req.body;
    const userTier = req.user?.tier || 'FREE';
    
    if (userTier === 'FREE') {
      return res.status(403).json({
        success: false,
        error: 'Premium or Elite membership required for deal analysis',
        upgradeUrl: '/pricing'
      });
    }
    
    // Calculate deal metrics
    const arv = 285000;
    const totalInvestment = purchasePrice + repairCosts;
    const profit = arv - totalInvestment;
    const roi = (profit / totalInvestment) * 100;
    
    const analysis = {
      propertyId,
      inputs: {
        purchasePrice,
        repairCosts,
        holdingMonths
      },
      calculations: {
        arv,
        totalInvestment,
        estimatedProfit: profit,
        roi: roi.toFixed(2),
        cashFlow: userTier === 'ELITE' ? 1200 : null, // Elite only
        capRate: userTier === 'ELITE' ? 7.5 : null
      },
      recommendation: roi > 15 ? 'Strong Buy' : roi > 10 ? 'Consider' : 'Pass'
    };
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
