import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from './lib/stripe';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { PricingPage } from './pages/PricingPage';
import { AuthPage } from './pages/AuthPage';
import { ForeclosurePage } from './pages/ForeclosurePage';
import { ContractsPage } from './pages/ContractsPage';
import { AdminPage } from './pages/AdminPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { ProfilePage } from './pages/ProfilePage';
import { useAuthStore, fetchUserProfile } from './store/authStore';
import { supabase } from './lib/supabase';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to RepMotivatedSeller
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your comprehensive real estate analysis platform
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Property Analysis
              </h3>
              <p className="text-gray-600">
                Analyze flip and rental properties with advanced calculations
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Foreclosure Help
              </h3>
              <p className="text-gray-600">
                Professional foreclosure assistance and consultation services
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Wholesale Contracts
              </h3>
              <p className="text-gray-600">
                Generate professional wholesale real estate contracts
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Professional Reports
              </h3>
              <p className="text-gray-600">
                Generate branded presentations and detailed reports
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { isAuthenticated, login } = useAuthStore();

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        try {
          // Fetch user profile from profiles table
          const profile = await fetchUserProfile(session.user.id);
          
          if (profile) {
            // Use profile data
            login(profile);
          } else {
            // Fallback to user metadata if profile doesn't exist yet
            const metadata = session.user.user_metadata;
            login({
              id: session.user.id,
              email: session.user.email || '',
              name: metadata?.name || session.user.email?.split('@')[0] || 'User',
              membershipTier: metadata?.membershipTier || 'free',
              stripeCustomerId: metadata?.stripeCustomerId,
              subscriptionId: metadata?.subscriptionId,
              subscriptionStatus: metadata?.subscriptionStatus,
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to basic user info
          login({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.email?.split('@')[0] || 'User',
            membershipTier: 'free',
          });
        }
      }
    };

    checkSession();
  }, [login]);

  return (
    <Elements stripe={stripePromise}>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          
          <main className="flex-grow">
            <Routes>
              <Route 
                path="/" 
                element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} 
              />
              <Route 
                path="/auth" 
                element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" />} 
              />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/foreclosure" element={<ForeclosurePage />} />
              <Route path="/contracts" element={<ContractsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/auth" />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </Elements>
  );
}

export default App;

