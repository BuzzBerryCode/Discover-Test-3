import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Icon } from "../../ui/icon";
import { DonutChart } from "../../ui/donut-chart";
import { ExpandedProfileOverlay } from "../../ui/expanded-profile-overlay";
import { useCreatorData } from "../../../hooks/useCreatorData";
import { Creator, ViewMode, SortField, SortDirection, SortState } from "../../../types/database";
import { formatNumber, getSocialMediaIcon, getMatchScoreColor, getBuzzScoreColor } from "../../../utils/formatters";

export const CreatorListSection = (): JSX.Element => {
  const { creators, currentMode, loading, error, currentPage, totalPages, totalCreators, handlePageChange, nextPage, previousPage } = useCreatorData();
  
  // View mode state (cards vs list)
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  
  // Sort state
  const [sortState, setSortState] = useState<SortState>({
    field: null,
    direction: 'desc'
  });
  
  // Selection state
  const [selectedCreators, setSelectedCreators] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Expanded profile state
  const [expandedCreator, setExpandedCreator] = useState<Creator | null>(null);
  
  // Handle creator selection
  const handleCreatorSelect = (creatorId: string) => {
    const newSelected = new Set(selectedCreators);
    if (newSelected.has(creatorId)) {
      newSelected.delete(creatorId);
    } else {
      newSelected.add(creatorId);
    }
    setSelectedCreators(newSelected);
    setSelectAll(newSelected.size === creators.length);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCreators(new Set());
      setSelectAll(false);
    } else {
      setSelectedCreators(new Set(creators.map(c => c.id)));
      setSelectAll(true);
    }
  };

  // Handle sort
  const handleSort = (field: SortField) => {
    const newDirection: SortDirection = 
      sortState.field === field && sortState.direction === 'desc' ? 'asc' : 'desc';
    
    setSortState({ field, direction: newDirection });
    
    // Sort creators (this would typically be handled by the backend)
    // For now, we'll sort the current page
  };

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // Handle creator card click to expand profile
  const handleCreatorClick = (creator: Creator) => {
    setExpandedCreator(creator);
  };

  // Close expanded profile
  const closeExpandedProfile = () => {
    setExpandedCreator(null);
  };

  // Loading state
  if (loading) {
    return (
      <Card className="flex-1 bg-white rounded-[10px] border-0 shadow-sm overflow-hidden">
        <CardContent className="p-[12px] lg:p-[15px] xl:p-[18px] h-full">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading creators...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="flex-1 bg-white rounded-[10px] border-0 shadow-sm overflow-hidden">
        <CardContent className="p-[12px] lg:p-[15px] xl:p-[18px] h-full">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-2">Error loading creators</p>
              <p className="text-gray-600 text-sm">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (creators.length === 0) {
    return (
      <Card className="flex-1 bg-white rounded-[10px] border-0 shadow-sm overflow-hidden">
        <CardContent className="p-[12px] lg:p-[15px] xl:p-[18px] h-full">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-600 mb-2">No creators found</p>
              <p className="text-gray-500 text-sm">Try adjusting your filters</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="flex-1 bg-white rounded-[10px] border-0 shadow-sm overflow-hidden flex flex-col">
        {/* Header with controls */}
        <div className="p-[12px] lg:p-[15px] xl:p-[18px] border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-[8px] lg:mb-[10px] xl:mb-[12px]">
            <div className="flex items-center gap-[8px] lg:gap-[10px] xl:gap-[12px]">
              <h3 className="font-semibold text-[14px] lg:text-[16px] xl:text-[18px] text-neutral-100">
                {currentMode === 'ai' ? 'AI Recommended Creators' : 'All Creators'}
              </h3>
              <span className="text-[12px] lg:text-[13px] xl:text-[14px] text-gray-500">
                ({totalCreators} total)
              </span>
            </div>
            
            <div className="flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px]">
              {/* View mode toggle */}
              <div className="flex items-center bg-gray-100 rounded-[8px] p-[2px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewModeChange('cards')}
                  className={`h-[28px] lg:h-[32px] xl:h-[36px] px-[8px] lg:px-[10px] xl:px-[12px] rounded-[6px] ${
                    viewMode === 'cards' 
                      ? 'bg-white shadow-sm text-neutral-100' 
                      : 'text-gray-600 hover:text-neutral-100'
                  }`}
                >
                  <Icon
                    name="CardsModeIcon.svg"
                    className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px]"
                    alt="Cards view"
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewModeChange('list')}
                  className={`h-[28px] lg:h-[32px] xl:h-[36px] px-[8px] lg:px-[10px] xl:px-[12px] rounded-[6px] ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-sm text-neutral-100' 
                      : 'text-gray-600 hover:text-neutral-100'
                  }`}
                >
                  <Icon
                    name="ListIconSelected.svg"
                    className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px]"
                    alt="List view"
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* Selection controls - only show when creators are selected */}
          {selectedCreators.size > 0 && (
            <div className="flex items-center justify-between p-[8px] lg:p-[10px] xl:p-[12px] bg-blue-50 rounded-[8px] mb-[8px] lg:mb-[10px] xl:mb-[12px]">
              <span className="text-[12px] lg:text-[13px] xl:text-[14px] text-blue-700 font-medium">
                {selectedCreators.size} creator{selectedCreators.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px]">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-[28px] lg:h-[32px] xl:h-[36px] px-[8px] lg:px-[10px] xl:px-[12px] text-[11px] lg:text-[12px] xl:text-[13px]"
                >
                  Add to List
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCreators(new Set());
                    setSelectAll(false);
                  }}
                  className="h-[28px] lg:h-[32px] xl:h-[36px] px-[8px] lg:px-[10px] xl:px-[12px] text-[11px] lg:text-[12px] xl:text-[13px] text-gray-600"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'cards' ? (
            /* Cards View */
            <div className="h-full overflow-y-auto">
              <div className="p-[12px] lg:p-[15px] xl:p-[18px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[12px] lg:gap-[15px] xl:gap-[18px]">
                  {creators.map((creator, index) => (
                    <Card 
                      key={`creator-card-${index}`}
                      className="bg-white rounded-[12px] lg:rounded-[15px] xl:rounded-[18px] border border-[#e1e5e9] hover:border-[#d1d5db] transition-all duration-200 hover:shadow-md cursor-pointer overflow-hidden"
                      onClick={() => handleCreatorClick(creator)}
                    >
                      <CardContent className="p-[10px] lg:p-[12px] xl:p-[15px] h-full flex flex-col">
                        {/* Header with profile info and match score */}
                        <div className="flex items-start justify-between mb-[8px] lg:mb-[10px] xl:mb-[12px]">
                          <div className="flex items-start gap-[8px] lg:gap-[10px] xl:gap-[12px] flex-1 min-w-0">
                            {/* Profile Picture - Smaller size */}
                            <div className="w-[32px] h-[32px] lg:w-[36px] lg:h-[36px] xl:w-[40px] xl:h-[40px] bg-[#384455] rounded-full overflow-hidden flex-shrink-0">
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

                            {/* Name and Username */}
                            <div className="flex flex-col gap-[2px] lg:gap-[3px] xl:gap-[4px] flex-1 min-w-0">
                              {/* Display Name - Smaller size */}
                              <h3 className="font-semibold text-[12px] lg:text-[14px] xl:text-[16px] text-neutral-100 leading-[14px] lg:leading-[16px] xl:leading-[18px] truncate">
                                {creator.username}
                              </h3>
                              
                              {/* Username with Social Media Icon */}
                              <div className="flex items-center gap-[4px] lg:gap-[5px] xl:gap-[6px]">
                                <span className="text-[10px] lg:text-[11px] xl:text-[12px] text-gray-600 font-medium truncate">
                                  {creator.username_tag || `@${creator.username.toLowerCase().replace(/\s+/g, '')}`}
                                </span>
                                {creator.social_media.map((social, iconIndex) => (
                                  <Icon
                                    key={iconIndex}
                                    name={getSocialMediaIcon(social.platform)}
                                    className="w-[10px] h-[10px] lg:w-[12px] lg:h-[12px] xl:w-[14px] xl:h-[14px] flex-shrink-0"
                                    alt={`${social.platform} logo`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Match Score and Selection */}
                          <div className="flex items-start gap-[4px] lg:gap-[6px] xl:gap-[8px] flex-shrink-0">
                            {/* Match Score - Only show in AI mode */}
                            {currentMode === 'ai' && (
                              <div className={`flex items-center justify-center px-[6px] lg:px-[8px] xl:px-[10px] py-[3px] lg:py-[4px] xl:py-[5px] rounded-[6px] ${getMatchScoreColor(creator.match_score || 0)}`}>
                                <span className="font-bold text-[11px] lg:text-[12px] xl:text-[13px] leading-[14px] lg:leading-[16px] xl:leading-[18px]">
                                  {creator.match_score || 0}%
                                </span>
                              </div>
                            )}
                            
                            {/* Selection Checkbox */}
                            <Checkbox
                              checked={selectedCreators.has(creator.id)}
                              onCheckedChange={() => handleCreatorSelect(creator.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-[16px] h-[16px] lg:w-[18px] lg:h-[18px] xl:w-[20px] xl:h-[20px]"
                            />
                          </div>
                        </div>

                        {/* Bio */}
                        <p className="text-[10px] lg:text-[11px] xl:text-[12px] text-gray-600 leading-[14px] lg:leading-[16px] xl:leading-[18px] mb-[8px] lg:mb-[10px] xl:mb-[12px] line-clamp-2">
                          {creator.bio}
                        </p>

                        {/* Category Badges */}
                        <div className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] mb-[8px] lg:mb-[10px] xl:mb-[12px] flex-wrap">
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
                            <Badge
                              variant="outline"
                              className="px-[6px] lg:px-[8px] xl:px-[10px] py-[2px] lg:py-[3px] xl:py-[4px] rounded-[4px] lg:rounded-[6px] xl:rounded-[8px] bg-gray-50 border-gray-200 text-gray-600"
                            >
                              <span className="font-medium text-[9px] lg:text-[10px] xl:text-[11px]">
                                +{creator.niches.length - 2}
                              </span>
                            </Badge>
                          )}
                        </div>

                        {/* Metrics Row */}
                        <div className="grid grid-cols-3 gap-[6px] lg:gap-[8px] xl:gap-[10px] mb-[8px] lg:mb-[10px] xl:mb-[12px]">
                          {/* Followers */}
                          <div className="text-center">
                            <div className="text-[10px] lg:text-[11px] xl:text-[12px] font-bold text-neutral-100 mb-[2px]">
                              {formatNumber(creator.followers)}
                            </div>
                            <div className="text-[8px] lg:text-[9px] xl:text-[10px] text-gray-600">
                              Followers
                            </div>
                          </div>

                          {/* Avg. Views */}
                          <div className="text-center">
                            <div className="text-[10px] lg:text-[11px] xl:text-[12px] font-bold text-neutral-100 mb-[2px]">
                              {formatNumber(creator.avg_views)}
                            </div>
                            <div className="text-[8px] lg:text-[9px] xl:text-[10px] text-gray-600">
                              Avg. Views
                            </div>
                          </div>

                          {/* Engagement */}
                          <div className="text-center">
                            <div className="text-[10px] lg:text-[11px] xl:text-[12px] font-bold text-neutral-100 mb-[2px]">
                              {creator.engagement.toFixed(1)}%
                            </div>
                            <div className="text-[8px] lg:text-[9px] xl:text-[10px] text-gray-600">
                              Engagement
                            </div>
                          </div>
                        </div>

                        {/* Buzz Score */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px]">
                            <span className="text-[10px] lg:text-[11px] xl:text-[12px] font-semibold text-gray-700">
                              Buzz Score
                            </span>
                            <DonutChart score={creator.buzz_score} size={24} strokeWidth={3} />
                          </div>
                          
                          {/* Thumbnails */}
                          <div className="flex items-center gap-[2px] lg:gap-[3px] xl:gap-[4px]">
                            {creator.thumbnails.slice(0, 3).map((thumbnail, thumbIndex) => (
                              <div 
                                key={thumbIndex}
                                className="w-[20px] h-[28px] lg:w-[24px] lg:h-[32px] xl:w-[28px] xl:h-[36px] rounded-[3px] lg:rounded-[4px] xl:rounded-[5px] overflow-hidden bg-gray-200"
                              >
                                <img
                                  src={thumbnail}
                                  alt={`${creator.username} post ${thumbIndex + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* List View */
            <div className="h-full overflow-y-auto">
              <div className="min-w-full">
                {/* Table Header */}
                <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-[12px] lg:px-[15px] xl:px-[18px] py-[8px] lg:py-[10px] xl:py-[12px]">
                  <div className="grid grid-cols-12 gap-[8px] lg:gap-[10px] xl:gap-[12px] items-center text-[11px] lg:text-[12px] xl:text-[13px] font-semibold text-gray-700">
                    <div className="col-span-1 flex items-center justify-center">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                        className="w-[16px] h-[16px] lg:w-[18px] lg:h-[18px] xl:w-[20px] xl:h-[20px]"
                      />
                    </div>
                    <div className="col-span-3">
                      <button 
                        onClick={() => handleSort('match_score')}
                        className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] hover:text-neutral-100 transition-colors"
                      >
                        <span>Creator</span>
                        <Icon
                          name="SortIcon.svg"
                          className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px]"
                          alt="Sort"
                        />
                      </button>
                    </div>
                    {currentMode === 'ai' && (
                      <div className="col-span-1">
                        <button 
                          onClick={() => handleSort('match_score')}
                          className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] hover:text-neutral-100 transition-colors"
                        >
                          <span>Match</span>
                          <Icon
                            name="SortIcon.svg"
                            className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px]"
                            alt="Sort"
                          />
                        </button>
                      </div>
                    )}
                    <div className={currentMode === 'ai' ? 'col-span-2' : 'col-span-3'}>
                      <button 
                        onClick={() => handleSort('followers')}
                        className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] hover:text-neutral-100 transition-colors"
                      >
                        <span>Followers</span>
                        <Icon
                          name="SortIcon.svg"
                          className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px]"
                          alt="Sort"
                        />
                      </button>
                    </div>
                    <div className={currentMode === 'ai' ? 'col-span-2' : 'col-span-2'}>
                      <button 
                        onClick={() => handleSort('avg_views')}
                        className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] hover:text-neutral-100 transition-colors"
                      >
                        <span>Avg. Views</span>
                        <Icon
                          name="SortIcon.svg"
                          className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px]"
                          alt="Sort"
                        />
                      </button>
                    </div>
                    <div className={currentMode === 'ai' ? 'col-span-2' : 'col-span-2'}>
                      <button 
                        onClick={() => handleSort('engagement')}
                        className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] hover:text-neutral-100 transition-colors"
                      >
                        <span>Engagement</span>
                        <Icon
                          name="SortIcon.svg"
                          className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px]"
                          alt="Sort"
                        />
                      </button>
                    </div>
                    <div className={currentMode === 'ai' ? 'col-span-1' : 'col-span-2'}>
                      <span>Buzz Score</span>
                    </div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="px-[12px] lg:px-[15px] xl:px-[18px]">
                  {creators.map((creator, index) => (
                    <div 
                      key={`creator-list-${index}`}
                      className="grid grid-cols-12 gap-[8px] lg:gap-[10px] xl:gap-[12px] items-center py-[8px] lg:py-[10px] xl:py-[12px] border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleCreatorClick(creator)}
                    >
                      <div className="col-span-1 flex items-center justify-center">
                        <Checkbox
                          checked={selectedCreators.has(creator.id)}
                          onCheckedChange={() => handleCreatorSelect(creator.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-[16px] h-[16px] lg:w-[18px] lg:h-[18px] xl:w-[20px] xl:h-[20px]"
                        />
                      </div>
                      
                      <div className="col-span-3 flex items-center gap-[8px] lg:gap-[10px] xl:gap-[12px]">
                        <div className="w-[32px] h-[32px] lg:w-[36px] lg:h-[36px] xl:w-[40px] xl:h-[40px] bg-[#384455] rounded-full overflow-hidden flex-shrink-0">
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
                        <div className="flex flex-col gap-[2px] lg:gap-[3px] xl:gap-[4px] flex-1 min-w-0">
                          <h3 className="font-semibold text-[12px] lg:text-[14px] xl:text-[16px] text-neutral-100 leading-[14px] lg:leading-[16px] xl:leading-[18px] truncate">
                            {creator.username}
                          </h3>
                          <div className="flex items-center gap-[4px] lg:gap-[5px] xl:gap-[6px]">
                            <span className="text-[10px] lg:text-[11px] xl:text-[12px] text-gray-600 font-medium truncate">
                              {creator.username_tag || `@${creator.username.toLowerCase().replace(/\s+/g, '')}`}
                            </span>
                            {creator.social_media.map((social, iconIndex) => (
                              <Icon
                                key={iconIndex}
                                name={getSocialMediaIcon(social.platform)}
                                className="w-[10px] h-[10px] lg:w-[12px] lg:h-[12px] xl:w-[14px] xl:h-[14px] flex-shrink-0"
                                alt={`${social.platform} logo`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {currentMode === 'ai' && (
                        <div className="col-span-1">
                          <div className={`inline-flex items-center justify-center px-[6px] lg:px-[8px] xl:px-[10px] py-[3px] lg:py-[4px] xl:py-[5px] rounded-[6px] ${getMatchScoreColor(creator.match_score || 0)}`}>
                            <span className="font-bold text-[11px] lg:text-[12px] xl:text-[13px]">
                              {creator.match_score || 0}%
                            </span>
                          </div>
                        </div>
                      )}

                      <div className={currentMode === 'ai' ? 'col-span-2' : 'col-span-3'}>
                        <span className="text-[11px] lg:text-[12px] xl:text-[13px] font-semibold text-neutral-100">
                          {formatNumber(creator.followers)}
                        </span>
                      </div>

                      <div className={currentMode === 'ai' ? 'col-span-2' : 'col-span-2'}>
                        <span className="text-[11px] lg:text-[12px] xl:text-[13px] font-semibold text-neutral-100">
                          {formatNumber(creator.avg_views)}
                        </span>
                      </div>

                      <div className={currentMode === 'ai' ? 'col-span-2' : 'col-span-2'}>
                        <span className="text-[11px] lg:text-[12px] xl:text-[13px] font-semibold text-neutral-100">
                          {creator.engagement.toFixed(1)}%
                        </span>
                      </div>

                      <div className={currentMode === 'ai' ? 'col-span-1' : 'col-span-2'}>
                        <DonutChart score={creator.buzz_score} size={24} strokeWidth={3} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-[12px] lg:p-[15px] xl:p-[18px] border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[12px] lg:text-[13px] xl:text-[14px] text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <div className="flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousPage}
                  disabled={currentPage === 1}
                  className="h-[28px] lg:h-[32px] xl:h-[36px] px-[8px] lg:px-[10px] xl:px-[12px] text-[11px] lg:text-[12px] xl:text-[13px]"
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
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="h-[28px] lg:h-[32px] xl:h-[36px] px-[8px] lg:px-[10px] xl:px-[12px] text-[11px] lg:text-[12px] xl:text-[13px]"
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
          </div>
        )}
      </Card>

      {/* Expanded Profile Overlay */}
      {expandedCreator && (
        <ExpandedProfileOverlay
          creator={expandedCreator}
          isOpen={!!expandedCreator}
          onClose={closeExpandedProfile}
        />
      )}
    </>
  );
};