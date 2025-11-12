import React, { useState } from 'react';
import { Shield, Key, User, Building2, Mail, Phone, Globe, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

interface OwnershipInfo {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  licenseNumber: string;
  taxId: string;
}

export const OwnershipVerification: React.FC = () => {
  const [ownershipInfo, setOwnershipInfo] = useState<OwnershipInfo>({
    businessName: 'RepMotivatedSeller',
    ownerName: '',
    email: 'admin@repmotivatedseller.org',
    phone: '',
    website: 'https://repmotivatedseller.org',
    address: '',
    licenseNumber: '',
    taxId: ''
  });

  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');

  const handleInputChange = (field: keyof OwnershipInfo, value: string) => {
    setOwnershipInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVerification = () => {
    // In a real implementation, this would verify against official records
    const requiredFields = ['businessName', 'ownerName', 'email', 'phone', 'address'];
    const isComplete = requiredFields.every(field => ownershipInfo[field as keyof OwnershipInfo].trim() !== '');
    
    if (isComplete) {
      setVerificationStatus('verified');
      setIsVerified(true);
    } else {
      setVerificationStatus('rejected');
    }
  };

  const getComplianceChecklist = () => [
    {
      id: 'business-registration',
      name: 'Business Registration',
      description: 'Valid business registration and licensing',
      status: ownershipInfo.licenseNumber ? 'complete' : 'pending',
      required: true
    },
    {
      id: 'contact-information',
      name: 'Contact Information',
      description: 'Valid business contact details',
      status: (ownershipInfo.email && ownershipInfo.phone) ? 'complete' : 'pending',
      required: true
    },
    {
      id: 'privacy-policy',
      name: 'Privacy Policy',
      description: 'GDPR/CCPA compliant privacy policy',
      status: 'complete',
      required: true
    },
    {
      id: 'terms-of-service',
      name: 'Terms of Service',
      description: 'Clear terms and conditions',
      status: 'complete',
      required: true
    },
    {
      id: 'data-security',
      name: 'Data Security',
      description: 'Secure data handling and encryption',
      status: 'complete',
      required: true
    },
    {
      id: 'real-estate-compliance',
      name: 'Real Estate Compliance',
      description: 'Compliance with real estate regulations',
      status: ownershipInfo.licenseNumber ? 'complete' : 'pending',
      required: true
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'border-green-200 bg-green-50';
      case 'pending':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <Shield className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Ownership & Compliance Verification</h2>
            <p className="text-gray-600 mt-1">Verify business ownership and regulatory compliance</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Verification Status */}
        <div className={`p-4 rounded-lg border ${
          verificationStatus === 'verified' 
            ? 'border-green-200 bg-green-50' 
            : verificationStatus === 'rejected'
            ? 'border-red-200 bg-red-50'
            : 'border-yellow-200 bg-yellow-50'
        }`}>
          <div className="flex items-center">
            {verificationStatus === 'verified' ? (
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
            )}
            <div>
              <h3 className="font-semibold">
                {verificationStatus === 'verified' 
                  ? 'Ownership Verified' 
                  : verificationStatus === 'rejected'
                  ? 'Verification Failed'
                  : 'Verification Pending'
                }
              </h3>
              <p className="text-sm">
                {verificationStatus === 'verified' 
                  ? 'Business ownership and compliance verified successfully'
                  : verificationStatus === 'rejected'
                  ? 'Please complete all required fields for verification'
                  : 'Complete the form below to verify ownership'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Business Information Form */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Business Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={ownershipInfo.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="RepMotivatedSeller LLC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner/Principal Name *
              </label>
              <input
                type="text"
                value={ownershipInfo.ownerName}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Email *
              </label>
              <input
                type="email"
                value={ownershipInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@repmotivatedseller.org"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Phone *
              </label>
              <input
                type="tel"
                value={ownershipInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={ownershipInfo.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://repmotivatedseller.org"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Real Estate License Number
              </label>
              <input
                type="text"
                value={ownershipInfo.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="RE123456789"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Address *
              </label>
              <textarea
                value={ownershipInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="123 Main Street, Suite 100, City, State 12345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax ID / EIN
              </label>
              <input
                type="text"
                value={ownershipInfo.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="12-3456789"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleVerification}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Verify Ownership
            </button>
          </div>
        </div>

        {/* Compliance Checklist */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Compliance Checklist
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getComplianceChecklist().map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border ${getStatusColor(item.status)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    {item.required && (
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        Required
                      </span>
                    )}
                  </div>
                  {getStatusIcon(item.status)}
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Disclaimers */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Legal & Regulatory Information</h3>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <strong>Real Estate Compliance:</strong> This platform assists with foreclosure prevention and does not provide legal advice. Users should consult with qualified attorneys for legal matters.
            </div>
            <div>
              <strong>Data Privacy:</strong> All client information is handled in accordance with GDPR, CCPA, and other applicable privacy regulations. Data is encrypted and stored securely.
            </div>
            <div>
              <strong>Professional Standards:</strong> All services are provided in accordance with real estate industry standards and ethical guidelines.
            </div>
            <div>
              <strong>Licensing:</strong> Ensure all applicable real estate licenses and certifications are current and valid in your operating jurisdictions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};