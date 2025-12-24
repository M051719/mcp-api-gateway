# KNOWLEDGE BASE - INTEGRATION GUIDE
## Step-by-Step Implementation

*Last Updated: December 15, 2025*

---

## ✅ COMPLETED: UI PAGE & AI INTEGRATION

### 1. Knowledge Base UI Page Created
**File:** [src/pages/KnowledgeBasePage.tsx](src/pages/KnowledgeBasePage.tsx)

**Features:**
- ✅ Browse articles by category
- ✅ Search by keywords/tags
- ✅ Tier-based access control (Basic/Premium/Elite)
- ✅ View tracking & analytics
- ✅ "Helpful" feedback system
- ✅ Article detail view with markdown rendering
- ✅ Responsive design with Framer Motion animations

### 2. Knowledge Base Service Created
**File:** [src/services/knowledgeBaseService.ts](src/services/knowledgeBaseService.ts)

**Methods:**
- `searchArticles(query, userTier)` - Full-text search
- `searchByCategory(category, userTier)` - Filter by category
- `getArticleBySlug(slug)` - Get single article
- `getRelatedArticles()` - Find related content
- `trackView(articleId, userId)` - Analytics tracking
- `markHelpful(articleId, userId)` - Feedback collection
- `logAIConversation()` - AI conversation logging
- `extractKeywords(query)` - NLP keyword extraction

### 3. AI Assistant Integrated with KB
**File:** [src/components/AIAssistant.tsx](src/components/AIAssistant.tsx)

**Integration Flow:**
```
User Query → 
  STEP 1: Search Knowledge Base → 
    If found: Return KB article excerpt + related articles →
  STEP 2: Check if real-time data needed →
    If yes: Query Dappier API →
  STEP 3: Combine KB + Dappier data →
  STEP 4: Log conversation for analytics →
Return response
```

**Enhancements:**
- ✅ Knowledge Base badge in header
- ✅ Shows which articles were referenced
- ✅ Indicates when KB data + real-time data combined
- ✅ Updated quick actions (DSCR, 1% Rule, foreclosure, credit)

---

## 🔄 NEXT STEPS: CONTENT EXTRACTION

### 1. Run Content Extraction Script

```powershell
cd "C:\Users\monte\Documents\cert api token keys ids\GITHUB FOLDER\GitHub\mcp-api-gateway"

# Extract content from netlify-analysis files
.\scripts\extract-kb-content.ps1

# This generates: seeds/003-extracted-content.sql
```

**What it extracts:**
- Cash-Out Refinance Legal Guide → Premium article
- Fix-and-Flip Contract Legal Guide → Premium article
- Membership Tiers Documentation → Basic article
- Foreclosure CRM Setup Guide → Premium article

### 2. Database Setup (CRITICAL)

```powershell
# Connect to your database
psql -U postgres -d repmotivatedseller

# Run migrations in order
\i migrations/0009-create-knowledge-base.sql
\i seeds/001-seed-knowledge-base.sql
\i seeds/002-comprehensive-kb-seed.sql
\i seeds/003-extracted-content.sql

# Verify
SELECT COUNT(*) FROM knowledge_base;
SELECT category, COUNT(*) FROM knowledge_base GROUP BY category;
```

---

## 🚀 ROUTING SETUP

### Add Knowledge Base Route

**Option A: Using DASHBOARD.txt pattern**

If you have a main App file like `netlify-analysis/DASHBOARD.txt`, add:

```tsx
import KnowledgeBasePage from './pages/KnowledgeBasePage';

// In Routes:
<Route path="/knowledge" element={<KnowledgeBasePage />} />
<Route path="/kb" element={<Navigate to="/knowledge" />} />
```

**Option B: Create new route file**

Create `src/routes/index.tsx`:

```tsx
import { Routes, Route } from 'react-router-dom';
import KnowledgeBasePage from '../pages/KnowledgeBasePage';
import DirectMailPage from '../pages/DirectMailPage';
import BookConsultation from '../pages/BookConsultation';

export const AppRoutes = () => (
  <Routes>
    <Route path="/knowledge" element={<KnowledgeBasePage />} />
    <Route path="/direct-mail" element={<DirectMailPage />} />
    <Route path="/consultation" element={<BookConsultation />} />
  </Routes>
);
```

### Add Navigation Links

**Update Header component** (wherever navigation lives):

```tsx
import { BookOpen } from 'lucide-react';

// Add to navigation menu
<Link 
  to="/knowledge" 
  className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
>
  <BookOpen className="w-5 h-5" />
  Knowledge Base
</Link>
```

---

## 🧪 TESTING CHECKLIST

