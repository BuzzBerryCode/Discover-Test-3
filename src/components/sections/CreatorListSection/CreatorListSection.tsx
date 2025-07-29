import React, { useState, useEffect } from "react";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Icon } from "../../ui/icon";
import { DonutChart } from "../../ui/donut-chart";
import { ExpandedProfileOverlay } from "../../ui/expanded-profile-overlay";
import { useCreatorData } from "../../../hooks/useCreatorData";
import { Creator, ViewMode, SortField, SortDirection, SortState } from "../../../types/database";
import { formatNumber, getSocialMediaIcon, getMatchScoreColor, getBuzzScoreColor, getTrendIcon, getTrendColor } from "../../../utils/formatters";

export const CreatorListSection = (): JSX.Element => {
  const { 
    creators, 
    currentMode, 
    currentPage, 
    totalPages, 
    totalCreators,
    loading, 
    error,
    handlePageChange,
    nextPage,
    previousPage
  } = useCreatorData();

  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [sortState, setSortState] = useState<SortState>({ field: null, direction: 'desc' });
  const [expandedCreator, setExpandedCreator] = useState<Creator | null>(null);

  // Handle sort
  const handleSort = (field: SortField) => {
    setSortState(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Handle creator card click
  const handleCreatorClick = (creator: Creator) => {
    setExpandedCreator(creator);
  };

  // Close expanded profile
  const handleCloseExpanded = () => {
    setExpandedCreator(null);
  };

  // Loading state
  if (loading) {
    return (
      <Card className="p-[15px] lg:p-[20px] xl:p-[25px] w-full bg-white rounded-[10px] flex-1 overflow-hidden shadow-sm border-0">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading creators...</p>
          </div>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="p-[15px] lg:p-[20px] xl:p-[25px] w-full bg-white rounded-[10px] flex-1 overflow-hidden shadow-sm border-0">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading creators</p>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  // Empty state
  if (creators.length === 0) {
    return (
      <Card className="p-[15px] lg:p-[20px] xl:p-[25px] w-full bg-white rounded-[10px] flex-1 overflow-hidden shadow-sm border-0">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <Icon name="SearchIcon.svg" className="w-16 h-16 text-gray-400 mx-auto mb-4" alt="No results" />
            <p className="text-gray-600 text-lg mb-2">No creators found</p>
            <p className="text-gray-500">Try adjusting your filters to see more results</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-[12px] lg:p-[15px] xl:p-[18px] w-full bg-white rounded-[10px] flex-1 overflow-hidden shadow-sm border-0">
        <div className="flex flex-col h-full">
          {/* Header with view toggle and results count */}
          <div className="flex items-center justify-between mb-[12px] lg:mb-[15px] xl:mb-[18px] flex-shrink-0">
            <div className="flex items-center gap-[8px] lg:gap-[10px] xl:gap-[12px]">
              <span className="font-semibold text-[14px] lg:text-[16px] xl:text-[18px] text-neutral-100">
                {totalCreators} Creators Found
              </span>
            </div>

            <div className="flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px]">
              <Button
                variant="outline"
                onClick={() => setViewMode('cards')}
                className={`h-[28px] lg:h-[32px] xl:h-[36px] px-[8px] lg:px-[10px] xl:px-[12px] rounded-[6px] ${
                  viewMode === 'cards'
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon
                  name={viewMode === 'cards' ? 'CardsModeIcon.svg' : 'CardsModeIconUnselected.svg'}
                  className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px]"
                  alt="Cards view"
                />
              </Button>
              <Button
                variant="outline"
                onClick={() => setViewMode('list')}
                className={`h-[28px] lg:h-[32px] xl:h-[36px] px-[8px] lg:px-[10px] xl:px-[12px] rounded-[6px] ${
                  viewMode === 'list'
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon
                  name={viewMode === 'list' ? 'ListIconSelected.svg' : 'ListIcon.svg'}
                  className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px]"
                  alt="List view"
                />
              </Button>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-hidden">
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[12px] lg:gap-[15px] xl:gap-[18px] h-full overflow-y-auto">
                {creators.map((creator, index) => (
                  <Card
                    key={`creator-${index}`}
                    className="bg-white rounded-[12px] border border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer hover:shadow-md p-[16px] lg:p-[18px] xl:p-[20px] flex flex-col h-fit"
                    onClick={() => handleCreatorClick(creator)}
                  >
                    {/* Header with profile and match score */}
                    <div className="flex items-start justify-between mb-[12px] lg:mb-[14px] xl:mb-[16px]">
                      <div className="flex items-center gap-[10px] lg:gap-[12px] xl:gap-[14px] flex-1 min-w-0">
                        {/* Profile Picture */}
                        <div className="w-[48px] h-[48px] lg:w-[52px] lg:h-[52px] xl:w-[56px] xl:h-[56px] bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
                          {creator.profile_pic ? (
                            <img 
                              src={creator.profile_pic} 
                              alt={`${creator.username} profile`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300" />
                          )}
                        </div>

                        {/* Name and handle */}
                        <div className="flex flex-col min-w-0 flex-1">
                          <h3 className="font-bold text-[16px] lg:text-[18px] xl:text-[20px] text-gray-900 truncate">
                            {creator.username}
                          </h3>
                          <div className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px]">
                            <span className="text-[12px] lg:text-[14px] xl:text-[16px] text-gray-600 truncate">
                              {creator.username_tag || `@${creator.username.toLowerCase().replace(/\s+/g, '')}`}
                            </span>
                            {creator.social_media.map((social, iconIndex) => (
                              <Icon
                                key={iconIndex}
                                name={getSocialMediaIcon(social.platform)}
                                className="w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] xl:w-[18px] xl:h-[18px] flex-shrink-0"
                                alt={`${social.platform} logo`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Match Score and Verification */}
                      <div className="flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px] flex-shrink-0">
                        {currentMode === 'ai' && creator.match_score && (
                          <div className="bg-green-100 text-green-600 px-[8px] lg:px-[10px] xl:px-[12px] py-[4px] lg:py-[5px] xl:py-[6px] rounded-[6px] font-bold text-[12px] lg:text-[13px] xl:text-[14px]">
                            {creator.match_score}%
                          </div>
                        )}
                        <div className="w-[20px] h-[20px] lg:w-[22px] lg:h-[22px] xl:w-[24px] xl:h-[24px] bg-blue-500 rounded-full flex items-center justify-center">
                          <Icon
                            name="CheckIcon.svg"
                            className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px] text-white"
                            alt="Verified"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-[12px] lg:text-[14px] xl:text-[16px] text-gray-600 mb-[16px] lg:mb-[18px] xl:mb-[20px] line-clamp-2">
                      {creator.bio}
                    </p>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-[12px] lg:gap-[14px] xl:gap-[16px] mb-[16px] lg:mb-[18px] xl:mb-[20px]">
                      {/* Followers */}
                      <div className="text-center">
                        <div className="w-[32px] h-[32px] lg:w-[36px] lg:h-[36px] xl:w-[40px] xl:h-[40px] bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-[6px] lg:mb-[8px] xl:mb-[10px]">
                          <Icon
                            name="FollowerIcon.svg"
                            className="w-[16px] h-[16px] lg:w-[18px] lg:h-[18px] xl:w-[20px] xl:h-[20px] text-blue-600"
                            alt="Followers"
                          />
                        </div>
                        <div className="font-bold text-[14px] lg:text-[16px] xl:text-[18px] text-gray-900">
                          {formatNumber(creator.followers)}
                        </div>
                        <div className="flex items-center justify-center gap-[2px] lg:gap-[3px] xl:gap-[4px] mt-[2px]">
                          <Icon 
                            name={getTrendIcon(creator.followers_change_type || 'positive')}
                            className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px]" 
                            alt={creator.followers_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
                          />
                          <span className={`text-[10px] lg:text-[11px] xl:text-[12px] font-medium ${getTrendColor(creator.followers_change_type || 'positive')}`}>
                            +{creator.followers_change?.toFixed(2) || '0.00'}%
                          </span>
                        </div>
                      </div>

                      {/* Views */}
                      <div className="text-center">
                        <div className="w-[32px] h-[32px] lg:w-[36px] lg:h-[36px] xl:w-[40px] xl:h-[40px] bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-[6px] lg:mb-[8px] xl:mb-[10px]">
                          <Icon
                            name="EyeIcon.svg"
                            className="w-[16px] h-[16px] lg:w-[18px] lg:h-[18px] xl:w-[20px] xl:h-[20px] text-orange-600"
                            alt="Views"
                          />
                        </div>
                        <div className="font-bold text-[14px] lg:text-[16px] xl:text-[18px] text-gray-900">
                          {formatNumber(creator.avg_views)}
                        </div>
                        <div className="flex items-center justify-center gap-[2px] lg:gap-[3px] xl:gap-[4px] mt-[2px]">
                          <Icon 
                            name={getTrendIcon(creator.avg_views_change_type || 'positive')}
                            className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px]" 
                            alt={creator.avg_views_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
                          />
                          <span className={`text-[10px] lg:text-[11px] xl:text-[12px] font-medium ${getTrendColor(creator.avg_views_change_type || 'positive')}`}>
                            +{creator.avg_views_change?.toFixed(2) || '0.00'}%
                          </span>
                        </div>
                      </div>

                      {/* Engagement */}
                      <div className="text-center">
                        <div className="w-[32px] h-[32px] lg:w-[36px] lg:h-[36px] xl:w-[40px] xl:h-[40px] bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-[6px] lg:mb-[8px] xl:mb-[10px]">
                          <Icon
                            name="EngagementIcon.svg"
                            className="w-[16px] h-[16px] lg:w-[18px] lg:h-[18px] xl:w-[20px] xl:h-[20px] text-purple-600"
                            alt="Engagement"
                          />
                        </div>
                        <div className="font-bold text-[14px] lg:text-[16px] xl:text-[18px] text-gray-900">
                          {creator.engagement.toFixed(1)}%
                        </div>
                        <div className="flex items-center justify-center gap-[2px] lg:gap-[3px] xl:gap-[4px] mt-[2px]">
                          <Icon 
                            name={getTrendIcon(creator.engagement_change_type || 'positive')}
                            className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px]" 
                            alt={creator.engagement_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
                          />
                          <span className={`text-[10px] lg:text-[11px] xl:text-[12px] font-medium ${getTrendColor(creator.engagement_change_type || 'positive')}`}>
                            +{creator.engagement_change?.toFixed(2) || '0.00'}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Buzz Score Bar */}
                    <div className="mb-[16px] lg:mb-[18px] xl:mb-[20px]">
                      <div className="flex items-center justify-between mb-[8px] lg:mb-[10px] xl:mb-[12px]">
                        <span className="text-[12px] lg:text-[14px] xl:text-[16px] font-medium text-gray-700">
                          Buzz Score
                        </span>
                        <span className="text-[12px] lg:text-[14px] xl:text-[16px] font-bold text-gray-900">
                          {creator.buzz_score}%
                        </span>
                      </div>
                      <div className="relative">
                        <div className="w-full h-[8px] lg:h-[10px] xl:h-[12px] bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-400 via-purple-500 to-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${creator.buzz_score}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Niches */}
                    <div className="flex flex-wrap gap-[6px] lg:gap-[8px] xl:gap-[10px] mb-[16px] lg:mb-[18px] xl:mb-[20px]">
                      {creator.niches.slice(0, 2).map((niche, nicheIndex) => (
                        <Badge
                          key={nicheIndex}
                          variant="outline"
                          className={`px-[8px] lg:px-[10px] xl:px-[12px] py-[4px] lg:py-[5px] xl:py-[6px] rounded-[6px] text-[10px] lg:text-[11px] xl:text-[12px] font-medium ${
                            niche.type === 'primary' 
                              ? 'bg-gray-100 border-gray-300 text-gray-700' 
                              : 'bg-green-50 border-green-200 text-green-700'
                          }`}
                        >
                          {niche.name}
                        </Badge>
                      ))}
                    </div>

                    {/* Thumbnails */}
                    <div className="grid grid-cols-3 gap-[6px] lg:gap-[8px] xl:gap-[10px]">
                      {creator.thumbnails.slice(0, 3).map((thumbnail, thumbIndex) => (
                        <div key={thumbIndex} className="aspect-[9/16] rounded-[8px] lg:rounded-[10px] xl:rounded-[12px] overflow-hidden bg-gray-200">
                          <img
                            src={thumbnail}
                            alt={`${creator.username} post ${thumbIndex + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/images/PostThumbnail.svg';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="h-full overflow-y-auto">
                <div className="min-w-full">
                  {/* List Header */}
                  <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 rounded-t-lg font-semibold text-sm text-gray-700 border-b">
                    <div className="col-span-4">Creator</div>
                    <div className="col-span-2 text-center">Followers</div>
                    <div className="col-span-2 text-center">Avg. Views</div>
                    <div className="col-span-2 text-center">Engagement</div>
                    {currentMode === 'ai' && <div className="col-span-1 text-center">Match</div>}
                    <div className={`${currentMode === 'ai' ? 'col-span-1' : 'col-span-2'} text-center`}>Buzz Score</div>
                  </div>

                  {/* List Items */}
                  <div className="divide-y divide-gray-100">
                    {creators.map((creator, index) => (
                      <div
                        key={`list-creator-${index}`}
                        className="grid grid-cols-12 gap-4 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleCreatorClick(creator)}
                      >
                        {/* Creator Info */}
                        <div className="col-span-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
                            {creator.profile_pic ? (
                              <img 
                                src={creator.profile_pic} 
                                alt={`${creator.username} profile`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-300" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 truncate">{creator.username}</div>
                            <div className="text-sm text-gray-600 truncate">{creator.username_tag}</div>
                          </div>
                        </div>

                        {/* Followers */}
                        <div className="col-span-2 text-center">
                          <div className="font-semibold text-gray-900">{formatNumber(creator.followers)}</div>
                          <div className={`text-xs ${getTrendColor(creator.followers_change_type || 'positive')}`}>
                            +{creator.followers_change?.toFixed(1) || '0.0'}%
                          </div>
                        </div>

                        {/* Avg. Views */}
                        <div className="col-span-2 text-center">
                          <div className="font-semibold text-gray-900">{formatNumber(creator.avg_views)}</div>
                          <div className={`text-xs ${getTrendColor(creator.avg_views_change_type || 'positive')}`}>
                            +{creator.avg_views_change?.toFixed(1) || '0.0'}%
                          </div>
                        </div>

                        {/* Engagement */}
                        <div className="col-span-2 text-center">
                          <div className="font-semibold text-gray-900">{creator.engagement.toFixed(1)}%</div>
                          <div className={`text-xs ${getTrendColor(creator.engagement_change_type || 'positive')}`}>
                            +{creator.engagement_change?.toFixed(1) || '0.0'}%
                          </div>
                        </div>

                        {/* Match Score (AI mode only) */}
                        {currentMode === 'ai' && (
                          <div className="col-span-1 text-center">
                            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${getMatchScoreColor(creator.match_score || 0)}`}>
                              {creator.match_score || 0}%
                            </div>
                          </div>
                        )}

                        {/* Buzz Score */}
                        <div className={`${currentMode === 'ai' ? 'col-span-1' : 'col-span-2'} text-center`}>
                          <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${getBuzzScoreColor(creator.buzz_score)}`}>
                            {creator.buzz_score}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-[15px] lg:mt-[18px] xl:mt-[20px] pt-[12px] lg:pt-[15px] xl:pt-[18px] border-t border-gray-200 flex-shrink-0">
              <div className="text-[12px] lg:text-[14px] xl:text-[16px] text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px]">
                <Button
                  variant="outline"
                  onClick={previousPage}
                  disabled={currentPage === 1}
                  className="h-[28px] lg:h-[32px] xl:h-[36px] px-[8px] lg:px-[10px] xl:px-[12px] text-[12px] lg:text-[14px] xl:text-[16px]"
                >
                  <Icon
                    name="ArrowLeftIcon.svg"
                    className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px]"
                    alt="Previous"
                  />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="h-[28px] lg:h-[32px] xl:h-[36px] px-[8px] lg:px-[10px] xl:px-[12px] text-[12px] lg:text-[14px] xl:text-[16px]"
                >
                  Next
                  <Icon
                    name="ArrowRightIcon.svg"
                    className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px]"
                    alt="Next"
                  />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Expanded Profile Overlay */}
      {expandedCreator && (
        <ExpandedProfileOverlay
          creator={expandedCreator}
          isOpen={!!expandedCreator}
          onClose={handleCloseExpanded}
        />
      )}
    </>
  );
};