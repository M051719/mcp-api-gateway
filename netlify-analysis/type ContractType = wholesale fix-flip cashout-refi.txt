import React, { useState } from 'react';
import { FileText, Home, DollarSign, Wrench, TrendingUp, Building2, AlertTriangle, CheckCircle, Building } from 'lucide-react';
import { WholesaleContractForm } from '../components/Contracts/WholesaleContractForm';
import { FixFlipContractForm } from '../components/Contracts/FixFlipContractForm';
import { CashoutRefiForm } from '../components/Contracts/CashoutRefiForm';

type ContractType = 'wholesale' | 'fix-flip' | 'cashout-refi';

export const ContractsPage: React.FC = () => {
  const [selectedContract, setSelectedContract] = useState<ContractType | null>(null);

  const contractTypes = [
    {
      id: 'wholesale' as ContractType,
      title: 'Wholesale Real Estate Contract',
      description: 'Professional wholesale purchase agreements with assignment rights and $10,000+ fee protection',
      icon: FileText,
      color: 'blue',
      features: [
        'Minimum $10,000 wholesale fee protection',
        'Full assignment rights without seller consent',
        'Comprehensive legal protections',
        'State-compliant disclosures',
        'Professional contract language'
      ]
    },
    {
      id: 'fix-flip' as ContractType,
      title: 'Fix-and-Flip Purchase Agreement',
      description: 'Investment property contracts with renovation provisions and market analysis',
      icon: Wrench,
      color: 'purple',
      features: [
        'Renovation cost and timeline provisions',
        'After Repair Value (ARV) analysis',
        'Investment protection clauses',
        'Contractor and permit requirements',
        'Market condition assessments'
      ]
    },
    {
      id: 'cashout-refi' as ContractType,
      title: 'Cash-Out Refinance Application',
      description: 'Comprehensive mortgage refinance documentation with cash-out provisions',
      icon: TrendingUp,
      color: 'green',
      features: [
        'Complete borrower financial profile',
        'Loan-to-value calculations',
        'Cash-out purpose documentation',
        'Lender qualification requirements',
        'Regulatory compliance disclosures'
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-900',
        button: 'bg-blue-600 hover:bg-blue-700',
        icon: 'text-blue-600'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-900',
        button: 'bg-purple-600 hover:bg-purple-700',
        icon: 'text-purple-600'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-900',
        button: 'bg-green-600 hover:bg-green-700',
        icon: 'text-green-600'
      }
    };
    return colors[color as keyof typeof colors];
  };

  if (selectedContract === 'wholesale') {
    return <WholesaleContractForm />;
  }

  if (selectedContract === 'fix-flip') {
    return <FixFlipContractForm />;
  }

  if (selectedContract === 'cashout-refi') {
    return <CashoutRefiForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Building2 className="w-12 h-12 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">
              Professional Real Estate Contracts
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Generate production-ready legal documents with comprehensive protections, 
            regulatory compliance, and professional-grade contract language
          </p>
        </div>

        {/* Financing Notice */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 mb-12">
          <div className="text-center">
            <DollarSign className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">
              🏦 All Deals Financed Through RepMotivatedSeller
            </h2>
            <p className="text-lg mb-6 text-blue-100">
              Private Money Opportunity: Residential & Multifamily Investment Property Loans Available
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="font-semibold mb-2">Loan Amount</div>
                <div className="text-yellow-200">$30,000 to FHA Cap</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="font-semibold mb-2">Interest Rate</div>
                <div className="text-yellow-200">8% - 15%</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="font-semibold mb-2">Term</div>
                <div className="text-yellow-200">6 - 24 Months</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="font-semibold mb-2">LTV</div>
                <div className="text-yellow-200">Up to 90% Purchase</div>
              </div>
            </div>

            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-300 mr-3 mt-0.5" />
                <div className="text-left">
                  <div className="font-semibold text-yellow-100 mb-2">Important Requirements</div>
                  <ul className="text-sm text-yellow-200 space-y-1">
                    <li>• <strong>Non-Owner Occupied Investment Properties Only</strong></li>
                    <li>• <strong>Must be made through a borrower entity</strong></li>
                    <li>• <strong>Residential and Commercial Loans Available</strong></li>
                    <li>• Available in 36 states (excludes MN, NV, SD, UT, VT)</li>
                    <li>• Broker fees paid subject to final underwriting and compliance</li>
                  </ul>
                </div>
              </div>
            </div>

            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Apply for Private Money Financing
            </button>
          </div>
        </div>

        {/* Contract Type Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {contractTypes.map((contract) => {
            const Icon = contract.icon;
            const colors = getColorClasses(contract.color);
            
            return (
              <div
                key={contract.id}
                className={`${colors.bg} ${colors.border} border-2 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:scale-105`}
              >
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <Icon className={`w-8 h-8 ${colors.icon}`} />
                  </div>
                  <h3 className={`text-2xl font-bold ${colors.text} mb-2`}>
                    {contract.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {contract.description}
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {contract.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <div className={`w-2 h-2 ${colors.button.split(' ')[0]} rounded-full mt-2 mr-3 flex-shrink-0`} />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedContract(contract.id)}
                  className={`w-full ${colors.button} text-white py-3 px-6 rounded-lg font-medium transition-colors shadow-lg`}
                >
                  Create {contract.title.split(' ')[0]} Contract
                </button>
              </div>
            );
          })}
        </div>

        {/* Property Requirements */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Property Requirements & Loan Parameters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Home className="w-6 h-6 text-blue-600 mr-2" />
                Residential Properties (1-4 Units)
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Property Type:</span>
                  <span className="text-gray-700">Non-Owner Occupied SFR (1-4 Units)</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Price Limit:</span>
                  <span className="text-gray-700">Not to exceed FHA cap for area</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Lot Size:</span>
                  <span className="text-gray-700">1/2 acre maximum</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Bedrooms/Bathrooms:</span>
                  <span className="text-gray-700">5 bedroom / 3 bathroom maximum per unit</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Square Footage:</span>
                  <span className="text-gray-700">2,800 sq ft maximum per unit</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="w-6 h-6 text-purple-600 mr-2" />
                Multifamily & Commercial Properties
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">Apartment Buildings:</span>
                  <span className="text-purple-700">5+ units, custom terms</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">Multifamily Complexes:</span>
                  <span className="text-purple-700">Dwelling complexes, custom LTV</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">Mixed-Use:</span>
                  <span className="text-purple-700">Residential/commercial combination</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">Student Housing:</span>
                  <span className="text-purple-700">University area properties</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">Senior Living:</span>
                  <span className="text-purple-700">Assisted living facilities</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-6 h-6 text-green-600 mr-2" />
              Loan Parameters by Property Type
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Purchase (1-4 units):</span>
                <span className="text-green-700 font-semibold">90% LTV</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Purchase (5+ units):</span>
                <span className="text-blue-700 font-semibold">80% LTV</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="font-medium">Rehab:</span>
                <span className="text-orange-700 font-semibold">70% (≤65% LTV)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="font-medium">Cash-out Refinance:</span>
                <span className="text-purple-700 font-semibold">50% LTV</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Investment Purpose:</span>
                <span className="text-gray-700">Acquisition, Cash-Out, Refinance, Rehab</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Appraiser Level:</span>
                <span className="text-gray-700">General Appraiser Required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Professional Contract Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Legal Compliance</h3>
              <p className="text-gray-600 text-sm">
                All contracts meet state and federal regulatory requirements with proper disclosures
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Financial Protection</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive fee protection and financial safeguards for all parties
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Property Specific</h3>
              <p className="text-gray-600 text-sm">
                Tailored clauses for residential, multifamily, and commercial properties
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Professional Grade</h3>
              <p className="text-gray-600 text-sm">
                Industry-standard language suitable for professional real estate transactions
              </p>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">Important Legal Notice</h4>
              <p className="text-yellow-800 text-sm">
                These contract templates are provided for informational purposes only and do not constitute legal advice. 
                Laws vary by state and locality. It is strongly recommended that you consult with a qualified real estate 
                attorney in your jurisdiction before using any of these agreements. RepMotivatedSeller assumes no liability 
                for the use of these templates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
