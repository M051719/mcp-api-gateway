export type MembershipTier = 'free' | 'pro' | 'enterprise';

export interface MembershipFeature {
  name: string;
  description: string;
  included: boolean;
}

export interface MembershipPlan {
  id: MembershipTier;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: MembershipFeature[];
}

export const membershipPlans: MembershipPlan[] = [
  {
    id: 'free',
    name: 'Basic',
    price: 0,
    billingPeriod: 'monthly',
    features: [
      {
        name: 'Flip Analysis',
        description: 'Basic property flip calculations',
        included: true,
      },
      {
        name: 'Rent & Hold Analysis',
        description: 'Basic rental property calculations',
        included: true,
      },
      {
        name: 'Basic Comparables',
        description: 'Simple property comparisons',
        included: true,
      },
      {
        name: 'Cost Calculations',
        description: 'Purchase, closing, and holding costs',
        included: true,
      },
      {
        name: 'Basic Land Info',
        description: 'Basic zoning and land use information',
        included: true,
      },
      {
        name: 'Basic Presentations',
        description: 'Simple property presentation templates',
        included: true,
      },
    ],
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 49.99,
    billingPeriod: 'monthly',
    features: [
      {
        name: 'Everything in Basic',
        description: 'All features from the Basic plan',
        included: true,
      },
      {
        name: 'Advanced Analytics',
        description: 'Detailed charts and market analysis',
        included: true,
      },
      {
        name: 'Enhanced Comparables',
        description: 'Comprehensive property comparisons',
        included: true,
      },
      {
        name: 'Custom Reports',
        description: 'Branded PDF reports and presentations',
        included: true,
      },
      {
        name: 'Market Trends',
        description: 'Historical data and trend analysis',
        included: true,
      },
      {
        name: 'Land Development Analysis',
        description: 'Soil quality reports and water rights data',
        included: true,
      },
      {
        name: 'Regulation Database',
        description: 'Local and state land use regulations',
        included: true,
      },
      {
        name: 'Negotiation Tools',
        description: 'Land purchase negotiation templates',
        included: true,
      },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149.99,
    billingPeriod: 'monthly',
    features: [
      {
        name: 'Everything in Professional',
        description: 'All features from the Professional plan',
        included: true,
      },
      {
        name: 'Crime Statistics',
        description: 'Detailed neighborhood safety data',
        included: true,
      },
      {
        name: 'Natural Disaster History',
        description: 'Historical natural disaster data',
        included: true,
      },
      {
        name: 'Flood Risk Assessment',
        description: 'Comprehensive flood risk analysis',
        included: true,
      },
      {
        name: 'Contractor Network',
        description: 'Access to verified local contractors',
        included: true,
      },
      {
        name: 'Priority Support',
        description: '24/7 priority customer support',
        included: true,
      },
      {
        name: 'Advanced Soil Testing',
        description: 'Detailed soil composition analysis',
        included: true,
      },
      {
        name: 'Water Rights Analysis',
        description: 'Comprehensive water rights research',
        included: true,
      },
      {
        name: 'Environmental Studies',
        description: 'Full environmental impact reports',
        included: true,
      },
      {
        name: 'Legal Document Templates',
        description: 'Land purchase agreement templates',
        included: true,
      },
    ],
  },
];

