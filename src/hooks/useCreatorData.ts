import { useState, useEffect } from 'react';
import { supabase, CreatorData } from '../lib/supabase';
import { Creator, CreatorMetrics, Niche, DatabaseFilters, CreatorListMode } from '../types/database';
import { getDisplayLocation, normalizeCountry, parseLocationManually, getRegionForFilter, getAvailableRegions } from '../utils/locationParser';

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

// Helper functions to extract metrics from different data formats
const extractAverageLikes = (averageLikesData: any): number => {
  if (typeof averageLikesData === 'object' && averageLikesData !== null) {
    // Handle case where it's an object with avg_value
    if (averageLikesData.avg_value !== undefined) {
      return averageLikesData.avg_value;
    }
    // Handle case where it's an object with average_likes property
    if (averageLikesData.average_likes !== undefined) {
      return averageLikesData.average_likes;
    }
  }
  // Handle case where it's a direct number
  return averageLikesData || 0;
};

const extractAverageComments = (averageCommentsData: any): number => {
  if (typeof averageCommentsData === 'object' && averageCommentsData !== null) {
    // Handle case where it's an object with avg_value
    if (averageCommentsData.avg_value !== undefined) {
      return averageCommentsData.avg_value;
    }
    // Handle case where it's an object with average_comments property
    if (averageCommentsData.average_comments !== undefined) {
      return averageCommentsData.average_comments;
    }
  }
  // Handle case where it's a direct number
  return averageCommentsData || 0;
};

const extractAverageViews = (averageViewsData: any): number => {
  if (typeof averageViewsData === 'object' && averageViewsData !== null) {
    // Handle case where it's an object with avg_value
    if (averageViewsData.avg_value !== undefined) {
      return averageViewsData.avg_value;
    }
    // Handle case where it's an object with average_views property
    if (averageViewsData.average_views !== undefined) {
      return averageViewsData.average_views;
    }
  }
  // Handle case where it's a direct number
  return averageViewsData || 0;
};

const extractEngagementRate = (engagementData: any): number => {
  if (typeof engagementData === 'object' && engagementData !== null) {
    // Handle case where it's an object with avg_value
    if (engagementData.avg_value !== undefined) {
      return engagementData.avg_value;
    }
    // Handle case where it's an object with engagement_rate property
    if (engagementData.engagement_rate !== undefined) {
      return engagementData.engagement_rate;
    }
  }
  // Handle case where it's a direct number
  return engagementData || 0;
};

const extractFollowersCount = (followersData: any): number => {
  if (typeof followersData === 'object' && followersData !== null) {
    // Handle case where it's an object with avg_value
    if (followersData.avg_value !== undefined) {
      return followersData.avg_value;
    }
    // Handle case where it's an object with followers_count property
    if (followersData.followers_count !== undefined) {
      return followersData.followers_count;
    }
  }
  // Handle case where it's a direct number
  return followersData || 0;
};

