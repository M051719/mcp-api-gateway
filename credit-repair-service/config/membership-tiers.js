/**
 * Membership Tiers Configuration
 * Credit Repair & Pre-Foreclosure Services
 */

const MEMBERSHIP_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free Tier',
    displayName: 'Basic',
    price: 0,
    billingPeriod: null,
    features: {
      // Property Services
      propertyLookup: {
        enabled: true,
        type: 'basic',
        description: 'Basic general property look-up',
        limits: {
          monthly: 10,
          daily: 3
        }
      },
      maps: {
        enabled: true,
        type: 'basic',
        description: 'Basic property mapping'
      },
      
      // Credit Services
      creditRepair: {
        enabled: true,
        type: 'basic',
        description: 'Access to credit repair features',
        features: [
          'Credit score monitoring',
          'Basic dispute letters',
          'Educational resources'
        ]
      },
      creditBuilder: {
        enabled: true,
        type: 'basic',
        description: 'Access to credit builder services',
        features: [
          'Credit building tips',
          'Payment tracking',
          'Goal setting'
        ]
      },
      
      // Knowledge Base & AI
      knowledgeBase: {
        enabled: true,
        type: 'basic',
        description: 'Basic knowledge base access',
        categories: [
          'Pre-foreclosure basics',
          'Credit repair fundamentals',
          'Real estate investing 101'
        ]
      },
      aiAssistance: {
        enabled: true,
        type: 'basic',
        description: 'Basic AI reference data',
        limits: {
          monthly: 20,
          tokensPerQuery: 500
        }
      },
      
      // Education
      videoEducation: {
        enabled: true,
        type: 'youtube',
        description: 'YouTube video education library',
        access: 'public-playlist'
      },
      
      // Support
      support: {
        email: false,
        phone: false,
        chat: false,
        ticketSystem: true,
        responseTime: '72 hours'
      }
    },
    landingPage: '/landing/free-tier',
    ctaText: 'Get Started Free',
    highlights: [
      'No credit card required',
      'Basic property lookup',
      'Credit repair tools',
      'Educational videos',
      'Community access'
    ]
  },

  PREMIUM: {
    id: 'premium',
    name: 'Premium Tier',
    displayName: 'Professional',
    price: 97,
    billingPeriod: 'monthly',
    annualPrice: 970,
    annualSavings: 194,
    features: {
      // All Free Tier Features
      ...{}, // Inherited from FREE
      
      // Enhanced Property Services
      propertyLookup: {
        enabled: true,
        type: 'advanced',
        description: 'Advanced property information & analytics',
        limits: {
          monthly: 100,
          daily: 10
        }
      },
      propertyComps: {
        enabled: true,
        type: 'basic',
        description: 'Basic comparable property analysis',
        features: [
          'Up to 5 comps per property',
          'Basic market analysis',
          'Price trend data'
        ]
      },
      buyHoldCalculator: {
        enabled: true,
        type: 'basic',
        description: 'Quick buy or hold calculator',
        features: [
          'ROI calculations',
          'Cash flow analysis',
          'Basic property metrics',
          'Repair cost estimator'
        ]
      },
      maps: {
        enabled: true,
        type: 'advanced',
        description: 'Advanced property mapping with overlays',
        features: [
          'Heat maps',
          'School districts',
          'Crime data',
          'Demographics'
        ]
      },
      
      // Enhanced Credit Services
      creditRepair: {
        enabled: true,
        type: 'advanced',
        description: 'Full credit repair service access',
        features: [
          'Advanced dispute letters',
          'Credit score monitoring (all 3 bureaus)',
          'Personalized action plans',
          'Monthly progress reports',
          'Priority processing'
        ]
      },
      creditBuilder: {
        enabled: true,
        type: 'advanced',
        description: 'Advanced credit builder services',
        features: [
          'Credit line recommendations',
          'Debt payoff optimizer',
          'Credit utilization tracker',
          'Score prediction tools'
        ]
      },
      
      // Knowledge Base & AI
      knowledgeBase: {
        enabled: true,
        type: 'premium',
        description: 'Full knowledge base access',
        categories: 'all',
        downloadable: true
      },
      aiAssistance: {
        enabled: true,
        type: 'advanced',
        description: 'Enhanced AI assistance',
        limits: {
          monthly: 200,
          tokensPerQuery: 2000
        },
        features: [
          'Property analysis',
          'Deal evaluation',
          'Market insights',
          'Document generation'
        ]
      },
      
      // Education
      videoEducation: {
        enabled: true,
        type: 'premium',
        description: 'Premium video education + webinars',
        access: 'full-library',
        features: [
          'Monthly live webinars',
          'Downloadable content',
          'Course certificates'
        ]
      },
      
      // Support
      support: {
        email: true,
        phone: false,
        chat: true,
        ticketSystem: true,
        responseTime: '24 hours',
        businessHours: 'Mon-Fri 9am-5pm EST'
      }
    },
    landingPage: '/landing/premium-tier',
    ctaText: 'Upgrade to Professional',
    highlights: [
      'Everything in Basic',
      'Advanced property comps',
      'Buy/hold calculator',
      'Full credit repair access',
      'Enhanced AI assistance',
      '24-hour support'
    ],
    popular: true
  },

  ELITE: {
    id: 'elite',
    name: 'Elite Tier',
    displayName: 'Elite Investor',
    price: 297,
    billingPeriod: 'monthly',
    annualPrice: 2970,
    annualSavings: 594,
    features: {
      // All Premium Tier Features
      ...{}, // Inherited from PREMIUM
      
      // Unlimited Property Services
      propertyLookup: {
        enabled: true,
        type: 'unlimited',
        description: 'Unlimited property lookups & analysis',
        limits: {
          monthly: 'unlimited',
          daily: 'unlimited'
        }
      },
      propertyComps: {
        enabled: true,
        type: 'advanced',
        description: 'Advanced comps with AI insights',
        features: [
          'Unlimited comps',
          'AI-powered valuation',
          'Investment grade analysis',
          'Custom reports'
        ]
      },
      buyHoldCalculator: {
        enabled: true,
        type: 'advanced',
        description: 'Advanced deal analyzer with AI',
        features: [
          'Multi-scenario analysis',
          'Risk assessment',
          'Tax implications',
          'Exit strategy planning',
          'Portfolio integration'
        ]
      },
      
      // Premium Credit Services
      creditRepair: {
        enabled: true,
        type: 'premium',
        description: 'White-glove credit repair service',
        features: [
          'Dedicated credit specialist',
          'Unlimited disputes',
          'Creditor negotiations',
          'Legal letter templates',
          'Weekly progress updates',
          'Score guarantee program'
        ]
      },
      creditBuilder: {
        enabled: true,
        type: 'premium',
        description: 'Premium credit builder with coaching',
        features: [
          'Personal credit coach',
          'Custom building strategy',
          'Tradeline recommendations',
          'Business credit building',
          'Credit privacy protection'
        ]
      },
      
      // AI & Automation
      aiAssistance: {
        enabled: true,
        type: 'full',
        description: 'Full AI assistance with priority access',
        limits: {
          monthly: 'unlimited',
          tokensPerQuery: 8000
        },
        features: [
          'Unlimited queries',
          'Advanced analysis',
          'Custom AI models',
          'Automated workflows',
          'API access',
          'Priority processing'
        ]
      },
      
      // VIP Support
      support: {
        email: true,
        phone: true,
        phoneNumber: '1-800-ELITE-RE',
        chat: true,
        liveAssistance: true,
        ticketSystem: true,
        responseTime: '1 hour',
        availability: '24/7',
        businessHours: '24/7 coverage',
        textMessaging: true,
        dedicatedManager: true,
        features: [
          '24/7 service call answering',
          'Live call assistance during business hours',
          'Text message support',
          'Priority email response',
          'Dedicated account manager'
        ]
      },
      
      // Exclusive Access
      exclusiveAccess: {
        facebookGroup: {
          enabled: true,
          name: 'Elite Investor Network',
          description: 'Private Facebook group for investors and real estate professionals only',
          features: [
            'Networking with verified investors',
            'Deal sharing opportunities',
            'Weekly expert Q&A',
            'Market insights',
            'Partnership opportunities'
          ]
        },
        events: {
          enabled: true,
          features: [
            'Quarterly mastermind events',
            'Annual conference access',
            'Regional meetups',
            'VIP networking'
          ]
        }
      }
    },
    landingPage: '/landing/elite-tier',
    ctaText: 'Go Elite Now',
    highlights: [
      'Everything in Professional',
      'Unlimited property analysis',
      'White-glove credit service',
      'Full AI assistance',
      '24/7 phone & text support',
      '800 number access',
      'Private investor network',
      'Dedicated account manager'
    ],
    badge: 'Most Popular for Pros'
  }
};

