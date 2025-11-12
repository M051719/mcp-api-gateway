import React from 'react';
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-400 mr-3" />
              <span className="text-xl font-bold">RepMotivatedSeller</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Professional real estate analysis tools and foreclosure assistance services. 
              Helping property investors and homeowners make informed decisions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/foreclosure" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Foreclosure Assistance
                </Link>
              </li>
              <li>
                <Link to="/contracts" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Wholesale Contracts
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Property Analysis
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Investment Tools
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Market Reports
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Video Tutorials
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Case Studies
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Mail className="w-4 h-4 mr-3 text-blue-400" />
                <span className="text-sm">help@repmotivatedseller.org</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="w-4 h-4 mr-3 text-blue-400" />
                <span className="text-sm">(555) 123-4567</span>
              </div>
              <div className="flex items-start text-gray-300">
                <MapPin className="w-4 h-4 mr-3 mt-1 text-blue-400" />
                <div className="text-sm">
                  123 Main Street<br />
                  Suite 100<br />
                  Your City, State 12345
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financing Information */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 mb-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                🏦 Private Money Financing Available
              </h3>
              <p className="text-blue-100 mb-4">
                Residential & Multifamily Investment Properties • Non-Owner Occupied • Borrower Entity Required
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white/10 rounded p-2">
                  <div className="font-semibold">Loan Amount</div>
                  <div className="text-blue-200">$30K - FHA Cap</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <div className="font-semibold">Rate</div>
                  <div className="text-blue-200">8% - 15%</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <div className="font-semibold">Term</div>
                  <div className="text-blue-200">6-24 Months</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <div className="font-semibold">LTV</div>
                  <div className="text-blue-200">Up to 90%</div>
                </div>
              </div>
              <p className="text-xs text-blue-200 mt-3">
                Available in 36 states • Excludes: MN, NV, SD, UT, VT • Broker fees subject to underwriting
              </p>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap justify-center md:justify-start space-x-6">
              <Link 
                to="/privacy-policy" 
                className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms-of-service" 
                className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
              >
                Terms of Service
              </Link>
              <a 
                href="#" 
                className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
              >
                Cookie Policy
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
              >
                Accessibility
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
              >
                Sitemap
              </a>
            </div>
            <div className="text-gray-400 text-sm">
              © {currentYear} RepMotivatedSeller. All rights reserved.
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="border-t border-gray-800 mt-6 pt-6">
          <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
            <p className="text-yellow-200 text-xs leading-relaxed">
              <strong>Legal Disclaimer:</strong> RepMotivatedSeller provides informational tools and services. 
              Our contract templates, analysis tools, and foreclosure assistance information are for educational 
              purposes only and do not constitute legal, financial, or professional advice. Laws vary by state 
              and locality. Always consult with qualified attorneys, financial advisors, and real estate 
              professionals before making important decisions. We assume no liability for the use of our services 
              or templates.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

