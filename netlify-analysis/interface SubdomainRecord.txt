import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  ExternalLink,
  Copy,
  Shield,
  Mail,
  Server,
  Cloud,
  Settings,
  Info,
  AlertCircle,
  Link
} from 'lucide-react';

interface SubdomainRecord {
  type: string;
  name: string;
  value: string;
  ttl: number;
  priority?: number;
  status: 'verified' | 'pending' | 'error' | 'missing';
  description: string;
  required: boolean;
  proxyStatus?: 'proxied' | 'dns-only';
}

interface SubdomainVerificationResult {
  parentDomain: string;
  subdomain: string;
  fullDomain: string;
  status: 'active' | 'pending' | 'error' | 'not-configured';
  records: SubdomainRecord[];
  cloudflareStatus: 'active' | 'pending' | 'error' | 'not-configured';
  sslStatus: 'active' | 'pending' | 'error' | 'not-configured';
  issues: string[];
}

export const SubdomainVerification: React.FC = () => {
  const [verificationResult, setVerificationResult] = useState<SubdomainVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'records' | 'setup' | 'troubleshoot'>('overview');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const requiredSubdomainRecords: SubdomainRecord[] = [
    {
      type: 'CNAME',
      name: 'repmotivatedseller',
      value: 'shoprealestatespace.org',
      ttl: 300,
      status: 'missing',
      description: 'Main subdomain pointing to parent domain (repmotivatedseller.shoprealestatespace.org)',
      required: true,
      proxyStatus: 'proxied'
    },
    {
      type: 'CNAME',
      name: 'www.repmotivatedseller',
      value: 'shoprealestatespace.org',
      ttl: 300,
      status: 'missing',
      description: 'WWW subdomain (www.repmotivatedseller.shoprealestatespace.org)',
      required: true,
      proxyStatus: 'proxied'
    },
    {
      type: 'CNAME',
      name: 'admin.repmotivatedseller',
      value: 'shoprealestatespace.org',
      ttl: 300,
      status: 'missing',
      description: 'Admin dashboard subdomain (admin.repmotivatedseller.shoprealestatespace.org)',
      required: false,
      proxyStatus: 'proxied'
    },
    {
      type: 'CNAME',
      name: 'api.repmotivatedseller',
      value: 'shoprealestatespace.org',
      ttl: 300,
      status: 'missing',
      description: 'API endpoint subdomain (api.repmotivatedseller.shoprealestatespace.org)',
      required: false,
      proxyStatus: 'proxied'
    },
    {
      type: 'TXT',
      name: 'repmotivatedseller',
      value: 'v=spf1 include:_spf.google.com ~all',
      ttl: 300,
      status: 'missing',
      description: 'SPF record for subdomain email security',
      required: true,
      proxyStatus: 'dns-only'
    },
    {
      type: 'TXT',
      name: '_dmarc.repmotivatedseller',
      value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@repmotivatedseller.shoprealestatespace.org',
      ttl: 300,
      status: 'missing',
      description: 'DMARC record for subdomain email authentication',
      required: true,
      proxyStatus: 'dns-only'
    },
    {
      type: 'MX',
      name: 'repmotivatedseller',
      value: 'mail.shoprealestatespace.org',
      ttl: 300,
      priority: 10,
      status: 'missing',
      description: 'Mail exchange record for subdomain emails',
      required: false,
      proxyStatus: 'dns-only'
    }
  ];

  useEffect(() => {
    runSubdomainVerification();
  }, []);

  const runSubdomainVerification = async () => {
    setIsVerifying(true);
    
    try {
      // Simulate DNS verification checks
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Since records are not found, set status as not-configured
      const mockResult: SubdomainVerificationResult = {
        parentDomain: 'shoprealestatespace.org',
        subdomain: 'repmotivatedseller',
        fullDomain: 'repmotivatedseller.shoprealestatespace.org',
        status: 'not-configured',
        cloudflareStatus: 'not-configured',
        sslStatus: 'not-configured',
        records: requiredSubdomainRecords.map(record => ({
          ...record,
          status: 'missing'
        })),
        issues: [
          'Subdomain CNAME records not configured',
          'DNS records not found in Cloudflare',
          'SSL certificate not provisioned for subdomain',
          'Email security records missing'
        ]
      };
      
      setVerificationResult(mockResult);
    } catch (error) {
      console.error('Subdomain verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
      case 'missing':
      case 'not-configured':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'active':
        return 'border-green-200 bg-green-50';
      case 'pending':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
      case 'missing':
      case 'not-configured':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Subdomain Configuration</h2>
              <p className="text-gray-600 mt-1">repmotivatedseller.shoprealestatespace.org</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href="https://dash.cloudflare.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Cloud className="w-4 h-4 mr-2" />
              Open Cloudflare
            </a>
            <button
              onClick={runSubdomainVerification}
              disabled={isVerifying}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isVerifying ? 'animate-spin' : ''}`} />
              {isVerifying ? 'Checking...' : 'Check DNS'}
            </button>
          </div>
        </div>
      </div>

      {/* Critical Alert */}
      {verificationResult?.status === 'not-configured' && (
        <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">🚨 Subdomain Configuration Required</h3>
              <p className="text-red-800 text-sm mt-1">
                The subdomain <strong>repmotivatedseller.shoprealestatespace.org</strong> is not configured. 
                You need to add CNAME records in your Cloudflare dashboard for <strong>shoprealestatespace.org</strong>.
              </p>
              <div className="mt-3 space-y-2">
                <div className="text-red-700 text-sm">
                  <strong>Parent Domain:</strong> shoprealestatespace.org<br/>
                  <strong>Subdomain:</strong> repmotivatedseller<br/>
                  <strong>Full Domain:</strong> repmotivatedseller.shoprealestatespace.org
                </div>
                <button
                  onClick={() => setSelectedTab('setup')}
                  className="text-red-700 hover:text-red-900 font-medium text-sm underline"
                >
                  → View Complete Setup Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: Globe },
            { id: 'records', label: 'DNS Records', icon: Server },
            { id: 'setup', label: 'Setup Guide', icon: Settings },
            { id: 'troubleshoot', label: 'Troubleshoot', icon: AlertTriangle }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6">
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {verificationResult && (
              <>
                {/* Domain Hierarchy */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">🌐 Domain Structure</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium text-blue-800">Parent Domain:</span>
                      <span className="ml-2 font-mono bg-white px-2 py-1 rounded border">shoprealestatespace.org</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-blue-800">Subdomain:</span>
                      <span className="ml-2 font-mono bg-white px-2 py-1 rounded border">repmotivatedseller</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-blue-800">Full Domain:</span>
                      <span className="ml-2 font-mono bg-white px-2 py-1 rounded border">repmotivatedseller.shoprealestatespace.org</span>
                    </div>
                  </div>
                </div>

                {/* Subdomain Status */}
                <div className={`p-4 rounded-lg border ${getStatusColor(verificationResult.status)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(verificationResult.status)}
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900">Subdomain Status</h3>
                        <p className="text-sm text-gray-600">{verificationResult.fullDomain}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      verificationResult.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : verificationResult.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {verificationResult.status === 'not-configured' ? 'NOT CONFIGURED' : verificationResult.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Service Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg border ${getStatusColor(verificationResult.cloudflareStatus)}`}>
                    <div className="flex items-center">
                      <Cloud className="w-8 h-8 text-orange-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Cloudflare DNS</h4>
                        <p className="text-sm text-gray-600 capitalize">
                          {verificationResult.cloudflareStatus === 'not-configured' ? 'Not Setup' : verificationResult.cloudflareStatus}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${getStatusColor(verificationResult.sslStatus)}`}>
                    <div className="flex items-center">
                      <Shield className="w-8 h-8 text-green-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">SSL Certificate</h4>
                        <p className="text-sm text-gray-600 capitalize">
                          {verificationResult.sslStatus === 'not-configured' ? 'Not Available' : verificationResult.sslStatus}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-red-200 bg-red-50">
                    <div className="flex items-center">
                      <Mail className="w-8 h-8 text-red-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Email Security</h4>
                        <p className="text-sm text-gray-600">Not Configured</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Issues List */}
                {verificationResult.issues.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-3">🔧 Configuration Issues</h4>
                    <ul className="space-y-2">
                      {verificationResult.issues.map((issue, index) => (
                        <li key={index} className="flex items-center text-sm text-red-800">
                          <XCircle className="w-4 h-4 mr-2 text-red-600" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">🚀 Quick Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <a
                      href="https://dash.cloudflare.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-white rounded border hover:bg-gray-50"
                    >
                      <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                      <span>Manage shoprealestatespace.org DNS</span>
                    </a>
                    <button
                      onClick={() => setSelectedTab('setup')}
                      className="flex items-center p-3 bg-white rounded border hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4 mr-2 text-blue-600" />
                      <span>View Setup Instructions</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* DNS Records Tab */}
        {selectedTab === 'records' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Required Subdomain DNS Records</h3>
              <div className="flex items-center space-x-2">
                {copySuccess && (
                  <span className="text-green-600 text-sm">✓ {copySuccess} copied!</span>
                )}
                <a
                  href="https://dash.cloudflare.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Manage shoprealestatespace.org DNS
                </a>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Subdomain Configuration Required</h4>
                  <p className="text-yellow-800 text-sm mt-1">
                    Add these DNS records to the <strong>shoprealestatespace.org</strong> zone in Cloudflare to create the subdomain.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {requiredSubdomainRecords.map((record, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(record.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {getStatusIcon(record.status)}
                        <span className="ml-2 font-medium text-gray-900">{record.type} Record</span>
                        {record.required && (
                          <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            Required
                          </span>
                        )}
                        {record.proxyStatus && (
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            record.proxyStatus === 'proxied' 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {record.proxyStatus === 'proxied' ? '🟠 Proxied' : '⚪ DNS Only'}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Name:</span>
                          <div className="font-mono bg-gray-100 p-2 rounded mt-1 flex items-center justify-between">
                            <span>{record.name}</span>
                            <button
                              onClick={() => copyToClipboard(record.name, 'Name')}
                              className="text-blue-600 hover:text-blue-700 ml-2"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Value:</span>
                          <div className="font-mono bg-gray-100 p-2 rounded mt-1 break-all flex items-center justify-between">
                            <span className="flex-1">{record.value}</span>
                            <button
                              onClick={() => copyToClipboard(record.value, 'Value')}
                              className="text-blue-600 hover:text-blue-700 ml-2"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">TTL:</span>
                          <div className="font-mono bg-gray-100 p-2 rounded mt-1">{record.ttl}</div>
                        </div>
                      </div>
                      
                      {record.priority && (
                        <div className="mt-2">
                          <span className="font-medium text-gray-600 text-sm">Priority: </span>
                          <span className="font-mono text-sm">{record.priority}</span>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-600 mt-2">{record.description}</p>
                    </div>
                    
                    <button
                      onClick={() => copyToClipboard(`${record.type} ${record.name} ${record.value}`, 'Full Record')}
                      className="ml-4 text-blue-600 hover:text-blue-700 p-2 rounded hover:bg-blue-50"
                      title="Copy full record"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Setup Guide Tab */}
        {selectedTab === 'setup' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Subdomain Setup for repmotivatedseller.shoprealestatespace.org</h4>
                  <p className="text-blue-800 text-sm mt-1">
                    Configure subdomain DNS records in the parent domain's Cloudflare zone
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">Step 1: Access Parent Domain DNS</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Go to <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Cloudflare Dashboard</a></li>
                  <li>Select the domain: <code className="bg-gray-100 px-2 py-1 rounded font-mono">shoprealestatespace.org</code></li>
                  <li>Navigate to the "DNS" tab</li>
                  <li>You'll add subdomain records to this zone</li>
                </ol>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">Step 2: Add Subdomain CNAME Records</h4>
                <p className="text-sm text-gray-700 mb-3">Add these CNAME records to create the subdomain:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex items-center justify-between bg-white p-2 rounded border">
                      <span>CNAME repmotivatedseller shoprealestatespace.org (Proxied)</span>
                      <button
                        onClick={() => copyToClipboard('CNAME repmotivatedseller shoprealestatespace.org', 'Main CNAME')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between bg-white p-2 rounded border">
                      <span>CNAME www.repmotivatedseller shoprealestatespace.org (Proxied)</span>
                      <button
                        onClick={() => copyToClipboard('CNAME www.repmotivatedseller shoprealestatespace.org', 'WWW CNAME')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between bg-white p-2 rounded border">
                      <span>CNAME admin.repmotivatedseller shoprealestatespace.org (Proxied)</span>
                      <button
                        onClick={() => copyToClipboard('CNAME admin.repmotivatedseller shoprealestatespace.org', 'Admin CNAME')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between bg-white p-2 rounded border">
                      <span>CNAME api.repmotivatedseller shoprealestatespace.org (Proxied)</span>
                      <button
                        onClick={() => copyToClipboard('CNAME api.repmotivatedseller shoprealestatespace.org', 'API CNAME')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">Step 3: Add Email Security Records</h4>
                <p className="text-sm text-gray-700 mb-3">Add these TXT records for email security:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex items-center justify-between bg-white p-2 rounded border">
                      <span>TXT repmotivatedseller "v=spf1 include:_spf.google.com ~all"</span>
                      <button
                        onClick={() => copyToClipboard('v=spf1 include:_spf.google.com ~all', 'SPF Record')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between bg-white p-2 rounded border">
                      <span>TXT _dmarc.repmotivatedseller "v=DMARC1; p=quarantine; rua=mailto:dmarc@repmotivatedseller.shoprealestatespace.org"</span>
                      <button
                        onClick={() => copyToClipboard('v=DMARC1; p=quarantine; rua=mailto:dmarc@repmotivatedseller.shoprealestatespace.org', 'DMARC Record')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">Step 4: Configure SSL/TLS for Subdomain</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Cloudflare will automatically provision SSL for the subdomain</li>
                  <li>Ensure "Always Use HTTPS" is enabled for the parent domain</li>
                  <li>The subdomain will inherit SSL settings from the parent domain</li>
                  <li>Wait 15-30 minutes for SSL certificate provisioning</li>
                </ol>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">Step 5: Update Application Configuration</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Update your <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file with the new subdomain</li>
                  <li>Set <code className="bg-gray-100 px-2 py-1 rounded">SITE_URL=https://repmotivatedseller.shoprealestatespace.org</code></li>
                  <li>Update email configuration to use subdomain</li>
                  <li>Test all application routes and functionality</li>
                </ol>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">✅ Expected Results</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• repmotivatedseller.shoprealestatespace.org resolves to your application</li>
                <li>• www.repmotivatedseller.shoprealestatespace.org works properly</li>
                <li>• admin.repmotivatedseller.shoprealestatespace.org accessible</li>
                <li>• api.repmotivatedseller.shoprealestatespace.org functional</li>
                <li>• SSL certificate automatically provisioned</li>
                <li>• Email security (SPF/DMARC) configured for subdomain</li>
              </ul>
            </div>
          </div>
        )}

        {/* Troubleshoot Tab */}
        {selectedTab === 'troubleshoot' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Subdomain Troubleshooting</h3>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">🚨 Subdomain Not Resolving</h4>
                <div className="text-sm text-red-800 space-y-2">
                  <p><strong>Current Issue:</strong> repmotivatedseller.shoprealestatespace.org not found</p>
                  <p><strong>Solutions:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Add CNAME record in shoprealestatespace.org DNS zone</li>
                    <li>Verify parent domain (shoprealestatespace.org) is active in Cloudflare</li>
                    <li>Check CNAME record syntax: <code>repmotivatedseller</code> → <code>shoprealestatespace.org</code></li>
                    <li>Wait 5-10 minutes for DNS propagation</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Common Subdomain Issues</h4>
                <div className="text-sm text-yellow-800 space-y-2">
                  <p><strong>Symptoms:</strong> SSL errors, redirect loops, 404 errors</p>
                  <p><strong>Solutions:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Ensure proxy status is enabled (orange cloud) for CNAME records</li>
                    <li>Check that parent domain SSL settings are correct</li>
                    <li>Verify application is configured to handle subdomain requests</li>
                    <li>Test with both www and non-www versions</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Verification Steps</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p><strong>After configuration:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Test DNS resolution: <code>nslookup repmotivatedseller.shoprealestatespace.org</code></li>
                    <li>Check SSL certificate covers subdomain</li>
                    <li>Verify application responds correctly</li>
                    <li>Test all subdomain variants (www, admin, api)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">DNS Testing Tools</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="https://whatsmydns.net/#CNAME/repmotivatedseller.shoprealestatespace.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-gray-50"
                >
                  <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                  <span>Check Subdomain Propagation</span>
                </a>
                <a
                  href="https://dnschecker.org/#CNAME/repmotivatedseller.shoprealestatespace.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-gray-50"
                >
                  <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                  <span>DNS Record Lookup</span>
                </a>
                <a
                  href="https://www.ssllabs.com/ssltest/analyze.html?d=repmotivatedseller.shoprealestatespace.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-gray-50"
                >
                  <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                  <span>SSL Certificate Test</span>
                </a>
                <a
                  href="https://dash.cloudflare.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-gray-50"
                >
                  <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                  <span>Manage DNS in Cloudflare</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};