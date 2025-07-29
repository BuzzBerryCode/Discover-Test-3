# 🚀 Supabase Setup Instructions

## Quick Setup Checklist

### ✅ Step 1: Get Your Supabase Credentials
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Navigate to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (looks like: `https://xyzabc123.supabase.co`)
   - **anon public key** (long JWT token starting with `eyJ...`)

### ✅ Step 2: Update Environment Variables
1. Open the `.env` file in your project root
2. Replace the placeholder values:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### ✅ Step 3: Verify Your Database Table
Make sure your `creatordata` table exists with these columns:
- `id` (uuid, primary key)
- `handle` (text)
- `display_name` (text)
- `profile_image_url` (text)
- `bio` (text)
- `platform` (text)
- `primary_niche` (text)
- `secondary_niche` (text)
- `location` (text)
- `followers_count` (int4)
- `average_views` (int4)
- `average_comments` (int4)
- `engagement_rate` (float8)
- `buzz_score` (int4)
- `recent_post_1` through `recent_post_12` (json)
- All the change fields (`followers_change`, `engagement_rate_change`, etc.)

### ✅ Step 4: Test the Connection
1. Start your development server: `npm run dev`
2. Open the discover page
3. Check the browser console for any connection errors
4. Verify that creators are loading from your database

## 🔧 Troubleshooting

### Common Issues:

**❌ "Missing Supabase environment variables"**
- Check that your `.env` file is in the project root
- Verify variable names start with `VITE_`
- Restart your dev server after adding variables

**❌ "Failed to load creators"**
- Check your Supabase project is active
- Verify your `creatordata` table exists
- Check Row Level Security (RLS) settings if enabled

**❌ "No creators found"**
- Verify your table has data
- Check that column names match exactly
- Look at browser network tab for API errors

### Database Permissions:
If you have Row Level Security enabled, you may need to add policies:
```sql
-- Allow anonymous read access to creatordata
CREATE POLICY "Allow anonymous read access" ON creatordata
FOR SELECT TO anon USING (true);
```

## 🎯 What's Connected:

### ✅ Real Data Integration:
- ✅ Creator profiles and bios
- ✅ Follower counts and engagement rates
- ✅ Recent posts and thumbnails
- ✅ Niches and categories
- ✅ Location data
- ✅ Buzz scores
- ✅ All change metrics with trend indicators

### ✅ Filtering System:
- ✅ Niche filtering (primary + secondary)
- ✅ Platform filtering
- ✅ Location filtering
- ✅ Followers range filtering
- ✅ Engagement range filtering
- ✅ Views range filtering
- ✅ Buzz score range filtering

### ✅ AI vs All Creators:
- ✅ Toggle between AI recommendations and all creators
- ✅ Match scores only show in AI mode
- ✅ Proper data separation

## 🚀 You're Ready!

Once you've added your Supabase credentials to the `.env` file, your discover page will automatically:
- Load real creator data from your database
- Apply filters based on actual data
- Calculate metrics from your creator pool
- Display proper thumbnails from recent posts

No additional code changes needed! 🎉