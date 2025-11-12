import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  FileText,
  Download,
  RefreshCw,
  Send,
  Settings,
  Bell,
  BarChart3,
  Shield,
  Zap,
  Globe,
  PhoneCall
} from 'lucide-react';
import { supabase, ForeclosureResponse } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { NotificationSettings } from './NotificationSettings';
import { ProjectVerification } from './ProjectVerification';
import { OwnershipVerification } from './OwnershipVerification';
import { SubdomainVerification } from './SubdomainVerification';
import { CallManagement } from './CallManagement';

interface AdminStats {
  total: number;
  submitted: number;
  reviewed: number;
  contacted: number;
  closed: number;
  urgent: number;
  todaySubmissions: number;
}

export const AdminDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<ForeclosureResponse[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<ForeclosureResponse[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ForeclosureResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calls' | 'settings' | 'verification' | 'ownership' | 'dns'>('dashboard');
  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    submitted: 0,
    reviewed: 0,
    contacted: 0,
    closed: 0,
    urgent: 0,
    todaySubmissions: 0
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchSubmissions();
    }
  }, [activeTab]);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchTerm, statusFilter, dateFilter, urgencyFilter]);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('foreclosure_responses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: ForeclosureResponse[]) => {
    const today = new Date().toDateString();
    const urgent = data.filter(s => getUrgencyLevel(s) === 'high').length;
    const todaySubmissions = data.filter(s => 
      new Date(s.created_at).toDateString() === today
    ).length;

    const stats = {
      total: data.length,
      submitted: data.filter(s => s.status === 'submitted').length,
      reviewed: data.filter(s => s.status === 'reviewed').length,
      contacted: data.filter(s => s.status === 'contacted').length,
      closed: data.filter(s => s.status === 'closed').length,
      urgent,
      todaySubmissions,
    };
    setStats(stats);
  };

  const getUrgencyLevel = (submission: ForeclosureResponse): 'high' | 'medium' | 'low' => {
    const missedPayments = submission.missed_payments || 0;
    const hasNOD = submission.nod === 'yes';
    const isOverwhelmed = submission.overwhelmed === 'yes';
    
    if (hasNOD || missedPayments >= 3 || isOverwhelmed) return 'high';
    if (missedPayments >= 1) return 'medium';
    return 'low';
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.lender?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }

    // Urgency filter
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(submission => getUrgencyLevel(submission) === urgencyFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(submission => 
          new Date(submission.created_at) >= filterDate
        );
      }
    }

    setFilteredSubmissions(filtered);
  };

  const updateSubmissionStatus = async (id: string, status: string, notes?: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('foreclosure_responses')
        .update({ 
          status,
          notes,
          assigned_to: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === id 
            ? { ...sub, status: status as any, notes, assigned_to: user?.id }
            : sub
        )
      );

      if (selectedSubmission?.id === id) {
        setSelectedSubmission(prev => 
          prev ? { ...prev, status: status as any, notes, assigned_to: user?.id } : null
        );
      }

      // Send status update email notification
      if (status !== 'submitted') {
        await sendStatusUpdateNotification(id);
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      alert('Failed to update submission status');
    } finally {
      setIsUpdating(false);
    }
  };

  const sendStatusUpdateNotification = async (submissionId: string) => {
    try {
      await supabase.functions.invoke('send-notification-email', {
        body: {
          submissionId,
          type: 'status_update'
        }
      });
      console.log('Status update notification sent');
    } catch (error) {
      console.error('Failed to send status update notification:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'contacted':
        return 'bg-purple-100 text-purple-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <FileText className="w-4 h-4" />;
      case 'reviewed':
        return <Eye className="w-4 h-4" />;
      case 'contacted':
        return <Phone className="w-4 h-4" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const headers = [
      'Date Submitted',
      'Name',
      'Email',
      'Phone',
      'Status',
      'Urgency',
      'Lender',
      'Property Type',
      'Home Value',
      'Mortgage Balance',
      'Missed Payments',
      'NOD',
      'Challenge',
      'Notes'
    ];

    const csvData = filteredSubmissions.map(sub => [
      formatDate(sub.created_at),
      sub.contact_name || '',
      sub.contact_email || '',
      sub.contact_phone || '',
      sub.status,
      getUrgencyLevel(sub),
      sub.lender || '',
      sub.property_type || '',
      sub.home_value || '',
      sub.mortgage_balance || '',
      sub.missed_payments || 0,
      sub.nod === 'yes' ? 'Yes' : 'No',
      sub.challenge || '',
      sub.notes || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foreclosure-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading && activeTab === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Tabs */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('calls')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'calls'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <PhoneCall className="w-4 h-4 inline mr-2" />
              AI Calls
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'verification'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Zap className="w-4 h-4 inline mr-2" />
              System Check
            </button>
            <button
              onClick={() => setActiveTab('dns')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'dns'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Globe className="w-4 h-4 inline mr-2" />
              DNS & Domain
            </button>
            <button
              onClick={() => setActiveTab('ownership')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'ownership'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Ownership
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'calls' && <CallManagement />}
        {activeTab === 'settings' && <NotificationSettings />}
        {activeTab === 'verification' && <ProjectVerification />}
        {activeTab === 'dns' && <SubdomainVerification />}
        {activeTab === 'ownership' && <OwnershipVerification />}
        
        {activeTab === 'dashboard' && (
          <>
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-gray-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Submitted</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Eye className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Reviewed</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.reviewed}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Phone className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Contacted</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.contacted}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Closed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.closed}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Urgent</p>
                    <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-indigo-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Today</p>
                    <p className="text-2xl font-bold text-indigo-600">{stats.todaySubmissions}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Search by name, email, or lender..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency
                  </label>
                  <select
                    value={urgencyFilter}
                    onChange={(e) => setUrgencyFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Urgency Levels</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={exportToCSV}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Submissions List */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Submissions ({filteredSubmissions.length})
                    </h2>
                  </div>
                  
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {filteredSubmissions.map((submission) => {
                      const urgency = getUrgencyLevel(submission);
                      return (
                        <div
                          key={submission.id}
                          className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedSubmission?.id === submission.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          }`}
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-medium text-gray-900">
                                  {submission.contact_name || 'No Name Provided'}
                                </h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                                  {getStatusIcon(submission.status)}
                                  <span className="ml-1 capitalize">{submission.status}</span>
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getUrgencyColor(urgency)}`}>
                                  {urgency === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                  <span className="capitalize">{urgency}</span>
                                </span>
                              </div>
                              
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Mail className="w-4 h-4 mr-2" />
                                  {submission.contact_email || 'No email provided'}
                                </div>
                                {submission.contact_phone && (
                                  <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {submission.contact_phone}
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  {formatDate(submission.created_at)}
                                </div>
                              </div>

                              {submission.lender && (
                                <div className="mt-2">
                                  <span className="text-sm text-gray-500">Lender: </span>
                                  <span className="text-sm font-medium text-gray-900">{submission.lender}</span>
                                </div>
                              )}
                            </div>

                            <div className="ml-4 flex-shrink-0">
                              {submission.missed_payments && submission.missed_payments > 0 && (
                                <div className="flex items-center text-red-600">
                                  <AlertTriangle className="w-4 h-4 mr-1" />
                                  <span className="text-sm font-medium">{submission.missed_payments} missed</span>
                                </div>
                              )}
                              {submission.nod === 'yes' && (
                                <div className="flex items-center text-red-600 mt-1">
                                  <FileText className="w-4 h-4 mr-1" />
                                  <span className="text-sm font-medium">NOD</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {filteredSubmissions.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No submissions found matching your filters.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submission Details */}
              <div className="lg:col-span-1">
                {selectedSubmission ? (
                  <SubmissionDetails
                    submission={selectedSubmission}
                    onStatusUpdate={updateSubmissionStatus}
                    isUpdating={isUpdating}
                  />
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Select a submission to view details</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface SubmissionDetailsProps {
  submission: ForeclosureResponse;
  onStatusUpdate: (id: string, status: string, notes?: string) => Promise<void>;
  isUpdating: boolean;
}

const SubmissionDetails: React.FC<SubmissionDetailsProps> = ({
  submission,
  onStatusUpdate,
  isUpdating
}) => {
  const [notes, setNotes] = useState(submission.notes || '');
  const [selectedStatus, setSelectedStatus] = useState(submission.status);

  const handleStatusUpdate = async () => {
    await onStatusUpdate(submission.id, selectedStatus, notes);
  };

  const getUrgencyLevel = () => {
    const missedPayments = submission.missed_payments || 0;
    const hasNOD = submission.nod === 'yes';
    const isOverwhelmed = submission.overwhelmed === 'yes';
    
    if (hasNOD || missedPayments >= 3 || isOverwhelmed) return 'high';
    if (missedPayments >= 1) return 'medium';
    return 'low';
  };

  const urgencyLevel = getUrgencyLevel();
  const urgencyColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Submission Details</h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Urgency Indicator */}
        <div className={`p-3 rounded-lg border ${urgencyColors[urgencyLevel]}`}>
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span className="font-medium capitalize">{urgencyLevel} Priority</span>
          </div>
          <p className="text-sm mt-1">
            {urgencyLevel === 'high' && 'Immediate attention required'}
            {urgencyLevel === 'medium' && 'Follow up within 24 hours'}
            {urgencyLevel === 'low' && 'Standard follow-up timeline'}
          </p>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-gray-400" />
              <span>{submission.contact_name || 'Not provided'}</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              <span>{submission.contact_email || 'Not provided'}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              <span>{submission.contact_phone || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Financial Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Home Value:</span>
              <span className="font-medium">{submission.home_value || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mortgage Balance:</span>
              <span className="font-medium">{submission.mortgage_balance || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Missed Payments:</span>
              <span className="font-medium">{submission.missed_payments || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lender:</span>
              <span className="font-medium">{submission.lender || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Key Information */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Key Information</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-600">Property Type:</span>
              <p className="font-medium capitalize">{submission.property_type || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-gray-600">Notice of Default:</span>
              <p className="font-medium">{submission.nod === 'yes' ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <span className="text-gray-600">Main Challenge:</span>
              <p className="font-medium">{submission.challenge || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Status Management */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Status Management</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="submitted">Submitted</option>
                <option value="reviewed">Reviewed</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                placeholder="Add notes about this submission..."
              />
            </div>

            <button
              onClick={handleStatusUpdate}
              disabled={isUpdating}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Update Status & Notify
                </>
              )}
            </button>
          </div>
        </div>

        {/* Submission Date */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Submitted: {new Date(submission.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};



