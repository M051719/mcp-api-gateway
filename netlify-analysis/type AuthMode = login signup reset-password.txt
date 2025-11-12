import React, { useState } from 'react';
import { LoginForm } from '../components/Auth/LoginForm';
import { SignupForm } from '../components/Auth/SignupForm';
import { ResetPasswordForm } from '../components/Auth/ResetPasswordForm';

type AuthMode = 'login' | 'signup' | 'reset-password';

export const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {authMode === 'login' && (
          <LoginForm 
            onToggleMode={() => setAuthMode('signup')} 
            onForgotPassword={() => setAuthMode('reset-password')}
          />
        )}
        
        {authMode === 'signup' && (
          <SignupForm 
            onToggleMode={() => setAuthMode('login')} 
          />
        )}
        
        {authMode === 'reset-password' && (
          <ResetPasswordForm 
            onBack={() => setAuthMode('login')} 
          />
        )}
      </div>
    </div>
  );
};


