/**
 * Knowledge Base Page
 * Browse and search educational real estate investing content
 * Tier-based access control
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Search, Filter, Lock, TrendingUp, 
  DollarSign, Home, FileText, Calculator, Mail,
  ChevronRight, Star, ThumbsUp, Eye, Clock,
  CheckCircle, AlertCircle, Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tier_level: 'basic' | 'premium' | 'elite';
  keywords: string[];
  tags: string[];
  view_count: number;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { id: 'all', name: 'All Topics', icon: BookOpen, color: 'gray' },
  { id: 'roi-analysis', name: 'ROI Analysis', icon: TrendingUp, color: 'green' },
  { id: 'calculators', name: 'Calculators', icon: Calculator, color: 'blue' },
  { id: 'dscr-analysis', name: 'DSCR Loans', icon: DollarSign, color: 'purple' },
  { id: 'credit-repair-fundamentals', name: 'Credit Repair', icon: Star, color: 'yellow' },
  { id: 'pre-foreclosure-basics', name: 'Pre-Foreclosure', icon: Home, color: 'red' },
  { id: 'real-estate-investing-101', name: 'Investing 101', icon: FileText, color: 'indigo' },
  { id: 'direct-mail', name: 'Direct Mail', icon: Mail, color: 'pink' },
  { id: 'fix-flip-strategies', name: 'Fix & Flip', icon: Home, color: 'orange' },
  { id: 'legal-guides', name: 'Legal Guides', icon: FileText, color: 'cyan' }
];

const TIER_INFO = {
  basic: { name: 'Free', color: 'gray', icon: CheckCircle },
  premium: { name: 'Premium', color: 'blue', icon: Star },
  elite: { name: 'Elite', color: 'purple', icon: Zap }
};

const KnowledgeBasePage: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [userTier, setUserTier] = useState<'basic' | 'premium' | 'elite'>('basic');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch articles on mount
  useEffect(() => {
    fetchArticles();
    fetchUserTier();
  }, []);

  // Filter articles when category or search changes
  useEffect(() => {
    filterArticles();
  }, [selectedCategory, searchQuery, articles]);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load knowledge base');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserTier = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('tier')
          .eq('id', user.id)
          .single();
        
        if (profile?.tier) {
          setUserTier(profile.tier);
        }
      }
    } catch (error) {
      console.error('Error fetching user tier:', error);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.keywords.some(kw => kw.toLowerCase().includes(query)) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredArticles(filtered);
  };

  const canAccessArticle = (articleTier: 'basic' | 'premium' | 'elite'): boolean => {
    const tierOrder = { basic: 0, premium: 1, elite: 2 };
    return tierOrder[userTier] >= tierOrder[articleTier];
  };

  const trackArticleView = async (articleId: string) => {
    try {
      // Increment view count
      await supabase.rpc('increment_kb_view', { article_id: articleId });

      // Log view in analytics
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('knowledge_base_views').insert({
          article_id: articleId,
          user_id: user.id,
          viewed_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const markHelpful = async (articleId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to provide feedback');
        return;
      }

      // Record feedback
      await supabase.from('knowledge_base_feedback').insert({
        article_id: articleId,
        user_id: user.id,
        helpful: true,
        feedback_text: null
      });

      // Increment helpful count
      await supabase.rpc('increment_kb_helpful', { article_id: articleId });

      toast.success('Thanks for your feedback!');
      
      // Refresh articles to update count
      fetchArticles();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const openArticle = (article: KnowledgeBaseArticle) => {
    if (!canAccessArticle(article.tier_level)) {
      toast.error(`This article requires ${TIER_INFO[article.tier_level].name} membership`);
      return;
    }

    setSelectedArticle(article);
    trackArticleView(article.id);
  };

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[0];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <BookOpen className="w-16 h-16 text-blue-600 mx-auto" />
          </motion.div>
          <p className="mt-4 text-gray-600 font-medium">Loading knowledge base...</p>
        </div>
      </div>
    );
  }

  // Article Detail View
  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => setSelectedArticle(null)}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ChevronRight className="w-5 h-5 rotate-180 mr-1" />
            Back to Knowledge Base
          </button>

          {/* Article Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              {React.createElement(getCategoryInfo(selectedArticle.category).icon, {
                className: `w-6 h-6 text-${getCategoryInfo(selectedArticle.category).color}-600`
              })}
              <span className="text-sm font-medium text-gray-600">
                {getCategoryInfo(selectedArticle.category).name}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${TIER_INFO[selectedArticle.tier_level].color}-100 text-${TIER_INFO[selectedArticle.tier_level].color}-800`}>
                {TIER_INFO[selectedArticle.tier_level].name}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {selectedArticle.title}
            </h1>

            <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {selectedArticle.view_count} views
              </div>
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" />
                {selectedArticle.helpful_count} helpful
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {new Date(selectedArticle.created_at).toLocaleDateString()}
              </div>
            </div>

            {/* Tags */}
            {selectedArticle.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedArticle.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
            />

            {/* Helpful Button */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-gray-700 font-medium mb-4">Was this article helpful?</p>
              <button
                onClick={() => markHelpful(selectedArticle.id)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
              >
                <ThumbsUp className="w-5 h-5" />
                Yes, this was helpful!
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main Knowledge Base View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-5xl font-bold text-gray-900">Knowledge Base</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive guides and tutorials on real estate investing, financing, 
            property analysis, and more. Learn from industry experts.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 text-sm font-medium text-gray-700">
              Your Tier: <span className={`text-${TIER_INFO[userTier].color}-600 font-bold`}>
                {TIER_INFO[userTier].name}
              </span>
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600 font-medium">{articles.length} Articles Available</span>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles, topics, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 overflow-x-auto"
        >
          <div className="flex gap-3 pb-4">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? `bg-${category.color}-600 text-white shadow-lg`
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600">
                Try adjusting your search or category filter
              </p>
            </div>
          ) : (
            filteredArticles.map((article, index) => {
              const canAccess = canAccessArticle(article.tier_level);
              const categoryInfo = getCategoryInfo(article.category);
              const Icon = categoryInfo.icon;

              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => canAccess && openArticle(article)}
                  className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all cursor-pointer ${
                    !canAccess && 'opacity-75'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-${categoryInfo.color}-100`}>
                      <Icon className={`w-6 h-6 text-${categoryInfo.color}-600`} />
                    </div>
                    {!canAccess && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
                        <Lock className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-medium text-gray-600">
                          {TIER_INFO[article.tier_level].name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {article.view_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {article.helpful_count}
                      </div>
                    </div>
                    {canAccess && (
                      <ChevronRight className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBasePage;
