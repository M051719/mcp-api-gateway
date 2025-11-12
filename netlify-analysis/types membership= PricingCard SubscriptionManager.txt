import React from 'react';
import { membershipPlans } from '../types/membership';
import { PricingCard } from '../components/Membership/PricingCard';
import { SubscriptionManager } from '../components/Membership/SubscriptionManager';
import { useAuthStore } from '../store/authStore';
import { DollarSign, AlertTriangle, Home, MapPin, Building } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  const availableStates = [
    'Washington', 'Montana', 'Wyoming', 'Colorado', 'New Mexico', 'Texas', 'Oklahoma', 
    'Kansas', 'Nebraska', 'Iowa', 'Missouri', 'Arkansas', 'Louisiana', 'Mississippi', 
    'Tennessee', 'Illinois', 'Wisconsin', 'Indiana', 'Maine', 'Michigan', 'Kentucky', 
    'Virginia', 'West Virginia', 'Pennsylvania', 'Alabama', 'Georgia', 'South Carolina', 
    'Florida', 'Delaware', 'Washington DC', 'New Hampshire', 'Massachusetts', 
    'Connecticut', 'Rhode Island', 'Maryland', 'Alaska', 'Hawaii'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock powerful real estate analysis tools and take your investment decisions to the next level
          </p>
        </div>

        {/* Financing Information */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 mb-12">
          <div className="text-center">
            <DollarSign className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              🏦 All Deals Financed Through RepMotivatedSeller
            </h2>
            <p className="text-xl mb-6 text-blue-100">
              Private Money Opportunity: Residential & Multifamily Investment Properties
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/10 rounded-lg p-6">
                <div className="font-semibold text-lg mb-2">Loan Amount</div>
                <div className="text-yellow-200 text-xl">$30,000 to FHA Cap</div>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <div className="font-semibold text-lg mb-2">Interest Rate</div>
                <div className="text-yellow-200 text-xl">8% - 15%</div>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <div className="font-semibold text-lg mb-2">Term</div>
                <div className="text-yellow-200 text-xl">6 - 24 Months</div>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <div className="font-semibold text-lg mb-2">Origination</div>
                <div className="text-yellow-200 text-xl">0 to 5 Points</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 rounded-lg p-6">
                <div className="font-semibold text-lg mb-2 flex items-center">
                  <Home className="w-5 h-5 mr-2" />
                  Residential Properties (1-4 Units)
                </div>
                <ul className="text-blue-100 text-sm space-y-1 text-left">
                  <li>• Single Family Residences</li>
                  <li>• Duplexes, Triplexes, Fourplexes</li>
                  <li>• Price ≤ FHA cap for area</li>
                  <li>• Max 1/2 acre, 5BR/3BA per unit, 2,800 sq ft per unit</li>
                </ul>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <div className="font-semibold text-lg mb-2 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Multifamily & Commercial
                </div>
                <ul className="text-blue-100 text-sm space-y-1 text-left">
                  <li>• Apartment buildings (5+ units)</li>
                  <li>• Multifamily dwelling complexes</li>
                  <li>• Mixed-use residential/commercial</li>
                  <li>• Student housing & senior living</li>
                </ul>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <div className="font-semibold text-lg mb-2">Loan Parameters</div>
                <ul className="text-blue-100 text-sm space-y-1 text-left">
                  <li>• 90% Purchase (1-4 units)</li>
                  <li>• 80% Purchase (5+ units)</li>
                  <li>• 70% Rehab (≤65% LTV)</li>
                  <li>• 50% Cash-out Refinance LTV</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-yellow-300 mr-3 mt-0.5" />
                <div className="text-left">
                  <div className="font-semibold text-yellow-100 mb-2">Important Requirements</div>
                  <ul className="text-sm text-yellow-200 space-y-1">
                    <li>• <strong>Non-Owner Occupied Investment Properties Only</strong></li>
                    <li>• <strong>Must be made through a borrower entity</strong></li>
                    <li>• <strong>Residential and Commercial Loans Available</strong></li>
                    <li>• No minimum credit score (680+ and 20%+ down strengthen applications)</li>
                    <li>• Broker fees paid subject to final underwriting and compliance with applicable law</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Available States (36 States)
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2 text-xs">
                {availableStates.map((state) => (
                  <div key={state} className="bg-green-500/20 text-green-100 px-2 py-1 rounded text-center">
                    {state}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <span className="text-red-200 text-sm">
                  <strong>Excluded States:</strong> Minnesota, Nevada, South Dakota, Utah, Vermont
                </span>
              </div>
            </div>

            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors">
              Apply for Private Money Financing
            </button>
          </div>
        </div>

        {/* Subscription Manager for existing subscribers */}
        {isAuthenticated && user && user.membershipTier !== 'free' && (
          <div className="mb-12">
            <SubscriptionManager />
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {membershipPlans.map((plan, index) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isPopular={index === 1}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change my plan at any time?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial available?
              </h3>
              <p className="text-gray-600">
                Our Basic plan is completely free and includes essential features. You can upgrade to Pro or Enterprise at any time to access advanced features.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What about financing for my deals?
              </h3>
              <p className="text-gray-600">
                All deals can be financed through RepMotivatedSeller's private money program. We offer residential and multifamily investment property loans from $30,000 to FHA caps with competitive rates and flexible terms for qualified borrowers.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you finance apartment buildings and multifamily properties?
              </h3>
              <p className="text-gray-600">
                Yes! We provide financing for both residential properties (1-4 units) and commercial multifamily properties including apartment buildings, multifamily dwelling complexes, student housing, and senior living facilities.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, MasterCard, American Express) and PayPal through our secure Stripe payment processing.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel my subscription?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You'll continue to have access to paid features until the end of your current billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


