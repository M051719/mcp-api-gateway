import React, { useState } from 'react';
import { DollarSign, X, MapPin, Home, Calendar, Percent, AlertTriangle, CheckCircle, Building } from 'lucide-react';

export const FinancingBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const availableStates = [
    'Washington', 'Montana', 'Wyoming', 'Colorado', 'New Mexico', 'Texas', 'Oklahoma', 
    'Kansas', 'Nebraska', 'Iowa', 'Missouri', 'Arkansas', 'Louisiana', 'Mississippi', 
    'Tennessee', 'Illinois', 'Wisconsin', 'Indiana', 'Maine', 'Michigan', 'Kentucky', 
    'Virginia', 'West Virginia', 'Pennsylvania', 'Alabama', 'Georgia', 'South Carolina', 
    'Florida', 'Delaware', 'Washington DC', 'New Hampshire', 'Massachusetts', 
    'Connecticut', 'Rhode Island', 'Maryland', 'Alaska', 'Hawaii'
  ];

  const excludedStates = ['Minnesota', 'Nevada', 'South Dakota', 'Utah', 'Vermont'];

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-6 h-6 text-yellow-300" />
              <div>
                <p className="font-semibold">
                  🏦 Private Money Financing Available Through RepMotivatedSeller
                </p>
                <p className="text-sm text-blue-100">
                  Residential & multifamily investment loans • 8-15% rates • $30K-FHA cap • 6-24 months
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {isExpanded ? 'Hide Details' : 'Learn More'}
              </button>
              <button
                onClick={() => setIsDismissed(true)}
                className="text-white/70 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-6 bg-white/10 rounded-lg p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Loan Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Home className="w-5 h-5 mr-2" />
                    Loan Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between bg-white/10 p-3 rounded">
                      <span className="font-medium">Property Type:</span>
                      <span>Non-Owner Occupied Investment Only</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/10 p-3 rounded">
                      <span className="font-medium">Loan Amount:</span>
                      <span>$30,000 to FHA Cap</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/10 p-3 rounded">
                      <span className="font-medium">Interest Rate:</span>
                      <span>8% - 15%</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/10 p-3 rounded">
                      <span className="font-medium">Term:</span>
                      <span>6 - 24 Months</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/10 p-3 rounded">
                      <span className="font-medium">Origination Points:</span>
                      <span>0 to 5</span>
                    </div>
                  </div>
                </div>

                {/* Property Requirements */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Property Requirements
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-white/10 p-3 rounded">
                      <div className="font-medium mb-2">Residential Properties (1-4 Units)</div>
                      <ul className="space-y-1 text-blue-100">
                        <li>• Single Family Residences</li>
                        <li>• Duplexes, Triplexes, Fourplexes</li>
                        <li>• Price not to exceed FHA cap for area</li>
                        <li>• Maximum 1/2 acre lot size</li>
                        <li>• Maximum 5 bedrooms, 3 bathrooms per unit</li>
                        <li>• Maximum 2,800 square feet per unit</li>
                      </ul>
                    </div>
                    <div className="bg-white/10 p-3 rounded">
                      <div className="font-medium mb-2">Multifamily & Commercial</div>
                      <ul className="space-y-1 text-blue-100">
                        <li>• Apartment buildings (5+ units)</li>
                        <li>• Multifamily dwelling complexes</li>
                        <li>• Mixed-use residential/commercial</li>
                        <li>• Student housing properties</li>
                        <li>• Senior living facilities</li>
                        <li>• Custom loan terms available</li>
                      </ul>
                    </div>
                    <div className="bg-white/10 p-3 rounded">
                      <div className="font-medium mb-2">Loan Parameters</div>
                      <ul className="space-y-1 text-blue-100">
                        <li>• 90% Purchase (Residential 1-4 units)</li>
                        <li>• 80% Purchase (Multifamily 5+ units)</li>
                        <li>• 70% Rehab (not to exceed 65% LTV)</li>
                        <li>• 50% Cash-out Refinance LTV</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Available States */}
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Available States (36 States)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
                    {availableStates.map((state) => (
                      <div key={state} className="bg-green-500/20 text-green-100 px-2 py-1 rounded text-center">
                        {state}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-red-300" />
                      Excluded States
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {excludedStates.map((state) => (
                        <div key={state} className="bg-red-500/20 text-red-200 px-2 py-1 rounded text-sm">
                          {state}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="lg:col-span-2 bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-100 mb-2">Important Notes</h4>
                  <ul className="text-sm text-yellow-200 space-y-1">
                    <li>• <strong>Investment Purpose Only:</strong> Acquisition, Cash-Out, Refinance, Rehab</li>
                    <li>• <strong>Borrower Entity Required:</strong> Must be made through a borrower entity</li>
                    <li>• <strong>Residential & Commercial Loans Available:</strong> 1-4 unit residential and multifamily properties</li>
                    <li>• <strong>No Minimum Credit Score:</strong> However, 680+ credit and 20%+ down payment strengthen applications</li>
                    <li>• <strong>General Appraiser Required:</strong> Professional appraisal mandatory</li>
                    <li>• <strong>Broker Fees:</strong> Paid subject to final underwriting and compliance with applicable law</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Apply for Private Money Financing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};




