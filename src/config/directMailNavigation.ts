/**
 * Direct Mail Navigation Integration
 * Add these links to your main navigation/dashboard
 */

// Example integration for dashboard navigation
export const directMailNavigation = {
  label: 'Direct Mail',
  icon: '📬',
  path: '/direct-mail',
  badge: 'PREMIUM',
  requiredTier: 'premium',
  description: 'Send professional direct mail campaigns'
};

// Example integration for hero section (add to homepage.tsx)
export const directMailHeroCTA = {
  label: '📬 Direct Mail',
  path: '/direct-mail',
  description: 'Send targeted postcards with Lob integration',
  color: 'from-purple-600 to-pink-600',
  tierRequired: 'premium'
};

// Add to your route configuration (usually App.tsx or routes.tsx)
/*
import DirectMailPage from './pages/DirectMailPage';
import ProtectedRoute from './components/ProtectedRoute';

// In your routes:
<Route 
  path="/direct-mail" 
  element={
    <ProtectedRoute requiredTier="premium" feature="direct-mail">
      <DirectMailPage />
    </ProtectedRoute>
  } 
/>
*/

// Add to dashboard menu (example structure)
export const dashboardMenuItems = [
  {
    section: 'Marketing',
    items: [
      {
        name: 'Direct Mail Campaigns',
        icon: '📬',
        path: '/direct-mail',
        badge: 'PREMIUM',
        description: 'Send professional postcards',
        stats: 'View campaigns'
      }
    ]
  }
];

// Quick stats widget for dashboard
export const directMailWidget = {
  title: 'Direct Mail',
  icon: '📬',
  stats: [
    { label: 'Sent This Month', key: 'sent_count' },
    { label: 'Response Rate', key: 'response_rate' },
    { label: 'Total Campaigns', key: 'campaign_count' }
  ],
  cta: {
    label: 'Create Campaign',
    path: '/direct-mail'
  }
};
