import React from 'react';
import { Icon } from './icon';
import { Badge } from './badge';
import { DonutChart } from './donut-chart';
import { Creator } from '../../types/database';
import { formatNumber, getSocialMediaIcon, getMatchScoreColor } from '../../utils/formatters';

interface CreatorCardProps {
  creator: Creator;
  currentMode: 'ai' | 'all';
  onCreatorClick: (creator: Creator) => void;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({
  creator,
  currentMode,
  onCreatorClick,
}) => {
  return (
    <div
      onClick={() => onCreatorClick(creator)}
      className="bg-white rounded-[10px] lg:rounded-[12px] xl:rounded-[15px] p-[8px] lg:p-[12px] xl:p-[15px] flex flex-col gap-[8px] lg:gap-[12px] xl:gap-[15px] cursor-pointer hover:shadow-md transition-shadow border-0 shadow-sm"
    >
      {/* Header with profile and match score */}
      <div className="flex items-start justify-between w-full">
        <div className="flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px] flex-1 min-w-0">
          {/* Profile Picture */}
          <div className="w-[32px] h-[32px] lg:w-[40px] lg:h-[40px] xl:w-[48px] xl:h-[48px] bg-[#384455] rounded-full overflow-hidden flex-shrink-0">
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
          <div className="flex flex-col gap-[2px] lg:gap-[3px] xl:gap-[4px] flex-1 min-w-0">
            <span className="text-[#06152b] text-[12px] lg:text-[14px] xl:text-[16px] font-semibold truncate">
              {creator.username}
            </span>
            <div className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] min-w-0">
              <span className="text-[#71737c] text-[10px] lg:text-[12px] xl:text-[14px] font-medium truncate flex-shrink">
                {creator.username_tag || `@${creator.username.toLowerCase().replace(/\s+/g, '')}`}
              </span>
              <div className="flex items-center gap-[2px] lg:gap-[3px] xl:gap-[4px] flex-shrink-0">
                {creator.social_media.map((social, iconIndex) => (
                  <Icon
                    key={iconIndex}
                    name={getSocialMediaIcon(social.platform)}
                    className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px]"
                    alt={`${social.platform} logo`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Match Score - Only show in AI mode */}
        {currentMode === 'ai' && (
          <div className={`flex items-center justify-center px-[6px] lg:px-[8px] xl:px-[10px] py-[3px] lg:py-[4px] xl:py-[5px] rounded-[6px] ${getMatchScoreColor(creator.match_score || 0)} flex-shrink-0`}>
            <span className="font-bold text-[11px] lg:text-[12px] xl:text-[13px] leading-[14px] lg:leading-[16px] xl:leading-[18px]">
              {creator.match_score || 0}%
            </span>
          </div>
        )}
      </div>

      {/* Location */}
      {creator.location && (
        <div className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px]">
          <Icon
            name="LocationIcon.svg"
            className="w-[10px] h-[10px] lg:w-[12px] lg:h-[12px] xl:w-[14px] xl:h-[14px] text-gray-600 flex-shrink-0"
            alt="Location"
          />
          <span className="text-[#71737c] text-[10px] lg:text-[12px] xl:text-[14px] font-medium truncate">
            {creator.location}
          </span>
        </div>
      )}

      {/* Bio */}
      <p className="text-[#71737c] text-[10px] lg:text-[12px] xl:text-[14px] font-medium leading-[14px] lg:leading-[16px] xl:leading-[18px] line-clamp-2">
        {creator.bio}
      </p>

      {/* Category Badges */}
      <div className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] flex-wrap">
        {creator.niches.map((niche, index) => (
          <Badge
            key={index}
            variant="outline"
            className={`px-[6px] lg:px-[8px] xl:px-[10px] py-[2px] lg:py-[3px] xl:py-[4px] rounded-[4px] lg:rounded-[6px] xl:rounded-[8px] ${
              niche.type === 'primary' 
                ? 'bg-sky-50 border-[#dbe2eb] text-neutral-new900' 
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            <span className="font-medium text-[9px] lg:text-[10px] xl:text-[11px]">
              {niche.name}
            </span>
          </Badge>
        ))}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-[4px] lg:gap-[6px] xl:gap-[8px]">
        {/* Followers */}
        <div className="flex flex-col items-center gap-[2px] lg:gap-[3px] xl:gap-[4px]">
          <Icon
            name="FollowerIcon.svg"
            className="w-[16px] h-[16px] lg:w-[20px] lg:h-[20px] xl:w-[24px] xl:h-[24px]"
            alt="Followers"
          />
          <div className="text-center">
            <div className="text-[#06152b] text-[10px] lg:text-[11px] xl:text-[12px] font-bold">
              {formatNumber(creator.followers)}
            </div>
            <div className="text-[#71737c] text-[8px] lg:text-[9px] xl:text-[10px] font-medium">
              Followers
            </div>
            <div className="flex items-center justify-center gap-[2px]">
              <Icon 
                name={creator.followers_change_type === 'positive' ? 'PositiveChangeIcon.svg' : 'NegativeChangeIcon.svg'}
                className="w-[6px] h-[6px] lg:w-[7px] lg:h-[7px] xl:w-[8px] xl:h-[8px]" 
                alt={creator.followers_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
              />
              <span className={`text-[8px] lg:text-[9px] xl:text-[10px] font-medium ${
                creator.followers_change_type === 'positive' ? 'text-[#1ad598]' : 'text-[#ea3a3d]'
              }`}>
                {creator.followers_change?.toFixed(2) || '0.00'}%
              </span>
            </div>
          </div>
        </div>

        {/* Avg. Views */}
        <div className="flex flex-col items-center gap-[2px] lg:gap-[3px] xl:gap-[4px]">
          <Icon
            name="AvgViewsIcon.svg"
            className="w-[16px] h-[16px] lg:w-[20px] lg:h-[20px] xl:w-[24px] xl:h-[24px]"
            alt="Avg. Views"
          />
          <div className="text-center">
            <div className="text-[#06152b] text-[10px] lg:text-[11px] xl:text-[12px] font-bold">
              {formatNumber(creator.avg_views)}
            </div>
            <div className="text-[#71737c] text-[8px] lg:text-[9px] xl:text-[10px] font-medium">
              Avg. Views
            </div>
            <div className="flex items-center justify-center gap-[2px]">
              <Icon 
                name={creator.avg_views_change_type === 'positive' ? 'PositiveChangeIcon.svg' : 'NegativeChangeIcon.svg'}
                className="w-[6px] h-[6px] lg:w-[7px] lg:h-[7px] xl:w-[8px] xl:h-[8px]" 
                alt={creator.avg_views_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
              />
              <span className={`text-[8px] lg:text-[9px] xl:text-[10px] font-medium ${
                creator.avg_views_change_type === 'positive' ? 'text-[#1ad598]' : 'text-[#ea3a3d]'
              }`}>
                {creator.avg_views_change?.toFixed(2) || '0.00'}%
              </span>
            </div>
          </div>
        </div>

        {/* Engagement with Donut Chart */}
        <div className="flex flex-col items-center gap-[2px] lg:gap-[3px] xl:gap-[4px]">
          <DonutChart score={Math.round(creator.engagement)} />
          <div className="text-center">
            <div className="text-[#06152b] text-[10px] lg:text-[11px] xl:text-[12px] font-bold">
              {creator.engagement.toFixed(1)}%
            </div>
            <div className="text-[#71737c] text-[8px] lg:text-[9px] xl:text-[10px] font-medium">
              Engagement
            </div>
            <div className="flex items-center justify-center gap-[2px]">
              <Icon 
                name={creator.engagement_change_type === 'positive' ? 'PositiveChangeIcon.svg' : 'NegativeChangeIcon.svg'}
                className="w-[6px] h-[6px] lg:w-[7px] lg:h-[7px] xl:w-[8px] xl:h-[8px]" 
                alt={creator.engagement_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
              />
              <span className={`text-[8px] lg:text-[9px] xl:text-[10px] font-medium ${
                creator.engagement_change_type === 'positive' ? 'text-[#1ad598]' : 'text-[#ea3a3d]'
              }`}>
                {creator.engagement_change?.toFixed(2) || '0.00'}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-3 gap-[4px] lg:gap-[6px] xl:gap-[8px]">
        {creator.thumbnails.slice(0, 3).map((thumbnail, index) => (
          <div key={index} className="aspect-[9/16] rounded-[4px] lg:rounded-[6px] xl:rounded-[8px] overflow-hidden">
            <img
              src={thumbnail}
              alt={`${creator.username} post ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};