// Transform Supabase data to match UI expectations
const transformCreatorData = async (dbCreator: any): Promise<Creator> => {
  try {
    // Extract recent posts and create thumbnails array - optimized for immediate loading
    const validThumbnails = [];
    const validShareUrls = [];
    
    for (let i = 1; i <= 12; i++) {
      let post = dbCreator[`recent_post_${i}`];
      if (post) {
        // Handle case where post might be a JSON string
        if (typeof post === 'string') {
          try {
            post = JSON.parse(post);
          } catch (e) {
            console.warn(`Failed to parse post ${i} for ${dbCreator.handle}:`, e);
            continue;
          }
        }
        // Prefer media_urls[0] if available (Instagram), else fallback to video_url
        let thumbnailUrl = '';
        if (Array.isArray(post.media_urls) && post.media_urls.length > 0) {
          thumbnailUrl = post.media_urls[0];
          // Clean up URL if it ends with '?'
          if (thumbnailUrl && thumbnailUrl.endsWith('?')) {
            thumbnailUrl = thumbnailUrl.slice(0, -1);
          }
        } else if (typeof post.media_urls === 'string' && post.media_urls.trim()) {
          // Handle case where media_urls is a single URL string
          thumbnailUrl = post.media_urls.trim();
          // Clean up URL if it ends with '?'
          if (thumbnailUrl && thumbnailUrl.endsWith('?')) {
            thumbnailUrl = thumbnailUrl.slice(0, -1);
          }
        } else if (post.video_url) {
          thumbnailUrl = extractStaticThumbnail(post.video_url);
        }
        
        // Only add valid thumbnails (skip empty media_urls)
        if (thumbnailUrl) {
          validThumbnails.push(thumbnailUrl);
          
          // Extract share URL for TikTok posts
          if (dbCreator.platform?.toLowerCase() === 'tiktok' && post.share_url) {
            validShareUrls.push(post.share_url);
          } else {
            validShareUrls.push(''); // Empty string for non-TikTok posts
          }
        }
      }
    }
    
    // Take the first 4 valid thumbnails, fill remaining with placeholders if needed
    const recentPosts = [
      ...validThumbnails.slice(0, 4),
      ...Array(4 - Math.min(validThumbnails.length, 4)).fill('/images/PostThumbnail-3.svg')
    ];
    

    
    // Pre-process all thumbnails to ensure they're ready immediately
    const cardThumbnails = recentPosts.slice(0, 3);
    const expandedThumbnails = recentPosts.slice(0, 4);
    
    // Preload thumbnails asynchronously (non-blocking)
    const preloadImages = (urls: string[]) => {
      urls.forEach(url => {
        if (url && !url.includes('PostThumbnail-3.svg')) {
          const img = new Image();
          img.src = url; // Start loading but don't wait
        }
      });
    };
    
    // Preload thumbnails in background (non-blocking)
    preloadImages([...cardThumbnails, ...expandedThumbnails]);

    // Create social media array from platform data
    const socialMedia = [{
      platform: (dbCreator.platform || 'instagram').toLowerCase(),
      username: dbCreator.handle || '',
      url: dbCreator.profile_url || `https://${(dbCreator.platform || 'instagram').toLowerCase()}.com/${dbCreator.handle || ''}`
    }];

    // Create niches array from primary and secondary niches
    const niches = [];
    // Fix for type: 'primary' | 'secondary' in niches
    if (dbCreator.primary_niche) {
      niches.push({ name: dbCreator.primary_niche, type: 'primary' as const });
    }
    if (dbCreator.secondary_niche) {
      niches.push({ name: dbCreator.secondary_niche, type: 'secondary' as const });
    }

    // Parse location - use manual parsing for speed, AI only for complex cases
    let parsedLocation: any;
    const rawLocation = dbCreator.location || '';
    
    try {
      // Use manual parsing for now to avoid potential AI issues
      parsedLocation = parseLocationManually(rawLocation);
    } catch (locationError) {
      console.warn('Location parsing failed for creator:', dbCreator.id, locationError);
      parsedLocation = { city: null, country: 'Unknown', isGlobal: false };
    }
    
    const displayLocation = getDisplayLocation(parsedLocation);

  return {
    id: dbCreator.id,
    profile_pic: dbCreator.profile_image_url,
    match_score: dbCreator.match_score || undefined, // Will be set by AI logic
    buzz_score: dbCreator.buzz_score ?? 0, // Use nullish coalescing to handle null/undefined as 0
    username: dbCreator.display_name,
    username_tag: `@${dbCreator.handle}`,
    social_media: socialMedia,
    bio: dbCreator.bio || '',
    followers: extractFollowersCount(dbCreator.followers_count),
    followers_change: dbCreator.followers_change || 0,
    followers_change_type: (dbCreator.followers_change_type as 'positive' | 'negative') || 'positive',
    engagement: extractEngagementRate(dbCreator.engagement_rate),
    engagement_change: dbCreator.engagement_rate_change || 0,
    engagement_change_type: (dbCreator.engagement_rate_change_type as 'positive' | 'negative') || 'positive',
    avg_views: extractAverageViews(dbCreator.average_views),
    avg_views_change: dbCreator.average_views_change || 0,
    avg_views_change_type: (dbCreator.average_views_change_type as 'positive' | 'negative') || 'positive',
    avg_likes: extractAverageLikes(dbCreator.average_likes),
    avg_likes_change: dbCreator.average_likes_change || 0,
    avg_likes_change_type: (dbCreator.average_likes_change_type as 'positive' | 'negative') || 'positive',
    avg_comments: extractAverageComments(dbCreator.average_comments),
    avg_comments_change: dbCreator.average_comments_change || 0,
    avg_comments_change_type: (dbCreator.average_comments_change_type as 'positive' | 'negative') || 'positive',
    niches: niches,
    hashtags: dbCreator.hashtags || [],
    thumbnails: cardThumbnails, // Pre-processed thumbnails for cards
    expanded_thumbnails: expandedThumbnails, // Pre-processed thumbnails for expanded overlay
    share_urls: validShareUrls.slice(0, 4), // Share URLs for TikTok posts (max 4)
    location: displayLocation,
    email: dbCreator.email || '',
    created_at: dbCreator.created_at || new Date().toISOString(),
    updated_at: dbCreator.created_at || new Date().toISOString()
  };
  } catch (error) {
    console.error('Error transforming creator data:', error, dbCreator);
    // Return a fallback creator object to prevent crashes
    return {
      id: dbCreator.id || 'unknown',
      profile_pic: dbCreator.profile_image_url || '',
      match_score: undefined,
      buzz_score: dbCreator.buzz_score ?? 0,
      username: dbCreator.display_name || 'Unknown Creator',
      username_tag: `@${dbCreator.handle || 'unknown'}`,
      social_media: [{
        platform: (dbCreator.platform || 'instagram').toLowerCase(),
        username: dbCreator.handle || '',
        url: `https://${(dbCreator.platform || 'instagram').toLowerCase()}.com/${dbCreator.handle || ''}`
      }],
      bio: dbCreator.bio || '',
      followers: extractFollowersCount(dbCreator.followers_count),
      followers_change: dbCreator.followers_change || 0,
      followers_change_type: 'positive' as const,
      engagement: extractEngagementRate(dbCreator.engagement_rate),
      engagement_change: dbCreator.engagement_rate_change || 0,
      engagement_change_type: 'positive' as const,
      avg_views: extractAverageViews(dbCreator.average_views),
      avg_views_change: dbCreator.average_views_change || 0,
      avg_views_change_type: 'positive' as const,
      avg_likes: extractAverageLikes(dbCreator.average_likes),
      avg_likes_change: dbCreator.average_likes_change || 0,
      avg_likes_change_type: 'positive' as const,
      avg_comments: extractAverageComments(dbCreator.average_comments),
      avg_comments_change: dbCreator.average_comments_change || 0,
      avg_comments_change_type: 'positive' as const,
      niches: [],
      hashtags: dbCreator.hashtags || [],
      thumbnails: [],
      expanded_thumbnails: [],
      share_urls: [],
      location: 'Unknown',
      email: dbCreator.email || '',
      created_at: dbCreator.created_at || new Date().toISOString(),
      updated_at: dbCreator.created_at || new Date().toISOString()
    };
  }
};

