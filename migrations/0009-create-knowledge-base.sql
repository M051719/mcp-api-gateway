-- Knowledge Base System
-- Stores articles, guides, and educational content

CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  
  -- Categorization
  category TEXT NOT NULL CHECK (category IN (
    'pre-foreclosure-basics',
    'credit-repair-fundamentals', 
    'real-estate-investing-101',
    'property-analysis',
    'deal-evaluation',
    'market-insights',
    'document-generation',
    'calculators',
    'roi-analysis',
    '1-percent-rule',
    'dscr-analysis',
    'direct-mail',
    'wholesale-contracts',
    'fix-flip-strategies',
    'legal-guides'
  )),
  
  -- Access Control
  tier_level TEXT NOT NULL DEFAULT 'basic' CHECK (tier_level IN ('basic', 'premium', 'elite')),
  
  -- Metadata
  keywords TEXT[],
  tags TEXT[],
  author TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_kb_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_kb_tier_level ON knowledge_base(tier_level);
CREATE INDEX IF NOT EXISTS idx_kb_status ON knowledge_base(status);
CREATE INDEX IF NOT EXISTS idx_kb_keywords ON knowledge_base USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_kb_tags ON knowledge_base USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_kb_slug ON knowledge_base(slug);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_kb_search ON knowledge_base USING GIN(
  to_tsvector('english', title || ' ' || content || ' ' || COALESCE(excerpt, ''))
);

-- User feedback on articles
CREATE TABLE IF NOT EXISTS knowledge_base_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES knowledge_base(id) ON DELETE CASCADE,
  user_id UUID,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  was_helpful BOOLEAN,
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kb_feedback_article ON knowledge_base_feedback(article_id);
CREATE INDEX IF NOT EXISTS idx_kb_feedback_user ON knowledge_base_feedback(user_id);

-- Track which articles users have viewed
CREATE TABLE IF NOT EXISTS knowledge_base_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES knowledge_base(id) ON DELETE CASCADE,
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kb_views_article ON knowledge_base_views(article_id);
CREATE INDEX IF NOT EXISTS idx_kb_views_user ON knowledge_base_views(user_id);
CREATE INDEX IF NOT EXISTS idx_kb_views_created ON knowledge_base_views(created_at);

-- AI Conversation History
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  session_id TEXT,
  
  -- Message
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  
  -- Context
  detected_intent TEXT,
  matched_kb_articles UUID[],
  used_real_time_data BOOLEAN DEFAULT FALSE,
  dappier_query TEXT,
  
  -- Metadata
  user_tier TEXT,
  keywords TEXT[],
  was_helpful BOOLEAN,
  feedback_text TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_conv_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conv_session ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conv_created ON ai_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_conv_intent ON ai_conversations(detected_intent);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kb_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert migrations tracking
INSERT INTO public.schema_migrations (version) 
VALUES ('0009_create_knowledge_base')
ON CONFLICT (version) DO NOTHING;
