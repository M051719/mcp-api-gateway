import React, { useState } from 'react';
import { 
  Home, 
  DollarSign, 
  Calendar, 
  FileText, 
  Download, 
  Printer, 
  CheckCircle, 
  AlertTriangle,
  User,
  MapPin,
  Wrench,
  TrendingUp,
  Shield,
  Clock
} from 'lucide-react';

interface FixFlipFormData {
  // Property Information
  propertyAddress: string;
  legalDescription: string;
  parcelNumber: string;
  propertyType: string;
  yearBuilt: string;
  squareFootage: string;
  bedrooms: string;
  bathrooms: string;
  lotSize: string;
  zoning: string;
  
  // Seller Information
  sellerName: string;
  sellerAddress: string;
  sellerPhone: string;
  sellerEmail: string;
  sellerEntityType: string;
  
  // Buyer/Flipper Information
  buyerName: string;
  buyerAddress: string;
  buyerPhone: string;
  buyerEmail: string;
  buyerEntityType: string;
  buyerLicense: string;
  
  // Financial Terms
  purchasePrice: string;
  earnestMoney: string;
  downPayment: string;
  financingType: string;
  loanAmount: string;
  interestRate: string;
  loanTerm: string;
  
  // Renovation Details
  estimatedRehabCost: string;
  rehabTimeline: string;
  contractorLicense: string;
  permitRequired: string;
  renovationScope: string;
  
  // Market Analysis
  afterRepairValue: string;
  comparableSales: string;
  marketConditions: string;
  holdingPeriod: string;
  
  // Contingencies
  inspectionPeriod: string;
  financingContingency: string;
  appraisalContingency: string;
  titleContingency: string;
  
  // Closing Details
  closingDate: string;
  closingLocation: string;
  titleCompany: string;
  
  // Legal Protections
  disclosures: string[];
  warranties: string[];
  defaultRemedies: string[];
}

const initialFormData: FixFlipFormData = {
  propertyAddress: '',
  legalDescription: '',
  parcelNumber: '',
  propertyType: 'single-family',
  yearBuilt: '',
  squareFootage: '',
  bedrooms: '',
  bathrooms: '',
  lotSize: '',
  zoning: '',
  sellerName: '',
  sellerAddress: '',
  sellerPhone: '',
  sellerEmail: '',
  sellerEntityType: 'individual',
  buyerName: '',
  buyerAddress: '',
  buyerPhone: '',
  buyerEmail: '',
  buyerEntityType: 'individual',
  buyerLicense: '',
  purchasePrice: '',
  earnestMoney: '',
  downPayment: '',
  financingType: 'conventional',
  loanAmount: '',
  interestRate: '',
  loanTerm: '',
  estimatedRehabCost: '',
  rehabTimeline: '',
  contractorLicense: '',
  permitRequired: 'yes',
  renovationScope: '',
  afterRepairValue: '',
  comparableSales: '',
  marketConditions: 'stable',
  holdingPeriod: '',
  inspectionPeriod: '10',
  financingContingency: '30',
  appraisalContingency: '21',
  titleContingency: '30',
  closingDate: '',
  closingLocation: '',
  titleCompany: '',
  disclosures: [],
  warranties: [],
  defaultRemedies: []
};

