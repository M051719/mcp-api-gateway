import React, { useState } from 'react';
import { Home, AlertTriangle, FileText, CheckCircle, Calendar, DollarSign, Phone, Mail, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

interface FormData {
  // Contact Information
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  
  // Situation Questions
  situation_length: string;
  payment_difficulty_date: string;
  lender: string;
  payment_status: string;
  missed_payments: string;
  nod: string;
  property_type: string;
  relief_contacted: string;
  home_value: string;
  mortgage_balance: string;
  liens: string;
  
  // Problem Questions
  challenge: string;
  lender_issue: string;
  impact: string;
  options_narrowing: string;
  third_party_help: string;
  overwhelmed: string;
  
  // Implication Questions
  implication_credit: string;
  implication_loss: string;
  implication_stay_duration: string;
  legal_concerns: string;
  future_impact: string;
  financial_risk: string;
  
  // Need-Payoff Questions
  interested_solution: string;
  negotiation_help: string;
  sell_feelings: string;
  credit_importance: string;
  resolution_peace: string;
  open_options: string;
}

const initialFormData: FormData = {
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  situation_length: '',
  payment_difficulty_date: '',
  lender: '',
  payment_status: '',
  missed_payments: '',
  nod: '',
  property_type: '',
  relief_contacted: '',
  home_value: '',
  mortgage_balance: '',
  liens: '',
  challenge: '',
  lender_issue: '',
  impact: '',
  options_narrowing: '',
  third_party_help: '',
  overwhelmed: '',
  implication_credit: '',
  implication_loss: '',
  implication_stay_duration: '',
  legal_concerns: '',
  future_impact: '',
  financial_risk: '',
  interested_solution: '',
  negotiation_help: '',
  sell_feelings: '',
  credit_importance: '',
  resolution_peace: '',
  open_options: '',
};

export const ForeclosureQuestionnaire: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuthStore();

  const sections = [
    { title: 'Contact Information', icon: User, color: 'purple' },
    { title: 'Situation Assessment', icon: Home, color: 'blue' },
    { title: 'Problem Identification', icon: AlertTriangle, color: 'orange' },
    { title: 'Impact Analysis', icon: FileText, color: 'red' },
    { title: 'Solution Planning', icon: CheckCircle, color: 'green' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setSubmitError('Please sign in to submit the questionnaire');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found');
      }

      // Prepare the data for submission
      const submissionData = {
        ...formData,
        missed_payments: formData.missed_payments ? parseInt(formData.missed_payments) : 0,
        payment_difficulty_date: formData.payment_difficulty_date || null,
      };

      // Submit to Supabase
      const { data, error } = await supabase
        .from('foreclosure_responses')
        .insert([{
          user_id: session.user.id,
          ...submissionData,
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('Form submitted successfully:', data);

      // Trigger email notifications
      await triggerEmailNotifications(data);

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerEmailNotifications = async (submission: any) => {
    try {
      // Determine urgency level
      const missedPayments = submission.missed_payments || 0;
      const hasNOD = submission.nod === 'yes';
      const isUrgent = hasNOD || missedPayments >= 3;

      // Send new submission notification
      await supabase.functions.invoke('send-notification-email', {
        body: {
          submissionId: submission.id,
          type: 'new_submission'
        }
      });

      // Send urgent notification if needed
      if (isUrgent) {
        await supabase.functions.invoke('send-notification-email', {
          body: {
            submissionId: submission.id,
            type: 'urgent_case'
          }
        });
      }

      console.log('Email notifications triggered successfully');
    } catch (error) {
      console.error('Failed to trigger email notifications:', error);
      // Don't fail the entire submission if email fails
    }
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const getSectionColor = (color: string) => {
    const colors = {
      purple: 'bg-purple-500',
      blue: 'bg-blue-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      green: 'bg-green-500',
    };
    return colors[color as keyof typeof colors];
  };

  // Pre-fill contact info from user data
  React.useEffect(() => {
    if (user && !formData.contact_name && !formData.contact_email) {
      setFormData(prev => ({
        ...prev,
        contact_name: user.name || '',
        contact_email: user.email || '',
      }));
    }
  }, [user, formData.contact_name, formData.contact_email]);

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your questionnaire has been submitted successfully. Our team will review your information and contact you within 24 hours with personalized options.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              📧 You'll receive an email confirmation shortly with next steps and our team's contact information.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              (555) 123-4567
            </div>
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              help@repmotivatedseller.org
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to access the foreclosure questionnaire. This helps us provide personalized assistance and keep your information secure.
          </p>
          <a
            href="/auth"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Foreclosure & Home Relief Assessment
          </h1>
          <p className="text-gray-600">
            Help us understand your situation so we can provide the best assistance
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isActive = index === currentSection;
              const isCompleted = index < currentSection;
              
              return (
                <div key={index} className="flex items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? `${getSectionColor(section.color)} text-white shadow-lg scale-110`
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  {index < sections.length - 1 && (
                    <div
                      className={`h-1 w-12 mx-2 transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {sections[currentSection].title}
            </h2>
            <p className="text-sm text-gray-600">
              Step {currentSection + 1} of {sections.length}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          {/* Section 0: Contact Information */}
          {currentSection === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="contact_name"
                      value={formData.contact_name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800">
                  <strong>Privacy Notice:</strong> Your information is kept strictly confidential and will only be used to provide you with personalized foreclosure assistance options.
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Situation Questions */}
          {currentSection === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How long have you lived in your current home?
                  </label>
                  <input
                    type="text"
                    name="situation_length"
                    value={formData.situation_length}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="e.g., 5 years"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    When did you start having difficulty with mortgage payments?
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="payment_difficulty_date"
                      value={formData.payment_difficulty_date}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Who is your current mortgage lender?
                  </label>
                  <input
                    type="text"
                    name="lender"
                    value={formData.lender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="e.g., Wells Fargo, Chase, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Are you currently behind or anticipating trouble?
                  </label>
                  <select
                    name="payment_status"
                    value={formData.payment_status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select status</option>
                    <option value="behind">Behind on payments</option>
                    <option value="anticipating">Anticipating trouble</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How many payments have you missed?
                  </label>
                  <input
                    type="number"
                    name="missed_payments"
                    value={formData.missed_payments}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated home value
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="home_value"
                      value={formData.home_value}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="350,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current mortgage balance
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="mortgage_balance"
                      value={formData.mortgage_balance}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="280,000"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Have you received a Notice of Default (NOD)?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="nod"
                        value="yes"
                        checked={formData.nod === 'yes'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="nod"
                        value="no"
                        checked={formData.nod === 'no'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Primary residence or investment property?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="property_type"
                        value="primary"
                        checked={formData.property_type === 'primary'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">Primary Residence</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="property_type"
                        value="investment"
                        checked={formData.property_type === 'investment'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">Investment Property</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Have you contacted the lender for relief?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="relief_contacted"
                        value="yes"
                        checked={formData.relief_contacted === 'yes'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="relief_contacted"
                        value="no"
                        checked={formData.relief_contacted === 'no'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Any second mortgages or liens?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="liens"
                        value="yes"
                        checked={formData.liens === 'yes'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="liens"
                        value="no"
                        checked={formData.liens === 'no'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Problem Questions */}
          {currentSection === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's your biggest challenge in catching up on payments?
                </label>
                <textarea
                  name="challenge"
                  value={formData.challenge}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Please describe your main challenges..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's the emotional and financial impact on your family?
                </label>
                <textarea
                  name="impact"
                  value={formData.impact}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Please describe the impact..."
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Have you had difficulty getting assistance from your lender?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="lender_issue"
                        value="yes"
                        checked={formData.lender_issue === 'yes'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="lender_issue"
                        value="no"
                        checked={formData.lender_issue === 'no'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Do you feel your options are shrinking?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="options_narrowing"
                        value="yes"
                        checked={formData.options_narrowing === 'yes'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="options_narrowing"
                        value="no"
                        checked={formData.options_narrowing === 'no'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Have you worked with others (attorneys, realtors) for help?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="third_party_help"
                        value="yes"
                        checked={formData.third_party_help === 'yes'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="third_party_help"
                        value="no"
                        checked={formData.third_party_help === 'no'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Are you feeling overwhelmed or unsure of next steps?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="overwhelmed"
                        value="yes"
                        checked={formData.overwhelmed === 'yes'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="overwhelmed"
                        value="no"
                        checked={formData.overwhelmed === 'no'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-gray-700">No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Implication Questions */}
          {currentSection === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How will this situation affect your credit and future housing options?
                </label>
                <textarea
                  name="implication_credit"
                  value={formData.implication_credit}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Please describe your concerns..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would be the impact of losing the home?
                </label>
                <textarea
                  name="implication_loss"
                  value={formData.implication_loss}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Please describe the potential impact..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How long could you remain in the home if foreclosure proceeds?
                </label>
                <input
                  type="text"
                  name="implication_stay_duration"
                  value={formData.implication_stay_duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  placeholder="e.g., 3-6 months"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How might this affect your future ability to buy or rent?
                </label>
                <textarea
                  name="future_impact"
                  value={formData.future_impact}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Please describe your concerns..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What are your concerns about job security, savings, and financial stability?
                </label>
                <textarea
                  name="financial_risk"
                  value={formData.financial_risk}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Please describe your concerns..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Are you concerned about tax or legal consequences?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="legal_concerns"
                      value="yes"
                      checked={formData.legal_concerns === 'yes'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <span className="ml-2 text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="legal_concerns"
                      value="no"
                      checked={formData.legal_concerns === 'no'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <span className="ml-2 text-gray-700">No</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Need-Payoff Questions */}
          {currentSection === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  If you could sell and walk away with dignity, how would that feel?
                </label>
                <textarea
                  name="sell_feelings"
                  value={formData.sell_feelings}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Please share your thoughts..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How important is protecting your credit score?
                </label>
                <select
                  name="credit_importance"
                  value={formData.credit_importance}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                >
                  <option value="">Select importance level</option>
                  <option value="not">Not Important</option>
                  <option value="somewhat">Somewhat Important</option>
                  <option value="very">Very Important</option>
                </select>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    If a solution could stop foreclosure, would you be interested?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="interested_solution"
                        value="yes"
                        checked={formData.interested_solution === 'yes'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="ml-2 text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="interested_solution"
                        value="no"
                        checked={formData.interested_solution === 'no'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="ml-2 text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Would you find professional lender negotiation help useful?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="negotiation_help"
                        value="yes"
                        checked={formData.negotiation_help === 'yes'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="ml-2 text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="negotiation_help"
                        value="no"
                        checked={formData.negotiation_help === 'no'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="ml-2 text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    If this could be resolved in 30–60 days, would you feel peace of mind?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="resolution_peace"
                        value="yes"
                        checked={formData.resolution_peace === 'yes'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="ml-2 text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="resolution_peace"
                        value="no"
                        checked={formData.resolution_peace === 'no'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="ml-2 text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Are you open to reviewing personalized options?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="open_options"
                        value="yes"
                        checked={formData.open_options === 'yes'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="ml-2 text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="open_options"
                        value="no"
                        checked={formData.open_options === 'no'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="ml-2 text-gray-700">No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{submitError}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={prevSection}
              disabled={currentSection === 0}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentSection < sections.length - 1 ? (
              <button
                type="button"
                onClick={nextSection}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next Section
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};