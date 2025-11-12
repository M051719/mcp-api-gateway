export interface Property {
  id: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  yearBuilt: number;
  propertyType: 'single-family' | 'condo' | 'townhouse' | 'multi-family';
  listingDate: Date;
  images: string[];
}

export interface FlipAnalysis {
  id: string;
  propertyId: string;
  purchasePrice: number;
  rehabCosts: number;
  holdingCosts: number;
  sellingCosts: number;
  arv: number; // After Repair Value
  profit: number;
  roi: number;
  createdAt: Date;
}

export interface RentalAnalysis {
  id: string;
  propertyId: string;
  purchasePrice: number;
  monthlyRent: number;
  expenses: {
    taxes: number;
    insurance: number;
    maintenance: number;
    vacancy: number;
    management: number;
    other: number;
  };
  cashFlow: number;
  capRate: number;
  cashOnCashReturn: number;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  membershipTier: 'free' | 'pro' | 'enterprise';
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'incomplete';
  createdAt: Date;
}
