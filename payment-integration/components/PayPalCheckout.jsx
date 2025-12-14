import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const PayPalCheckout = ({ plan, userId, userEmail, onCancel }) => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const initialOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: 'USD',
    intent: 'subscription',
    vault: true,
  };

  const createSubscription = (data, actions) => {
    return actions.subscription.create({
      plan_id: plan.paypalPlanId,
      application_context: {
        shipping_preference: 'NO_SHIPPING',
      },
      custom_id: userId,
      subscriber: {
        email_address: userEmail,
      },
    });
  };

  const onApprove = async (data, actions) => {
    try {
      // Save subscription to your database
      const response = await fetch('/api/paypal-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: data.subscriptionID,
          userId,
          email: userEmail,
          planName: plan.name,
          planId: plan.paypalPlanId,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        // Redirect to success page
        window.location.href = `/payment/success?subscription_id=${data.subscriptionID}&provider=paypal`;
      } else {
        throw new Error('Failed to save subscription');
      }
    } catch (err) {
      setError('Failed to complete subscription. Please contact support.');
      console.error('PayPal subscription error:', err);
    }
  };

  const onError = (err) => {
    console.error('PayPal error:', err);
    setError('An error occurred with PayPal. Please try again or use a different payment method.');
  };

  const onCancel = (data) => {
    console.log('PayPal subscription cancelled:', data);
    // User cancelled, don't show error
  };

  return (
    <div className="paypal-checkout">
      <div className="checkout-header">
        <button onClick={onCancel} className="back-btn">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Plans
        </button>
        <h2>PayPal Subscription</h2>
        <p>{plan.name} Plan - ${plan.price}/month</p>
      </div>

      {error && (
        <div className="error-message">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          Subscription successful! Redirecting...
        </div>
      )}

      <div className="paypal-container">
        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtons
            createSubscription={createSubscription}
            onApprove={onApprove}
            onError={onError}
            onCancel={onCancel}
            style={{
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'subscribe',
            }}
          />
        </PayPalScriptProvider>
      </div>

      <div className="features-summary">
        <h3>What's included:</h3>
        <ul>
          {plan.features.map((feature, index) => (
            <li key={index}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="secure-info">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
        <div>
          <strong>Secure Payment</strong>
          <p>Powered by PayPal. Your payment information is encrypted and secure.</p>
        </div>
      </div>

      <style jsx>{`
        .paypal-checkout {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .checkout-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: transparent;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          color: #4a5568;
          font-size: 0.875rem;
          cursor: pointer;
          margin-bottom: 24px;
          transition: all 0.2s ease;
        }

        .back-btn:hover {
          background: #f7fafc;
          border-color: #cbd5e0;
        }

        .back-btn svg {
          width: 20px;
          height: 20px;
        }

        .checkout-header h2 {
          font-size: 1.75rem;
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 8px;
        }

        .checkout-header p {
          color: #718096;
          font-size: 1.125rem;
        }

        .error-message,
        .success-message {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .error-message {
          background: #fed7d7;
          color: #c53030;
        }

        .success-message {
          background: #c6f6d5;
          color: #22543d;
        }

        .error-message svg,
        .success-message svg {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }

        .paypal-container {
          background: white;
          padding: 32px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-bottom: 32px;
        }

        .features-summary {
          background: #f7fafc;
          padding: 24px;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .features-summary h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 16px;
        }

        .features-summary ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .features-summary li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
          color: #4a5568;
        }

        .features-summary li svg {
          width: 20px;
          height: 20px;
          color: #48bb78;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .secure-info {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: #edf2f7;
          border-radius: 8px;
          align-items: flex-start;
        }

        .secure-info svg {
          width: 32px;
          height: 32px;
          color: #4299e1;
          flex-shrink: 0;
        }

        .secure-info strong {
          display: block;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .secure-info p {
          color: #718096;
          font-size: 0.875rem;
          margin: 0;
        }

        @media (max-width: 640px) {
          .paypal-checkout {
            padding: 20px;
          }

          .paypal-container {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default PayPalCheckout;
