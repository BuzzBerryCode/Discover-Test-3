import { useState, useEffect } from 'react';
import { supabase, CreatorData } from '../lib/supabase';
import { Creator, CreatorMetrics, Niche, DatabaseFilters, CreatorListMode } from '../types/database';

// Pagination configuration
const CREATORS_PER_PAGE = 24;

// Extract static thumbnail from TikTok video URL
const extractStaticThumbnail = (videoUrl: string): string => {
  if (!videoUrl) return '';
  
  // For TikTok videos, try to get static thumbnail
  if (videoUrl.includes('tiktok.com') || videoUrl.includes('supabase.co')) {
    // If it's a .awebp file, it should already be static
    if (videoUrl.includes('.awebp') || videoUrl.includes('.webp') || videoUrl.includes('.jpg') || videoUrl.includes('.png')) {
      return videoUrl;
    }
    // For video files, try to get thumbnail by replacing extension or adding thumbnail parameter
    if (videoUrl.includes('.mp4') || videoUrl.includes('.mov')) {
      // Try to get thumbnail version
      return videoUrl.replace(/\.(mp4|mov)/, '_thumbnail.jpg');
    }
  }
  
  return videoUrl; // Return as-is if we can't determine a better thumbnail
};

// Transform Supabase data to match UI expectations
const transformCreatorData = (dbCreator: any): Creator => {
  // Extract recent posts and create thumbnails array
  const recentPosts = [];
  for (let i = 1; i <= 12; i++) {
    const post = dbCreator[`recent_post_${i}`];
    if (post && post.video_url) {
      // Extract static thumbnail instead of potentially animated video
      const staticThumbnail = extractStaticThumbnail(post.video_url);
      recentPosts.push(staticThumbnail);
    }
  }

  // Create social media array from platform data
  const socialMedia = [{
    platform: dbCreator.platform.toLowerCase(),
    username: dbCreator.handle,
    url: dbCreator.profile_url || `https://${dbCreator.platform.toLowerCase()}.com/${dbCreator.handle}`
  }];

  // Create niches array from primary and secondary niches
  const niches = [];
  if (dbCreator.primary_niche) {
    niches.push({ name: dbCreator.primary_niche, type: 'primary' });
  }
  if (dbCreator.secondary_niche) {
    niches.push({ name: dbCreator.secondary_niche, type: 'secondary' });
  }

  return {
    id: dbCreator.id,
    profile_pic: dbCreator.profile_image_url,
    match_score: dbCreator.match_score || undefined, // Will be set by AI logic
    buzz_score: dbCreator.buzz_score || 0,
    username: dbCreator.display_name,
    username_tag: `@${dbCreator.handle}`,
    social_media: socialMedia,
    bio: dbCreator.bio || '',
    followers: dbCreator.followers_count || 0,
    followers_change: dbCreator.followers_change || 0,
    followers_change_type: (dbCreator.followers_change_type as 'positive' | 'negative') || 'positive',
    engagement: dbCreator.engagement_rate || 0,
    engagement_change: dbCreator.engagement_rate_change || 0,
    engagement_change_type: (dbCreator.engagement_rate_change_type as 'positive' | 'negative') || 'positive',
    avg_views: dbCreator.average_views || 0,
    avg_views_change: dbCreator.average_views_change || 0,
    avg_views_change_type: (dbCreator.average_views_change_type as 'positive' | 'negative') || 'positive',
    avg_likes: typeof dbCreator.average_likes === 'object' ? dbCreator.average_likes?.value || 0 : dbCreator.average_likes || 0,
    avg_likes_change: dbCreator.average_likes_change || 0,
    avg_likes_change_type: (dbCreator.average_likes_change_type as 'positive' | 'negative') || 'positive',
    avg_comments: dbCreator.average_comments || 0,
    avg_comments_change: dbCreator.average_comments_change || 0,
    avg_comments_change_type: (dbCreator.average_comments_change_type as 'positive' | 'negative') || 'positive',
    niches: niches,
    hashtags: dbCreator.hashtags || [],
    thumbnails: recentPosts.slice(0, 3), // Take first 3 for thumbnails
    location: dbCreator.location || '',
    email: dbCreator.email || '',
    created_at: dbCreator.created_at || new Date().toISOString(),
    updated_at: dbCreator.created_at || new Date().toISOString()
  };
};

