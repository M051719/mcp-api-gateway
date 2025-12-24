/**
 * Knowledge Base Service
 * Handles searching, filtering, and retrieving KB articles
 * Integrates with AI Assistant for intelligent responses
 */

import { supabase } from '../lib/supabase';

export interface KBArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tier_level: 'basic' | 'premium' | 'elite';
  keywords: string[];
  tags: string[];
  view_count: number;
  helpful_count: number;
  created_at: string;
}

export interface KBSearchResult {
  articles: KBArticle[];
  query: string;
  count: number;
  hasResults: boolean;
}

class KnowledgeBaseService {
  /**
   * Search knowledge base by keywords
   * Uses full-text search for optimal performance
   */
  async searchArticles(query: string, userTier: 'basic' | 'premium' | 'elite' = 'basic'): Promise<KBSearchResult> {
    try {
      if (!query || query.trim().length === 0) {
        return { articles: [], query: '', count: 0, hasResults: false };
      }

      // Extract keywords from query
      const keywords = this.extractKeywords(query);
      
      // Full-text search
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .textSearch('fts', keywords.join(' & '), {
          type: 'websearch',
          config: 'english'
        })
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Filter by tier access
      const accessibleArticles = (data || []).filter(article => 
        this.canAccessTier(userTier, article.tier_level)
      );

      return {
        articles: accessibleArticles,
        query,
        count: accessibleArticles.length,
        hasResults: accessibleArticles.length > 0
      };
    } catch (error) {
      console.error('KB Search Error:', error);
      return { articles: [], query, count: 0, hasResults: false };
    }
  }

  /**
   * Search by category
   */
  async searchByCategory(category: string, userTier: 'basic' | 'premium' | 'elite' = 'basic'): Promise<KBArticle[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('category', category)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).filter(article => 
        this.canAccessTier(userTier, article.tier_level)
      );
    } catch (error) {
      console.error('Category search error:', error);
      return [];
    }
  }

  /**
   * Get article by slug
   */
  async getArticleBySlug(slug: string): Promise<KBArticle | null> {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get article error:', error);
      return null;
    }
  }

  /**
   * Get related articles based on keywords and category
   */
  async getRelatedArticles(articleId: string, category: string, keywords: string[], limit: number = 5): Promise<KBArticle[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('category', category)
        .neq('id', articleId)
        .eq('status', 'published')
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Related articles error:', error);
      return [];
    }
  }

  /**
   * Track article view
   */
  async trackView(articleId: string, userId?: string): Promise<void> {
    try {
      // Increment view count
      await supabase.rpc('increment_kb_view', { article_id: articleId });

      // Log detailed view if user is authenticated
      if (userId) {
        await supabase.from('knowledge_base_views').insert({
          article_id: articleId,
          user_id: userId,
          viewed_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Track view error:', error);
    }
  }

  /**
   * Submit helpful feedback
   */
  async markHelpful(articleId: string, userId: string, helpful: boolean): Promise<void> {
    try {
      await supabase.from('knowledge_base_feedback').insert({
        article_id: articleId,
        user_id: userId,
        helpful,
        feedback_text: null
      });

      if (helpful) {
        await supabase.rpc('increment_kb_helpful', { article_id: articleId });
      }
    } catch (error) {
      console.error('Feedback error:', error);
    }
  }

  /**
   * Log AI conversation for analytics
   */
  async logAIConversation(userId: string, query: string, response: string, articlesUsed: string[]): Promise<void> {
    try {
      await supabase.from('ai_conversations').insert({
        user_id: userId,
        query,
        response,
        articles_referenced: articlesUsed,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Log conversation error:', error);
    }
  }

  /**
   * Extract keywords from natural language query
   */
  extractKeywords(query: string): string[] {
    const stopWords = new Set([
      'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'what', 'how', 'when', 'where', 'why',
      'who', 'which', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
      'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my',
      'your', 'his', 'its', 'our', 'their', 'to', 'from', 'in', 'on', 'at',
      'by', 'for', 'with', 'about', 'as', 'of', 'and', 'or', 'but'
    ]);

    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  /**
   * Check if user can access article tier
   */
  canAccessTier(userTier: 'basic' | 'premium' | 'elite', articleTier: 'basic' | 'premium' | 'elite'): boolean {
    const tierOrder = { basic: 0, premium: 1, elite: 2 };
    return tierOrder[userTier] >= tierOrder[articleTier];
  }

  /**
   * Get all categories with article counts
   */
  async getCategoryCounts(userTier: 'basic' | 'premium' | 'elite' = 'basic'): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('category, tier_level')
        .eq('status', 'published');

      if (error) throw error;

      const counts: Record<string, number> = {};
      (data || []).forEach(article => {
        if (this.canAccessTier(userTier, article.tier_level)) {
          counts[article.category] = (counts[article.category] || 0) + 1;
        }
      });

      return counts;
    } catch (error) {
      console.error('Category counts error:', error);
      return {};
    }
  }

  /**
   * Get popular articles
   */
  async getPopularArticles(limit: number = 10, userTier: 'basic' | 'premium' | 'elite' = 'basic'): Promise<KBArticle[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .limit(limit * 2); // Fetch extra in case of tier filtering

      if (error) throw error;

      return (data || [])
        .filter(article => this.canAccessTier(userTier, article.tier_level))
        .slice(0, limit);
    } catch (error) {
      console.error('Popular articles error:', error);
      return [];
    }
  }

  /**
   * Get recent articles
   */
  async getRecentArticles(limit: number = 10, userTier: 'basic' | 'premium' | 'elite' = 'basic'): Promise<KBArticle[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit * 2);

      if (error) throw error;

      return (data || [])
        .filter(article => this.canAccessTier(userTier, article.tier_level))
        .slice(0, limit);
    } catch (error) {
      console.error('Recent articles error:', error);
      return [];
    }
  }
}

// Singleton instance
export const knowledgeBaseService = new KnowledgeBaseService();
