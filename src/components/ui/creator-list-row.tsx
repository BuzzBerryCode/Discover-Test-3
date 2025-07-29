import React from 'react';
import { Icon } from './icon';
import { Badge } from './badge';
import { DonutChart } from './donut-chart';
import { Creator } from '../../types/database';
import { formatNumber, getSocialMediaIcon, getMatchScoreColor } from '../../utils/formatters';

interface CreatorListRowProps {
  creator: Creator;
  currentMode: 'ai' | 'all';
  onCreatorClick: (creator: Creator) => void;
}

export const CreatorListRow: React.FC<CreatorListRowProps> = ({
  creator,
  currentMode,
  onCreatorClick,
}) => {
  return (
    <tr 
      onClick={() => onCreatorClick(creator)}
      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      {/* Creator Info */}
      <td className="px-[8px] lg:px-[12px] xl:px-[16px] py-[8px] lg:py-[12px] xl:py-[16px]">
        <div className="flex items-center gap-[8px] lg:gap-[12px] xl:gap-[16px]">
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

          {/* Creator Details */}
          <div className="flex flex-col gap-[2px] lg:gap-[4px] xl:gap-[6px] min-w-0 flex-1">
            <div className="flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px]">
              <span className="text-[#06152b] text-[12px] lg:text-[14px] xl:text-[16px] font-semibold truncate">
                {creator.username}
              </span>
              <div className="flex items-center gap-[2px] lg:gap-[3px] xl:gap-[4px] flex-shrink-0">
                {creator.social_media.map((social, iconIndex) => (
                  <Icon
                    key={iconIndex}
                    name={getSocialMediaIcon(social.platform)}
                    className="w-[10px] h-[10px] lg:w-[12px] lg:h-[12px] xl:w-[14px] xl:h-[14px]"
                    alt={`${social.platform} logo`}
                  />
                ))}
              </div>
            </div>
            <span className="text-[#71737c] text-[10px] lg:text-[12px] xl:text-[14px] font-medium truncate">
              {creator.username_tag || `@${creator.username.toLowerCase().replace(/\s+/g, '')}`}
            </span>
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
          </div>
        </div>
      </td>

      {/* Match Score - Only show in AI mode */}
      {currentMode === 'ai' && (
        <td className="px-[8px] lg:px-[12px] xl:px-[16px] py-[8px] lg:py-[12px] xl:py-[16px] text-center">
          <div className={`inline-flex items-center justify-center px-[8px] lg:px-[12px] xl:px-[16px] py-[4px] lg:py-[6px] xl:py-[8px] rounded-[6px] ${getMatchScoreColor(creator.match_score || 0)}`}>
            <span className="font-bold text-[12px] lg:text-[14px] xl:text-[16px]">
              {creator.match_score || 0}%
            </span>
          </div>
        </td>
      )}

      {/* Followers */}
      <td className="px-[8px] lg:px-[12px] xl:px-[16px] py-[8px] lg:py-[12px] xl:py-[16px] text-center">
        <div className="flex flex-col items-center gap-[2px] lg:gap-[4px] xl:gap-[6px]">
          <span className="text-[#06152b] text-[12px] lg:text-[14px] xl:text-[16px] font-bold">
            {formatNumber(creator.followers)}
          </span>
          <div className="flex items-center gap-[2px] lg:gap-[3px] xl:gap-[4px]">
            <Icon 
              name={creator.followers_change_type === 'positive' ? 'PositiveChangeIcon.svg' : 'NegativeChangeIcon.svg'}
              className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px]" 
              alt={creator.followers_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
            />
            <span className={`text-[10px] lg:text-[12px] xl:text-[14px] font-medium ${
              creator.followers_change_type === 'positive' ? 'text-[#1ad598]' : 'text-[#ea3a3d]'
            }`}>
              {creator.followers_change?.toFixed(2) || '0.00'}%
            </span>
          </div>
        </div>
      </td>

      {/* Avg. Views */}
      <td className="px-[8px] lg:px-[12px] xl:px-[16px] py-[8px] lg:py-[12px] xl:py-[16px] text-center">
        <div className="flex flex-col items-center gap-[2px] lg:gap-[4px] xl:gap-[6px]">
          <span className="text-[#06152b] text-[12px] lg:text-[14px] xl:text-[16px] font-bold">
            {formatNumber(creator.avg_views)}
          </span>
          <div className="flex items-center gap-[2px] lg:gap-[3px] xl:gap-[4px]">
            <Icon 
              name={creator.avg_views_change_type === 'positive' ? 'PositiveChangeIcon.svg' : 'NegativeChangeIcon.svg'}
              className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px]" 
              alt={creator.avg_views_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
            />
            <span className={`text-[10px] lg:text-[12px] xl:text-[14px] font-medium ${
              creator.avg_views_change_type === 'positive' ? 'text-[#1ad598]' : 'text-[#ea3a3d]'
            }`}>
              {creator.avg_views_change?.toFixed(2) || '0.00'}%
            </span>
          </div>
        </div>
      </td>

      {/* Engagement */}
      <td className="px-[8px] lg:px-[12px] xl:px-[16px] py-[8px] lg:py-[12px] xl:py-[16px] text-center">
        <div className="flex flex-col items-center gap-[2px] lg:gap-[4px] xl:gap-[6px]">
          <DonutChart score={Math.round(creator.engagement)} />
          <span className="text-[#06152b] text-[12px] lg:text-[14px] xl:text-[16px] font-bold">
            {creator.engagement.toFixed(1)}%
          </span>
          <div className="flex items-center gap-[2px] lg:gap-[3px] xl:gap-[4px]">
            <Icon 
              name={creator.engagement_change_type === 'positive' ? 'PositiveChangeIcon.svg' : 'NegativeChangeIcon.svg'}
              className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px]" 
              alt={creator.engagement_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
            />
            <span className={`text-[10px] lg:text-[12px] xl:text-[14px] font-medium ${
              creator.engagement_change_type === 'positive' ? 'text-[#1ad598]' : 'text-[#ea3a3d]'
            }`}>
              {creator.engagement_change?.toFixed(2) || '0.00'}%
            </span>
          </div>
        </div>
      </td>

      {/* Niches */}
      <td className="px-[8px] lg:px-[12px] xl:px-[16px] py-[8px] lg:py-[12px] xl:py-[16px]">
        <div className="flex flex-wrap gap-[4px] lg:gap-[6px] xl:gap-[8px] max-w-[200px]">
          {creator.niches.slice(0, 2).map((niche, index) => (
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
          {creator.niches.length > 2 && (
            <span className="text-[#71737c] text-[10px] lg:text-[12px] xl:text-[14px] font-medium">
              +{creator.niches.length - 2}
            </span>
          )}
        </div>
      </td>

      {/* Thumbnails */}
      <td className="px-[8px] lg:px-[12px] xl:px-[16px] py-[8px] lg:py-[12px] xl:py-[16px]">
        <div className="flex gap-[4px] lg:gap-[6px] xl:gap-[8px]">
          {creator.thumbnails.slice(0, 3).map((thumbnail, index) => (
            <div key={index} className="w-[24px] h-[32px] lg:w-[30px] lg:h-[40px] xl:w-[36px] xl:h-[48px] rounded-[4px] lg:rounded-[6px] xl:rounded-[8px] overflow-hidden flex-shrink-0">
              <img
                src={thumbnail}
                alt={`${creator.username} post ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </td>
    </tr>
  );
};