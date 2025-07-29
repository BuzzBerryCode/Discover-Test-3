# Supabase Integration Guide for Buzzberry Discover Page

This guide provides a comprehensive breakdown of all dynamic datapoints and their connection points for integrating with your Supabase database.

## Table of Contents
1. [Database Schema Overview](#database-schema-overview)
2. [Connection Points by Component](#connection-points-by-component)
3. [Data Flow Architecture](#data-flow-architecture)
4. [Implementation Steps](#implementation-steps)
5. [Code Locations](#code-locations)

## Database Schema Overview

### Required Tables

#### 1. `creators` Table
```sql
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_pic TEXT,
  username TEXT NOT NULL,
  username_tag TEXT,
  bio TEXT,
  location TEXT,
  email TEXT,
  followers INTEGER NOT NULL,
  followers_change DECIMAL(5,2),
  followers_change_type TEXT CHECK (followers_change_type IN ('positive', 'negative')),
  engagement DECIMAL(5,2) NOT NULL,
  engagement_change DECIMAL(5,2),
  engagement_change_type TEXT CHECK (engagement_change_type IN ('positive', 'negative')),
  avg_views INTEGER NOT NULL,
  avg_views_change DECIMAL(5,2),
  avg_views_change_type TEXT CHECK (avg_views_change_type IN ('positive', 'negative')),
  avg_likes INTEGER,
  avg_likes_change DECIMAL(5,2),
  avg_likes_change_type TEXT CHECK (avg_likes_change_type IN ('positive', 'negative')),
  avg_comments INTEGER,
  avg_comments_change DECIMAL(5,2),
  avg_comments_change_type TEXT CHECK (avg_comments_change_type IN ('positive', 'negative')),
  buzz_score INTEGER NOT NULL CHECK (buzz_score >= 0 AND buzz_score <= 100),
  niches TEXT[] NOT NULL,
  hashtags TEXT[],
  thumbnails TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. `ai_recommended_creators` Table
```sql
CREATE TABLE ai_recommended_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- Reference to authenticated user
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(creator_id, user_id)
);
```

#### 3. `social_media` Table
```sql
CREATE TABLE social_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter')),
  username TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. `niches` Table
```sql
CREATE TABLE niches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Connection Points by Component

### 1. MetricsTitleSection Component
**File:** `src/components/sections/MetricsTitleSection/MetricsTitleSection.tsx`

**Connection Points:**
- **Line 8-9:** `useCreatorData` hook - Replace with Supabase aggregation queries
- **Line 15-32:** Metric configurations - Connect to real-time database calculations

**Database Queries Needed:**
```typescript
// Replace mockMetrics calculation
const getMetrics = async (filters: DatabaseFilters, mode: CreatorListMode) => {
  const tableName = mode === 'ai' ? 'ai_recommended_creators_view' : 'creators';
  
  const { data, error } = await supabase
    .from(tableName)
    .select('followers, avg_views, engagement')
    .match(filters);
    
  // Calculate aggregations
  return {
    total_creators: data.length,
    avg_followers: data.reduce((sum, c) => sum + c.followers, 0) / data.length,
    avg_views: data.reduce((sum, c) => sum + c.avg_views, 0) / data.length,
    avg_engagement: data.reduce((sum, c) => sum + c.engagement, 0) / data.length
  };
};
```

### 2. CreatorFilterSection Component
**File:** `src/components/sections/CreatorFilterSection/CreatorFilterSection.tsx`

**Connection Points:**
- **Line 35:** `useCreatorData` hook - Replace with Supabase niche fetching
- **Line 245:** `handleApplyFilters` function - Replace with Supabase filtering queries

**Database Queries Needed:**
```typescript
// Load niches from database
const loadNiches = async () => {
  const { data, error } = await supabase
    .from('niches')
    .select('*')
    .order('name');
  return data;
};

// Apply filters with Supabase
const applyFilters = async (filters: DatabaseFilters, mode: CreatorListMode) => {
  let query = supabase.from(mode === 'ai' ? 'ai_recommended_creators_view' : 'creators');
  
  if (filters.niches?.length) {
    query = query.overlaps('niches', filters.niches);
  }
  
  if (filters.followers_min || filters.followers_max) {
    query = query.gte('followers', filters.followers_min || 0)
                 .lte('followers', filters.followers_max || 999999999);
  }
  
  // Add other filter conditions...
  
  const { data, error } = await query.select('*');
  return data;
};
```

### 3. CreatorListSection Component
**File:** `src/components/sections/CreatorListSection/CreatorListSection.tsx`

**Connection Points:**
- **Line 18:** `useCreatorData` hook - Replace with Supabase creator fetching
- **Line 95-105:** Creator data mapping - Connect to database fields
- **Line 200-400:** Creator card rendering - Map database fields to UI components

**Database Queries Needed:**
```typescript
// Load creators with social media
const loadCreators = async (mode: CreatorListMode, userId?: string) => {
  if (mode === 'ai') {
    const { data, error } = await supabase
      .from('ai_recommended_creators')
      .select(`
        *,
        creators (
          *,
          social_media (*)
        )
      `)
      .eq('user_id', userId);
    return data;
  } else {
    const { data, error } = await supabase
      .from('creators')
      .select(`
        *,
        social_media (*)
      `);
    return data;
  }
};
```

### 4. useCreatorData Hook
**File:** `src/hooks/useCreatorData.ts`

**Connection Points:**
- **Line 1-50:** Mock data definitions - Replace with Supabase client calls
- **Line 60-120:** Hook functions - Replace with real database operations

**Complete Hook Replacement:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export const useCreatorData = () => {
  // Replace all mock data with Supabase calls
  // See detailed implementation in next section
};
```

## Data Flow Architecture

### 1. AI Recommendations Flow
```
User Login → Get User Preferences → Query AI Recommended Creators → Display with Match Scores
```

### 2. All Creators Flow
```
User Request → Query All Creators → Apply Filters → Display without Match Scores
```

### 3. Filter Flow
```
Filter Selection → Build Query Conditions → Execute Supabase Query → Update UI
```

## Implementation Steps

### Step 1: Set up Supabase Client
**File:** `src/lib/supabase.ts` (Create this file)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Step 2: Create Database Views
```sql
-- Create a view for AI recommended creators with match scores
CREATE VIEW ai_recommended_creators_view AS
SELECT 
  c.*,
  arc.match_score,
  arc.user_id
FROM creators c
JOIN ai_recommended_creators arc ON c.id = arc.creator_id;
```

### Step 3: Update Environment Variables
**File:** `.env` (Create this file)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Replace Mock Data Functions
Replace functions in the following order:
1. `loadNiches()` in useCreatorData hook
2. `loadCreators()` in useCreatorData hook
3. `applyFilters()` in useCreatorData hook
4. `calculateMetrics()` in useCreatorData hook

### Step 5: Update Type Definitions
**File:** `src/types/database.ts`
- Add Supabase-specific types
- Update Creator interface to match database schema
- Add proper foreign key relationships

## Code Locations

### Primary Files to Modify:

1. **`src/hooks/useCreatorData.ts`** - Main data fetching logic
   - Lines 60-200: Replace all mock functions with Supabase calls

2. **`src/components/sections/CreatorFilterSection/CreatorFilterSection.tsx`**
   - Line 35: Replace mock niches with database fetch
   - Line 245: Replace mock filtering with Supabase queries

3. **`src/components/sections/CreatorListSection/CreatorListSection.tsx`**
   - Line 18: Connect to real creator data
   - Lines 200-400: Ensure proper data mapping

4. **`src/components/sections/MetricsTitleSection/MetricsTitleSection.tsx`**
   - Lines 15-32: Connect to real-time metrics calculation

### New Files to Create:

1. **`src/lib/supabase.ts`** - Supabase client configuration
2. **`.env`** - Environment variables
3. **`src/types/supabase.ts`** - Generated Supabase types

### Configuration Files to Update:

1. **`package.json`** - Add @supabase/supabase-js dependency
2. **`vite.config.ts`** - Ensure environment variables are loaded

## Match Score Visibility Logic

The match score should only be visible when `currentMode === 'ai'`:

### In Card View:
**File:** `src/components/sections/CreatorListSection/CreatorListSection.tsx`
**Lines:** 250-260
```typescript
{currentMode === 'ai' && (
  <div className={`flex items-center justify-center px-[6px] lg:px-[8px] xl:px-[10px] py-[3px] lg:py-[4px] xl:py-[5px] rounded-[6px] ${getMatchScoreColor(creator.match_score || 0)}`}>
    <span className="font-bold text-[11px] lg:text-[12px] xl:text-[13px] leading-[14px] lg:leading-[16px] xl:leading-[18px]">
      {creator.match_score || 0}%
    </span>
  </div>
)}
```

### In List View:
**File:** `src/components/sections/CreatorListSection/CreatorListSection.tsx`
**Lines:** 400-420
```typescript
{/* Match Score Column - Only show in AI mode */}
{currentMode === 'ai' && (
  <button onClick={() => handleSort('match_score')}>
    <span>Match Score</span>
    <Icon name="SortIcon.svg" />
  </button>
)}
```

## Testing Checklist

- [ ] Supabase client connects successfully
- [ ] Niches load from database
- [ ] Creators load in both AI and All modes
- [ ] Filters work with database queries
- [ ] Match scores only show in AI mode
- [ ] Metrics calculate correctly from filtered data
- [ ] Social media data loads properly
- [ ] Thumbnails and images display correctly
- [ ] Performance is acceptable with real data
- [ ] Error handling works for failed queries

## Next Steps

1. Install Supabase dependency: `npm install @supabase/supabase-js`
2. Set up your Supabase project and get credentials
3. Create the database tables using the provided SQL
4. Add environment variables
5. Replace mock data functions one by one
6. Test each component as you integrate
7. Implement proper error handling and loading states

This guide provides all the connection points needed to integrate your Buzzberry Discover Page with Supabase. Each section includes specific file locations, line numbers, and code examples to make the integration process straightforward.