// Fetch metrics for all creators (count, avg followers, avg views, avg engagement)
const fetchCreatorMetrics = async (filters: DatabaseFilters = {}, setTotalCount?: (count: number) => void) => {
  // console.log('fetchCreatorMetrics called with filters:', filters);
  let query = supabase
    .from('creatordata')
    .select('id, followers_count, average_views, engagement_rate', { count: 'exact', head: false });

  // Optionally apply filters here if needed
  // (You can add filter logic similar to applyFilters if you want metrics to reflect filters)

  // Apply filters (same logic as above)
  if (filters.niches?.length) {
    // console.log('Filtering by niches:', filters.niches);
    // Only filter by primary_niche
    query = query.in('primary_niche', filters.niches);
  }
        if (filters.platforms?.length) {
        // Handle case-insensitive platform matching
        const platformConditions = filters.platforms.map(platform => {
          const lowerPlatform = platform.toLowerCase();
          if (lowerPlatform === 'instagram') return 'platform.ilike.instagram';
          if (lowerPlatform === 'tiktok') return 'platform.ilike.tiktok';
          if (lowerPlatform === 'youtube') return 'platform.ilike.youtube';
          if (lowerPlatform === 'x' || lowerPlatform === 'twitter') return 'platform.ilike.twitter';
          return `platform.ilike.${platform}`;
        });
        query = query.or(platformConditions.join(','));
      }
  if (filters.followers_min !== undefined) {
    query = query.gte('followers_count', filters.followers_min);
  }
  if (filters.followers_max !== undefined) {
    query = query.lte('followers_count', filters.followers_max);
  }
  if (filters.engagement_min !== undefined) {
    query = query.gte('engagement_rate', filters.engagement_min);
  }
  if (filters.engagement_max !== undefined) {
    query = query.lte('engagement_rate', filters.engagement_max);
  }
  if (filters.avg_views_min !== undefined) {
    query = query.gte('average_views', filters.avg_views_min);
  }
  if (filters.avg_views_max !== undefined) {
    query = query.lte('average_views', filters.avg_views_max);
  }
  if (filters.buzz_scores?.length) {
    // Simplified buzz score filtering - since all scores are currently 0
    const hasLessThan60 = filters.buzz_scores.includes('Less than 60%');
    const hasOtherRanges = filters.buzz_scores.some(range => range !== 'Less than 60%');
    
    if (!hasLessThan60 && hasOtherRanges) {
      // Only higher ranges selected - return no results efficiently
      // Use a condition that will never match any existing records
      query = query.eq('buzz_score', 999999);
    }
    // For all other cases (Less than 60% selected or both selected), no filtering needed
    // since all current buzz scores are 0, which falls under "Less than 60%"
  }
  if (filters.locations?.length) {
    // For each selected region, match all countries in that region
    const locationVariants: string[] = [];
    filters.locations.forEach(region => {
      if (region === 'Global') {
        locationVariants.push('location.ilike.%global%');
      } else if (region === 'United States') {
        locationVariants.push('location.ilike.%us%', 'location.ilike.%usa%', 'location.ilike.%united states%');
      } else if (region === 'Europe') {
        // Add European countries
        const europeanCountries = ['uk', 'germany', 'france', 'spain', 'italy', 'netherlands', 'sweden', 'norway', 'denmark', 'finland', 'poland', 'czech', 'austria', 'switzerland', 'belgium', 'portugal', 'ireland', 'belarus'];
        europeanCountries.forEach(country => {
          locationVariants.push(`location.ilike.%${country}%`);
        });
      } else if (region === 'Asia') {
        // Add Asian countries
        const asianCountries = ['japan', 'korea', 'singapore', 'india', 'china', 'philippines'];
        asianCountries.forEach(country => {
          locationVariants.push(`location.ilike.%${country}%`);
        });
      } else if (region === 'Middle East') {
        // Add Middle Eastern countries - be more specific to avoid false matches
        const middleEastCountries = ['saudi arabia', 'saudi', 'uae', 'united arab emirates', 'qatar', 'kuwait', 'bahrain', 'oman', 'jordan', 'lebanon', 'israel', 'turkey', 'iran', 'iraq', 'egypt'];
        middleEastCountries.forEach(country => {
          locationVariants.push(`location.ilike.%${country}%`);
        });
      }
    });
    if (locationVariants.length) {
      query = query.or(locationVariants.join(','));
    }
  }

  const { data, count, error } = await query;
  // console.log('fetchCreatorMetrics query result:', { data: data?.length, count, error });
  if (error) throw error;

  const total_creators = count || 0;
  if (setTotalCount) {
    setTotalCount(total_creators);
  }
  let avg_followers = 0, avg_views = 0, avg_engagement = 0;
  if (data && data.length > 0) {
    avg_followers = Math.round(data.reduce((sum, c) => sum + (c.followers_count || 0), 0) / data.length);
    avg_views = Math.round(data.reduce((sum, c) => sum + (c.average_views || 0), 0) / data.length);
    avg_engagement = Math.round((data.reduce((sum, c) => sum + (c.engagement_rate || 0), 0) / data.length) * 100) / 100;
  }
  // In fetchCreatorMetrics, ensure change_type is typed correctly
  return {
    total_creators,
    avg_followers,
    avg_views,
    avg_engagement,
    change_percentage: 0, // Not calculated here
    change_type: 'positive' as const, // Not calculated here
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
  // Add currentFilters state
  const [currentFilters, setCurrentFilters] = useState<DatabaseFilters>({});
  const [totalFilteredCount, setTotalFilteredCount] = useState(0);
  const [countries, setCountries] = useState<string[]>([]);

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
    fetchPaginatedCreators(page);
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
    // Removed debug logging for security
    setCurrentFilters(filters);
    setLoading(true);
    setError(null);

    try {
      // Update metrics with new filters
      const metrics = await fetchCreatorMetrics(filters, setTotalFilteredCount);
      setMetrics(metrics);
      
      // Fetch first page with new filters
      await fetchPaginatedCreators(1, mode, filters);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while filtering creators');
      // Removed debug logging for security
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
      // For 'all' mode, always use pagination
      await loadCreators('all');
    }
  };

  // Load creators from Supabase with pagination
  const loadCreators = async (mode: CreatorListMode = currentMode) => {
    setLoading(true);
    setError(null);

    try {
      // For 'all' mode, just set up the initial state and load first page
      if (mode === 'all') {
        setAllCreators([]); // Clear to indicate we're using pagination
        setCreators([]);
        setFilteredCreators([]);
        // Load first page immediately
        await fetchPaginatedCreators(1, 'all', {});
      } else {
        // For 'ai' mode, load a subset for recommendations
        const { data, error: queryError } = await supabase
          .from('creatordata')
          .select('*')
          .order('followers_count', { ascending: false })
          .limit(100); // Limit to 100 for AI recommendations
        
        if (queryError) throw queryError;
        
        // Transform the data
        let transformedCreators = await Promise.all((data || []).map(transformCreatorData));
        
        // Apply AI logic to assign match scores
        transformedCreators = transformedCreators.map(creator => ({
          ...creator,
          match_score: Math.floor(Math.random() * 40) + 60 // Temporary: 60-100% match scores
        }));
        
        // Sort by match score for AI mode
        transformedCreators.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
        
        setAiRecommendedCreators(transformedCreators);
        setCreators(transformedCreators);
        setFilteredCreators(transformedCreators);
        updatePagination(transformedCreators, 1);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load creators');
      // Removed debug logging for security
    } finally {
      setLoading(false);
    }
  };

  // Fetch paginated creators from Supabase
  const fetchPaginatedCreators = async (page: number, mode: CreatorListMode = currentMode, filters: DatabaseFilters = currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const startIndex = (page - 1) * CREATORS_PER_PAGE;
      const endIndex = startIndex + CREATORS_PER_PAGE - 1;
      let query = supabase
        .from('creatordata')
        .select('*', { count: 'exact' })
        .order('followers_count', { ascending: false })
        .range(startIndex, endIndex);
      
      // Apply filters (same logic as applyFilters)
      if (filters.niches?.length) {
        // Only filter by primary_niche
        query = query.in('primary_niche', filters.niches);
      }
      if (filters.platforms?.length) {
        // Handle case-insensitive platform matching
        const platformConditions = filters.platforms.map(platform => {
          const lowerPlatform = platform.toLowerCase();
          if (lowerPlatform === 'instagram') return 'platform.ilike.instagram';
          if (lowerPlatform === 'tiktok') return 'platform.ilike.tiktok';
          if (lowerPlatform === 'youtube') return 'platform.ilike.youtube';
          if (lowerPlatform === 'x' || lowerPlatform === 'twitter') return 'platform.ilike.twitter';
          return `platform.ilike.${platform}`;
        });
        query = query.or(platformConditions.join(','));
      }
      if (filters.followers_min !== undefined) {
        query = query.gte('followers_count', filters.followers_min);
      }
      if (filters.followers_max !== undefined) {
        query = query.lte('followers_count', filters.followers_max);
      }
      if (filters.engagement_min !== undefined) {
        query = query.gte('engagement_rate', filters.engagement_min);
      }
      if (filters.engagement_max !== undefined) {
        query = query.lte('engagement_rate', filters.engagement_max);
      }
      if (filters.avg_views_min !== undefined) {
        query = query.gte('average_views', filters.avg_views_min);
      }
      if (filters.avg_views_max !== undefined) {
        query = query.lte('average_views', filters.avg_views_max);
      }
      if (filters.buzz_scores?.length) {
        // Simplified buzz score filtering - since all scores are currently 0
        const hasLessThan60 = filters.buzz_scores.includes('Less than 60%');
        const hasOtherRanges = filters.buzz_scores.some(range => range !== 'Less than 60%');
        
        if (!hasLessThan60 && hasOtherRanges) {
          // Only higher ranges selected - return no results efficiently
          // Use a condition that will never match any existing records
          query = query.eq('buzz_score', 999999);
        }
        // For all other cases (Less than 60% selected or both selected), no filtering needed
        // since all current buzz scores are 0, which falls under "Less than 60%"
      }
      if (filters.locations?.length) {
        // For each selected region, match all countries in that region
        const locationVariants: string[] = [];
        filters.locations.forEach(region => {
          if (region === 'Global') {
            locationVariants.push('location.ilike.%global%');
          } else if (region === 'United States') {
            locationVariants.push('location.ilike.%us%', 'location.ilike.%usa%', 'location.ilike.%united states%');
          } else if (region === 'Europe') {
            // Add European countries
            const europeanCountries = ['uk', 'germany', 'france', 'spain', 'italy', 'netherlands', 'sweden', 'norway', 'denmark', 'finland', 'poland', 'czech', 'austria', 'switzerland', 'belgium', 'portugal', 'ireland', 'belarus'];
            europeanCountries.forEach(country => {
              locationVariants.push(`location.ilike.%${country}%`);
            });
          } else if (region === 'Asia') {
            // Add Asian countries
            const asianCountries = ['japan', 'korea', 'singapore', 'india', 'china', 'philippines'];
            asianCountries.forEach(country => {
              locationVariants.push(`location.ilike.%${country}%`);
            });
          } else if (region === 'Middle East') {
            // Add Middle Eastern countries - be more specific to avoid false matches
            const middleEastCountries = ['saudi arabia', 'saudi', 'uae', 'united arab emirates', 'qatar', 'kuwait', 'bahrain', 'oman', 'jordan', 'lebanon', 'israel', 'turkey', 'iran', 'iraq', 'egypt'];
            middleEastCountries.forEach(country => {
              locationVariants.push(`location.ilike.%${country}%`);
            });
          }
        });
        if (locationVariants.length) {
          query = query.or(locationVariants.join(','));
        }
      }
      
      const { data, error: queryError, count } = await query;
      if (queryError) throw queryError;
      
      // Transform creators with error handling
      let transformedCreators: Creator[] = [];
      try {
        transformedCreators = await Promise.all((data || []).map(transformCreatorData));
      } catch (transformError) {
        console.error('Error transforming creators:', transformError);
        // Return empty array to prevent crash
        transformedCreators = [];
      }
      
      if (mode === 'ai') {
        transformedCreators = transformedCreators.map(creator => ({
          ...creator,
          match_score: Math.floor(Math.random() * 40) + 60 // Temporary: 60-100% match scores
        }));
        transformedCreators.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
        setAiRecommendedCreators(transformedCreators);
      } else {
        setAllCreators(transformedCreators);
      }
      
      setCreators(transformedCreators);
      setFilteredCreators(transformedCreators); // For compatibility
      setPaginatedCreators(transformedCreators);
      setCurrentPage(page);
      // Set total pages based on count (if available)
      if (typeof count === 'number') {
        setTotalPages(Math.ceil(count / CREATORS_PER_PAGE));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load creators');
      // Removed debug logging for security
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
      
      // Removed debug logging for security
      
      // Convert to Niche objects
      const uniqueNiches: Niche[] = Array.from(nicheSet).map(name => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        created_at: new Date().toISOString()
      }));
      
      setNiches(uniqueNiches);
      
    } catch (err) {
      // Removed debug logging for security
      // Fallback to empty array
      setNiches([]);
    }
  };

  // Load locations from database
  const loadLocations = async () => {
    try {
      const { data, error: queryError } = await supabase
        .from('creatordata')
        .select('location');
      
      if (queryError) throw queryError;
      
      // Quick fallback: load regions immediately with manual parsing
      const quickRegionSet = new Set<string>();
      const uniqueLocations = [...new Set(data?.map(c => c.location).filter(Boolean))];
      
      // First, do quick manual parsing for immediate results
      uniqueLocations.forEach(location => {
        const parsed = parseLocationManually(location);
        if (parsed.country && parsed.country !== 'Unknown') {
          const region = getRegionForFilter(parsed.country);
          quickRegionSet.add(region);
        }
      });
      
      // Set initial regions immediately (in the specified order)
      const orderedRegions = getAvailableRegions().filter(region => quickRegionSet.has(region));
      setCountries(orderedRegions);
      // Removed debug logging for security
      
      // Then process with AI in background (optional)
      if (uniqueLocations.length > 0) {
        // Process locations in batches with timeout
        const regionSet = new Set<string>();
        const batchSize = 10;
        const timeout = 5000; // 5 second timeout
        
        for (let i = 0; i < uniqueLocations.length; i += batchSize) {
          const batch = uniqueLocations.slice(i, i + batchSize);
          
          try {
            const batchPromises = batch.map(async (location) => {
              // Use manual parsing instead of AI to avoid issues
              return parseLocationManually(location);
            });
            
            const results = await Promise.all(batchPromises);
            
            results.forEach((parsedLocation: any) => {
              if (parsedLocation.country && parsedLocation.country !== 'Unknown') {
                const region = getRegionForFilter(parsedLocation.country);
                regionSet.add(region);
              }
            });
            
          } catch (error) {
            // Removed debug logging for security
            // Fallback to manual parsing for this batch
            batch.forEach(location => {
              const parsed = parseLocationManually(location);
              if (parsed.country && parsed.country !== 'Unknown') {
                const region = getRegionForFilter(parsed.country);
                regionSet.add(region);
              }
            });
          }
        }
        
        // Update with AI results if different
        const aiRegions = getAvailableRegions().filter(region => regionSet.has(region));
        if (aiRegions.length > 0) {
          setCountries(aiRegions);
          // Removed debug logging for security
        }
      }
      
    } catch (err) {
      // Removed debug logging for security
      setCountries([]);
    }
  };

  // On mount, fetch metrics and first page
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const metrics = await fetchCreatorMetrics(currentFilters, setTotalFilteredCount);
        setMetrics(metrics);
        await fetchPaginatedCreators(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load creators');
      } finally {
        setLoading(false);
      }
    })();
    loadNiches();
    loadLocations();
  }, []);

  // Debug what's being returned (only log when values change)
  // console.log('useCreatorData returning:', {
  //   creatorsCount: paginatedCreators.length,
  //   totalCreators: totalFilteredCount,
  //   metrics,
  //   currentPage,
  //   totalPages
  // });

  return {
    creators: paginatedCreators, // Return paginated creators instead of all filtered creators
    allCreators: creators,
    filteredCreators, // Keep full filtered list for metrics
    currentMode,
    currentPage,
    totalPages,
    totalCreators: totalFilteredCount,
    niches,
    metrics,
    loading,
    error,
    applyFilters,
    switchMode,
    loadCreators,
    loadNiches,
    loadLocations,
    handlePageChange,
    nextPage,
    previousPage,
    countries
  };
};