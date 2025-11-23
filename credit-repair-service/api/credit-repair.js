const express = require('express');
const router = express.Router();

/**
 * Credit Repair API Routes
 */

// Get credit reports
router.get('/reports', async (req, res) => {
  try {
    const userId = req.user?.id;
    const userTier = req.user?.tier || 'FREE';
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Mock credit report data
    const reports = {
      experian: {
        score: 680,
        lastUpdated: '2025-11-15',
        accounts: 12,
        negativeItems: 3
      },
      transunion: userTier !== 'FREE' ? {
        score: 675,
        lastUpdated: '2025-11-14',
        accounts: 12,
        negativeItems: 4
      } : null,
      equifax: userTier !== 'FREE' ? {
        score: 682,
        lastUpdated: '2025-11-15',
        accounts: 12,
        negativeItems: 3
      } : null
    };
    
    res.json({
      success: true,
      data: reports,
      message: userTier === 'FREE' ? 'Upgrade for all 3 bureau reports' : null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get active disputes
router.get('/disputes', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Mock dispute data
    const disputes = [
      {
        id: 'disp_001',
        type: 'Late Payment',
        creditor: 'ABC Bank',
        account: '****1234',
        status: 'Pending',
        submittedDate: '2025-11-01',
        expectedResolution: '2025-12-01'
      },
      {
        id: 'disp_002',
        type: 'Collection',
        creditor: 'XYZ Collections',
        account: '****5678',
        status: 'In Review',
        submittedDate: '2025-10-15',
        expectedResolution: '2025-11-15'
      },
      {
        id: 'disp_003',
        type: 'Hard Inquiry',
        creditor: 'DEF Credit',
        account: 'N/A',
        status: 'Resolved',
        submittedDate: '2025-10-01',
        resolution: 'Removed',
        resolvedDate: '2025-11-10'
      }
    ];
    
    res.json({
      success: true,
      data: disputes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new dispute
router.post('/disputes', async (req, res) => {
  try {
    const userId = req.user?.id;
    const userTier = req.user?.tier || 'FREE';
    const { type, creditor, accountNumber, reason, description } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Check dispute limits for Free tier
    if (userTier === 'FREE') {
      // Free users might have limits on number of active disputes
      const activeDisputes = 2; // Mock count
      if (activeDisputes >= 3) {
        return res.status(403).json({
          success: false,
          error: 'Free tier limited to 3 active disputes. Upgrade for unlimited.',
          upgradeUrl: '/pricing'
        });
      }
    }
    
    // Create dispute
    const dispute = {
      id: `disp_${Date.now()}`,
      userId,
      type,
      creditor,
      accountNumber,
      reason,
      description,
      status: 'Pending',
      submittedDate: new Date().toISOString().split('T')[0],
      expectedResolution: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    // In production: Save to database, generate dispute letters, notify user
    
    res.json({
      success: true,
      message: 'Dispute submitted successfully',
      data: dispute
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get dispute letters
router.get('/disputes/:disputeId/letters', async (req, res) => {
  try {
    const { disputeId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Generate dispute letter
    const letter = {
      disputeId,
      creditorLetter: `[Your Name]\n[Your Address]\n\nDate: ${new Date().toLocaleDateString()}\n\n[Creditor Name]\n[Creditor Address]\n\nRe: Dispute of Late Payment on Account ****1234\n\nDear Sir/Madam,\n\nI am writing to dispute a late payment reported on my credit report...`,
      bureauLetters: {
        experian: 'Letter to Experian...',
        transunion: 'Letter to TransUnion...',
        equifax: 'Letter to Equifax...'
      }
    };
    
    res.json({
      success: true,
      data: letter
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get credit building tips
router.get('/tips', async (req, res) => {
  try {
    const tips = [
      {
        id: 1,
        title: 'Pay Bills On Time',
        description: 'Payment history is 35% of your credit score. Set up autopay to never miss a payment.',
        impact: 'High',
        category: 'Payment History'
      },
      {
        id: 2,
        title: 'Keep Credit Utilization Below 30%',
        description: 'Use less than 30% of your available credit. Lower is better.',
        impact: 'High',
        category: 'Credit Utilization'
      },
      {
        id: 3,
        title: 'Don\'t Close Old Accounts',
        description: 'Length of credit history matters. Keep old accounts open even if not in use.',
        impact: 'Medium',
        category: 'Credit Age'
      }
    ];
    
    res.json({
      success: true,
      data: tips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Track credit score progress
router.get('/progress', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Mock progress data
    const progress = {
      current: 680,
      history: [
        { date: '2025-07-01', score: 580 },
        { date: '2025-08-01', score: 610 },
        { date: '2025-09-01', score: 635 },
        { date: '2025-10-01', score: 655 },
        { date: '2025-11-01', score: 680 }
      ],
      improvement: 100,
      improvementPercentage: 17.2,
      goal: 720,
      estimatedTimeToGoal: '3 months'
    };
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