export const FixFlipContractForm: React.FC = () => {
  const [formData, setFormData] = useState<FixFlipFormData>(initialFormData);
  const [currentSection, setCurrentSection] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContract, setGeneratedContract] = useState<string | null>(null);

  const sections = [
    { title: 'Property Details', icon: Home, color: 'blue' },
    { title: 'Party Information', icon: User, color: 'green' },
    { title: 'Financial Terms', icon: DollarSign, color: 'yellow' },
    { title: 'Renovation Plan', icon: Wrench, color: 'purple' },
    { title: 'Market Analysis', icon: TrendingUp, color: 'indigo' },
    { title: 'Contingencies & Closing', icon: Shield, color: 'red' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (field: keyof FixFlipFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof FixFlipFormData].includes(value)
        ? (prev[field as keyof FixFlipFormData] as string[]).filter(item => item !== value)
        : [...(prev[field as keyof FixFlipFormData] as string[]), value]
    }));
  };

  const generateContract = async () => {
    setIsGenerating(true);
    
    // Simulate contract generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const contract = generateFixFlipContract(formData);
    setGeneratedContract(contract);
    setIsGenerating(false);
  };

  const downloadContract = () => {
    if (!generatedContract) return;
    
    const blob = new Blob([generatedContract], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fix-flip-contract-${formData.propertyAddress.replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printContract = () => {
    if (!generatedContract) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatedContract);
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

  if (generatedContract) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Contract Generated Successfully!</h2>
              <p className="text-gray-600">Your fix-and-flip purchase agreement is ready for review and execution.</p>
            </div>

            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={downloadContract}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                Download HTML
              </button>
              <button
                onClick={printContract}
                className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Printer className="w-5 h-5 mr-2" />
                Print Contract
              </button>
              <button
                onClick={() => setGeneratedContract(null)}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileText className="w-5 h-5 mr-2" />
                Create New Contract
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: generatedContract }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Fix-and-Flip Purchase Agreement Generator
          </h1>
          <p className="text-xl text-gray-600">
            Professional real estate contracts with renovation and resale protections
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
          {/* Section 0: Property Details */}
          {currentSection === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="propertyAddress"
                      value={formData.propertyAddress}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="123 Main Street, City, State 12345"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Legal Description
                  </label>
                  <textarea
                    name="legalDescription"
                    value={formData.legalDescription}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Lot 1, Block 2, Subdivision Name, as recorded in Plat Book..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parcel Number
                  </label>
                  <input
                    type="text"
                    name="parcelNumber"
                    value={formData.parcelNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="123-456-789-000"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                    Year Built
                  </label>
                  <input
                    type="number"
                    name="yearBuilt"
                    value={formData.yearBuilt}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="1985"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="2000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="3"
                    min="0"
                    max="20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    step="0.5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="2.5"
                    min="0"
                    max="20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lot Size (sq ft)
                  </label>
                  <input
                    type="number"
                    name="lotSize"
                    value={formData.lotSize}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="8000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zoning
                  </label>
                  <input
                    type="text"
                    name="zoning"
                    value={formData.zoning}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="R-1 (Residential Single Family)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Party Information */}
          {currentSection === 1 && (
            <div className="space-y-8">
              {/* Seller Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Seller Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seller Name/Entity *
                    </label>
                    <input
                      type="text"
                      name="sellerName"
                      value={formData.sellerName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="John Doe or ABC Properties LLC"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entity Type
                    </label>
                    <select
                      name="sellerEntityType"
                      value={formData.sellerEntityType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    >
                      <option value="individual">Individual</option>
                      <option value="llc">LLC</option>
                      <option value="corporation">Corporation</option>
                      <option value="partnership">Partnership</option>
                      <option value="trust">Trust</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seller Address *
                    </label>
                    <input
                      type="text"
                      name="sellerAddress"
                      value={formData.sellerAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="456 Oak Street, City, State 12345"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="sellerPhone"
                      value={formData.sellerPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
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
                      name="sellerEmail"
                      value={formData.sellerEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="seller@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Buyer Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Home className="w-5 h-5 mr-2 text-green-600" />
                  Buyer/Flipper Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buyer Name/Entity *
                    </label>
                    <input
                      type="text"
                      name="buyerName"
                      value={formData.buyerName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Jane Smith or XYZ Investments LLC"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entity Type
                    </label>
                    <select
                      name="buyerEntityType"
                      value={formData.buyerEntityType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    >
                      <option value="individual">Individual</option>
                      <option value="llc">LLC</option>
                      <option value="corporation">Corporation</option>
                      <option value="partnership">Partnership</option>
                      <option value="trust">Trust</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buyer Address *
                    </label>
                    <input
                      type="text"
                      name="buyerAddress"
                      value={formData.buyerAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="789 Pine Street, City, State 12345"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="buyerPhone"
                      value={formData.buyerPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="(555) 987-6543"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="buyerEmail"
                      value={formData.buyerEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="buyer@example.com"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Real Estate License Number (if applicable)
                    </label>
                    <input
                      type="text"
                      name="buyerLicense"
                      value={formData.buyerLicense}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="RE123456789"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Financial Terms */}
          {currentSection === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Price *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="purchasePrice"
                      value={formData.purchasePrice}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                      placeholder="250000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Earnest Money *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="earnestMoney"
                      value={formData.earnestMoney}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                      placeholder="5000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Down Payment
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="downPayment"
                      value={formData.downPayment}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                      placeholder="50000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Financing Type
                  </label>
                  <select
                    name="financingType"
                    value={formData.financingType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                  >
                    <option value="cash">Cash Purchase</option>
                    <option value="conventional">Conventional Loan</option>
                    <option value="hard-money">Hard Money Loan</option>
                    <option value="private-lender">Private Lender</option>
                    <option value="portfolio">Portfolio Loan</option>
                    <option value="seller-financing">Seller Financing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="loanAmount"
                      value={formData.loanAmount}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                      placeholder="200000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    name="interestRate"
                    value={formData.interestRate}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                    placeholder="7.50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Term (months)
                  </label>
                  <input
                    type="number"
                    name="loanTerm"
                    value={formData.loanTerm}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                    placeholder="360"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Financial Terms Notice</h4>
                    <p className="text-yellow-800 text-sm mt-1">
                      All financial terms are subject to loan approval and appraisal. Hard money and private lending terms may vary significantly from conventional financing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Renovation Plan */}
          {currentSection === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Rehab Cost *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="estimatedRehabCost"
                      value={formData.estimatedRehabCost}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="75000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Renovation Timeline (months) *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="rehabTimeline"
                      value={formData.rehabTimeline}
                      onChange={handleInputChange}
                      step="0.5"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="6"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contractor License Number
                  </label>
                  <input
                    type="text"
                    name="contractorLicense"
                    value={formData.contractorLicense}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="GC123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permits Required *
                  </label>
                  <select
                    name="permitRequired"
                    value={formData.permitRequired}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    required
                  >
                    <option value="yes">Yes - Permits Required</option>
                    <option value="no">No - Cosmetic Only</option>
                    <option value="unknown">To Be Determined</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Renovation Scope *
                  </label>
                  <textarea
                    name="renovationScope"
                    value={formData.renovationScope}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Detailed description of planned renovations: kitchen remodel, bathroom updates, flooring, paint, HVAC, electrical, plumbing, etc."
                    required
                  />
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Wrench className="w-5 h-5 text-purple-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900">Renovation Planning Notice</h4>
                    <p className="text-purple-800 text-sm mt-1">
                      All renovation costs are estimates. Actual costs may vary based on unforeseen conditions, permit requirements, and material price fluctuations. Consider adding 10-20% contingency to your budget.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Market Analysis */}
          {currentSection === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    After Repair Value (ARV) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="afterRepairValue"
                      value={formData.afterRepairValue}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      placeholder="400000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Market Conditions
                  </label>
                  <select
                    name="marketConditions"
                    value={formData.marketConditions}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  >
                    <option value="strong-seller">Strong Seller's Market</option>
                    <option value="seller">Seller's Market</option>
                    <option value="balanced">Balanced Market</option>
                    <option value="buyer">Buyer's Market</option>
                    <option value="strong-buyer">Strong Buyer's Market</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Holding Period (months)
                  </label>
                  <input
                    type="number"
                    name="holdingPeriod"
                    value={formData.holdingPeriod}
                    onChange={handleInputChange}
                    step="0.5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="9"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comparable Sales Analysis
                  </label>
                  <textarea
                    name="comparableSales"
                    value={formData.comparableSales}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                    placeholder="List recent comparable sales that support the ARV: Address, sale price, date, square footage, condition, etc."
                  />
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-start">
                  <TrendingUp className="w-5 h-5 text-indigo-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-indigo-900">Market Analysis Notice</h4>
                    <p className="text-indigo-800 text-sm mt-1">
                      ARV estimates should be based on recent comparable sales of similar properties in similar condition. Market conditions can significantly impact sale timeline and final sale price.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Contingencies & Closing */}
          {currentSection === 5 && (
            <div className="space-y-8">
              {/* Contingencies */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-red-600" />
                  Contingencies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Inspection Period (days) *
                    </label>
                    <input
                      type="number"
                      name="inspectionPeriod"
                      value={formData.inspectionPeriod}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="10"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Financing Contingency (days)
                    </label>
                    <input
                      type="number"
                      name="financingContingency"
                      value={formData.financingContingency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appraisal Contingency (days)
                    </label>
                    <input
                      type="number"
                      name="appraisalContingency"
                      value={formData.appraisalContingency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="21"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title Contingency (days)
                    </label>
                    <input
                      type="number"
                      name="titleContingency"
                      value={formData.titleContingency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="30"
                    />
                  </div>
                </div>
              </div>

              {/* Closing Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-red-600" />
                  Closing Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Closing Date *
                    </label>
                    <input
                      type="date"
                      name="closingDate"
                      value={formData.closingDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title Company
                    </label>
                    <input
                      type="text"
                      name="titleCompany"
                      value={formData.titleCompany}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="ABC Title & Escrow Company"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Closing Location
                    </label>
                    <input
                      type="text"
                      name="closingLocation"
                      value={formData.closingLocation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="123 Title Street, City, State 12345"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Important Legal Notice</h4>
                    <p className="text-red-800 text-sm mt-1">
                      This contract includes standard real estate contingencies and protections. All dates are calendar days unless otherwise specified. Time is of the essence for all deadlines.
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
                onClick={generateContract}
                disabled={isGenerating}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating Contract...' : 'Generate Contract'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function generateFixFlipContract(data: FixFlipFormData): string {
  const currentDate = new Date().toLocaleDateString();
  const purchasePrice = parseFloat(data.purchasePrice) || 0;
  const rehabCost = parseFloat(data.estimatedRehabCost) || 0;
  const arv = parseFloat(data.afterRepairValue) || 0;
  const totalInvestment = purchasePrice + rehabCost;
  const projectedProfit = arv - totalInvestment;
  const roi = totalInvestment > 0 ? ((projectedProfit / totalInvestment) * 100).toFixed(2) : '0';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fix-and-Flip Purchase Agreement</title>
    <style>
        body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #000; max-width: 8.5in; margin: 0 auto; padding: 1in; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #000; padding-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { font-size: 16px; margin-bottom: 5px; }
        .section { margin: 25px 0; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 5px; }
        .clause { margin: 15px 0; }
        .clause-title { font-weight: bold; margin-bottom: 5px; }
        .party-info { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 20px 0; }
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
        <div class="title">FIX-AND-FLIP REAL ESTATE PURCHASE AGREEMENT</div>
        <div class="subtitle">Investment Property Acquisition Contract</div>
        <div class="subtitle">Date: ${currentDate}</div>
    </div>

    <div class="section">
        <div class="section-title">1. PARTIES TO THE AGREEMENT</div>
        <div class="party-info">
            <div>
                <strong>SELLER:</strong><br>
                Name/Entity: ${data.sellerName}<br>
                Entity Type: ${data.sellerEntityType}<br>
                Address: ${data.sellerAddress}<br>
                Phone: ${data.sellerPhone}<br>
                Email: ${data.sellerEmail}
            </div>
            <div>
                <strong>BUYER/INVESTOR:</strong><br>
                Name/Entity: ${data.buyerName}<br>
                Entity Type: ${data.buyerEntityType}<br>
                Address: ${data.buyerAddress}<br>
                Phone: ${data.buyerPhone}<br>
                Email: ${data.buyerEmail}<br>
                ${data.buyerLicense ? `License: ${data.buyerLicense}` : ''}
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">2. PROPERTY DESCRIPTION</div>
        <div class="clause">
            <div class="clause-title">Property Address:</div>
            ${data.propertyAddress}
        </div>
        <div class="clause">
            <div class="clause-title">Legal Description:</div>
            ${data.legalDescription || 'To be provided by title company'}
        </div>
        <table>
            <tr><th>Property Details</th><th>Information</th></tr>
            <tr><td>Parcel Number</td><td>${data.parcelNumber || 'TBD'}</td></tr>
            <tr><td>Property Type</td><td>${data.propertyType}</td></tr>
            <tr><td>Year Built</td><td>${data.yearBuilt || 'TBD'}</td></tr>
            <tr><td>Square Footage</td><td>${data.squareFootage || 'TBD'}</td></tr>
            <tr><td>Bedrooms</td><td>${data.bedrooms || 'TBD'}</td></tr>
            <tr><td>Bathrooms</td><td>${data.bathrooms || 'TBD'}</td></tr>
            <tr><td>Lot Size</td><td>${data.lotSize || 'TBD'} sq ft</td></tr>
            <tr><td>Zoning</td><td>${data.zoning || 'TBD'}</td></tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">3. PURCHASE PRICE AND FINANCIAL TERMS</div>
        <div class="financial-summary">
            <table>
                <tr><th>Financial Component</th><th>Amount</th></tr>
                <tr><td><strong>Purchase Price</strong></td><td><strong>$${purchasePrice.toLocaleString()}</strong></td></tr>
                <tr><td>Earnest Money Deposit</td><td>$${parseFloat(data.earnestMoney || '0').toLocaleString()}</td></tr>
                <tr><td>Down Payment</td><td>$${parseFloat(data.downPayment || '0').toLocaleString()}</td></tr>
                <tr><td>Loan Amount</td><td>$${parseFloat(data.loanAmount || '0').toLocaleString()}</td></tr>
                <tr><td>Financing Type</td><td>${data.financingType}</td></tr>
                ${data.interestRate ? `<tr><td>Interest Rate</td><td>${data.interestRate}%</td></tr>` : ''}
                ${data.loanTerm ? `<tr><td>Loan Term</td><td>${data.loanTerm} months</td></tr>` : ''}
            </table>
        </div>
        <div class="clause">
            <div class="clause-title">Payment Terms:</div>
            The earnest money deposit shall be held in escrow by the title company and applied toward the purchase price at closing. The balance of the purchase price shall be paid in cash or certified funds at closing, subject to financing contingencies if applicable.
        </div>
    </div>

    <div class="section">
        <div class="section-title">4. RENOVATION AND INVESTMENT ANALYSIS</div>
        <div class="financial-summary">
            <table>
                <tr><th>Investment Analysis</th><th>Amount</th></tr>
                <tr><td>Purchase Price</td><td>$${purchasePrice.toLocaleString()}</td></tr>
                <tr><td>Estimated Rehab Cost</td><td>$${rehabCost.toLocaleString()}</td></tr>
                <tr><td><strong>Total Investment</strong></td><td><strong>$${totalInvestment.toLocaleString()}</strong></td></tr>
                <tr><td>After Repair Value (ARV)</td><td>$${arv.toLocaleString()}</td></tr>
                <tr><td><strong>Projected Profit</strong></td><td><strong>$${projectedProfit.toLocaleString()}</strong></td></tr>
                <tr><td><strong>Projected ROI</strong></td><td><strong>${roi}%</strong></td></tr>
            </table>
        </div>
        <div class="clause">
            <div class="clause-title">Renovation Details:</div>
            <strong>Timeline:</strong> ${data.rehabTimeline} months<br>
            <strong>Permits Required:</strong> ${data.permitRequired}<br>
            ${data.contractorLicense ? `<strong>Contractor License:</strong> ${data.contractorLicense}<br>` : ''}
            <strong>Scope of Work:</strong> ${data.renovationScope}
        </div>
        <div class="important">
            <strong>INVESTMENT DISCLOSURE:</strong> The renovation costs and timeline are estimates only. Actual costs may vary due to unforeseen conditions, permit requirements, material costs, and market conditions. Buyer acknowledges the speculative nature of fix-and-flip investments.
        </div>
    </div>

    <div class="page-break"></div>

    <div class="section">
        <div class="section-title">5. CONTINGENCIES AND BUYER PROTECTIONS</div>
        <div class="clause">
            <div class="clause-title">A. Inspection Contingency:</div>
            Buyer shall have ${data.inspectionPeriod} calendar days from the effective date to conduct inspections of the property. Buyer may terminate this agreement for any reason during the inspection period by providing written notice to Seller.
        </div>
        <div class="clause">
            <div class="clause-title">B. Financing Contingency:</div>
            ${data.financingContingency ? `This agreement is contingent upon Buyer obtaining financing within ${data.financingContingency} calendar days. If financing is not obtained, Buyer may terminate this agreement and receive a full refund of earnest money.` : 'This is a cash purchase with no financing contingency.'}
        </div>
        <div class="clause">
            <div class="clause-title">C. Appraisal Contingency:</div>
            ${data.appraisalContingency ? `If the property appraises for less than the purchase price, Buyer may terminate this agreement within ${data.appraisalContingency} calendar days of receiving the appraisal report.` : 'No appraisal contingency applies to this transaction.'}
        </div>
        <div class="clause">
            <div class="clause-title">D. Title Contingency:</div>
            This agreement is contingent upon Buyer's approval of the title commitment within ${data.titleContingency || 30} calendar days. Seller shall provide marketable title free of liens and encumbrances except as noted.
        </div>
    </div>

    <div class="section">
        <div class="section-title">6. CLOSING PROVISIONS</div>
        <div class="clause">
            <div class="clause-title">Closing Date:</div>
            ${data.closingDate ? new Date(data.closingDate).toLocaleDateString() : 'To be determined'}
        </div>
        <div class="clause">
            <div class="clause-title">Closing Location:</div>
            ${data.closingLocation || 'To be determined by title company'}
        </div>
        <div class="clause">
            <div class="clause-title">Title Company:</div>
            ${data.titleCompany || 'To be selected by mutual agreement'}
        </div>
        <div class="clause">
            <div class="clause-title">Closing Costs:</div>
            Each party shall pay their respective closing costs as customary in the jurisdiction where the property is located. Buyer shall pay for title insurance, loan costs, and recording fees. Seller shall pay for deed preparation and any required inspections.
        </div>
    </div>

    <div class="section">
        <div class="section-title">7. DEFAULT AND REMEDIES</div>
        <div class="clause">
            <div class="clause-title">Seller Default:</div>
            If Seller defaults, Buyer may: (a) terminate this agreement and receive return of earnest money plus reasonable expenses, (b) seek specific performance, or (c) pursue other legal remedies available at law or equity.
        </div>
        <div class="clause">
            <div class="clause-title">Buyer Default:</div>
            If Buyer defaults without legal excuse, Seller may retain the earnest money as liquidated damages, provided such amount does not exceed 3% of the purchase price.
        </div>
        <div class="clause">
            <div class="clause-title">Time is of the Essence:</div>
            Time is of the essence for all dates and deadlines in this agreement. Failure to perform by specified dates may constitute default.
        </div>
    </div>

    <div class="section">
        <div class="section-title">8. DISCLOSURES AND WARRANTIES</div>
        <div class="clause">
            <div class="clause-title">Property Condition:</div>
            Seller warrants that the property will be in substantially the same condition at closing as on the date of this agreement, reasonable wear and tear excepted. Seller shall maintain the property and not remove any fixtures without Buyer's consent.
        </div>
        <div class="clause">
            <div class="clause-title">Lead-Based Paint Disclosure:</div>
            ${data.yearBuilt && parseInt(data.yearBuilt) < 1978 ? 
                'Property was built before 1978. Federal law requires disclosure of known lead-based paint hazards. Seller has provided required disclosures and Buyer acknowledges receipt.' : 
                'Property was built in 1978 or later; lead-based paint disclosure not required.'}
        </div>
        <div class="clause">
            <div class="clause-title">Investment Property Disclosure:</div>
            Buyer acknowledges this is an investment property purchase for fix-and-flip purposes. Buyer is an experienced investor or has consulted with qualified professionals regarding the risks and requirements of real estate investment.
        </div>
        <div class="clause">
            <div class="clause-title">Market Conditions:</div>
            Current market conditions are characterized as: ${data.marketConditions}. Buyer acknowledges that market conditions may change and affect the property's resale value and timeline.
        </div>
    </div>

    <div class="page-break"></div>

    <div class="section">
        <div class="section-title">9. GENERAL PROVISIONS</div>
        <div class="clause">
            <div class="clause-title">Governing Law:</div>
            This agreement shall be governed by the laws of the state where the property is located.
        </div>
        <div class="clause">
            <div class="clause-title">Dispute Resolution:</div>
            Any disputes arising from this agreement shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
        </div>
        <div class="clause">
            <div class="clause-title">Entire Agreement:</div>
            This agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements relating to the subject matter.
        </div>
        <div class="clause">
            <div class="clause-title">Amendments:</div>
            This agreement may only be amended in writing signed by both parties.
        </div>
        <div class="clause">
            <div class="clause-title">Severability:</div>
            If any provision of this agreement is deemed invalid or unenforceable, the remaining provisions shall remain in full force and effect.
        </div>
    </div>

    <div class="legal-notice">
        <strong>IMPORTANT LEGAL NOTICE:</strong> This is a legally binding contract. Both parties should seek independent legal counsel before signing. This form is provided for informational purposes only and does not constitute legal advice. Laws vary by state and locality. Consult with a qualified real estate attorney in your jurisdiction before using this agreement.
    </div>

    <div class="signature-section">
        <div class="section-title">10. SIGNATURES</div>
        
        <div style="margin: 40px 0;">
            <strong>SELLER:</strong><br><br>
            <div class="signature-line"></div>
            ${data.sellerName}<br>
            Date: _______________
        </div>

        <div style="margin: 40px 0;">
            <strong>BUYER/INVESTOR:</strong><br><br>
            <div class="signature-line"></div>
            ${data.buyerName}<br>
            Date: _______________
        </div>

        <div style="margin: 40px 0;">
            <strong>WITNESS:</strong><br><br>
            <div class="signature-line"></div>
            Print Name: ___________________________<br>
            Date: _______________
        </div>

        <div style="margin: 40px 0;">
            <strong>NOTARY PUBLIC:</strong><br><br>
            <div class="signature-line"></div>
            Notary Public Signature<br>
            My Commission Expires: _______________<br>
            [NOTARY SEAL]
        </div>
    </div>

    <div class="legal-notice">
        <strong>ACKNOWLEDGMENT:</strong> By signing below, both parties acknowledge they have read, understood, and agree to be bound by all terms and conditions of this Fix-and-Flip Real Estate Purchase Agreement. Each party acknowledges they have been advised to seek independent legal counsel and have either done so or voluntarily chosen to proceed without such counsel.
    </div>
</body>
</html>
  `;
}