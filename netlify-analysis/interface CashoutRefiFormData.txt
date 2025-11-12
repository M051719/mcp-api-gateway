import React, { useState } from 'react';
import { 
  DollarSign, 
  Home, 
  FileText, 
  Download, 
  Printer, 
  CheckCircle, 
  AlertTriangle,
  User,
  Calculator,
  TrendingUp,
  Shield,
  Clock,
  Building2
} from 'lucide-react';

interface CashoutRefiFormData {
  // Borrower Information
  borrowerName: string;
  borrowerAddress: string;
  borrowerPhone: string;
  borrowerEmail: string;
  borrowerSSN: string;
  borrowerDOB: string;
  borrowerEmployer: string;
  borrowerIncome: string;
  borrowerCreditScore: string;
  
  // Co-Borrower Information (if applicable)
  coBorrowerName: string;
  coBorrowerAddress: string;
  coBorrowerPhone: string;
  coBorrowerEmail: string;
  coBorrowerSSN: string;
  coBorrowerDOB: string;
  coBorrowerEmployer: string;
  coBorrowerIncome: string;
  coBorrowerCreditScore: string;
  
  // Property Information
  propertyAddress: string;
  propertyType: string;
  propertyValue: string;
  yearBuilt: string;
  squareFootage: string;
  occupancyType: string;
  propertyUse: string;
  
  // Current Loan Information
  currentLender: string;
  currentBalance: string;
  currentRate: string;
  currentPayment: string;
  originalLoanDate: string;
  
  // New Loan Information
  requestedLoanAmount: string;
  cashoutAmount: string;
  newLoanTerm: string;
  desiredRate: string;
  loanProgram: string;
  
  // Financial Information
  monthlyIncome: string;
  monthlyDebts: string;
  assets: string;
  liabilities: string;
  
  // Cash-Out Purpose
  cashoutPurpose: string;
  purposeDetails: string;
  
  // Lender Information
  lenderName: string;
  lenderAddress: string;
  lenderPhone: string;
  lenderEmail: string;
  loanOfficer: string;
  lenderLicense: string;
}

const initialFormData: CashoutRefiFormData = {
  borrowerName: '',
  borrowerAddress: '',
  borrowerPhone: '',
  borrowerEmail: '',
  borrowerSSN: '',
  borrowerDOB: '',
  borrowerEmployer: '',
  borrowerIncome: '',
  borrowerCreditScore: '',
  coBorrowerName: '',
  coBorrowerAddress: '',
  coBorrowerPhone: '',
  coBorrowerEmail: '',
  coBorrowerSSN: '',
  coBorrowerDOB: '',
  coBorrowerEmployer: '',
  coBorrowerIncome: '',
  coBorrowerCreditScore: '',
  propertyAddress: '',
  propertyType: 'single-family',
  propertyValue: '',
  yearBuilt: '',
  squareFootage: '',
  occupancyType: 'owner-occupied',
  propertyUse: 'primary-residence',
  currentLender: '',
  currentBalance: '',
  currentRate: '',
  currentPayment: '',
  originalLoanDate: '',
  requestedLoanAmount: '',
  cashoutAmount: '',
  newLoanTerm: '360',
  desiredRate: '',
  loanProgram: 'conventional',
  monthlyIncome: '',
  monthlyDebts: '',
  assets: '',
  liabilities: '',
  cashoutPurpose: 'home-improvement',
  purposeDetails: '',
  lenderName: '',
  lenderAddress: '',
  lenderPhone: '',
  lenderEmail: '',
  loanOfficer: '',
  lenderLicense: ''
};

