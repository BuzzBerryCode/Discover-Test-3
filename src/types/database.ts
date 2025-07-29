// Database types and interfaces

export interface SocialMedia {
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter';
  username: string;
  url: string;
}

export interface Creator {
  id: string;
  profile_pic?: string;
  match_score?: number;
  buzz_score: number;
  username: string;
  username_tag?: string;
  social_media: SocialMedia[];
  bio: string;
  followers: number;
  followers_change?: number;
  followers_change_type?: 'positive' | 'negative';
  engagement: number;
  engagement_change?: number;
  engagement_change_type?: 'positive' | 'negative';
  avg_views: number;
  avg_views_change?: number;
  avg_views_change_type?: 'positive' | 'negative';
  avg_likes?: number;
  avg_likes_change?: number;
  avg_likes_change_type?: 'positive' | 'negative';
  avg_comments?: number;
  avg_comments_change?: number;
  avg_comments_change_type?: 'positive' | 'negative';
  niches: Array<{ name: string; type: 'primary' | 'secondary' }>;
  hashtags?: string[];
  thumbnails: string[];
  location?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Niche {
  id: string;
  name: string;
  created_at: string;
}

export interface CreatorMetrics {
  total_creators: number;
  avg_followers: number;
  avg_views: number;
  avg_engagement: number;
  change_percentage: number;
  change_type: 'positive' | 'negative';
}

export interface DatabaseFilters {
  niches?: string[];
  platforms?: string[];
  match_scores?: string[];
  buzz_scores?: string[];
  followers_min?: number;
  followers_max?: number;
  engagement_min?: number;
  engagement_max?: number;
  avg_views_min?: number;
  avg_views_max?: number;
}

export type CreatorListMode = 'ai' | 'all';
export type ViewMode = 'cards' | 'list';
export type SortField = 'match_score' | 'followers' | 'avg_views' | 'engagement';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField | null;
  direction: SortDirection;
}