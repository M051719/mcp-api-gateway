/**
 * Direct Mail Campaign Management Page
 * Integrated with Lob API for sending physical mailers
 * With tier-based access control
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, Send, FileText, TrendingUp, DollarSign, 
  MapPin, Calendar, CheckCircle, AlertCircle,
  Download, Eye, Lock, ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { TIERS, hasAccess, getUpgradeMessage, getDirectMailLimits } from '../utils/tierAccess';

interface Campaign {
  id: string;
  name: string;
  template_type: 'foreclosure' | 'cash_offer' | 'land_acquisition' | 'loan_modification';
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  sent_count: number;
  delivered_count: number;
  responded_count: number;
  total_cost: number;
  created_at: string;
}

const TEMPLATES = [
  {
    id: 'foreclosure',
    name: 'Foreclosure Prevention',
    description: 'Help homeowners avoid foreclosure with our in-house loan processing',
    icon: '🏠',
    color: 'blue'
  },
  {
    id: 'cash_offer',
    name: 'Cash Offer (24hr)',
    description: 'Fast cash offers with 24-hour response guarantee',
    icon: '💰',
    color: 'green'
  },
  {
    id: 'land_acquisition',
    name: 'Land Acquisition',
    description: 'We buy land directly - no agents, no fees',
    icon: '🌳',
    color: 'purple'
  },
  {
    id: 'loan_modification',
    name: 'Loan Modification',
    description: 'Reduce your mortgage payments with our loan modification services',
    icon: '📋',
    color: 'orange'
  }
];

interface DirectMailPageProps {
  userTier?: string;
}

export default function DirectMailPage({ userTier = TIERS.FREE }: DirectMailPageProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [monthlyUsage, setMonthlyUsage] = useState({ postcards: 0, campaigns: 0 });

  const hasPremiumAccess = hasAccess(userTier, TIERS.PREMIUM);
  const tierLimits = getDirectMailLimits(userTier);
  const isUnlimited = tierLimits.postcards === -1;

  useEffect(() => {
    loadCampaigns();
    loadMonthlyUsage();
  }, []);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('direct_mail_campaigns')
        .select('*')
    

  const loadMonthlyUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthCampaigns, error } = await supabase
        .from('direct_mail_campaigns')
        .select('sent_count')
        .gte('created_at', startOfMonth.toISOString());

      if (error) throw error;

      const totalPostcards = monthCampaigns?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0;
      setMonthlyUsage({
      // Check tier limits
      if (!isUnlimited && monthlyUsage.campaigns >= tierLimits.campaigns) {
        toast.error(`You've reached your monthly limit of ${tierLimits.campaigns} campaigns. ${getUpgradeMessage(TIERS.PREMIUM)}`);
        return;
      }

      const { error } = await supabase
        .from('direct_mail_campaigns')
        .insert({
          name: campaignName,
          template_type: templateType,
          user_id: user.id,
          status: 'draft'
        });

      if (error) throw error;

      toast.success('Campaign created successfully!');
      setShowCreateModal(false);
      loadCampaigns();
      loadMonthlyUsage
      setLoading(false);
    }
  };

  const createCampaign = async (templateType: string, campaignName: string) => {
    try {
  // Show upgrade prompt for free users
  if (!hasPremiumAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-12 shadow-2xl text-center"
          >
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Direct Mail Campaigns
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {getUpgradeMessage(TIERS.PREMIUM)}
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Premium Features Include:</h2>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                {[
                  '📬 100 postcards per month',
                  '📊 10 campaigns per month',
                  '🎨 Professional templates',
                  '📈 Campaign analytics',
                  '✅ Legal compliance built-in',
                  '🚀 Lob API integration'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/pricing'}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all shadow-lg mx-auto"
            >
              Upgrade to Premium <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                📬 Direct Mail Campaigns
              </h1>
              <p className="text-gray-600">
                Send professional mailers powered by Lob API with built-in legal protection
              </p>
              {/* Usage indicator */}
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className={`font-semibold ${isUnlimited ? 'text-green-600' : monthlyUsage.postcards >= tierLimits.postcards ? 'text-red-600' : 'text-blue-600'}`}>
                  {isUnlimited ? '∞ Unlimited' : `${monthlyUsage.postcards}/${tierLimits.postcards} postcards`} this month
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  {isUnlimited ? '∞ Unlimited' : `${monthlyUsage.campaigns}/${tierLimits.campaigns} campaigns`}
                </span>
                {userTier && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase">
                      {tierLimits.name} Plan
                    </span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!isUnlimited && monthlyUsage.campaigns >= tierLimits.campaigns}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
      toast.error('Failed to create campaign');
    }
  };

  const calculateROI = (campaign: Campaign) => {
    if (campaign.total_cost === 0) return 0;
    const avgDealValue = 5000; // Estimated average deal value
    const revenue = campaign.responded_count * avgDealValue;
    return ((revenue - campaign.total_cost) / campaign.total_cost * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                📬 Direct Mail Campaigns
              </h1>
              <p className="text-gray-600">
                Send professional mailers powered by Lob API with built-in legal protection
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg"
            >
              <Send className="w-5 h-5" />
              Create Campaign
            </button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Total Sent',
              value: campaigns.reduce((sum, c) => sum + c.sent_count, 0),
              icon: Mail,
              color: 'blue'
            },
            {
              label: 'Delivered',
              value: campaigns.reduce((sum, c) => sum + c.delivered_count, 0),
              icon: CheckCircle,
              color: 'green'
            },
            {
              label: 'Responses',
              value: campaigns.reduce((sum, c) => sum + c.responded_count, 0),
              icon: TrendingUp,
              color: 'purple'
            },
            {
              label: 'Total Cost',
              value: `$${campaigns.reduce((sum, c) => sum + c.total_cost, 0).toFixed(2)}`,
              icon: DollarSign,
              color: 'orange'
            }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">{stat.label}</span>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <div className={`text-3xl font-bold text-${stat.color}-600`}>
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Template Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📝 Available Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEMPLATES.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.05 }}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? `border-${template.color}-600 bg-${template.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="text-4xl mb-3">{template.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Campaigns List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-8 shadow-lg border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📊 Campaign History
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No campaigns yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Create your first campaign →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {campaign.name}
                      </h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {campaign.template_type.replace('_', ' ')}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Sent</p>
                      <p className="text-lg font-bold text-gray-900">{campaign.sent_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Delivered</p>
                      <p className="text-lg font-bold text-green-600">{campaign.delivered_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Responses</p>
                      <p className="text-lg font-bold text-purple-600">{campaign.responded_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cost</p>
                      <p className="text-lg font-bold text-orange-600">${campaign.total_cost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ROI</p>
                      <p className="text-lg font-bold text-blue-600">{calculateROI(campaign)}%</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Create Campaign Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Create New Campaign
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    id="campaign-name"
                    placeholder="e.g., Q1 Foreclosure Outreach"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Template
                  </label>
                  <select
                    id="template-select"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a template...</option>
                    {TEMPLATES.map(t => (
                      <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      All templates include required legal disclaimers and FTC compliance language.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const name = (document.getElementById('campaign-name') as HTMLInputElement)?.value;
                    const template = (document.getElementById('template-select') as HTMLSelectElement)?.value;
                    if (name && template) {
                      createCampaign(template, name);
                    } else {
                      toast.error('Please fill in all fields');
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                >
                  Create Campaign
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}
