import React from 'react';
import { InlineWidget } from 'react-calendly';
import { Calendar, Clock, CheckCircle, Users } from 'lucide-react';

const BookConsultation: React.FC = () => {
  // Get Calendly URL from environment variable
  const calendlyUrl = import.meta.env.VITE_CALENDLY_URL;

  if (!calendlyUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Configuration Required:</strong> VITE_CALENDLY_URL is not set in your environment variables. 
                  Please add your Calendly scheduling page URL to continue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Schedule Your Free Consultation
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Let's discuss how we can help you achieve your financial goals
          </p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Clock className="w-10 h-10 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">30-Minute Call</h3>
              <p className="text-blue-100 text-sm">
                Personalized consultation to understand your needs
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Users className="w-10 h-10 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Expert Guidance</h3>
              <p className="text-blue-100 text-sm">
                Work with experienced financial professionals
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <CheckCircle className="w-10 h-10 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">No Obligation</h3>
              <p className="text-blue-100 text-sm">
                Free consultation with no strings attached
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendly Widget Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* What to Expect Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              What to Expect During Your Consultation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                    1
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Discovery Call
                  </h3>
                  <p className="text-gray-600 text-sm">
                    We'll discuss your current situation, goals, and challenges
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                    2
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Solution Overview
                  </h3>
                  <p className="text-gray-600 text-sm">
                    We'll outline potential strategies and solutions tailored to you
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-600 text-white font-bold">
                    3
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Q&A Session
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Ask any questions you have about our services and approach
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-600 text-white font-bold">
                    4
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Next Steps
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Decide if we're a good fit and discuss how to move forward
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Calendly Widget */}
          <div className="p-4 bg-white">
            <InlineWidget
              url={calendlyUrl}
              styles={{
                height: '700px',
                width: '100%',
              }}
              pageSettings={{
                backgroundColor: 'ffffff',
                hideEventTypeDetails: false,
                hideLandingPageDetails: false,
                primaryColor: '2563eb',
                textColor: '1f2937',
              }}
            />
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-gray-600">Clients Served</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-600">Support Available</div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Your Privacy is Protected
          </h3>
          <p className="text-gray-700 text-sm">
            All information shared during your consultation is kept strictly confidential and complies with 
            GLBA Privacy Rules and industry best practices. We never share your personal information without 
            your explicit consent. Read our{' '}
            <a href="/compliance/glba" className="text-blue-600 hover:text-blue-800 underline">
              GLBA Compliance Policy
            </a>{' '}
            for more details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookConsultation;