// Custom hook for creator data management
export const useCreatorData = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const [paginatedCreators, setPaginatedCreators] = useState<Creator[]>([]);
  const [aiRecommendedCreators, setAiRecommendedCreators] = useState<Creator[]>([]);
  const [allCreators, setAllCreators] = useState<Creator[]>([]);
  const [currentMode, setCurrentMode] = useState<CreatorListMode>('ai');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [metrics, setMetrics] = useState<CreatorMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate metrics based on current filtered creators
  const calculateMetrics = (creatorList: Creator[]): CreatorMetrics => {
    if (creatorList.length === 0) {
      return {
        total_creators: 0,
        avg_followers: 0,
        avg_views: 0,
        avg_engagement: 0,
        change_percentage: 0,
        change_type: 'positive'
      };
    }

    const totalFollowers = creatorList.reduce((sum, creator) => sum + creator.followers, 0);
    const totalViews = creatorList.reduce((sum, creator) => sum + creator.avg_views, 0);
    const totalEngagement = creatorList.reduce((sum, creator) => sum + creator.engagement, 0);

    // Calculate average change percentage across all creators
    const avgFollowersChange = creatorList.reduce((sum, creator) => sum + (creator.followers_change || 0), 0) / creatorList.length;

    return {
      total_creators: creatorList.length,
      avg_followers: Math.round(totalFollowers / creatorList.length),
      avg_views: Math.round(totalViews / creatorList.length),
      avg_engagement: Math.round((totalEngagement / creatorList.length) * 100) / 100,
      change_percentage: Math.round(avgFollowersChange * 100) / 100,
      change_type: avgFollowersChange >= 0 ? 'positive' : 'negative'
    };
  };

  // Update pagination when filtered creators change
  const updatePagination = (creatorList: Creator[], page: number = 1) => {
    const totalPages = Math.ceil(creatorList.length / CREATORS_PER_PAGE);
    const startIndex = (page - 1) * CREATORS_PER_PAGE;
    const endIndex = startIndex + CREATORS_PER_PAGE;
    const paginatedList = creatorList.slice(startIndex, endIndex);
    
    setTotalPages(totalPages);
    setCurrentPage(page);
    setPaginatedCreators(paginatedList);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      updatePagination(filteredCreators, page);
    }
  };

  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Go to previous page
  const previousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  // Apply filters to creators using Supabase queries
  const applyFilters = async (filters: DatabaseFilters, mode: CreatorListMode = currentMode) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('creatordata').select('*');
      
      // Apply niche filters
      if (filters.niches?.length) {
        const nicheConditions = filters.niches.map(niche => 
          `primary_niche.eq.${niche},secondary_niche.eq.${niche}`
        ).join(',');
        query = query.or(nicheConditions);
      }
      
      // Apply platform filters
      if (filters.platforms?.length) {
        query = query.in('platform', filters.platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)));
      }
      
      // Apply followers range filter
      if (filters.followers_min !== undefined || filters.followers_max !== undefined) {
        if (filters.followers_min !== undefined) {
          query = query.gte('followers_count', filters.followers_min);
        }
        if (filters.followers_max !== undefined) {
          query = query.lte('followers_count', filters.followers_max);
        }
      }
      
      // Apply engagement range filter
      if (filters.engagement_min !== undefined || filters.engagement_max !== undefined) {
        if (filters.engagement_min !== undefined) {
          query = query.gte('engagement_rate', filters.engagement_min);
        }
        if (filters.engagement_max !== undefined) {
          query = query.lte('engagement_rate', filters.engagement_max);
        }
      }
      
      // Apply average views range filter
      if (filters.avg_views_min !== undefined || filters.avg_views_max !== undefined) {
        if (filters.avg_views_min !== undefined) {
          query = query.gte('average_views', filters.avg_views_min);
        }
        if (filters.avg_views_max !== undefined) {
          query = query.lte('average_views', filters.avg_views_max);
        }
      }
      
      // Apply location filter
      if (filters.locations?.length) {
        query = query.in('location', filters.locations);
      }
      
      // Apply buzz score filters
      if (filters.buzz_scores?.length) {
        const buzzConditions = filters.buzz_scores.map(range => {
          switch (range) {
            case '90%+': return 'buzz_score.gte.90';
            case '80-90%': return 'buzz_score.gte.80.and.buzz_score.lt.90';
            case '70-80%': return 'buzz_score.gte.70.and.buzz_score.lt.80';
            case '60-70%': return 'buzz_score.gte.60.and.buzz_score.lt.70';
            case 'Less than 60%': return 'buzz_score.lt.60';
            default: return '';
          }
        }).filter(Boolean);
        
        if (buzzConditions.length) {
          query = query.or(buzzConditions.join(','));
        }
      }

      const { data, error: queryError } = await query;
      
      if (queryError) throw queryError;
      
      // Transform the data and apply AI logic if needed
      let transformedCreators = (data || []).map(transformCreatorData);
      
      // If in AI mode, assign match scores (this would be replaced with actual AI logic)
      if (mode === 'ai') {
        transformedCreators = transformedCreators.map(creator => ({
          ...creator,
          match_score: Math.floor(Math.random() * 40) + 60 // Temporary: 60-100% match scores
        }));
        setAiRecommendedCreators(transformedCreators);
      } else {
        setAllCreators(transformedCreators);
      }
      
      setFilteredCreators(transformedCreators);
      updatePagination(transformedCreators, 1); // Reset to first page when filtering
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while filtering creators');
      console.error('Filter error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Switch between AI recommendations and all creators
  const switchMode = async (mode: CreatorListMode) => {
    setCurrentMode(mode);
    
    // Load appropriate data based on mode
    if (mode === 'ai') {
      if (aiRecommendedCreators.length === 0) {
        await loadCreators('ai');
      } else {
        setCreators(aiRecommendedCreators);
        setFilteredCreators(aiRecommendedCreators);
        updatePagination(aiRecommendedCreators, 1);
      }
    } else {
      if (allCreators.length === 0) {
        await loadCreators('all');
      } else {
        setCreators(allCreators);
        setFilteredCreators(allCreators);
        updatePagination(allCreators, 1);
      }
    }
  };

  // Load creators from Supabase
  const loadCreators = async (mode: CreatorListMode = currentMode) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('creatordata')
        .select('*')
        .order('followers_count', { ascending: false });
      
      if (queryError) throw queryError;
      
      // Transform the data
      let transformedCreators = (data || []).map(transformCreatorData);
      
      if (mode === 'ai') {
        // Apply AI logic to assign match scores
        transformedCreators = transformedCreators.map(creator => ({
          ...creator,
          match_score: Math.floor(Math.random() * 40) + 60 // Temporary: 60-100% match scores
        }));
        
        // Sort by match score for AI mode
        transformedCreators.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
        
        setAiRecommendedCreators(transformedCreators);
      } else {
        setAllCreators(transformedCreators);
      }
      
      setCreators(transformedCreators);
      setFilteredCreators(transformedCreators);
      updatePagination(transformedCreators, 1);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load creators');
      console.error('Load creators error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load niches from database
  const loadNiches = async () => {
    try {
      // Get unique niches from primary_niche column only
      const { data, error: queryError } = await supabase
        .from('creatordata')
        .select('primary_niche');
      
      if (queryError) throw queryError;
      
      // Extract unique primary niches only
      const nicheSet = new Set<string>();
      data?.forEach(creator => {
        if (creator.primary_niche) nicheSet.add(creator.primary_niche);
      });
      
      // Convert to Niche objects
      const uniqueNiches: Niche[] = Array.from(nicheSet).map(name => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        created_at: new Date().toISOString()
      }));
      
      setNiches(uniqueNiches);
      
    } catch (err) {
      console.error('Failed to load niches:', err);
      // Fallback to empty array
      setNiches([]);
    }
  };

  // Calculate metrics whenever filtered creators change
  useEffect(() => {
    const newMetrics = calculateMetrics(filteredCreators);
    setMetrics(newMetrics);
    updatePagination(filteredCreators, 1); // Update pagination when filtered creators change
  }, [filteredCreators]);

  // Load initial data on mount
  useEffect(() => {
    loadCreators();
    loadNiches();
  }, []);

  return {
    creators: paginatedCreators, // Return paginated creators instead of all filtered creators
    allCreators: creators,
    filteredCreators, // Keep full filtered list for metrics
    currentMode,
    currentPage,
    totalPages,
    totalCreators: filteredCreators.length,
    niches,
    metrics,
    loading,
    error,
    applyFilters,
    switchMode,
    loadCreators,
    loadNiches,
    handlePageChange,
    nextPage,
    previousPage
  };
};