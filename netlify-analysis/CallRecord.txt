import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOutgoing, 
  Clock, 
  User, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Play,
  Pause,
  Volume2,
  FileText,
  BarChart3,
  Users,
  Zap,
  Target,
  Activity
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CallRecord {
  id: string;
  call_sid: string;
  phone_number: string;
  caller_name?: string;
  call_status: 'in-progress' | 'completed' | 'failed' | 'transferred';
  call_duration: number;
  ai_confidence_score?: number;
  primary_intent?: string;
  requires_human_followup: boolean;
  priority_level: 'low' | 'medium' | 'high' | 'urgent';
  call_summary?: string;
  created_at: string;
  completed_at?: string;
}

interface CallAnalytics {
  overview: {
    totalCalls: number;
    completedCalls: number;
    transferredCalls: number;
    todayCalls: number;
    urgentCalls: number;
    avgDuration: number;
    transferRate: number;
  };
  aiPerformance: {
    fulfillmentRate: number;
    topIntents: [string, number][];
    avgConfidence: number;
  };
  handoffAnalysis: {
    totalHandoffs: number;
    avgResolutionTime: number;
    commonReasons: [string, number][];
  };
  recentCalls: CallRecord[];
}

export const CallManagement: React.FC = () => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [analytics, setAnalytics] = useState<CallAnalytics | null>(null);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'calls' | 'analytics' | 'live'>('overview');
  const [callDetails, setCallDetails] = useState<any>(null);

  useEffect(() => {
    fetchCallData();
    const interval = setInterval(fetchCallData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCallData = async () => {
    try {
      // Fetch call analytics
      const { data: analyticsData, error: analyticsError } = await supabase.functions.invoke('call-analytics', {
        body: { action: 'dashboard' }
      });

      if (analyticsError) throw analyticsError;
      setAnalytics(analyticsData);

      // Fetch recent calls
      const { data: callsData, error: callsError } = await supabase
        .from('ai_calls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (callsError) throw callsError;
      setCalls(callsData || []);
    } catch (error) {
      console.error('Error fetching call data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCallDetails = async (callId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('call-analytics', {
        body: { action: 'call-details', callId }
      });

      if (error) throw error;
      setCallDetails(data);
    } catch (error) {
      console.error('Error fetching call details:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-progress':
        return <PhoneCall className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'transferred':
        return <PhoneOutgoing className="w-4 h-4 text-purple-600" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Phone className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading call data...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Phone className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Call Management</h2>
              <p className="text-gray-600 mt-1">Monitor and manage AI-assisted calls</p>
            </div>
          </div>
          <button
            onClick={fetchCallData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'calls', label: 'Call History', icon: Phone },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'live', label: 'Live Monitoring', icon: Activity }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
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
        {activeTab === 'overview' && analytics && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center">
                  <Phone className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Total Calls</p>
                    <p className="text-2xl font-bold text-blue-900">{analytics.overview.totalCalls}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Completed</p>
                    <p className="text-2xl font-bold text-green-900">{analytics.overview.completedCalls}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Transferred</p>
                    <p className="text-2xl font-bold text-purple-900">{analytics.overview.transferredCalls}</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-600">Avg Duration</p>
                    <p className="text-2xl font-bold text-orange-900">{formatDuration(analytics.overview.avgDuration)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-blue-600" />
                  AI Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Intent Fulfillment Rate</span>
                    <span className="font-semibold text-green-600">{analytics.aiPerformance.fulfillmentRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Average Confidence</span>
                    <span className="font-semibold text-blue-600">{Math.round(analytics.aiPerformance.avgConfidence * 100)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Transfer Rate</span>
                    <span className="font-semibold text-purple-600">{analytics.overview.transferRate}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-600" />
                  Top Intents
                </h3>
                <div className="space-y-3">
                  {analytics.aiPerformance.topIntents.slice(0, 5).map(([intent, count], index) => (
                    <div key={intent} className="flex items-center justify-between">
                      <span className="text-gray-700 capitalize">{intent.replace('_', ' ')}</span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / analytics.aiPerformance.topIntents[0][1]) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Calls */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Calls</h3>
              <div className="space-y-3">
                {analytics.recentCalls.slice(0, 5).map((call) => (
                  <div key={call.id} className="flex items-center justify-between bg-white p-4 rounded-lg">
                    <div className="flex items-center">
                      {getStatusIcon(call.call_status)}
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{call.phone_number}</p>
                        <p className="text-sm text-gray-600">{call.primary_intent || 'No intent detected'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(call.priority_level)}`}>
                        {call.priority_level}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatDuration(call.call_duration)}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedCall(call);
                          fetchCallDetails(call.id);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Call History Tab */}
        {activeTab === 'calls' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Call History</h3>
              <div className="flex items-center space-x-2">
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Statuses</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Transferred</option>
                  <option>Failed</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Priorities</option>
                  <option>Urgent</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Caller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Intent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {calls.map((call) => (
                    <tr key={call.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <PhoneIncoming className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {call.caller_name || call.phone_number}
                            </div>
                            {call.caller_name && (
                              <div className="text-sm text-gray-500">{call.phone_number}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(call.call_status)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">
                            {call.call_status.replace('-', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {call.primary_intent ? (
                          <span className="capitalize">{call.primary_intent.replace('_', ' ')}</span>
                        ) : (
                          <span className="text-gray-400">No intent</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDuration(call.call_duration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(call.priority_level)}`}>
                          {call.priority_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(call.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedCall(call);
                            fetchCallDetails(call.id);
                          }}
                          className="text-blue-600 hover:text-blue-700 mr-3"
                        >
                          View
                        </button>
                        {call.requires_human_followup && (
                          <span className="text-orange-600 text-xs">Follow-up needed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Call Analytics & Insights</h3>
            
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-2">AI Success Rate</h4>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {100 - analytics.overview.transferRate}%
                </div>
                <p className="text-sm text-blue-700">
                  Calls resolved without human intervention
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="font-semibold text-green-900 mb-2">Intent Accuracy</h4>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {Math.round(analytics.aiPerformance.avgConfidence * 100)}%
                </div>
                <p className="text-sm text-green-700">
                  Average confidence in intent detection
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <h4 className="font-semibold text-purple-900 mb-2">Avg Resolution Time</h4>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {analytics.handoffAnalysis.avgResolutionTime}m
                </div>
                <p className="text-sm text-purple-700">
                  For transferred calls
                </p>
              </div>
            </div>

            {/* Common Handoff Reasons */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Common Handoff Reasons</h4>
              <div className="space-y-3">
                {analytics.handoffAnalysis.commonReasons.map(([reason, count], index) => (
                  <div key={reason} className="flex items-center justify-between">
                    <span className="text-gray-700 capitalize">{reason.replace('_', ' ')}</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${(count / analytics.handoffAnalysis.commonReasons[0][1]) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Monitoring Tab */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Live Call Monitoring</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
            </div>

            {/* Active Calls */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Active Calls</h4>
              {calls.filter(call => call.call_status === 'in-progress').length === 0 ? (
                <div className="text-center py-8">
                  <Phone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No active calls at the moment</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {calls.filter(call => call.call_status === 'in-progress').map((call) => (
                    <div key={call.id} className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-3"></div>
                          <div>
                            <p className="font-medium text-gray-900">{call.phone_number}</p>
                            <p className="text-sm text-gray-600">
                              Duration: {formatDuration(call.call_duration)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(call.priority_level)}`}>
                            {call.priority_level}
                          </span>
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Monitor
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="font-semibold text-green-900 mb-4">AI System Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">Speech Recognition</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">Intent Processing</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">Text-to-Speech</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-4">Telephony Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">Twilio Connection</span>
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">Phone Number Active</span>
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">Call Routing</span>
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Call Details Modal */}
      {selectedCall && callDetails && (
        <CallDetailsModal
          call={selectedCall}
          details={callDetails}
          onClose={() => {
            setSelectedCall(null);
            setCallDetails(null);
          }}
        />
      )}
    </div>
  );
};

interface CallDetailsModalProps {
  call: CallRecord;
  details: any;
  onClose: () => void;
}

const CallDetailsModal: React.FC<CallDetailsModalProps> = ({ call, details, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Call Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Call Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Call Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone Number:</span>
                  <span className="font-medium">{call.phone_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{Math.floor(call.call_duration / 60)}:{(call.call_duration % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize">{call.call_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <span className="font-medium capitalize">{call.priority_level}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">AI Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Primary Intent:</span>
                  <span className="font-medium">{call.primary_intent || 'None detected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confidence:</span>
                  <span className="font-medium">{call.ai_confidence_score ? `${Math.round(call.ai_confidence_score * 100)}%` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Requires Follow-up:</span>
                  <span className="font-medium">{call.requires_human_followup ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call Summary */}
          {call.call_summary && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Call Summary</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{call.call_summary}</p>
              </div>
            </div>
          )}

          {/* Transcript */}
          {details.transcript && details.transcript.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Conversation Transcript</h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="space-y-3">
                  {details.transcript.map((entry: any, index: number) => (
                    <div key={index} className={`flex ${entry.speaker === 'caller' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        entry.speaker === 'caller' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-gray-900 border'
                      }`}>
                        <div className="text-xs opacity-75 mb-1">
                          {entry.speaker === 'caller' ? 'Caller' : 'AI Assistant'}
                        </div>
                        <div className="text-sm">{entry.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Detected Intents */}
          {details.intents && details.intents.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Detected Intents</h4>
              <div className="space-y-2">
                {details.intents.map((intent: any, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900 capitalize">
                        {intent.intent_name.replace('_', ' ')}
                      </span>
                      {intent.entities && Object.keys(intent.entities).length > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          Entities: {JSON.stringify(intent.entities)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {Math.round(intent.confidence_score * 100)}%
                      </span>
                      {intent.fulfilled && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Handoff Information */}
          {details.handoff && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Agent Handoff</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reason:</span>
                    <span className="font-medium">{details.handoff.reason}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Handoff Time:</span>
                    <span className="font-medium">
                      {new Date(details.handoff.handoff_time).toLocaleString()}
                    </span>
                  </div>
                  {details.handoff.resolution_time && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resolution Time:</span>
                      <span className="font-medium">
                        {new Date(details.handoff.resolution_time).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                {details.handoff.ai_summary && (
                  <div className="mt-3">
                    <span className="text-gray-600 text-sm">AI Summary:</span>
                    <p className="text-gray-700 mt-1">{details.handoff.ai_summary}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};