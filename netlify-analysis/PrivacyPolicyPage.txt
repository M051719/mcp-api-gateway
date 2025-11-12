import React from 'react';
import { Shield, Mail, Phone, MapPin, Calendar, Lock, Eye, UserCheck, FileText, AlertTriangle } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how RepMotivatedSeller collects, 
            uses, and protects your personal information.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Information We Collect */}
          <section>
            <div className="flex items-center mb-4">
              <Eye className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Name, email address, and phone number</li>
                  <li>Property and financial information for foreclosure assistance</li>
                  <li>Communication preferences and contact history</li>
                  <li>Account credentials and authentication data</li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Usage Information</h3>
                <ul className="list-disc list-inside space-y-1 text-green-800">
                  <li>Website usage patterns and analytics</li>
                  <li>Device information and browser type</li>
                  <li>IP address and location data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <div className="flex items-center mb-4">
              <UserCheck className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Primary Uses</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Provide foreclosure assistance services</li>
                  <li>Process and respond to your inquiries</li>
                  <li>Generate real estate contracts and documents</li>
                  <li>Facilitate property analysis and valuations</li>
                  <li>Communicate about your case status</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Secondary Uses</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Improve our services and user experience</li>
                  <li>Send relevant updates and notifications</li>
                  <li>Comply with legal and regulatory requirements</li>
                  <li>Prevent fraud and ensure security</li>
                  <li>Analyze usage patterns and trends</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section>
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Information Sharing</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">We May Share Information With:</h3>
                <ul className="list-disc list-inside space-y-1 text-purple-800">
                  <li><strong>Service Providers:</strong> Third-party vendors who assist in providing our services</li>
                  <li><strong>Legal Professionals:</strong> Attorneys and legal advisors when necessary for your case</li>
                  <li><strong>Financial Partners:</strong> Lenders and financial institutions for loan processing</li>
                  <li><strong>Real Estate Professionals:</strong> Agents, appraisers, and other industry professionals</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">We Will Never:</h3>
                <ul className="list-disc list-inside space-y-1 text-red-800">
                  <li>Sell your personal information to third parties</li>
                  <li>Share your information for marketing purposes without consent</li>
                  <li>Disclose sensitive financial information unnecessarily</li>
                  <li>Use your information for purposes unrelated to our services</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center mb-4">
              <Lock className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Technical Safeguards</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>SSL/TLS encryption for data transmission</li>
                    <li>Secure database storage with encryption</li>
                    <li>Regular security audits and updates</li>
                    <li>Multi-factor authentication options</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Administrative Safeguards</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Limited access to personal information</li>
                    <li>Employee training on data protection</li>
                    <li>Regular privacy policy reviews</li>
                    <li>Incident response procedures</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <div className="flex items-center mb-4">
              <UserCheck className="w-6 h-6 text-indigo-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Your Privacy Rights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-900 mb-2">Access & Control</h3>
                <ul className="list-disc list-inside space-y-1 text-indigo-800">
                  <li>Request access to your personal information</li>
                  <li>Update or correct your information</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data in a portable format</li>
                </ul>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 mb-2">Communication Preferences</h3>
                <ul className="list-disc list-inside space-y-1 text-orange-800">
                  <li>Opt out of marketing communications</li>
                  <li>Choose notification preferences</li>
                  <li>Limit data collection and processing</li>
                  <li>Request information about data sharing</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <div className="flex items-center mb-4">
              <Eye className="w-6 h-6 text-yellow-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Cookies and Tracking</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                and provide personalized content. You can control cookie settings through your browser preferences.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Types of Cookies We Use:</h3>
                <ul className="list-disc list-inside space-y-1 text-yellow-800">
                  <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how you use our website</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Third-Party Services */}
          <section>
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-teal-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Third-Party Services</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">
                Our website may contain links to third-party services or integrate with external platforms. 
                These services have their own privacy policies, and we encourage you to review them.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-center">
                  <h3 className="font-semibold text-teal-900 mb-2">Analytics</h3>
                  <p className="text-teal-800 text-sm">Google Analytics for website usage insights</p>
                </div>
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-center">
                  <h3 className="font-semibold text-teal-900 mb-2">Email Services</h3>
                  <p className="text-teal-800 text-sm">MailerLite for email communications</p>
                </div>
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-center">
                  <h3 className="font-semibold text-teal-900 mb-2">Payment Processing</h3>
                  <p className="text-teal-800 text-sm">Stripe for secure payment handling</p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <div className="flex items-center mb-4">
              <Calendar className="w-6 h-6 text-pink-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Data Retention</h2>
            </div>
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <p className="text-pink-800 mb-3">
                We retain your personal information only as long as necessary to provide our services 
                and comply with legal obligations.
              </p>
              <ul className="list-disc list-inside space-y-1 text-pink-800">
                <li><strong>Active Accounts:</strong> Information retained while account is active</li>
                <li><strong>Closed Accounts:</strong> Data deleted within 30 days unless legally required</li>
                <li><strong>Legal Requirements:</strong> Some data may be retained longer for compliance</li>
                <li><strong>Anonymized Data:</strong> May be retained indefinitely for analytics</li>
              </ul>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Children's Privacy</h2>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                Our services are not intended for children under 18 years of age. We do not knowingly 
                collect personal information from children. If you believe we have collected information 
                from a child, please contact us immediately.
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section>
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-gray-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Changes to This Policy</h2>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700">
                We may update this privacy policy from time to time. We will notify you of any material 
                changes by posting the new policy on this page and updating the "Last Updated" date. 
                We encourage you to review this policy periodically.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <div className="flex items-center mb-4">
              <Mail className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-800 mb-4">
                If you have any questions about this privacy policy or our data practices, please contact us:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-blue-800">
                  <Mail className="w-5 h-5 mr-3" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <div>privacy@repmotivatedseller.org</div>
                  </div>
                </div>
                <div className="flex items-center text-blue-800">
                  <Phone className="w-5 h-5 mr-3" />
                  <div>
                    <div className="font-semibold">Phone</div>
                    <div>(555) 123-4567</div>
                  </div>
                </div>
                <div className="flex items-start text-blue-800 md:col-span-2">
                  <MapPin className="w-5 h-5 mr-3 mt-1" />
                  <div>
                    <div className="font-semibold">Mailing Address</div>
                    <div>
                      RepMotivatedSeller<br />
                      Privacy Officer<br />
                      123 Main Street, Suite 100<br />
                      Your City, State 12345
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <section className="border-t border-gray-200 pt-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">Legal Disclaimer</h3>
                  <p className="text-yellow-800 text-sm">
                    This privacy policy is provided for informational purposes and does not constitute legal advice. 
                    Laws and regulations may vary by jurisdiction. For specific legal questions, please consult 
                    with a qualified attorney.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};