// Feature comparison matrix
const FEATURE_COMPARISON = {
  propertyLookups: {
    free: '10/month',
    premium: '100/month',
    elite: 'Unlimited'
  },
  propertyComps: {
    free: 'Not included',
    premium: 'Basic (5 per property)',
    elite: 'Advanced (unlimited)'
  },
  calculator: {
    free: 'Not included',
    premium: 'Basic buy/hold calculator',
    elite: 'Advanced deal analyzer'
  },
  creditRepair: {
    free: 'Basic tools',
    premium: 'Full service',
    elite: 'White-glove + specialist'
  },
  aiQueries: {
    free: '20/month',
    premium: '200/month',
    elite: 'Unlimited'
  },
  support: {
    free: 'Ticket only (72hr)',
    premium: 'Email + chat (24hr)',
    elite: '24/7 phone + text (1hr)'
  },
  exclusiveAccess: {
    free: 'No',
    premium: 'No',
    elite: 'Yes - Investor network'
  }
};

// Upgrade paths and CTAs
const UPGRADE_PATHS = {
  free_to_premium: {
    discount: 0.20, // 20% off first month
    message: 'Upgrade now and get 20% off your first month!',
    urgency: 'Limited time offer'
  },
  free_to_elite: {
    discount: 0.15, // 15% off first month
    message: 'Skip ahead to Elite and save 15%!',
    urgency: 'Best value for serious investors'
  },
  premium_to_elite: {
    discount: 0.10, // 10% off first month
    message: 'Unlock full potential with Elite - 10% off!',
    urgency: 'Join the top 1% of investors'
  }
};

module.exports = {
  MEMBERSHIP_TIERS,
  FEATURE_COMPARISON,
  UPGRADE_PATHS
};
