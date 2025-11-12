import React, { useState } from 'react';
import { Check, Crown, Zap, Building2 } from 'lucide-react';
import { MembershipPlan } from '../../types/membership';
import { useAuthStore } from '../../store/authStore';
import { createCheckoutSession } from '../../lib/stripe';

interface PricingCardProps {
  plan: MembershipPlan;
  isPopular?: boolean;
}

const planIcons = {
  free: Building2,
  pro: Zap,
  enterprise: Crown,
};

const stripePriceIds = {
  pro: 'price_1234567890', // Replace with your actual Stripe price ID
  enterprise: 'price_0987654321', // Replace with your actual Stripe price ID
};

export const PricingCard: React.FC<PricingCardProps> = ({ plan, isPopular = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const Icon = planIcons[plan.id];

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to subscribe');
      return;
    }

    if (plan.id === 'free') {
      // Handle free plan upgrade
      return;
    }

    setIsLoading(true);

    try {
      const priceId = stripePriceIds[plan.id as keyof typeof stripePriceIds];
      const session = await createCheckoutSession(priceId, user?.stripeCustomerId);
      
      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isCurrentPlan = user?.membershipTier === plan.id;

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
        isPopular
          ? 'border-blue-500 scale-105'
          : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <div className="p-8">
        <div className="flex items-center justify-center mb-4">
          <div
            className={`p-3 rounded-full ${
              isPopular
                ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                : 'bg-gray-100'
            }`}
          >
            <Icon
              className={`w-8 h-8 ${
                isPopular ? 'text-white' : 'text-gray-600'
              }`}
            />
          </div>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-bold text-gray-900">
              ${plan.price}
            </span>
            <span className="text-gray-600 ml-2">/{plan.billingPeriod}</span>
          </div>
        </div>

        <ul className="space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-900">{feature.name}</span>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={handleSubscribe}
          disabled={isLoading || isCurrentPlan}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
            isCurrentPlan
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : isPopular
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading
            ? 'Processing...'
            : isCurrentPlan
            ? 'Current Plan'
            : plan.id === 'free'
            ? 'Get Started'
            : 'Subscribe Now'}
        </button>
      </div>
    </div>
  );
};