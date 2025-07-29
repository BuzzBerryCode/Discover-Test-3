import React, { useState, useRef, useEffect } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Icon } from "../../ui/icon";
import { DonutChart } from "../../ui/donut-chart";
import { ExpandedProfileOverlay } from "../../ui/expanded-profile-overlay";
import { useCreatorData } from "../../../hooks/useCreatorData";
import { Creator, ViewMode, SortField, SortDirection, SortState } from "../../../types/database";
import { formatNumber, getSocialMediaIcon, getMatchScoreColor } from "../../../utils/formatters";

export const CreatorListSection = (): JSX.Element => {
  const { creators, currentMode, loading, totalCreators, currentPage, totalPages, nextPage, previousPage } = useCreatorData();
  
  // View mode state
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
  
  // Dropdown states
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);
  const saveDropdownRef = useRef<HTMLDivElement>(null);

  // Handle view mode toggle
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // Handle sort
  const handleSort = (field: SortField) => {
    setSortState(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCreators(new Set());
    } else {
      setSelectedCreators(new Set(creators.map(creator => creator.id)));
    }
    setSelectAll(!selectAll);
  };

  // Handle individual creator selection
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

  // Handle creator card click (expand profile)
  const handleCreatorClick = (creator: Creator) => {
    setExpandedCreator(creator);
  };

  // Close expanded profile
  const closeExpandedProfile = () => {
    setExpandedCreator(null);
  };

  // Close save dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (saveDropdownRef.current && !saveDropdownRef.current.contains(event.target as Node)) {
        setShowSaveDropdown(false);
      }
    };

    if (showSaveDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showSaveDropdown]);

  // Sort creators
  const sortedCreators = React.useMemo(() => {
    if (!sortState.field) return creators;
    
    return [...creators].sort((a, b) => {
      let aValue: number;
      let bValue: number;
      
      switch (sortState.field) {
        case 'match_score':
          aValue = a.match_score || 0;
          bValue = b.match_score || 0;
          break;
        case 'followers':
          aValue = a.followers;
          bValue = b.followers;
          break;
        case 'avg_views':
          aValue = a.avg_views;
          bValue = b.avg_views;
          break;
        case 'engagement':
          aValue = a.engagement;
          bValue = b.engagement;
          break;
        default:
          return 0;
      }
      
      return sortState.direction === 'desc' ? bValue - aValue : aValue - bValue;
    });
  }, [creators, sortState]);

  if (loading) {
    return (
      <Card className="flex-1 p-[12px] lg:p-[15px] xl:p-[18px] bg-white rounded-[10px] border-0 shadow-sm overflow-hidden">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading creators...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="flex-1 p-[12px] lg:p-[15px] xl:p-[18px] bg-white rounded-[10px] border-0 shadow-sm overflow-hidden flex flex-col">
        {/* Header with view toggle and actions */}
        <div className="flex items-center justify-between mb-[12px] lg:mb-[15px] xl:mb-[18px] flex-shrink-0">
          {/* Left side - View mode toggle */}
          <div className="flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px]">
            <Button
              onClick={() => handleViewModeChange('cards')}
              className={`h-[35px] px-[8px] lg:px-[10px] xl:px-[12px] rounded-[10px] font-medium text-[14px] flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] transition-colors ${
                viewMode === 'cards'
                  ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'
                  : 'bg-basewhite border-[#dbe2eb] text-neutral-new900 hover:bg-gray-50'
              }`}
              variant="outline"
            >
              <Icon
                name={viewMode === 'cards' ? "CardsModeIcon.svg" : "CardsModeIconUnselected.svg"}
                className="w-[15px] h-[15px]"
                alt="Cards view"
              />
              <span className="hidden sm:inline">Cards</span>
            </Button>
            
            <Button
              onClick={() => handleViewModeChange('list')}
              className={`h-[35px] px-[8px] lg:px-[10px] xl:px-[12px] rounded-[10px] font-medium text-[14px] flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'
                  : 'bg-basewhite border-[#dbe2eb] text-neutral-new900 hover:bg-gray-50'
              }`}
              variant="outline"
            >
              <Icon
                name={viewMode === 'list' ? "ListIconSelected.svg" : "ListIcon.svg"}
                className="w-[15px] h-[15px]"
                alt="List view"
              />
              <span className="hidden sm:inline">List</span>
            </Button>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px]">
            {/* Save in a list button with dropdown */}
            <div className="relative" ref={saveDropdownRef}>
              <Button
                onClick={() => setShowSaveDropdown(!showSaveDropdown)}
                className="h-[35px] px-[8px] lg:px-[10px] xl:px-[12px] bg-basewhite border-[#dbe2eb] rounded-[10px] font-medium text-[14px] text-neutral-new900 flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] hover:bg-gray-50 transition-colors"
                variant="outline"
              >
                <Icon
                  name="SavedListIcon.svg"
                  className="w-[15px] h-[15px]"
                  alt="Save list"
                />
                <span className="hidden sm:inline">Save in a list</span>
                <span className="sm:hidden">Save</span>
                <Icon
                  name="DropdownIcon.svg"
                  className={`w-[8px] h-[5px] lg:w-[10px] lg:h-[6px] xl:w-[12px] xl:h-[7px] transition-transform ${
                    showSaveDropdown ? 'rotate-180' : ''
                  }`}
                  alt="Dropdown"
                />
              </Button>

              {/* Save dropdown */}
              {showSaveDropdown && (
                <div className="absolute top-full right-0 mt-2 w-[200px] lg:w-[240px] xl:w-[280px] bg-white border border-[#dbe2eb] rounded-[12px] shadow-lg z-50 overflow-hidden">
                  <div className="p-3 lg:p-4">
                    <div className="text-[12px] lg:text-[13px] xl:text-[14px] font-medium text-gray-600 mb-2">
                      Save to list
                    </div>
                    <div className="space-y-2">
                      <button className="w-full text-left px-3 py-2 rounded-[8px] text-[12px] lg:text-[13px] xl:text-[14px] text-neutral-new900 hover:bg-gray-50 transition-colors">
                        Create new list
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-[8px] text-[12px] lg:text-[13px] xl:text-[14px] text-neutral-new900 hover:bg-gray-50 transition-colors">
                        My Favorites
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-[8px] text-[12px] lg:text-[13px] xl:text-[14px] text-neutral-new900 hover:bg-gray-50 transition-colors">
                        Campaign Ideas
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Select All button */}
            <Button
              onClick={handleSelectAll}
              className={`h-[35px] px-[8px] lg:px-[10px] xl:px-[12px] rounded-[10px] font-medium text-[14px] flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] transition-colors ${
                selectAll
                  ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'
                  : 'bg-basewhite border-[#dbe2eb] text-neutral-new900 hover:bg-gray-50'
              }`}
              variant="outline"
            >
              <Icon
                name={selectAll ? "CheckIcon.svg" : "CheckIcon.svg"}
                className="w-[15px] h-[15px]"
                alt="Select all"
              />
              <span className="hidden sm:inline">
                {selectAll ? `Selected (${selectedCreators.size})` : 'Select All'}
              </span>
              <span className="sm:hidden">
                {selectAll ? `(${selectedCreators.size})` : 'All'}
              </span>
            </Button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'cards' ? (
            // Cards View
            <div className="h-full overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[8px] lg:gap-[10px] xl:gap-[12px] pb-4">
                {sortedCreators.map((creator, index) => (
                  <div
                    key={`creator-card-${index}`}
                    className="bg-white rounded-[12px] lg:rounded-[15px] xl:rounded-[18px] border border-[#e5e7eb] overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative"
                    onClick={() => handleCreatorClick(creator)}
                  >
                    {/* Selection checkbox */}
                    <div className="absolute top-[8px] lg:top-[10px] xl:top-[12px] left-[8px] lg:left-[10px] xl:left-[12px] z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreatorSelect(creator.id);
                        }}
                        className={`w-[16px] h-[16px] lg:w-[18px] lg:h-[18px] xl:w-[20px] xl:h-[20px] rounded-[4px] border-2 flex items-center justify-center transition-colors ${
                          selectedCreators.has(creator.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-white border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {selectedCreators.has(creator.id) && (
                          <Icon
                            name="CheckIcon.svg"
                            className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px] text-white"
                            alt="Selected"
                          />
                        )}
                      </button>
                    </div>

                    {/* Match Score - Only show in AI mode */}
                    {currentMode === 'ai' && creator.match_score && (
                      <div className="absolute top-[8px] lg:top-[10px] xl:top-[12px] right-[8px] lg:right-[10px] xl:right-[12px] z-10">
                        <div className={`flex items-center justify-center px-[6px] lg:px-[8px] xl:px-[10px] py-[3px] lg:py-[4px] xl:py-[5px] rounded-[6px] ${getMatchScoreColor(creator.match_score)}`}>
                          <span className="font-bold text-[11px] lg:text-[12px] xl:text-[13px] leading-[14px] lg:leading-[16px] xl:leading-[18px]">
                            {creator.match_score}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Thumbnail */}
                    <div className="aspect-[9/16] bg-gray-200 overflow-hidden">
                      {creator.thumbnails[0] ? (
                        <img
                          src={creator.thumbnails[0]}
                          alt={`${creator.username} thumbnail`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-[12px] lg:text-[14px] xl:text-[16px]">No image</span>
                        </div>
                      )}
                    </div>

                    {/* Creator info */}
                    <div className="p-[8px] lg:p-[10px] xl:p-[12px]">
                      {/* Profile and basic info */}
                      <div className="flex items-start gap-[6px] lg:gap-[8px] xl:gap-[10px] mb-[6px] lg:mb-[8px] xl:mb-[10px]">
                        {/* Profile picture */}
                        <div className="w-[24px] h-[24px] lg:w-[28px] lg:h-[28px] xl:w-[32px] xl:h-[32px] bg-[#384455] rounded-full overflow-hidden flex-shrink-0">
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

                        {/* Name and handle */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[12px] lg:text-[13px] xl:text-[14px] text-[#06152b] leading-[14px] lg:leading-[16px] xl:leading-[18px] truncate">
                            {creator.username}
                          </div>
                          <div className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] mt-[1px]">
                            <span className="text-[10px] lg:text-[11px] xl:text-[12px] text-[#71737c] leading-[12px] lg:leading-[14px] xl:leading-[16px] truncate">
                              {creator.username_tag}
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

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-[4px] lg:gap-[6px] xl:gap-[8px] mb-[6px] lg:mb-[8px] xl:mb-[10px]">
                        {/* Followers */}
                        <div className="text-center">
                          <div className="text-[10px] lg:text-[11px] xl:text-[12px] font-bold text-[#06152b] leading-[12px] lg:leading-[14px] xl:leading-[16px]">
                            {formatNumber(creator.followers)}
                          </div>
                          <div className="text-[8px] lg:text-[9px] xl:text-[10px] text-[#71737c] leading-[10px] lg:leading-[12px] xl:leading-[14px]">
                            Followers
                          </div>
                        </div>

                        {/* Avg Views */}
                        <div className="text-center">
                          <div className="text-[10px] lg:text-[11px] xl:text-[12px] font-bold text-[#06152b] leading-[12px] lg:leading-[14px] xl:leading-[16px]">
                            {formatNumber(creator.avg_views)}
                          </div>
                          <div className="text-[8px] lg:text-[9px] xl:text-[10px] text-[#71737c] leading-[10px] lg:leading-[12px] xl:leading-[14px]">
                            Avg Views
                          </div>
                        </div>

                        {/* Engagement */}
                        <div className="text-center">
                          <div className="text-[10px] lg:text-[11px] xl:text-[12px] font-bold text-[#06152b] leading-[12px] lg:leading-[14px] xl:leading-[16px]">
                            {creator.engagement.toFixed(1)}%
                          </div>
                          <div className="text-[8px] lg:text-[9px] xl:text-[10px] text-[#71737c] leading-[10px] lg:leading-[12px] xl:leading-[14px]">
                            Engagement
                          </div>
                        </div>
                      </div>

                      {/* Buzz Score */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] lg:text-[11px] xl:text-[12px] font-medium text-[#71737c]">
                          Buzz Score
                        </span>
                        <div className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px]">
                          <DonutChart score={creator.buzz_score} size={24} strokeWidth={3} />
                          <span className="text-[10px] lg:text-[11px] xl:text-[12px] font-bold text-[#06152b]">
                            {creator.buzz_score}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // List View
            <div className="h-full overflow-hidden flex flex-col">
              {/* Table Header */}
              <div className="flex-shrink-0 border-b border-[#e5e7eb] pb-[8px] lg:pb-[10px] xl:pb-[12px] mb-[8px] lg:mb-[10px] xl:mb-[12px]">
                <div className="grid grid-cols-12 gap-[8px] lg:gap-[10px] xl:gap-[12px] items-center">
                  {/* Selection header */}
                  <div className="col-span-1 flex items-center justify-center">
                    <button
                      onClick={handleSelectAll}
                      className={`w-[16px] h-[16px] lg:w-[18px] lg:h-[18px] xl:w-[20px] xl:h-[20px] rounded-[4px] border-2 flex items-center justify-center transition-colors ${
                        selectAll
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {selectAll && (
                        <Icon
                          name="CheckIcon.svg"
                          className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px] text-white"
                          alt="Select all"
                        />
                      )}
                    </button>
                  </div>

                  {/* Creator header */}
                  <div className="col-span-3">
                    <span className="text-[12px] lg:text-[13px] xl:text-[14px] font-semibold text-[#71737c]">
                      Creator
                    </span>
                  </div>

                  {/* Match Score header - Only show in AI mode */}
                  {currentMode === 'ai' && (
                    <div className="col-span-1">
                      <button
                        onClick={() => handleSort('match_score')}
                        className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] text-[12px] lg:text-[13px] xl:text-[14px] font-semibold text-[#71737c] hover:text-[#06152b] transition-colors"
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

                  {/* Followers header */}
                  <div className={currentMode === 'ai' ? "col-span-2" : "col-span-3"}>
                    <button
                      onClick={() => handleSort('followers')}
                      className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] text-[12px] lg:text-[13px] xl:text-[14px] font-semibold text-[#71737c] hover:text-[#06152b] transition-colors"
                    >
                      <span>Followers</span>
                      <Icon
                        name="SortIcon.svg"
                        className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px]"
                        alt="Sort"
                      />
                    </button>
                  </div>

                  {/* Avg Views header */}
                  <div className="col-span-2">
                    <button
                      onClick={() => handleSort('avg_views')}
                      className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] text-[12px] lg:text-[13px] xl:text-[14px] font-semibold text-[#71737c] hover:text-[#06152b] transition-colors"
                    >
                      <span>Avg Views</span>
                      <Icon
                        name="SortIcon.svg"
                        className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px]"
                        alt="Sort"
                      />
                    </button>
                  </div>

                  {/* Engagement header */}
                  <div className="col-span-2">
                    <button
                      onClick={() => handleSort('engagement')}
                      className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] text-[12px] lg:text-[13px] xl:text-[14px] font-semibold text-[#71737c] hover:text-[#06152b] transition-colors"
                    >
                      <span>Engagement</span>
                      <Icon
                        name="SortIcon.svg"
                        className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px]"
                        alt="Sort"
                      />
                    </button>
                  </div>

                  {/* Buzz Score header */}
                  <div className="col-span-1">
                    <span className="text-[12px] lg:text-[13px] xl:text-[14px] font-semibold text-[#71737c]">
                      Buzz
                    </span>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-[4px] lg:space-y-[6px] xl:space-y-[8px]">
                  {sortedCreators.map((creator, index) => (
                    <div
                      key={`creator-list-${index}`}
                      className="grid grid-cols-12 gap-[8px] lg:gap-[10px] xl:gap-[12px] items-center p-[8px] lg:p-[10px] xl:p-[12px] bg-white rounded-[8px] lg:rounded-[10px] xl:rounded-[12px] border border-[#e5e7eb] hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => handleCreatorClick(creator)}
                    >
                      {/* Selection checkbox */}
                      <div className="col-span-1 flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreatorSelect(creator.id);
                          }}
                          className={`w-[16px] h-[16px] lg:w-[18px] lg:h-[18px] xl:w-[20px] xl:h-[20px] rounded-[4px] border-2 flex items-center justify-center transition-colors ${
                            selectedCreators.has(creator.id)
                              ? 'bg-blue-600 border-blue-600'
                              : 'bg-white border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {selectedCreators.has(creator.id) && (
                            <Icon
                              name="CheckIcon.svg"
                              className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px] text-white"
                              alt="Selected"
                            />
                          )}
                        </button>
                      </div>

                      {/* Creator info */}
                      <div className="col-span-3 flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px]">
                        {/* Profile picture */}
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

                        {/* Name and handle */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[12px] lg:text-[13px] xl:text-[14px] text-[#06152b] leading-[14px] lg:leading-[16px] xl:leading-[18px] truncate">
                            {creator.username}
                          </div>
                          <div className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] mt-[1px]">
                            <span className="text-[10px] lg:text-[11px] xl:text-[12px] text-[#71737c] leading-[12px] lg:leading-[14px] xl:leading-[16px] truncate">
                              {creator.username_tag}
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
                        </div>
                      </div>

                      {/* Match Score - Only show in AI mode */}
                      {currentMode === 'ai' && (
                        <div className="col-span-1">
                          {creator.match_score && (
                            <div className={`inline-flex items-center justify-center px-[6px] lg:px-[8px] xl:px-[10px] py-[2px] lg:py-[3px] xl:py-[4px] rounded-[6px] ${getMatchScoreColor(creator.match_score)}`}>
                              <span className="font-bold text-[10px] lg:text-[11px] xl:text-[12px]">
                                {creator.match_score}%
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Followers */}
                      <div className={currentMode === 'ai' ? "col-span-2" : "col-span-3"}>
                        <div className="text-[12px] lg:text-[13px] xl:text-[14px] font-semibold text-[#06152b]">
                          {formatNumber(creator.followers)}
                        </div>
                        <div className="flex items-center gap-[2px] lg:gap-[3px] xl:gap-[4px] mt-[1px]">
                          <Icon 
                            name={creator.followers_change_type === 'positive' ? 'PositiveChangeIcon.svg' : 'NegativeChangeIcon.svg'}
                            className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px]" 
                            alt={creator.followers_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
                          />
                          <span className={`text-[10px] lg:text-[11px] xl:text-[12px] font-medium ${
                            creator.followers_change_type === 'positive' ? 'text-[#1ad598]' : 'text-[#ea3a3d]'
                          }`}>
                            {creator.followers_change?.toFixed(2) || '0.00'}%
                          </span>
                        </div>
                      </div>

                      {/* Avg Views */}
                      <div className="col-span-2">
                        <div className="text-[12px] lg:text-[13px] xl:text-[14px] font-semibold text-[#06152b]">
                          {formatNumber(creator.avg_views)}
                        </div>
                        <div className="flex items-center gap-[2px] lg:gap-[3px] xl:gap-[4px] mt-[1px]">
                          <Icon 
                            name={creator.avg_views_change_type === 'positive' ? 'PositiveChangeIcon.svg' : 'NegativeChangeIcon.svg'}
                            className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px]" 
                            alt={creator.avg_views_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
                          />
                          <span className={`text-[10px] lg:text-[11px] xl:text-[12px] font-medium ${
                            creator.avg_views_change_type === 'positive' ? 'text-[#1ad598]' : 'text-[#ea3a3d]'
                          }`}>
                            {creator.avg_views_change?.toFixed(2) || '0.00'}%
                          </span>
                        </div>
                      </div>

                      {/* Engagement */}
                      <div className="col-span-2">
                        <div className="text-[12px] lg:text-[13px] xl:text-[14px] font-semibold text-[#06152b]">
                          {creator.engagement.toFixed(1)}%
                        </div>
                        <div className="flex items-center gap-[2px] lg:gap-[3px] xl:gap-[4px] mt-[1px]">
                          <Icon 
                            name={creator.engagement_change_type === 'positive' ? 'PositiveChangeIcon.svg' : 'NegativeChangeIcon.svg'}
                            className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px]" 
                            alt={creator.engagement_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
                          />
                          <span className={`text-[10px] lg:text-[11px] xl:text-[12px] font-medium ${
                            creator.engagement_change_type === 'positive' ? 'text-[#1ad598]' : 'text-[#ea3a3d]'
                          }`}>
                            {creator.engagement_change?.toFixed(2) || '0.00'}%
                          </span>
                        </div>
                      </div>

                      {/* Buzz Score */}
                      <div className="col-span-1">
                        <div className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px]">
                          <DonutChart score={creator.buzz_score} size={24} strokeWidth={3} />
                          <span className="text-[10px] lg:text-[11px] xl:text-[12px] font-bold text-[#06152b]">
                            {creator.buzz_score}%
                          </span>
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
          <div className="flex items-center justify-between mt-[12px] lg:mt-[15px] xl:mt-[18px] pt-[12px] lg:pt-[15px] xl:pt-[18px] border-t border-[#e5e7eb] flex-shrink-0">
            <div className="text-[12px] lg:text-[13px] xl:text-[14px] text-[#71737c]">
              Showing {((currentPage - 1) * 24) + 1}-{Math.min(currentPage * 24, totalCreators)} of {totalCreators} creators
            </div>
            
            <div className="flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px]">
              <Button
                onClick={previousPage}
                disabled={currentPage === 1}
                className="h-[32px] lg:h-[36px] xl:h-[40px] px-[8px] lg:px-[10px] xl:px-[12px] bg-basewhite border-[#dbe2eb] rounded-[8px] font-medium text-[12px] lg:text-[13px] xl:text-[14px] text-neutral-new900 flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                variant="outline"
              >
                <Icon
                  name="ArrowLeftIcon.svg"
                  className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px]"
                  alt="Previous"
                />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              
              <span className="text-[12px] lg:text-[13px] xl:text-[14px] text-[#71737c] px-[8px] lg:px-[10px] xl:px-[12px]">
                {currentPage} of {totalPages}
              </span>
              
              <Button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="h-[32px] lg:h-[36px] xl:h-[40px] px-[8px] lg:px-[10px] xl:px-[12px] bg-basewhite border-[#dbe2eb] rounded-[8px] font-medium text-[12px] lg:text-[13px] xl:text-[14px] text-neutral-new900 flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                variant="outline"
              >
                <span className="hidden sm:inline">Next</span>
                <Icon
                  name="ArrowRightIcon.svg"
                  className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px]"
                  alt="Next"
                />
              </Button>
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