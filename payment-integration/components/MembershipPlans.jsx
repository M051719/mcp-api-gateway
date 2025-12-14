import React, { useState } from 'react';
import StripeCheckout from './StripeCheckout';
import PayPalCheckout from './PayPalCheckout';

const PLANS = [
  {
    name: 'Basic',
    price: 29,
    stripePriceId: import.meta.env.VITE_STRIPE_BASIC_PRICE_ID,
    paypalPlanId: import.meta.env.VITE_PAYPAL_BASIC_PLAN_ID,
    features: [
      'Credit Report Analysis',
      'Dispute Letter Templates',
      'Email Support',
      'Basic Credit Tips',
      'Monthly Progress Reports'
    ]
  },
  {
    name: 'Premium',
    price: 49,
    stripePriceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID,
    paypalPlanId: import.meta.env.VITE_PAYPAL_PREMIUM_PLAN_ID,
    features: [
      'Everything in Basic',
      'Priority Support',
      'Advanced Dispute Strategies',
      'Credit Builder Resources',
      'Weekly Progress Reports',
      'Phone Consultation (1/month)'
    ],
    popular: true
  },
  {
    name: 'VIP',
    price: 97,
    stripePriceId: import.meta.env.VITE_STRIPE_VIP_PRICE_ID,
    paypalPlanId: import.meta.env.VITE_PAYPAL_VIP_PLAN_ID,
    features: [
      'Everything in Premium',
      'Dedicated Account Manager',
      'Unlimited Phone Consultations',
      'Daily Progress Updates',
      'Personalized Action Plans',
      'Guarantee: 100-point increase or refund'
    ]
  }
];

const MembershipPlans = ({ userId, userEmail }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  const handleSelectPlan = (plan, method) => {
    setSelectedPlan(plan);
    setPaymentMethod(method);
  };

  const handleCancel = () => {
    setSelectedPlan(null);
    setPaymentMethod(null);
  };

  if (selectedPlan && paymentMethod === 'stripe') {
    return (
      <StripeCheckout
        plan={selectedPlan}
        userId={userId}
        userEmail={userEmail}
        onCancel={handleCancel}
      />
    );
  }

  if (selectedPlan && paymentMethod === 'paypal') {
    return (
      <PayPalCheckout
        plan={selectedPlan}
        userId={userId}
        userEmail={userEmail}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="membership-plans">
      <div className="plans-header">
        <h1>Choose Your Membership</h1>
        <p>Start your credit repair journey today with RepMotivatedSeller</p>
      </div>

      <div className="plans-grid">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`plan-card ${plan.popular ? 'popular' : ''}`}
          >
            {plan.popular && <div className="popular-badge">Most Popular</div>}
            
            <div className="plan-header">
              <h2>{plan.name}</h2>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">{plan.price}</span>
                <span className="period">/month</span>
              </div>
            </div>

            <ul className="features-list">
              {plan.features.map((feature, index) => (
                <li key={index}>
                  <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="payment-options">
              <button
                className="payment-btn stripe-btn"
                onClick={() => handleSelectPlan(plan, 'stripe')}
              >
                <svg className="stripe-logo" viewBox="0 0 60 25">
                  <path fill="currentColor" d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 01-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 013.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 01-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 01-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 00-4.1-1.06c-.86 0-1.44.25-1.44.93 0 1.85 6.29.97 6.29 5.88z"/>
                </svg>
                Pay with Card
              </button>

              <button
                className="payment-btn paypal-btn"
                onClick={() => handleSelectPlan(plan, 'paypal')}
              >
                <svg className="paypal-logo" viewBox="0 0 100 32">
                  <path fill="#003087" d="M12 4.917h8.668c2.454 0 4.31.636 5.573 1.908 1.263 1.272 1.89 3.181 1.89 5.726 0 2.545-.627 4.545-1.89 5.818-1.264 1.272-3.12 1.908-5.573 1.908h-3.556l-1.778 7.806H12zm5.334 11.543h2.667c1.333 0 2.334-.318 3-.954.667-.636 1-1.682 1-3.135 0-1.454-.333-2.5-1-3.136-.666-.636-1.667-.954-3-.954h-2.667z"/>
                  <path fill="#009cde" d="M32.447 4.917h8.667c2.453 0 4.31.636 5.573 1.908 1.264 1.272 1.89 3.181 1.89 5.726 0 2.545-.626 4.545-1.89 5.818-1.263 1.272-3.12 1.908-5.573 1.908h-3.556l-1.778 7.806h-3.333zm5.333 11.543h2.667c1.334 0 2.334-.318 3-.954.667-.636 1-1.682 1-3.135 0-1.454-.333-2.5-1-3.136-.666-.636-1.666-.954-3-.954H37.78z"/>
                  <path fill="#003087" d="M75.78 20.361h-3.556l1.778-7.806h3.556c2.453 0 3.68-1.09 3.68-3.272 0-1.091-.334-1.909-1-2.454-.667-.545-1.667-.818-3-.818h-2.667l-3.11 14.35h-3.334l4.223-19.444h8.667c2.453 0 4.31.636 5.573 1.908 1.263 1.272 1.89 3.181 1.89 5.726 0 2.545-.627 4.545-1.89 5.818-1.264 1.272-3.12 1.908-5.573 1.908z"/>
                  <path fill="#009cde" d="M92.447 28.167h-3.334l4.223-19.444h3.334zm4.89-15.806c0-1.454-.334-2.5-1-3.136-.667-.636-1.667-.954-3-.954h-2.667l-1.778 7.806h2.667c1.333 0 2.333-.318 3-.954.666-.636 1-1.682 1-3.135z"/>
                </svg>
                Pay with PayPal
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .membership-plans {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .plans-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .plans-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 12px;
        }

        .plans-header p {
          font-size: 1.125rem;
          color: #718096;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 32px;
          margin-bottom: 48px;
        }

        .plan-card {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 32px;
          position: relative;
          transition: all 0.3s ease;
        }

        .plan-card:hover {
          border-color: #4299e1;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transform: translateY(-4px);
        }

        .plan-card.popular {
          border-color: #4299e1;
          box-shadow: 0 10px 30px rgba(66, 153, 225, 0.15);
        }

        .popular-badge {
          position: absolute;
          top: -12px;
          right: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .plan-header {
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .plan-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 12px;
        }

        .price {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .currency {
          font-size: 1.25rem;
          color: #4a5568;
        }

        .amount {
          font-size: 3rem;
          font-weight: 700;
          color: #1a202c;
        }

        .period {
          font-size: 1rem;
          color: #718096;
        }

        .features-list {
          list-style: none;
          padding: 0;
          margin: 0 0 32px 0;
        }

        .features-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
          color: #4a5568;
        }

        .check-icon {
          width: 20px;
          height: 20px;
          color: #48bb78;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .payment-btn {
          width: 100%;
          padding: 14px 24px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .stripe-btn {
          background: #635bff;
          color: white;
        }

        .stripe-btn:hover {
          background: #4f46e5;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 91, 255, 0.4);
        }

        .paypal-btn {
          background: #ffc439;
          color: #003087;
        }

        .paypal-btn:hover {
          background: #ffb800;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 196, 57, 0.4);
        }

        .stripe-logo {
          height: 24px;
        }

        .paypal-logo {
          height: 28px;
        }

        @media (max-width: 768px) {
          .plans-grid {
            grid-template-columns: 1fr;
          }

          .plans-header h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MembershipPlans;
