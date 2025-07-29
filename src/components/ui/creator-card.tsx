import React from 'react';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Icon } from './icon';
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
    <Card 
      className="bg-white rounded-[10px] border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200 overflow-hidden"
      onClick={() => onCreatorClick(creator)}
    >
      <CardContent className="p-[8px] lg:p-[10px] xl:p-[12px] h-full">
        <div className="flex flex-col h-full">
          {/* Header with profile and match score */}
          <div className="flex items-start justify-between mb-[6px] lg:mb-[8px] xl:mb-[10px]">
            <div className="flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px] flex-1 min-w-0">
              {/* Profile Picture */}
              <div className="w-[32px] h-[32px] lg:w-[40px] lg:h-[40px] xl:w-[44px] xl:h-[44px] bg-[#384455] rounded-full overflow-hidden flex-shrink-0">
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
                <div className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px]">
                  <span className="text-[#71737c] text-[10px] lg:text-[12px] xl:text-[14px] font-medium truncate">
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

          {/* Bio */}
          <div className="mb-[6px] lg:mb-[8px] xl:mb-[10px]">
            <p className="text-[#71737c] text-[10px] lg:text-[12px] xl:text-[14px] font-medium leading-[14px] lg:leading-[16px] xl:leading-[18px] line-clamp-2">
              {creator.bio}
            </p>
          </div>

          {/* Category Badges */}
          <div className="mb-[8px] lg:mb-[10px] xl:mb-[12px]">
            <div className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] flex-wrap">
              {creator.niches.slice(0, 2).map((niche, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`px-[6px] lg:px-[8px] xl:px-[10px] py-[2px] lg:py-[3px] xl:py-[4px] rounded-[6px] ${
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
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-[4px] lg:gap-[6px] xl:gap-[8px] mb-[8px] lg:mb-[10px] xl:mb-[12px]">
            {/* Followers */}
            <div className="text-center">
              <div className="text-[#06152b] text-[10px] lg:text-[12px] xl:text-[14px] font-bold mb-[2px] lg:mb-[3px] xl:mb-[4px]">
                {formatNumber(creator.followers)}
              </div>
              <div className="text-[#71737c] text-[8px] lg:text-[9px] xl:text-[10px] font-medium mb-[2px] lg:mb-[3px] xl:mb-[4px]">
                Followers
              </div>
              <div className="flex items-center justify-center gap-[2px] lg:gap-[3px] xl:gap-[4px]">
                <Icon 
                  name={creator.followers_change_type === 'positive' ? 'PositiveChangeIcon.svg' : 'NegativeChangeIcon.svg'}
                  className="w-[6px] h-[6px] lg:w-[8px] lg:h-[8px] xl:w-[10px] xl:h-[10px]" 
                  alt={creator.followers_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
                />
                <span className={`text-[8px] lg:text-[9px] xl:text-[10px] font-medium ${
                  creator.followers_change_type === 'positive' ? 'text-[#1ad598]' : 'text-[#ea3a3d]'
                }`}>
                  {creator.followers_change?.toFixed(2) || '0.00'}%
                </span>
              </div>
            </div>

            {/* Avg. Views */}
            <div className="text-center">
              <div className="text-[#06152b] text-[10px] lg:text-[12px] xl:text-[14px] font-bold mb-[2px] lg:mb-[3px] xl:mb-[4px]">
                {formatNumber(creator.avg_views)}
              </div>
              <div className="text-[#71737c] text-[8px] lg:text-[9px] xl:text-[10px] font-medium mb-[2px] lg:mb-[3px] xl:mb-[4px]">
                Avg. Views
              </div>
              <div className="flex items-center justify-center gap-[2px] lg:gap-[3px] xl:gap-[4px]">
                <Icon 
                  name={creator.avg_views_change_type === 'positive' ? 'PositiveChangeIcon.svg' : 'NegativeChangeIcon.svg'}
                  className="w-[6px] h-[6px] lg:w-[8px] lg:h-[8px] xl:w-[10px] xl:h-[10px]" 
                  alt={creator.avg_views_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
                />
                <span className={`text-[8px] lg:text-[9px] xl:text-[10px] font-medium ${
                  creator.avg_views_change_type === 'positive' ? 'text-[#1ad598]' : 'text-[#ea3a3d]'
                }`}>
                  {creator.avg_views_change?.toFixed(2) || '0.00'}%
                </span>
              </div>
            </div>

            {/* Engagement */}
            <div className="text-center">
              <div className="text-[#06152b] text-[10px] lg:text-[12px] xl:text-[14px] font-bold mb-[2px] lg:mb-[3px] xl:mb-[4px]">
                {creator.engagement.toFixed(1)}%
              </div>
              <div className="text-[#71737c] text-[8px] lg:text-[9px] xl:text-[10px] font-medium mb-[2px] lg:mb-[3px] xl:mb-[4px]">
                Engagement
              </div>
              <div className="flex items-center justify-center gap-[2px] lg:gap-[3px] xl:gap-[4px]">
                <Icon 
                  name={creator.engagement_change_type === 'positive' ? 'PositiveChangeIcon.svg' : 'NegativeChangeIcon.svg'}
                  className="w-[6px] h-[6px] lg:w-[8px] lg:h-[8px] xl:w-[10px] xl:h-[10px]" 
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

          {/* Buzz Score */}
          <div className="flex items-center justify-between mb-[8px] lg:mb-[10px] xl:mb-[12px]">
            <span className="text-[#00518B] text-[10px] lg:text-[12px] xl:text-[14px] font-bold">
              Buzz Score
            </span>
            <div className="flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px]">
              <DonutChart score={creator.buzz_score} size={32} strokeWidth={3} />
              <span 
                className="text-[10px] lg:text-[12px] xl:text-[14px] font-bold"
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
          </div>

          {/* Thumbnails */}
          <div className="flex-1 flex items-end">
            <div className="grid grid-cols-3 gap-[3px] lg:gap-[4px] xl:gap-[6px] w-full">
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
        </div>
      </CardContent>
    </Card>
  );
};