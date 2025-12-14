import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ plan, userId, userEmail, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Create subscription on your backend
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId,
          email: userEmail,
          planName: plan.name
        }),
      });

      const { clientSecret, subscriptionId } = await response.json();

      // Confirm the payment
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?subscription_id=${subscriptionId}`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsProcessing(false);
      }
    } catch (err) {
      setErrorMessage('An error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="form-header">
        <h2>Complete Your Subscription</h2>
        <p>{plan.name} Plan - ${plan.price}/month</p>
      </div>

      <PaymentElement />

      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="cancel-btn"
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="submit-btn"
        >
          {isProcessing ? 'Processing...' : `Subscribe for $${plan.price}/mo`}
        </button>
      </div>

      <div className="secure-badge">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
        <span>Secured by Stripe</span>
      </div>

      <style jsx>{`
        .checkout-form {
          max-width: 500px;
          margin: 0 auto;
          padding: 32px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .form-header {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .form-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 8px;
        }

        .form-header p {
          color: #718096;
          font-size: 1.125rem;
        }

        .error-message {
          background: #fed7d7;
          color: #c53030;
          padding: 12px 16px;
          border-radius: 6px;
          margin: 16px 0;
          font-size: 0.875rem;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .cancel-btn,
        .submit-btn {
          flex: 1;
          padding: 14px 24px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn {
          background: #e2e8f0;
          color: #4a5568;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #cbd5e0;
        }

        .submit-btn {
          background: #635bff;
          color: white;
        }

        .submit-btn:hover:not(:disabled) {
          background: #4f46e5;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 91, 255, 0.4);
        }

        .submit-btn:disabled,
        .cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .secure-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
          color: #718096;
          font-size: 0.875rem;
        }

        .secure-badge svg {
          width: 20px;
          height: 20px;
        }
      `}</style>
    </form>
  );
};

const StripeCheckout = ({ plan, userId, userEmail, onCancel }) => {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create PaymentIntent on mount
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: plan.stripePriceId,
        userId,
        email: userEmail
      }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [plan.stripePriceId, userId, userEmail]);

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#635bff',
        colorBackground: '#ffffff',
        colorText: '#1a202c',
        colorDanger: '#c53030',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="stripe-checkout-wrapper">
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm
            plan={plan}
            userId={userId}
            userEmail={userEmail}
            onCancel={onCancel}
          />
        </Elements>
      )}

      {!clientSecret && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading payment form...</p>
        </div>
      )}

      <style jsx>{`
        .stripe-checkout-wrapper {
          min-height: 400px;
          padding: 40px 20px;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 60px 20px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top-color: #635bff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading p {
          color: #718096;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
};

export default StripeCheckout;
