import React from 'react';
import { FileText, Scale, Shield, AlertTriangle, CheckCircle, Users, Building2, Mail, Phone, MapPin } from 'lucide-react';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Scale className="w-12 h-12 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            These terms govern your use of RepMotivatedSeller's services and platform. 
            Please read them carefully before using our services.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Acceptance of Terms */}
          <section>
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Acceptance of Terms</h2>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">
                By accessing or using RepMotivatedSeller's website, services, or platform, you agree to be bound 
                by these Terms of Service and all applicable laws and regulations. If you do not agree with any 
                of these terms, you are prohibited from using our services.
              </p>
            </div>
          </section>

          {/* Services Description */}
          <section>
            <div className="flex items-center mb-4">
              <Building2 className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Our Services</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">
                RepMotivatedSeller provides real estate analysis tools, foreclosure assistance services, 
                contract generation, and related professional services. Our platform includes:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Core Services</h3>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>Foreclosure assistance and consultation</li>
                    <li>Real estate contract generation</li>
                    <li>Property analysis and valuation tools</li>
                    <li>Investment property calculations</li>
                  </ul>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">Additional Features</h3>
                  <ul className="list-disc list-inside space-y-1 text-purple-800">
                    <li>Professional document templates</li>
                    <li>Market analysis and reporting</li>
                    <li>Client management tools</li>
                    <li>Educational resources and guides</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">User Responsibilities</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Account Security</h3>
                <ul className="list-disc list-inside space-y-1 text-purple-800">
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Use strong passwords and enable two-factor authentication</li>
                  <li>You are responsible for all activities under your account</li>
                </ul>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 mb-2">Acceptable Use</h3>
                <ul className="list-disc list-inside space-y-1 text-orange-800">
                  <li>Use services only for lawful purposes</li>
                  <li>Provide accurate and complete information</li>
                  <li>Respect intellectual property rights</li>
                  <li>Do not attempt to disrupt or compromise our systems</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Prohibited Activities */}
          <section>
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Prohibited Activities</h2>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 mb-3">You may not use our services to:</p>
              <ul className="list-disc list-inside space-y-1 text-red-800">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful, offensive, or illegal content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated tools to scrape or harvest data</li>
                <li>Impersonate others or provide false information</li>
                <li>Interfere with other users' access to our services</li>
                <li>Use our services for fraudulent or deceptive purposes</li>
              </ul>
            </div>
          </section>

          {/* Professional Disclaimers */}
          <section>
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-yellow-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Professional Disclaimers</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Not Legal Advice</h3>
                <p className="text-yellow-800">
                  Our services, including contract templates and foreclosure assistance information, 
                  are for informational purposes only and do not constitute legal advice. Always 
                  consult with qualified attorneys for legal matters.
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Not Financial Advice</h3>
                <p className="text-yellow-800">
                  Property analysis tools and investment calculations are educational resources. 
                  Consult with licensed financial advisors before making investment decisions.
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Professional Review Required</h3>
                <p className="text-yellow-800">
                  All generated documents and contracts should be reviewed by qualified professionals 
                  before use in actual transactions.
                </p>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-indigo-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Intellectual Property</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-900 mb-2">Our Rights</h3>
                <p className="text-indigo-800 mb-2">
                  All content, features, and functionality of our platform are owned by RepMotivatedSeller 
                  and are protected by copyright, trademark, and other intellectual property laws.
                </p>
                <ul className="list-disc list-inside space-y-1 text-indigo-800">
                  <li>Website design, layout, and user interface</li>
                  <li>Software, algorithms, and proprietary tools</li>
                  <li>Content, text, graphics, and multimedia</li>
                  <li>Trademarks, logos, and brand elements</li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Your Rights</h3>
                <p className="text-green-800">
                  You retain ownership of any content you submit to our platform. By using our services, 
                  you grant us a limited license to use your content to provide our services.
                </p>
              </div>
            </div>
          </section>

          {/* Payment Terms */}
          <section>
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Payment Terms</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Subscription Services</h3>
                <ul className="list-disc list-inside space-y-1 text-green-800">
                  <li>Monthly or annual billing cycles</li>
                  <li>Automatic renewal unless cancelled</li>
                  <li>Pro-rated refunds for downgrades</li>
                  <li>No refunds for partial months</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Payment Processing</h3>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Secure payment processing via Stripe</li>
                  <li>Major credit cards accepted</li>
                  <li>Failed payments may suspend service</li>
                  <li>Update payment methods in account settings</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Limitation of Liability</h2>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 mb-3">
                <strong>IMPORTANT:</strong> To the maximum extent permitted by law, RepMotivatedSeller 
                shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
              </p>
              <ul className="list-disc list-inside space-y-1 text-red-800">
                <li>Loss of profits, data, or business opportunities</li>
                <li>Damages resulting from use of our services</li>
                <li>Third-party actions or content</li>
                <li>Service interruptions or technical issues</li>
                <li>Errors in generated documents or calculations</li>
              </ul>
            </div>
          </section>

          {/* Indemnification */}
          <section>
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Indemnification</h2>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-800">
                You agree to indemnify and hold harmless RepMotivatedSeller from any claims, damages, 
                or expenses arising from your use of our services, violation of these terms, or 
                infringement of any rights of another party.
              </p>
            </div>
          </section>

          {/* Termination */}
          <section>
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Termination</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 mb-2">By You</h3>
                <p className="text-orange-800">
                  You may terminate your account at any time by contacting us or using the account 
                  cancellation feature. Paid subscriptions will continue until the end of the billing period.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">By Us</h3>
                <p className="text-red-800">
                  We may terminate or suspend your account immediately for violations of these terms, 
                  illegal activities, or other reasons at our sole discretion.
                </p>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <div className="flex items-center mb-4">
              <Scale className="w-6 h-6 text-gray-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Governing Law</h2>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700">
                These Terms of Service are governed by and construed in accordance with the laws of 
                [Your State/Country]. Any disputes arising from these terms will be resolved in the 
                courts of [Your Jurisdiction].
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Changes to Terms</h2>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                We reserve the right to modify these terms at any time. We will notify users of 
                material changes by posting the updated terms on our website and updating the 
                "Last Updated" date. Continued use of our services constitutes acceptance of the new terms.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <div className="flex items-center mb-4">
              <Mail className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-green-800 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-green-800">
                  <Mail className="w-5 h-5 mr-3" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <div>legal@repmotivatedseller.org</div>
                  </div>
                </div>
                <div className="flex items-center text-green-800">
                  <Phone className="w-5 h-5 mr-3" />
                  <div>
                    <div className="font-semibold">Phone</div>
                    <div>(555) 123-4567</div>
                  </div>
                </div>
                <div className="flex items-start text-green-800 md:col-span-2">
                  <MapPin className="w-5 h-5 mr-3 mt-1" />
                  <div>
                    <div className="font-semibold">Mailing Address</div>
                    <div>
                      RepMotivatedSeller<br />
                      Legal Department<br />
                      123 Main Street, Suite 100<br />
                      Your City, State 12345
                    </div>
                  </div>
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