### Database Tests
```sql
-- Check tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'knowledge%';

-- Check article counts by tier
SELECT tier_level, COUNT(*) FROM knowledge_base GROUP BY tier_level;

-- Check categories
SELECT DISTINCT category FROM knowledge_base ORDER BY category;

-- Test search
SELECT title, category FROM knowledge_base 
WHERE to_tsvector('english', title || ' ' || content) @@ websearch_to_tsquery('english', 'DSCR loans');
```

### UI Tests
1. ✅ Visit http://localhost:5173/knowledge
2. ✅ Search for "DSCR" - should find DSCR articles
3. ✅ Filter by category - should update results
4. ✅ Click article - should show full content
5. ✅ Click "Helpful" - should increment count
6. ✅ Try accessing premium article as free user - should show lock icon

### AI Integration Tests
1. ✅ Open AI Assistant
2. ✅ Ask "What is DSCR?" - should return KB article
3. ✅ Ask "Current mortgage rates?" - should query Dappier
4. ✅ Ask "DSCR requirements today?" - should combine KB + Dappier
5. ✅ Check conversation logged in ai_conversations table

---

## 📊 ANALYTICS DASHBOARD

### Query Useful Metrics

```sql
-- Most viewed articles
SELECT title, view_count, helpful_count 
FROM knowledge_base 
ORDER BY view_count DESC 
LIMIT 10;

-- Most helpful articles
SELECT title, helpful_count, view_count 
FROM knowledge_base 
ORDER BY helpful_count DESC 
LIMIT 10;

-- Popular searches
SELECT query, COUNT(*) as count 
FROM ai_conversations 
GROUP BY query 
ORDER BY count DESC 
LIMIT 20;

-- Articles by tier access
SELECT tier_level, COUNT(*), AVG(view_count) as avg_views 
FROM knowledge_base 
GROUP BY tier_level;
```

---

## 🔧 TROUBLESHOOTING

### Issue: Articles not showing in UI
**Solution:** 
```powershell
# Verify database connection
psql -U postgres -d repmotivatedseller -c "SELECT COUNT(*) FROM knowledge_base;"

# Check Supabase RLS policies
# Ensure knowledge_base table has policies that allow SELECT for authenticated users
```

### Issue: Search not working
**Solution:**
```sql
-- Rebuild search index
REINDEX INDEX idx_kb_search;

-- Test search manually
SELECT title FROM knowledge_base 
WHERE to_tsvector('english', title || ' ' || content) @@ websearch_to_tsquery('english', 'your query');
```

### Issue: AI Assistant not finding articles
**Solution:**
- Check knowledgeBaseService import in AIAssistant.tsx
- Verify supabase client initialized
- Check browser console for errors
- Test searchArticles() method directly

---

## 📁 FILE STRUCTURE

```
mcp-api-gateway/
├── src/
│   ├── pages/
│   │   └── KnowledgeBasePage.tsx ✅ CREATED
│   ├── services/
│   │   └── knowledgeBaseService.ts ✅ CREATED
│   └── components/
│       └── AIAssistant.tsx ✅ UPDATED
├── migrations/
│   └── 0009-create-knowledge-base.sql ✅ EXISTS
├── seeds/
│   ├── 001-seed-knowledge-base.sql ✅ EXISTS
│   ├── 002-comprehensive-kb-seed.sql ✅ EXISTS
│   └── 003-extracted-content.sql ⏳ TO GENERATE
├── scripts/
│   └── extract-kb-content.ps1 ✅ CREATED
└── KNOWLEDGE_BASE_TOPICS_INVENTORY.md ✅ CREATED
```

---

## 🎯 PRIORITY ACTIONS

**IMMEDIATE (DO NOW):**
1. Run content extraction script
2. Execute database migrations
3. Add `/knowledge` route to your app
4. Test AI Assistant with KB queries

**SHORT TERM (THIS WEEK):**
1. Create remaining topic articles (BRRRR, Subject-To, etc.)
2. Add navigation link to header
3. Set up analytics tracking
4. Test tier access controls

**LONG TERM (THIS MONTH):**
1. Extract all netlify-analysis files (40+ files)
2. Create 100+ comprehensive articles
3. Build admin interface for managing KB
4. Add article recommendations
5. Implement full-text search autocomplete

---

## 💡 USAGE EXAMPLES

### For Users:
- "How do I calculate DSCR?" → AI finds KB article on DSCR
- "What's the 1% rule?" → AI explains with KB article
- "Current foreclosure rates?" → AI combines KB + Dappier
- "Show me BRRRR strategy" → AI returns full KB guide

### For Admins:
- Browse `/knowledge` to see all articles
- Track which articles get most views
- See what users search for most
- Add new articles via SQL inserts

---

**Status:** ✅ UI COMPLETE | ✅ AI INTEGRATED | ⏳ CONTENT EXTRACTION READY | ⏳ DATABASE PENDING
