import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './icon';
import { Badge } from './badge';
import { Button } from './button';
import { Creator } from '../../types/database';
import { formatNumber, getSocialMediaIcon } from '../../utils/formatters';

interface ExpandedProfileOverlayProps {
  creator: Creator;
  isOpen: boolean;
  onClose: () => void;
}

export const ExpandedProfileOverlay: React.FC<ExpandedProfileOverlayProps> = ({
  creator,
  isOpen,
  onClose,
}) => {
  const [showAllHashtags, setShowAllHashtags] = useState(false);
  const [emailButtonText, setEmailButtonText] = useState('Copy Email ID');
  const [showBuzzScoreInfo, setShowBuzzScoreInfo] = useState(false);
  const buzzScoreInfoRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        setShowBuzzScoreInfo(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Close buzz score info popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buzzScoreInfoRef.current && 
        !buzzScoreInfoRef.current.contains(event.target as Node)
      ) {
        setShowBuzzScoreInfo(false);
      }
    };

    if (showBuzzScoreInfo) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showBuzzScoreInfo]);
  // Handle email copy
  const handleEmailClick = async () => {
    if (creator.email) {
      try {
        await navigator.clipboard.writeText(creator.email);
        setEmailButtonText('Copied to clipboard');
        setTimeout(() => {
          setEmailButtonText('Copy Email ID');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy email:', err);
      }
    }
  };

  // Handle DM click
  const handleDMClick = () => {
    const primarySocial = creator.social_media[0];
    if (primarySocial?.url) {
      window.open(primarySocial.url, '_blank');
    }
  };

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div 
        className={`
          absolute bg-[#F9FAFB] border-[#CAC8C8] overflow-y-auto pointer-events-auto
          ${/* Mobile: Full screen */ ''}
          w-full h-full top-0 right-0 rounded-none border-0
          ${/* Medium: 60% width, XL: 50% width, right side */ ''}
          md:w-[60%] md:h-full md:top-0 md:right-0 md:rounded-tl-[16px] md:rounded-bl-[16px] md:border-l md:border-t-0 md:border-r-0 md:border-b-0
          lg:w-[60%] lg:rounded-tl-[15px] lg:rounded-bl-[15px]
          xl:w-[50%] xl:rounded-tl-[16px] xl:rounded-bl-[16px]
        `}
        style={{ borderWidth: '1px' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-[12px] md:p-[15px] mb-[12px] md:mb-[17px]">
          <div className="flex items-center gap-[10px] md:gap-[12px] lg:gap-[15px] xl:gap-[18px] flex-1">
            {/* Profile Picture */}
            <div className="w-[50px] h-[50px] md:w-[62px] md:h-[62px] lg:w-[72px] lg:h-[72px] xl:w-[72px] xl:h-[72px] bg-[#384455] rounded-full overflow-hidden flex-shrink-0">
              {creator.profile_pic ? (
                <img 
                  src={creator.profile_pic} 
                  alt={`${creator.username} profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#384455]" />
              )}
            </div>

            {/* Creator Info */}
            <div className="flex flex-col gap-[3px] md:gap-[4px] lg:gap-[6px] xl:gap-[8px] flex-1 min-w-0">
                <span className="text-[#06152b] text-[14px] md:text-[21px] lg:text-[20px] xl:text-[24px] font-semibold">
                {creator.username}
              </span>
              <div className="flex items-center gap-[6px] md:gap-[8px] lg:gap-[10px] xl:gap-[11px]">
                <span className="text-[#71737c] text-[12px] md:text-[14px] lg:text-[16px] xl:text-[18px] font-medium">
                  {creator.username_tag || `@${creator.username.toLowerCase().replace(/\s+/g, '')}`}
                </span>
                <div className="flex items-center gap-[2px] md:gap-[2px] lg:gap-[3px]">
                  {creator.social_media.map((social, iconIndex) => (
                    <Icon
                      key={iconIndex}
                      name={getSocialMediaIcon(social.platform)}
                      className="w-[11px] h-[11px] md:w-[13px] md:h-[13px] lg:w-[15px] lg:h-[15px]"
                      alt={`${social.platform} logo`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Action Buttons - Positioned below username tag */}
              <div className="flex items-center gap-[6px] md:gap-[8px] lg:gap-[10px] mt-[3px] md:mt-[4px]">
                <Button
                  onClick={handleEmailClick}
                  className="relative flex items-center gap-[3px] md:gap-[4px] lg:gap-[6px] px-[6px] md:px-[8px] lg:px-[10px] py-[1px] lg:py-[2px] bg-transparent border border-gray-300 rounded-[6px] hover:bg-[#F0F0F0] transition-colors"
                >
                  <Icon
                    name="EmailIcon.svg"
                    className="w-[11px] h-[11px] md:w-[13px] md:h-[13px] lg:w-[15px] lg:h-[15px]"
                    alt="Email"
                  />
                  <span className="text-[10px] md:text-[12px] lg:text-[13px] font-medium text-gray-700">
                    {emailButtonText}
                  </span>
                </Button>
                <Button
                  onClick={handleDMClick}
                  className="relative flex items-center gap-[3px] md:gap-[4px] lg:gap-[6px] px-[6px] md:px-[8px] lg:px-[10px] py-[1px] lg:py-[2px] bg-transparent border border-gray-300 rounded-[6px] hover:bg-[#F0F0F0] transition-colors"
                >
                  <Icon
                    name="DMIcon.svg"
                    className="w-[11px] h-[11px] md:w-[13px] md:h-[13px] lg:w-[15px] lg:h-[15px]"
                    alt="DM"
                  />
                  <span className="text-[10px] md:text-[12px] lg:text-[13px] font-medium text-gray-700">
                    DM Creator
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* Match Score and Close Button */}
          <div className="flex items-center gap-[6px] md:gap-[8px] lg:gap-[10px] flex-shrink-0">
            <div className="bg-green-100 text-green-600 px-[8px] md:px-[12px] lg:px-[16px] py-[4px] md:py-[6px] lg:py-[8px] rounded-[6px] md:rounded-[8px] font-bold text-[11px] md:text-[13px] lg:text-[15px]">
              Match {creator.match_score || 0}%
            </div>
            <Button
              onClick={onClose}
              className="bg-transparent hover:bg-transparent transition-colors"
            >
              <Icon
                name="CloseIcon.svg"
                className="w-[13px] h-[13px] md:w-[15px] md:h-[15px] lg:w-[17px] lg:h-[17px] text-gray-600"
                alt="Close"
              />
            </Button>
          </div>
        </div>

        {/* Location */}
        {creator.location && (
          <div className="px-[12px] md:px-[15px] mb-[12px] md:mb-[17px]">
            <div className="flex items-center gap-[5px] md:gap-[6px] lg:gap-[8px]">
              <Icon
                name="LocationIcon.svg"
                className="w-[12px] h-[12px] md:w-[14px] md:h-[14px] lg:w-[16px] lg:h-[16px] text-gray-600"
                alt="Location"
              />
              <span className="text-[#71737c] text-[12px] md:text-[14px] lg:text-[16px] font-medium">
                {creator.location}
              </span>
            </div>
          </div>
        )}

        {/* Bio */}
        <div className="px-[12px] md:px-[15px] mb-[12px] md:mb-[17px]">
          <p className="text-[#71737c] text-[12px] md:text-[14px] lg:text-[16px] font-medium leading-[18px] md:leading-[20px] lg:leading-[24px]">
            {creator.bio}
          </p>
        </div>

        {/* Category Badges */}
        <div className="px-[12px] md:px-[15px] mb-[12px] md:mb-[17px]">
          <div className="flex items-center gap-[6px] md:gap-[8px] lg:gap-[10px] flex-wrap">
            {creator.niches.map((niche, index) => (
              <Badge
                key={index}
                variant="outline"
                className={`px-[8px] md:px-[12px] lg:px-[16px] py-[4px] md:py-[6px] lg:py-[8px] rounded-[6px] md:rounded-[8px] ${
                  niche.type === 'primary' 
                    ? 'bg-sky-50 border-[#dbe2eb] text-neutral-new900' 
                    : 'bg-green-50 border-green-200 text-green-700'
                }`}
              >
                <span className="font-medium text-[11px] md:text-[13px] lg:text-[15px]">
                  {niche.name}
                </span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Hashtags */}
        {creator.hashtags && creator.hashtags.length > 0 && (
          <div className="px-[12px] md:px-[15px] mb-[12px] md:mb-[17px]">
            <div 
              className="flex items-center gap-[4px] md:gap-[6px] lg:gap-[8px] flex-wrap"
            >
              {creator.hashtags.map((hashtag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="px-[6px] md:px-[10px] lg:px-[12px] py-[3px] md:py-[4px] lg:py-[6px] bg-gray-100 rounded-[4px] md:rounded-[6px] border-gray-300 flex-shrink-0"
                >
                  <span className="font-medium text-gray-600 text-[10px] md:text-[13px] lg:text-[15px]">
                    {hashtag}
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Metrics Cards - Single Row */}
        <div className="px-[12px] md:px-[15px] mb-[12px] md:mb-[17px]">
          <div className="grid grid-cols-5 gap-[2px] md:gap-[3px] lg:gap-[4px]">
            {/* Followers */}
            <div className="bg-white rounded-[8px] md:rounded-[12px] px-[3px] md:px-[6px] py-[6px] md:py-[10px] flex flex-col items-center gap-[4px] md:gap-[8px] lg:gap-[10px] xl:gap-[12px]">
              <div className="flex items-center justify-center">
                <Icon
                  name="FollowerIcon.svg"
                  className="w-[24px] h-[24px] md:w-[40px] md:h-[40px] lg:w-[44px] lg:h-[44px]"
                  alt="Followers"
                />
              </div>
              <div className="text-center">
                <div className="text-[#06152b] text-[10px] md:text-[14px] lg:text-[16px] font-bold mb-1">
                  {formatNumber(creator.followers)}
                </div>
                <div className="text-[#71737c] text-[8px] md:text-[10px] lg:text-[13px] font-medium mb-1">
                  Followers
                </div>
                <div className="flex items-center justify-center gap-[2px] md:gap-1">
                  <Icon 
                    name={creator.followers_change_type === 'positive' ? 'PositiveChangeIcon.svg' : 'NegativeChangeIcon.svg'}
                    className="w-[6px] h-[6px] md:w-[8px] md:h-[8px] lg:w-[10px] lg:h-[10px]" 
                    alt={creator.followers_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
                  />
                  <span className={`text-[10px] lg:text-[11px] font-medium ${
                    creator.followers_change_type === 'positive' ? 'text-[#1ad598]' : 'text-[#ea3a3d]'
                  }`}>
                    {creator.followers_change?.toFixed(2) || '0.00'}%
                  </span>
                </div>
              </div>
            </div>

            {/* Avg. Views */}
            <div className="bg-white rounded-[8px] md:rounded-[12px] px-[3px] md:px-[6px] py-[6px] md:py-[10px] flex flex-col items-center gap-[4px] md:gap-[8px] lg:gap-[10px] xl:gap-[12px]">
              <div className="flex items-center justify-center">
                <Icon
                  name="AvgViewsIcon.svg"
                  className="w-[24px] h-[24px] md:w-[40px] md:h-[40px] lg:w-[44px] lg:h-[44px]"
                  alt="Avg. Views"
                />
              </div>
              <div className="text-center">
                <div className="text-[#06152b] text-[10px] md:text-[14px] lg:text-[16px] font-bold mb-1">
                  {formatNumber(creator.avg_views)}
                </div>
                <div className="text-[#71737c] text-[8px] md:text-[10px] lg:text-[13px] font-medium mb-1">
                  Avg. Views
                </div>
                <div className="flex items-center justify-center gap-[2px] md:gap-1">
                  <Icon 
                    name={creator.avg_views_change_type === 'positive' ? 'PositiveChangeIcon.svg' : 'NegativeChangeIcon.svg'}
                    className="w-[6px] h-[6px] md:w-[8px] md:h-[8px] lg:w-[10px] lg:h-[10px]" 
                    alt={creator.avg_views_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
                  />
                  <span className={`text-[10px] lg:text-[11px] font-medium ${
                    creator.avg_views_change_type === 'positive' ? 'text-[#1ad598]' : 'text-[#ea3a3d]'
                  }`}>
                    {creator.avg_views_change?.toFixed(2) || '0.00'}%
                  </span>
                </div>
              </div>
            </div>

            {/* Engagement */}
            <div className="bg-white rounded-[8px] md:rounded-[12px] px-[3px] md:px-[6px] py-[6px] md:py-[10px] flex flex-col items-center gap-[4px] md:gap-[8px] lg:gap-[10px] xl:gap-[12px]">
              <div className="flex items-center justify-center">
                <Icon
                  name="AvgEngagementIcon.svg"
                  className="w-[24px] h-[24px] md:w-[40px] md:h-[40px] lg:w-[44px] lg:h-[44px]"
                  alt="Engagement"
                />
              </div>
              <div className="text-center">
                <div className="text-[#06152b] text-[10px] md:text-[14px] lg:text-[16px] font-bold mb-1">
                  {creator.engagement.toFixed(1)}%
                </div>
                <div className="text-[#71737c] text-[8px] md:text-[10px] lg:text-[13px] font-medium mb-1">
                  Engagement
                </div>
                <div className="flex items-center justify-center gap-[2px] md:gap-1">
                  <Icon 
                    name={creator.engagement_change_type === 'positive' ? 'PositiveChangeIcon.svg' : 'NegativeChangeIcon.svg'}
                    className="w-[6px] h-[6px] md:w-[8px] md:h-[8px] lg:w-[10px] lg:h-[10px]" 
                    alt={creator.engagement_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
                  />
                  <span className={`text-[10px] lg:text-[11px] font-medium ${
                    creator.engagement_change_type === 'positive' ? 'text-[#1ad598]' : 'text-[#ea3a3d]'
                  }`}>
                    {creator.engagement_change?.toFixed(2) || '0.00'}%
                  </span>
                </div>
              </div>
            </div>

            {/* Avg. Likes */}
            <div className="bg-white rounded-[8px] md:rounded-[12px] px-[3px] md:px-[6px] py-[6px] md:py-[10px] flex flex-col items-center gap-[4px] md:gap-[8px] lg:gap-[10px] xl:gap-[12px]">
              <div className="flex items-center justify-center">
                <Icon
                  name="AvgLikesIcon.svg"
                  className="w-[24px] h-[24px] md:w-[40px] md:h-[40px] lg:w-[44px] lg:h-[44px]"
                  alt="Avg. Likes"
                />
              </div>
              <div className="text-center">
                <div className="text-[#06152b] text-[10px] md:text-[14px] lg:text-[16px] font-bold mb-1">
                  {formatNumber(creator.avg_likes || 0)}
                </div>
                <div className="text-[#71737c] text-[8px] md:text-[10px] lg:text-[13px] font-medium mb-1">
                  Avg. Likes
                </div>
                <div className="flex items-center justify-center gap-[2px] md:gap-1">
                  <Icon 
                    name={creator.avg_likes_change_type === 'positive' ? 'PositiveChangeIcon.svg' : 'NegativeChangeIcon.svg'}
                    className="w-[6px] h-[6px] md:w-[8px] md:h-[8px] lg:w-[10px] lg:h-[10px]" 
                    alt={creator.avg_likes_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
                  />
                  <span className={`text-[10px] lg:text-[11px] font-medium ${
                    creator.avg_likes_change_type === 'positive' ? 'text-[#1ad598]' : 'text-[#ea3a3d]'
                  }`}>
                    {creator.avg_likes_change?.toFixed(2) || '0.00'}%
                  </span>
                </div>
              </div>
            </div>

            {/* Avg. Comments */}
            <div className="bg-white rounded-[8px] md:rounded-[12px] px-[3px] md:px-[6px] py-[6px] md:py-[10px] flex flex-col items-center gap-[4px] md:gap-[8px] lg:gap-[10px] xl:gap-[12px]">
              <div className="flex items-center justify-center">
                <Icon
                  name="AvgCommentsIcon.svg"
                  className="w-[24px] h-[24px] md:w-[40px] md:h-[40px] lg:w-[44px] lg:h-[44px]"
                  alt="Avg. Comments"
                />
              </div>
              <div className="text-center">
                <div className="text-[#06152b] text-[10px] md:text-[14px] lg:text-[16px] font-bold mb-1">
                  {formatNumber(creator.avg_comments || 0)}
                </div>
                <div className="text-[#71737c] text-[8px] md:text-[10px] lg:text-[13px] font-medium mb-1">
                  Avg. Comments
                </div>
                <div className="flex items-center justify-center gap-[2px] md:gap-1">
                  <Icon 
                    name={creator.avg_comments_change_type === 'positive' ? 'PositiveChangeIcon.svg' : 'NegativeChangeIcon.svg'}
                    className="w-[6px] h-[6px] md:w-[8px] md:h-[8px] lg:w-[10px] lg:h-[10px]" 
                    alt={creator.avg_comments_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
                  />
                  <span className={`text-[10px] lg:text-[11px] font-medium ${
                    creator.avg_comments_change_type === 'positive' ? 'text-[#1ad598]' : 'text-[#ea3a3d]'
                  }`}>
                    {creator.avg_comments_change?.toFixed(2) || '0.00'}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buzz Score Card */}
        <div className="px-[12px] md:px-[15px] mb-[12px] md:mb-[17px]">
          <div className="bg-white rounded-[8px] md:rounded-[12px] px-[12px] md:px-[20px] lg:px-[24px] pt-[10px] md:pt-[13px] lg:pt-[12px] pb-[12px] md:pb-[20px] lg:pb-[24px]">
            <div className="flex items-center justify-between mb-[8px] md:mb-[12px] lg:mb-[15px]">
              <div className="flex items-center gap-[7px] lg:gap-[10px]">
                <span className="text-[#00518B] text-[12px] md:text-[15px] lg:text-[17px] font-bold">
                  Buzz Score
                </span>
                <span 
                  className="text-[12px] md:text-[15px] lg:text-[17px] font-bold"
                  style={{
                    background: 'linear-gradient(90deg, #FC4C4B 0%, #CD45BA 50%, #6E57FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {creator.buzz_score}%
                </span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowBuzzScoreInfo(!showBuzzScoreInfo)}
                  className="bg-transparent hover:bg-gray-100 p-1 rounded-full transition-colors"
                >
                <Icon
                  name="InformationIcon.svg"
                  className="w-[10px] h-[10px] md:w-[12px] md:h-[12px] lg:w-[14px] lg:h-[14px] text-gray-600"
                  alt="Info"
                />
                </button>
                
                {/* Buzz Score Info Popup */}
                {showBuzzScoreInfo && (
                  <div
                    ref={buzzScoreInfoRef}
                    className="absolute top-full right-0 mt-2 w-[280px] sm:w-[320px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm">Buzz Score</h3>
                        <p className="text-sm text-gray-600">
                          The Buzz Score is a performance metric that we calculate based on account growth, engagement, and consistency. It provides a comprehensive view of a creator's overall performance and trending potential.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Buzz Score Bar */}
            <div className="relative">
              {/* Indicating Arrow - Above the bar */}
              <div 
                className="absolute -top-[6px] md:-top-[8px] transform -translate-x-1/2"
                style={{ left: `${creator.buzz_score}%` }}
              >
                <div 
                  className="border-l-[4px] md:border-l-[5.355px] border-r-[4px] md:border-r-[5.355px] border-t-[4px] md:border-t-[5.25px] border-l-transparent border-r-transparent border-t-black"
                  style={{ width: '8px', height: '4px' }}
                />
              </div>
              
              <div className="w-full h-[8px] md:h-[12px] lg:h-[14px] bg-gradient-to-r from-[#FC4C4B] via-[#CD45BA] to-[#6E57FF] rounded-[4px] md:rounded-[6px] lg:rounded-[7px] relative">
                {/* Indicating Dot */}
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
                  style={{ left: `${creator.buzz_score}%` }}
                >
                  <div className="w-[3px] h-[3px] md:w-[4px] md:h-[4px] lg:w-[6px] lg:h-[6px] bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Posts */}
        <div className="px-[12px] md:px-[15px] mb-[12px] md:mb-[17px]">
          <h3 className="text-[#71737c] text-[12px] md:text-[16px] lg:text-[16px] font-semibold mb-[8px] md:mb-[12px] lg:mb-[15px]">
            Latest Posts
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-4 gap-[4px] md:gap-[8px] lg:gap-[15px]">
            {[...creator.thumbnails.slice(0, 3), '/images/PostThumbnail-3.svg'].map((thumbnail, index) => (
              <div key={index} className="aspect-[9/16] rounded-[6px] md:rounded-[10px] lg:rounded-[12px] overflow-hidden">
                <img
                  src={thumbnail}
                  alt={`${creator.username} post ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};