export const CashoutRefiForm: React.FC = () => {
  const [formData, setFormData] = useState<CashoutRefiFormData>(initialFormData);
  const [currentSection, setCurrentSection] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [hasCoBorrower, setHasCoBorrower] = useState(false);

  const sections = [
    { title: 'Borrower Information', icon: User, color: 'blue' },
    { title: 'Property Details', icon: Home, color: 'green' },
    { title: 'Current Loan Info', icon: FileText, color: 'yellow' },
    { title: 'New Loan Terms', icon: Calculator, color: 'purple' },
    { title: 'Financial Profile', icon: TrendingUp, color: 'indigo' },
    { title: 'Lender & Purpose', icon: Building2, color: 'red' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateDocument = async () => {
    setIsGenerating(true);
    
    // Simulate document generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const document = generateCashoutRefiDocument(formData);
    setGeneratedDocument(document);
    setIsGenerating(false);
  };

  const downloadDocument = () => {
    if (!generatedDocument) return;
    
    const blob = new Blob([generatedDocument], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashout-refi-application-${formData.borrowerName.replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printDocument = () => {
    if (!generatedDocument) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatedDocument);
      printWindow.document.close();
      printWindow.print();
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
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      indigo: 'bg-indigo-500',
      red: 'bg-red-500',
    };
    return colors[color as keyof typeof colors];
  };

  if (generatedDocument) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Cash-Out Refinance Application Generated!</h2>
              <p className="text-gray-600">Your comprehensive refinance documentation is ready for submission.</p>
            </div>

            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={downloadDocument}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                Download HTML
              </button>
              <button
                onClick={printDocument}
                className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Printer className="w-5 h-5 mr-2" />
                Print Application
              </button>
              <button
                onClick={() => setGeneratedDocument(null)}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileText className="w-5 h-5 mr-2" />
                Create New Application
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: generatedDocument }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Cash-Out Refinance Application Generator
          </h1>
          <p className="text-xl text-gray-600">
            Professional mortgage refinance documentation with cash-out provisions
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
                      className={`h-1 w-16 mx-2 transition-all duration-300 ${
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
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Section 0: Borrower Information */}
          {currentSection === 0 && (
            <div className="space-y-8">
              {/* Primary Borrower */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Primary Borrower Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="borrowerName"
                      value={formData.borrowerName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Social Security Number *
                    </label>
                    <input
                      type="text"
                      name="borrowerSSN"
                      value={formData.borrowerSSN}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="XXX-XX-XXXX"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="borrowerDOB"
                      value={formData.borrowerDOB}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="borrowerPhone"
                      value={formData.borrowerPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="borrowerEmail"
                      value={formData.borrowerEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credit Score (estimated)
                    </label>
                    <input
                      type="number"
                      name="borrowerCreditScore"
                      value={formData.borrowerCreditScore}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="750"
                      min="300"
                      max="850"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Address *
                    </label>
                    <input
                      type="text"
                      name="borrowerAddress"
                      value={formData.borrowerAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="123 Main Street, City, State 12345"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employer *
                    </label>
                    <input
                      type="text"
                      name="borrowerEmployer"
                      value={formData.borrowerEmployer}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="ABC Company"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Income *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        name="borrowerIncome"
                        value={formData.borrowerIncome}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="75000"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Co-Borrower Toggle */}
              <div className="border-t border-gray-200 pt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hasCoBorrower}
                    onChange={(e) => setHasCoBorrower(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Add Co-Borrower Information
                  </span>
                </label>
              </div>

              {/* Co-Borrower Information */}
              {hasCoBorrower && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-green-600" />
                    Co-Borrower Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="coBorrowerName"
                        value={formData.coBorrowerName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="Jane Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Social Security Number
                      </label>
                      <input
                        type="text"
                        name="coBorrowerSSN"
                        value={formData.coBorrowerSSN}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="XXX-XX-XXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="coBorrowerDOB"
                        value={formData.coBorrowerDOB}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Annual Income
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="number"
                          name="coBorrowerIncome"
                          value={formData.coBorrowerIncome}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                          placeholder="65000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 1: Property Details */}
          {currentSection === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Address *
                  </label>
                  <input
                    type="text"
                    name="propertyAddress"
                    value={formData.propertyAddress}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="456 Oak Street, City, State 12345"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    required
                  >
                    <option value="single-family">Single Family Home</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="condo">Condominium</option>
                    <option value="duplex">Duplex</option>
                    <option value="multi-family">Multi-Family (3-4 units)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Property Value *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="propertyValue"
                      value={formData.propertyValue}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="450000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year Built
                  </label>
                  <input
                    type="number"
                    name="yearBuilt"
                    value={formData.yearBuilt}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="1995"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Square Footage
                  </label>
                  <input
                    type="number"
                    name="squareFootage"
                    value={formData.squareFootage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="2500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Occupancy Type *
                  </label>
                  <select
                    name="occupancyType"
                    value={formData.occupancyType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    required
                  >
                    <option value="owner-occupied">Owner Occupied</option>
                    <option value="second-home">Second Home</option>
                    <option value="investment">Investment Property</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Use *
                  </label>
                  <select
                    name="propertyUse"
                    value={formData.propertyUse}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    required
                  >
                    <option value="primary-residence">Primary Residence</option>
                    <option value="vacation-home">Vacation Home</option>
                    <option value="rental-property">Rental Property</option>
                    <option value="fix-and-flip">Fix and Flip</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Current Loan Information */}
          {currentSection === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Lender *
                  </label>
                  <input
                    type="text"
                    name="currentLender"
                    value={formData.currentLender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                    placeholder="ABC Mortgage Company"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Loan Balance *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="currentBalance"
                      value={formData.currentBalance}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                      placeholder="280000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Interest Rate (%) *
                  </label>
                  <input
                    type="number"
                    name="currentRate"
                    value={formData.currentRate}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                    placeholder="6.50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Monthly Payment *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="currentPayment"
                      value={formData.currentPayment}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                      placeholder="1850"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Loan Date
                  </label>
                  <input
                    type="date"
                    name="originalLoanDate"
                    value={formData.originalLoanDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Current Loan Information</h4>
                    <p className="text-yellow-800 text-sm mt-1">
                      Provide accurate information about your existing mortgage. This will be verified during the application process.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: New Loan Terms */}
          {currentSection === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requested Loan Amount *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="requestedLoanAmount"
                      value={formData.requestedLoanAmount}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="360000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cash-Out Amount *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="cashoutAmount"
                      value={formData.cashoutAmount}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="80000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Term (months) *
                  </label>
                  <select
                    name="newLoanTerm"
                    value={formData.newLoanTerm}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    required
                  >
                    <option value="360">30 Years (360 months)</option>
                    <option value="300">25 Years (300 months)</option>
                    <option value="240">20 Years (240 months)</option>
                    <option value="180">15 Years (180 months)</option>
                    <option value="120">10 Years (120 months)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desired Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    name="desiredRate"
                    value={formData.desiredRate}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="5.75"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Program *
                  </label>
                  <select
                    name="loanProgram"
                    value={formData.loanProgram}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    required
                  >
                    <option value="conventional">Conventional</option>
                    <option value="fha">FHA</option>
                    <option value="va">VA</option>
                    <option value="usda">USDA</option>
                    <option value="jumbo">Jumbo</option>
                    <option value="portfolio">Portfolio</option>
                  </select>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Calculator className="w-5 h-5 text-purple-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900">Loan-to-Value Calculation</h4>
                    <p className="text-purple-800 text-sm mt-1">
                      Most cash-out refinances are limited to 80% LTV for primary residences, 75% for second homes, and 70% for investment properties.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Financial Profile */}
          {currentSection === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Monthly Income *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="monthlyIncome"
                      value={formData.monthlyIncome}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      placeholder="8500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Monthly Debts *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="monthlyDebts"
                      value={formData.monthlyDebts}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      placeholder="2500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Assets *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="assets"
                      value={formData.assets}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      placeholder="150000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Liabilities *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="liabilities"
                      value={formData.liabilities}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      placeholder="320000"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-start">
                  <TrendingUp className="w-5 h-5 text-indigo-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-indigo-900">Financial Qualification</h4>
                    <p className="text-indigo-800 text-sm mt-1">
                      Lenders typically require a debt-to-income ratio below 43% and sufficient assets to cover closing costs and reserves.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Lender & Purpose */}
          {currentSection === 5 && (
            <div className="space-y-8">
              {/* Cash-Out Purpose */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-red-600" />
                  Cash-Out Purpose
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Purpose *
                    </label>
                    <select
                      name="cashoutPurpose"
                      value={formData.cashoutPurpose}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      required
                    >
                      <option value="home-improvement">Home Improvement</option>
                      <option value="debt-consolidation">Debt Consolidation</option>
                      <option value="investment">Investment Property Purchase</option>
                      <option value="education">Education Expenses</option>
                      <option value="business">Business Investment</option>
                      <option value="emergency">Emergency Fund</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purpose Details *
                    </label>
                    <textarea
                      name="purposeDetails"
                      value={formData.purposeDetails}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none"
                      placeholder="Detailed description of how the cash-out funds will be used..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Lender Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-red-600" />
                  Lender Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lender Name
                    </label>
                    <input
                      type="text"
                      name="lenderName"
                      value={formData.lenderName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="XYZ Mortgage Company"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Officer Name
                    </label>
                    <input
                      type="text"
                      name="loanOfficer"
                      value={formData.loanOfficer}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lender Phone
                    </label>
                    <input
                      type="tel"
                      name="lenderPhone"
                      value={formData.lenderPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="(555) 987-6543"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lender Email
                    </label>
                    <input
                      type="email"
                      name="lenderEmail"
                      value={formData.lenderEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="loans@xyzmortgage.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lender Address
                    </label>
                    <input
                      type="text"
                      name="lenderAddress"
                      value={formData.lenderAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="789 Lender Street, City, State 12345"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lender License Number
                    </label>
                    <input
                      type="text"
                      name="lenderLicense"
                      value={formData.lenderLicense}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="NMLS123456"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Important Disclosure</h4>
                    <p className="text-red-800 text-sm mt-1">
                      Cash-out refinancing increases your loan balance and may result in higher monthly payments. Consider the long-term financial impact before proceeding.
                    </p>
                  </div>
                </div>
              </div>
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
                type="button"
                onClick={generateDocument}
                disabled={isGenerating}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating Application...' : 'Generate Application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function generateCashoutRefiDocument(data: CashoutRefiFormData): string {
  const currentDate = new Date().toLocaleDateString();
  const propertyValue = parseFloat(data.propertyValue) || 0;
  const requestedLoan = parseFloat(data.requestedLoanAmount) || 0;
  const currentBalance = parseFloat(data.currentBalance) || 0;
  const cashOut = parseFloat(data.cashoutAmount) || 0;
  const ltv = propertyValue > 0 ? ((requestedLoan / propertyValue) * 100).toFixed(2) : '0';
  const monthlyIncome = parseFloat(data.monthlyIncome) || 0;
  const monthlyDebts = parseFloat(data.monthlyDebts) || 0;
  const dti = monthlyIncome > 0 ? ((monthlyDebts / monthlyIncome) * 100).toFixed(2) : '0';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cash-Out Refinance Application</title>
    <style>
        body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #000; max-width: 8.5in; margin: 0 auto; padding: 1in; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #000; padding-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { font-size: 16px; margin-bottom: 5px; }
        .section { margin: 25px 0; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 5px; }
        .clause { margin: 15px 0; }
        .clause-title { font-weight: bold; margin-bottom: 5px; }
        .borrower-info { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 20px 0; }
        .financial-summary { background: #f5f5f5; padding: 15px; border: 1px solid #ccc; margin: 20px 0; }
        .signature-section { margin-top: 50px; }
        .signature-line { border-bottom: 1px solid #000; width: 300px; margin: 30px 0 10px 0; }
        .checkbox { margin-right: 8px; }
        .important { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 15px 0; }
        .legal-notice { background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; margin: 20px 0; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background: #f5f5f5; font-weight: bold; }
        .page-break { page-break-before: always; }
        @media print { .page-break { page-break-before: always; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">CASH-OUT REFINANCE APPLICATION</div>
        <div class="subtitle">Mortgage Refinancing with Cash-Out Proceeds</div>
        <div class="subtitle">Application Date: ${currentDate}</div>
    </div>

    <div class="section">
        <div class="section-title">1. BORROWER INFORMATION</div>
        <div class="borrower-info">
            <div>
                <strong>PRIMARY BORROWER:</strong><br>
                Name: ${data.borrowerName}<br>
                SSN: ${data.borrowerSSN}<br>
                DOB: ${data.borrowerDOB ? new Date(data.borrowerDOB).toLocaleDateString() : 'Not provided'}<br>
                Phone: ${data.borrowerPhone}<br>
                Email: ${data.borrowerEmail}<br>
                Address: ${data.borrowerAddress}<br>
                Employer: ${data.borrowerEmployer}<br>
                Annual Income: $${parseFloat(data.borrowerIncome || '0').toLocaleString()}<br>
                Credit Score: ${data.borrowerCreditScore || 'TBD'}
            </div>
            ${data.coBorrowerName ? `
            <div>
                <strong>CO-BORROWER:</strong><br>
                Name: ${data.coBorrowerName}<br>
                SSN: ${data.coBorrowerSSN}<br>
                DOB: ${data.coBorrowerDOB ? new Date(data.coBorrowerDOB).toLocaleDateString() : 'Not provided'}<br>
                Employer: ${data.coBorrowerEmployer}<br>
                Annual Income: $${parseFloat(data.coBorrowerIncome || '0').toLocaleString()}<br>
                Credit Score: ${data.coBorrowerCreditScore || 'TBD'}
            </div>
            ` : '<div><em>No Co-Borrower</em></div>'}
        </div>
    </div>

    <div class="section">
        <div class="section-title">2. PROPERTY INFORMATION</div>
        <table>
            <tr><th>Property Details</th><th>Information</th></tr>
            <tr><td>Property Address</td><td>${data.propertyAddress}</td></tr>
            <tr><td>Property Type</td><td>${data.propertyType}</td></tr>
            <tr><td>Current Value</td><td>$${propertyValue.toLocaleString()}</td></tr>
            <tr><td>Year Built</td><td>${data.yearBuilt || 'TBD'}</td></tr>
            <tr><td>Square Footage</td><td>${data.squareFootage || 'TBD'}</td></tr>
            <tr><td>Occupancy Type</td><td>${data.occupancyType}</td></tr>
            <tr><td>Property Use</td><td>${data.propertyUse}</td></tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">3. CURRENT LOAN INFORMATION</div>
        <table>
            <tr><th>Current Loan Details</th><th>Information</th></tr>
            <tr><td>Current Lender</td><td>${data.currentLender}</td></tr>
            <tr><td>Current Balance</td><td>$${currentBalance.toLocaleString()}</td></tr>
            <tr><td>Current Interest Rate</td><td>${data.currentRate}%</td></tr>
            <tr><td>Current Monthly Payment</td><td>$${parseFloat(data.currentPayment || '0').toLocaleString()}</td></tr>
            <tr><td>Original Loan Date</td><td>${data.originalLoanDate ? new Date(data.originalLoanDate).toLocaleDateString() : 'Not provided'}</td></tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">4. NEW LOAN REQUEST</div>
        <div class="financial-summary">
            <table>
                <tr><th>New Loan Details</th><th>Amount/Terms</th></tr>
                <tr><td><strong>Requested Loan Amount</strong></td><td><strong>$${requestedLoan.toLocaleString()}</strong></td></tr>
                <tr><td>Cash-Out Amount</td><td>$${cashOut.toLocaleString()}</td></tr>
                <tr><td>Loan Term</td><td>${data.newLoanTerm} months</td></tr>
                <tr><td>Desired Interest Rate</td><td>${data.desiredRate || 'Market Rate'}%</td></tr>
                <tr><td>Loan Program</td><td>${data.loanProgram}</td></tr>
                <tr><td><strong>Loan-to-Value Ratio</strong></td><td><strong>${ltv}%</strong></td></tr>
            </table>
        </div>
        <div class="clause">
            <div class="clause-title">Cash-Out Calculation:</div>
            <table>
                <tr><td>New Loan Amount</td><td>$${requestedLoan.toLocaleString()}</td></tr>
                <tr><td>Less: Current Balance Payoff</td><td>($${currentBalance.toLocaleString()})</td></tr>
                <tr><td>Less: Estimated Closing Costs</td><td>($${Math.round(requestedLoan * 0.02).toLocaleString()})</td></tr>
                <tr><td><strong>Net Cash to Borrower</strong></td><td><strong>$${(requestedLoan - currentBalance - (requestedLoan * 0.02)).toLocaleString()}</strong></td></tr>
            </table>
        </div>
    </div>

    <div class="section">
        <div class="section-title">5. FINANCIAL PROFILE</div>
        <div class="financial-summary">
            <table>
                <tr><th>Financial Information</th><th>Amount</th></tr>
                <tr><td>Total Monthly Income</td><td>$${monthlyIncome.toLocaleString()}</td></tr>
                <tr><td>Total Monthly Debts</td><td>$${monthlyDebts.toLocaleString()}</td></tr>
                <tr><td><strong>Debt-to-Income Ratio</strong></td><td><strong>${dti}%</strong></td></tr>
                <tr><td>Total Assets</td><td>$${parseFloat(data.assets || '0').toLocaleString()}</td></tr>
                <tr><td>Total Liabilities</td><td>$${parseFloat(data.liabilities || '0').toLocaleString()}</td></tr>
                <tr><td><strong>Net Worth</strong></td><td><strong>$${(parseFloat(data.assets || '0') - parseFloat(data.liabilities || '0')).toLocaleString()}</strong></td></tr>
            </table>
        </div>
    </div>

    <div class="page-break"></div>

    <div class="section">
        <div class="section-title">6. CASH-OUT PURPOSE</div>
        <div class="clause">
            <div class="clause-title">Primary Purpose:</div>
            ${data.cashoutPurpose}
        </div>
        <div class="clause">
            <div class="clause-title">Detailed Purpose:</div>
            ${data.purposeDetails}
        </div>
        <div class="important">
            <strong>CASH-OUT DISCLOSURE:</strong> The borrower acknowledges that this refinance will increase the loan balance and may result in higher monthly payments. The cash-out proceeds will be used for the stated purpose above.
        </div>
    </div>

    <div class="section">
        <div class="section-title">7. LENDER INFORMATION</div>
        <table>
            <tr><th>Lender Details</th><th>Information</th></tr>
            <tr><td>Lender Name</td><td>${data.lenderName || 'To be determined'}</td></tr>
            <tr><td>Loan Officer</td><td>${data.loanOfficer || 'To be assigned'}</td></tr>
            <tr><td>Phone Number</td><td>${data.lenderPhone || 'TBD'}</td></tr>
            <tr><td>Email Address</td><td>${data.lenderEmail || 'TBD'}</td></tr>
            <tr><td>Address</td><td>${data.lenderAddress || 'TBD'}</td></tr>
            <tr><td>License Number</td><td>${data.lenderLicense || 'TBD'}</td></tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">8. LOAN TERMS AND CONDITIONS</div>
        <div class="clause">
            <div class="clause-title">Interest Rate:</div>
            The interest rate will be determined based on market conditions, borrower qualifications, and loan program selected at the time of rate lock.
        </div>
        <div class="clause">
            <div class="clause-title">Loan-to-Value Limits:</div>
            Cash-out refinances are typically limited to 80% LTV for primary residences, 75% for second homes, and 70% for investment properties.
        </div>
        <div class="clause">
            <div class="clause-title">Qualification Requirements:</div>
            Borrower must meet all lender requirements including credit score, debt-to-income ratio, employment verification, and asset documentation.
        </div>
        <div class="clause">
            <div class="clause-title">Closing Costs:</div>
            Borrower is responsible for all closing costs including but not limited to: appraisal, title insurance, recording fees, and lender fees.
        </div>
    </div>

    <div class="section">
        <div class="section-title">9. REQUIRED DISCLOSURES</div>
        <div class="clause">
            <div class="clause-title">Right of Rescission:</div>
            For owner-occupied properties, borrower has the right to cancel this transaction within three business days after closing.
        </div>
        <div class="clause">
            <div class="clause-title">Property Appraisal:</div>
            An independent appraisal will be required to determine current property value. Loan approval is contingent upon satisfactory appraisal.
        </div>
        <div class="clause">
            <div class="clause-title">Flood Insurance:</div>
            If property is located in a flood zone, flood insurance will be required as a condition of the loan.
        </div>
        <div class="clause">
            <div class="clause-title">Private Mortgage Insurance:</div>
            PMI may be required if the loan-to-value ratio exceeds 80% for conventional loans.
        </div>
    </div>

    <div class="section">
        <div class="section-title">10. BORROWER ACKNOWLEDGMENTS</div>
        <div class="clause">
            <input type="checkbox" class="checkbox"> I/We acknowledge that this application is for a cash-out refinance that will increase my/our loan balance.
        </div>
        <div class="clause">
            <input type="checkbox" class="checkbox"> I/We understand that the cash-out proceeds will be used for the stated purpose and may have tax implications.
        </div>
        <div class="clause">
            <input type="checkbox" class="checkbox"> I/We acknowledge that all information provided is true and accurate to the best of my/our knowledge.
        </div>
        <div class="clause">
            <input type="checkbox" class="checkbox"> I/We understand that providing false information may result in loan denial or criminal prosecution.
        </div>
        <div class="clause">
            <input type="checkbox" class="checkbox"> I/We authorize the lender to verify all information provided and obtain credit reports.
        </div>
        <div class="clause">
            <input type="checkbox" class="checkbox"> I/We have received and reviewed all required loan disclosures.
        </div>
    </div>

    <div class="legal-notice">
        <strong>IMPORTANT LEGAL NOTICE:</strong> This application is subject to credit approval and property appraisal. All loan terms are subject to change based on market conditions and borrower qualifications. This document does not constitute a loan commitment. Consult with qualified financial and legal professionals before proceeding with any refinance transaction.
    </div>

    <div class="signature-section">
        <div class="section-title">11. SIGNATURES</div>
        
        <div style="margin: 40px 0;">
            <strong>PRIMARY BORROWER:</strong><br><br>
            <div class="signature-line"></div>
            ${data.borrowerName}<br>
            Date: _______________<br>
            SSN: ${data.borrowerSSN}
        </div>

        ${data.coBorrowerName ? `
        <div style="margin: 40px 0;">
            <strong>CO-BORROWER:</strong><br><br>
            <div class="signature-line"></div>
            ${data.coBorrowerName}<br>
            Date: _______________<br>
            SSN: ${data.coBorrowerSSN}
        </div>
        ` : ''}

        <div style="margin: 40px 0;">
            <strong>LOAN OFFICER:</strong><br><br>
            <div class="signature-line"></div>
            ${data.loanOfficer || 'Loan Officer Name'}<br>
            Date: _______________<br>
            NMLS ID: ${data.lenderLicense || 'NMLS#'}
        </div>
    </div>

    <div class="legal-notice">
        <strong>PRIVACY NOTICE:</strong> The information provided in this application is confidential and will be used solely for the purpose of evaluating the loan request. The lender will protect borrower information in accordance with applicable privacy laws and regulations.
    </div>
</body>
</html>
  `;
}