import React from 'react';

const PaymentSuccess = () => {
  // Get subscription details from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const subscriptionId = urlParams.get('subscription_id');
  const provider = urlParams.get('provider') || 'stripe';

  React.useEffect(() => {
    // Optionally verify subscription on backend
    // fetch(`/api/verify-subscription?id=${subscriptionId}`)
    //   .then(res => res.json())
    //   .then(data => console.log('Subscription verified:', data));
  }, [subscriptionId]);

  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#48bb78" />
            <path
              d="M8 12.5l2.5 2.5L16 9"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1>Payment Successful!</h1>
        <p className="subtitle">Welcome to RepMotivatedSeller</p>

        <div className="details-card">
          <h2>What's Next?</h2>
          <ul className="next-steps">
            <li>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Check your email for confirmation and next steps
            </li>
            <li>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Access your member dashboard
            </li>
            <li>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Start your credit repair journey
            </li>
            <li>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Schedule your first consultation
            </li>
          </ul>
        </div>

        <div className="subscription-info">
          <p>Subscription ID: <code>{subscriptionId}</code></p>
          <p>Payment Method: <strong>{provider === 'paypal' ? 'PayPal' : 'Stripe'}</strong></p>
        </div>

        <div className="action-buttons">
          <a href="/dashboard" className="primary-btn">
            Go to Dashboard
          </a>
          <a href="/account" className="secondary-btn">
            Manage Subscription
          </a>
        </div>

        <div className="help-section">
          <p>Need help? Contact us at <a href="mailto:support@repmotivatedseller.com">support@repmotivatedseller.com</a></p>
        </div>
      </div>

      <style jsx>{`
        .success-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .success-container {
          max-width: 600px;
          width: 100%;
          background: white;
          border-radius: 16px;
          padding: 48px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          animation: scaleIn 0.5s ease-out;
        }

        .success-icon svg {
          width: 100%;
          height: 100%;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 8px;
        }

        .subtitle {
          font-size: 1.25rem;
          color: #718096;
          margin-bottom: 32px;
        }

        .details-card {
          background: #f7fafc;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          text-align: left;
        }

        .details-card h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 16px;
        }

        .next-steps {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .next-steps li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
          color: #4a5568;
          font-size: 1rem;
        }

        .next-steps li:last-child {
          margin-bottom: 0;
        }

        .next-steps svg {
          width: 20px;
          height: 20px;
          color: #48bb78;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .subscription-info {
          background: #edf2f7;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          font-size: 0.875rem;
        }

        .subscription-info p {
          margin: 4px 0;
          color: #4a5568;
        }

        .subscription-info code {
          background: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.875rem;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .primary-btn,
        .secondary-btn {
          flex: 1;
          padding: 14px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .primary-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .secondary-btn {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }

        .secondary-btn:hover {
          background: #f7fafc;
        }

        .help-section {
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
          font-size: 0.875rem;
          color: #718096;
        }

        .help-section a {
          color: #667eea;
          text-decoration: none;
        }

        .help-section a:hover {
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .success-container {
            padding: 32px 24px;
          }

          h1 {
            font-size: 1.5rem;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;
