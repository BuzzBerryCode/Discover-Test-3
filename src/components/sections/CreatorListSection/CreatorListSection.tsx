import React, { useState } from "react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Checkbox } from "../../ui/checkbox";
import { Separator } from "../../ui/separator";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../ui/toggle-group";
import { Icon } from "../../ui/icon";
import { DonutChart } from "../../ui/donut-chart";
import { ExpandedProfileOverlay } from "../../ui/expanded-profile-overlay";
import { useCreatorData } from "../../../hooks/useCreatorData";
import { formatNumber, formatEngagement, getSocialMediaIcon, getMatchScoreColor } from "../../../utils/formatters";
import { ViewMode, SortField, SortDirection, SortState, Creator } from "../../../types/database";

export const CreatorListSection = (): JSX.Element => {
  const { 
    creators, 
    loading, 
    error, 
    currentMode, 
    currentPage, 
    totalPages, 
    totalCreators,
    handlePageChange,
    nextPage,
    previousPage 
  } = useCreatorData();

  // State for tracking selected cards
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  
  // Sorting state
  const [sortState, setSortState] = useState<SortState>({
    field: null,
    direction: 'desc'
  });

  // Handle individual card selection
  const handleCardSelection = (creatorId: string) => {
    const newSelectedCards = new Set(selectedCards);
    if (newSelectedCards.has(creatorId)) {
      newSelectedCards.delete(creatorId);
    } else {
      newSelectedCards.add(creatorId);
    }
    setSelectedCards(newSelectedCards);
    
    // Update select all state based on individual selections
    setSelectAll(newSelectedCards.size === creators.length);
  };

  // Handle select all functionality
  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setSelectedCards(new Set());
      setSelectAll(false);
    } else {
      // Select all
      const allCreatorIds = new Set(creators.map(creator => creator.id));
      setSelectedCards(allCreatorIds);
      setSelectAll(true);
    }
  };

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // Handle creator click to open overlay
  const handleCreatorClick = (creator: Creator) => {
    setSelectedCreator(creator);
    setIsOverlayOpen(true);
  };

  // Handle overlay close
  const handleOverlayClose = () => {
    setIsOverlayOpen(false);
    setSelectedCreator(null);
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    setSortState(prevState => ({
      field,
      direction: prevState.field === field && prevState.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Sort creators based on current sort state
  const getSortedCreators = (): Creator[] => {
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

      if (sortState.direction === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  };

  const sortedCreators = getSortedCreators();

  if (loading) {
    return (
      <section className="flex flex-col items-start gap-[5px] p-[15px] lg:p-[20px] xl:p-[25px] bg-white rounded-[12px] flex-1 overflow-hidden shadow-sm">
        <div className="w-full h-[100px] bg-gray-100 rounded-lg animate-pulse mb-4" />
        <div className="flex-1 overflow-y-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-[12px] lg:gap-[15px] xl:gap-[18px] 2xl:gap-[20px] w-full pb-4">
            {Array(6).fill(0).map((_, index) => (
              <Card key={index} className="w-full rounded-[15px] p-0 border-2 shadow-sm animate-pulse">
                <CardContent className="flex flex-col gap-[8px] lg:gap-[10px] xl:gap-[12px] p-[12px] lg:p-[15px] xl:p-[18px]">
                  <div className="flex w-full items-start justify-between">
                    <div className="w-[50px] h-[50px] lg:w-[60px] lg:h-[60px] xl:w-[70px] xl:h-[70px] bg-gray-200 rounded-full" />
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-6 bg-gray-200 rounded" />
                      <div className="w-5 h-5 bg-gray-200 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-16 bg-gray-200 rounded" />
                    <div className="flex-1 h-16 bg-gray-200 rounded" />
                    <div className="flex-1 h-16 bg-gray-200 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-gray-200 rounded" />
                    <div className="h-6 w-20 bg-gray-200 rounded" />
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1 h-20 bg-gray-200 rounded" />
                    <div className="flex-1 h-20 bg-gray-200 rounded" />
                    <div className="flex-1 h-20 bg-gray-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-col items-center justify-center gap-4 p-[15px] lg:p-[20px] xl:p-[25px] bg-white rounded-[12px] flex-1 overflow-hidden shadow-sm">
        <div className="text-red-500 text-lg font-medium">Error loading creators</div>
        <div className="text-gray-600 text-sm">{error}</div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-start gap-[5px] p-[15px] lg:p-[20px] xl:p-[25px] bg-white rounded-[12px] flex-1 overflow-hidden shadow-sm">
      {/* Header with controls */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between w-full flex-shrink-0 mb-[10px] gap-3 sm:gap-4 xl:gap-6 min-w-0 overflow-hidden">
        {/* Left side - View mode toggle */}
        <div className="flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px] min-w-0 overflow-hidden">
          <div className="flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px] min-w-0 overflow-hidden">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && handleViewModeChange(value as ViewMode)}
              className="inline-flex items-center gap-0 px-[4px] lg:px-[6px] xl:px-[8px] py-0 h-[32px] lg:h-[40px] xl:h-[44px] rounded-[8px] border border-solid border-[#dbe2eb] bg-white flex-shrink-0 min-w-0"
            >
              <ToggleGroupItem
                value="cards"
                className={`inline-flex items-center justify-center gap-[4px] lg:gap-[6px] xl:gap-[8px] px-[6px] lg:px-[8px] xl:px-[10px] py-0 bg-basewhite h-full rounded-[6px] data-[state=on]:bg-gray-50 text-[12px] lg:text-[14px] xl:text-[15px] min-w-0 flex-shrink-0`}
              >
                <Icon
                  name={viewMode === 'cards' ? "CardsModeIcon.svg" : "CardsModeIconUnselected.svg"}
                  className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px] flex-shrink-0"
                  alt="Cards mode icon"
                />
                <span className={`font-medium hidden sm:inline ${viewMode === 'cards' ? 'text-graysblack' : 'text-[#999999]'}`}>Cards</span>
              </ToggleGroupItem>

              <Separator orientation="vertical" className="h-[16px] lg:h-[20px] xl:h-[24px]" />

              <ToggleGroupItem
                value="list"
                className={`inline-flex items-center justify-center gap-[4px] lg:gap-[6px] xl:gap-[8px] px-[6px] lg:px-[8px] xl:px-[10px] py-0 bg-white h-full rounded-[6px] data-[state=on]:bg-gray-50 text-[12px] lg:text-[14px] xl:text-[15px] min-w-0 flex-shrink-0`}
              >
                <Icon
                  name={viewMode === 'list' ? "ListIconSelected.svg" : "ListIcon.svg"}
                  className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px] flex-shrink-0"
                  alt="List mode icon"
                />
                <span className={`font-medium hidden sm:inline ${viewMode === 'list' ? 'text-graysblack' : 'text-[#999999]'}`}>List</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Right side - Save and Select All buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-[6px] lg:gap-[8px] xl:gap-[10px] w-full sm:w-auto min-w-0 overflow-hidden">
          <Button
            variant="outline"
            className="h-[32px] lg:h-[40px] xl:h-[44px] inline-flex items-center justify-center gap-[4px] lg:gap-[6px] xl:gap-[8px] px-[8px] lg:px-[12px] xl:px-[16px] py-[6px] lg:py-[8px] xl:py-[10px] bg-basewhite rounded-[8px] border-[#dbe2eb] hover:bg-gray-50 transition-colors text-[12px] lg:text-[14px] xl:text-[15px] w-full sm:w-auto flex-shrink-0 min-w-0 max-w-full"
          >
            <Icon
              name="SavedListIcon.svg"
              className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px] flex-shrink-0"
              alt="Save in list icon"
            />
            <span className="font-medium text-neutral-new900 truncate min-w-0">
              Save in a list
            </span>
          </Button>

          <div className="flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px] w-full sm:w-auto min-w-0 overflow-hidden">
            <Button
              onClick={handleSelectAll}
              variant="outline"
              className="h-[32px] lg:h-[40px] xl:h-[44px] inline-flex items-center justify-center gap-[4px] lg:gap-[6px] xl:gap-[8px] px-[8px] lg:px-[12px] xl:px-[16px] py-[6px] lg:py-[8px] xl:py-[10px] bg-basewhite rounded-[8px] border-[#dbe2eb] hover:bg-gray-50 transition-colors text-[12px] lg:text-[14px] xl:text-[15px] flex-1 sm:flex-none flex-shrink-0 min-w-0 max-w-full"
            >
              <span className="font-medium text-neutral-new900 truncate min-w-0">
                Select All
              </span>
              <Checkbox
                checked={selectAll}
                className="w-[18px] h-[18px] lg:w-[20px] lg:h-[20px] xl:w-[22px] xl:h-[22px] p-0 border-2 border-gray-300 rounded-[3px] data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 flex-shrink-0"
              />
            </Button>
          </div>
        </div>
      </header>

      <div className="w-full flex-shrink-0 mb-[15px]">
        <Separator className="w-full h-px bg-[#f1f4f9]" />
      </div>

      {/* Dynamic Creator content - Cards or List */}
      <div className="flex-1 overflow-y-auto w-full">
        {totalCreators === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-gray-500 text-lg font-medium mb-2">No creators found</div>
            <div className="text-gray-400 text-sm">Try adjusting your filters to see more results</div>
          </div>
        ) : viewMode === 'cards' ? (
          // Cards View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-[12px] lg:gap-[15px] xl:gap-[18px] 2xl:gap-[20px] w-full pb-4">
            {sortedCreators.map((creator) => (
              <Card
                key={creator.id}
                onClick={() => handleCreatorClick(creator)}
                className={`w-full rounded-[15px] p-0 border-2 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  selectedCards.has(creator.id) 
                    ? 'bg-gray-50 border-blue-300' 
                    : selectedCreator?.id === creator.id
                    ? 'bg-[#f1f6fe] border-transparent'
                    : 'bg-gray-50 border-transparent'
                }`}
              >
                <CardContent className="flex flex-col gap-[8px] lg:gap-[10px] xl:gap-[12px] p-[12px] lg:p-[15px] xl:p-[18px]">
                  <div className="flex w-full items-start justify-between">
                    <div className="w-[50px] h-[50px] lg:w-[60px] lg:h-[60px] xl:w-[70px] xl:h-[70px] bg-[#384455] rounded-full flex-shrink-0 overflow-hidden">
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

                    <div className="inline-flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px]">
                      {currentMode === 'ai' && (
                        <div className={`flex items-center justify-center px-[6px] lg:px-[8px] xl:px-[10px] py-[3px] lg:py-[4px] xl:py-[5px] rounded-[6px] ${getMatchScoreColor(creator.match_score || 0)}`}>
                          <span className="font-bold text-[11px] lg:text-[12px] xl:text-[13px] leading-[14px] lg:leading-[16px] xl:leading-[18px]">
                            {creator.match_score || 0}%
                          </span>
                        </div>
                      )}
                      <Checkbox
                        checked={selectedCards.has(creator.id)}
                        onCheckedChange={(e) => {
                          e?.stopPropagation?.();
                          handleCardSelection(creator.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-[18px] h-[18px] lg:w-[20px] lg:h-[20px] xl:w-[22px] xl:h-[22px] p-0 border-2 border-gray-300 rounded-[3px] data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        id={`select-${creator.id}`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-[10px] lg:gap-[12px] xl:gap-[14px] w-full">
                    <div className="flex flex-col gap-[4px] lg:gap-[6px] xl:gap-[8px]">
                      <div className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px]">
                        <span className="font-semibold text-[#06152b] text-[14px] lg:text-[16px] xl:text-[18px] leading-[18px] lg:leading-[20px] xl:leading-[22px]">
                          {creator.username}
                        </span>
                        <div className="flex items-center gap-[3px] lg:gap-[4px] xl:gap-[5px]">
                          {creator.social_media.map((social, iconIndex) => (
                            <Icon
                              key={iconIndex}
                              name={getSocialMediaIcon(social.platform)}
                              className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px]"
                              alt={`${social.platform} logo`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="font-medium text-[#71737c] text-[11px] lg:text-[12px] xl:text-[13px] leading-[14px] lg:leading-[16px] xl:leading-[18px] line-clamp-2">
                        {creator.bio}
                      </p>
                    </div>

                    <div className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] w-full">
                      <div className="flex-1 flex flex-col items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] px-[6px] lg:px-[8px] xl:px-[10px] py-[8px] lg:py-[10px] xl:py-[12px] bg-white rounded-[8px]">
                        <Icon
                          name="FollowerIcon.svg"
                          className="w-[20px] h-[20px] lg:w-[24px] lg:h-[24px] xl:w-[28px] xl:h-[28px]"
                          alt="Followers icon"
                        />
                        <div className="font-medium text-[#06152b] text-[11px] lg:text-[13px] xl:text-[14px] leading-[14px] lg:leading-[16px] xl:leading-[18px] text-center">
                          {formatNumber(creator.followers)}
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] px-[6px] lg:px-[8px] xl:px-[10px] py-[8px] lg:py-[10px] xl:py-[12px] bg-white rounded-[8px]">
                        <Icon
                          name="AvgViewsIcon.svg"
                          className="w-[20px] h-[20px] lg:w-[24px] lg:h-[24px] xl:w-[28px] xl:h-[28px]"
                          alt="Views icon"
                        />
                        <div className="font-medium text-[#06152b] text-[11px] lg:text-[13px] xl:text-[14px] leading-[14px] lg:leading-[16px] xl:leading-[18px] text-center">
                          {formatNumber(creator.avg_views)}
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] px-[6px] lg:px-[8px] xl:px-[10px] py-[8px] lg:py-[10px] xl:py-[12px] bg-white rounded-[8px]">
                        <Icon
                          name="AvgEngagementIcon.svg"
                          className="w-[20px] h-[20px] lg:w-[24px] lg:h-[24px] xl:w-[28px] xl:h-[28px]"
                          alt="Engage icon"
                        />
                        <div className="font-medium text-[#0A1529] text-[11px] lg:text-[13px] xl:text-[14px] leading-[14px] lg:leading-[16px] xl:leading-[18px] text-center">
                          {creator.engagement.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    {/* Buzz Score Bar */}
                    <div className="w-full h-[18px] bg-[#DDDDDD] rounded-[6px] relative overflow-hidden">
                      {/* Gradient part of the bar */}
                      <div 
                        className="h-full rounded-[6px] bg-gradient-to-r from-[#FC4C4B] via-[#CD45BA] to-[#6E57FF]"
                        style={{ width: `${creator.buzz_score}%` }}
                      />
                      {/* Score text */}
                      <div 
                        className="absolute top-0 h-full flex items-center text-white font-bold text-[10px] lg:text-[11px] xl:text-[12px] font-['Inter',Helvetica] px-[2.5px]"
                        style={{
                          left: `calc(${creator.buzz_score}% - 2.5px)`,
                          transform: 'translateX(-100%)'
                        }}
                      >
                        {creator.buzz_score}%
                      </div>
                    </div>
                    <div className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] flex-wrap">
                      {creator.niches.map((niche, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="outline"
                          className={`px-[6px] lg:px-[8px] xl:px-[10px] py-[2px] lg:py-[3px] xl:py-[4px] rounded-[4px] lg:rounded-[6px] xl:rounded-[8px] ${
                            niche.type === 'primary' 
                              ? 'bg-sky-50 border-[#dbe2eb] text-neutral-new900' 
                              : 'bg-green-50 border-green-200 text-green-700'
                          }`}
                        >
                          <span className="font-medium text-[10px] lg:text-[11px] xl:text-[12px]">
                            {niche.name}
                          </span>
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-[3px] lg:gap-[4px] xl:gap-[5px]">
                      {creator.thumbnails.slice(0, 3).map((thumbnail, thumbIndex) => (
                        <div
                          key={thumbIndex}
                          className="flex-1"
                        >
                          <img
                            className="w-full aspect-[9/16] object-cover rounded-[8px]"
                            alt={`${creator.username} post ${thumbIndex + 1}`}
                            src={thumbnail}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // List View - Horizontal scrollable table with proper responsive design and sorting
          <div className="w-full overflow-x-auto lg:overflow-x-visible">
            <div className={currentMode === 'ai' ? "min-w-[1200px] lg:min-w-[1300px] xl:min-w-0" : "min-w-[1100px] lg:min-w-[1200px] xl:min-w-0"}>
              {/* Table Header */}
              <div className={`gap-3 sm:gap-4 lg:gap-5 px-4 py-3 bg-gray-50 rounded-t-lg border-b border-gray-200 text-[10px] sm:text-xs lg:text-[13px] xl:text-[14px] font-medium text-gray-600 ${
                currentMode === 'ai' 
                  ? "grid grid-cols-[50px_200px_100px_100px_100px_100px_140px_120px_90px_50px] lg:grid-cols-[60px_220px_110px_110px_110px_110px_140px_120px_100px_60px] xl:grid-cols-[60px_2fr_1fr_1fr_1fr_1fr_1.1fr_1fr_0.9fr_60px]"
                  : "grid grid-cols-[50px_200px_100px_100px_100px_140px_120px_90px_50px] lg:grid-cols-[60px_220px_110px_110px_110px_140px_120px_100px_60px] xl:grid-cols-[60px_2fr_1fr_1fr_1fr_1.1fr_1fr_0.9fr_60px]"
              }`}>
                <div></div>
                
                {/* Creators - No sorting */}
                <div className="flex items-center gap-1 sm:gap-2 justify-start">
                  <span className="truncate">Creators</span>
                </div>
                
                {/* Match Score - Sortable - Only show in AI mode */}
                {currentMode === 'ai' && (
                  <button 
                    onClick={() => handleSort('match_score')}
                    className="flex items-center gap-1 sm:gap-2 justify-center hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    <span className="truncate">Match Score</span>
                    <Icon 
                      name="SortIcon.svg" 
                      className={`w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 flex-shrink-0 transition-transform ${
                        sortState.field === 'match_score' && sortState.direction === 'asc' ? 'rotate-180' : ''
                      }`} 
                      alt="Sort" 
                    />
                  </button>
                )}
                
                {/* Followers - Sortable */}
                <button 
                  onClick={() => handleSort('followers')}
                  className="flex items-center gap-1 sm:gap-2 justify-center hover:text-gray-800 transition-colors cursor-pointer"
                >
                  <span className="truncate">Followers</span>
                  <Icon 
                    name="SortIcon.svg" 
                    className={`w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 flex-shrink-0 transition-transform ${
                      sortState.field === 'followers' && sortState.direction === 'asc' ? 'rotate-180' : ''
                    }`} 
                    alt="Sort" 
                  />
                </button>
                
                {/* Average Views - Sortable */}
                <button 
                  onClick={() => handleSort('avg_views')}
                  className="flex items-center gap-1 sm:gap-2 justify-center hover:text-gray-800 transition-colors cursor-pointer"
                >
                  <span className="truncate">
                    <span className="hidden md:inline lg:inline xl:hidden">Avg. Views</span>
                    <span className="md:hidden lg:hidden xl:inline">Average Views</span>
                  </span>
                  <Icon 
                    name="SortIcon.svg" 
                    className={`w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 flex-shrink-0 transition-transform ${
                      sortState.field === 'avg_views' && sortState.direction === 'asc' ? 'rotate-180' : ''
                    }`} 
                    alt="Sort" 
                  />
                </button>
                
                {/* Engagement - Sortable */}
                <button 
                  onClick={() => handleSort('engagement')}
                  className="flex items-center gap-1 sm:gap-2 justify-center hover:text-gray-800 transition-colors cursor-pointer"
                >
                  <span className="truncate">Engagement</span>
                  <Icon 
                    name="SortIcon.svg" 
                    className={`w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 flex-shrink-0 transition-transform ${
                      sortState.field === 'engagement' && sortState.direction === 'asc' ? 'rotate-180' : ''
                    }`} 
                    alt="Sort" 
                  />
                </button>
                
                {/* Category - No sorting */}
                <div>
                  <span className="truncate">Category</span>
                </div>
                
                {/* Location - No sorting */}
                <div className="flex items-center justify-center">
                  <span className="truncate">Location</span>
                </div>
                
                {/* Buzz Score - No sorting */}
                <div className="flex items-center justify-center">
                  <span className="truncate">Buzz Score</span>
                </div>
                
                <div></div>
              </div>

              {/* Table Rows */}
              <div className="bg-white rounded-b-lg border border-gray-200 border-t-0 overflow-hidden">
                {sortedCreators.map((creator, index) => (
                  <div
                    key={creator.id}
                    onClick={() => handleCreatorClick(creator)}
                    className={`gap-3 sm:gap-4 lg:gap-5 px-4 py-4 items-center hover:bg-gray-50 transition-colors cursor-pointer ${
                      index !== sortedCreators.length - 1 ? 'border-b border-gray-100' : ''
                    } ${
                      selectedCreator?.id === creator.id ? 'bg-[#f1f6fe]' : ''
                    } ${
                      currentMode === 'ai' 
                        ? "grid grid-cols-[50px_200px_100px_100px_100px_100px_140px_120px_90px_50px] lg:grid-cols-[60px_220px_110px_110px_110px_110px_140px_120px_100px_60px] xl:grid-cols-[60px_2fr_1fr_1fr_1fr_1fr_1.1fr_1fr_0.9fr_60px]"
                        : "grid grid-cols-[50px_200px_100px_100px_100px_140px_120px_90px_50px] lg:grid-cols-[60px_220px_110px_110px_110px_140px_120px_100px_60px] xl:grid-cols-[60px_2fr_1fr_1fr_1fr_1.1fr_1fr_0.9fr_60px]"
                    }`}
                  >
                    {/* Checkbox - Leftmost position */}
                    <div className="flex justify-center">
                      <Checkbox
                        checked={selectedCards.has(creator.id)}
                        onCheckedChange={(e) => {
                          e?.stopPropagation?.();
                          handleCardSelection(creator.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-500 rounded data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                    </div>

                    {/* Creator Info - Always show name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-[#384455] rounded-full overflow-hidden flex-shrink-0">
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
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                          <span className="font-semibold text-[#06152b] text-xs lg:text-[13px] xl:text-[14px] min-w-0 max-w-[140px] xl:max-w-none truncate">
                            {creator.username}
                          </span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {creator.social_media.map((social, iconIndex) => (
                              <Icon
                                key={iconIndex}
                                name={getSocialMediaIcon(social.platform)}
                                className="w-3 h-3 sm:w-4 sm:h-4"
                                alt={`${social.platform} logo`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Match Score - Only show in AI mode */}
                    {currentMode === 'ai' && (
                      <div className="flex justify-center">
                        <div className={`px-2 md:px-3 py-1 rounded-md text-xs lg:text-[13px] xl:text-[14px] font-bold ${getMatchScoreColor(creator.match_score || 0)}`}>
                          {creator.match_score || 0}%
                        </div>
                      </div>
                    )}

                    {/* Followers */}
                    <div className="text-center text-xs lg:text-[13px] xl:text-[13px] font-medium text-[#06152b]">
                      <div>{formatNumber(creator.followers)}</div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Icon 
                          name={creator.followers_change_type === 'positive' ? 'PositiveChangeIcon.svg' : 'NegativeChangeIcon.svg'}
                          className="w-2 h-2 sm:w-3 sm:h-3 lg:w-3 lg:h-3 flex-shrink-0" 
                          alt={creator.followers_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
                        />
                        <span className={`text-[10px] lg:text-[11px] xl:text-[11px] font-medium ${
                          creator.followers_change_type === 'positive' ? 'text-[#1ad598]' : 'text-[#ea3a3d]'
                        }`}>
                          {creator.followers_change_type === 'positive' ? '+' : ''}{creator.followers_change?.toFixed(2) || '0.00'}%
                        </span>
                      </div>
                    </div>

                    {/* Average Views */}
                    <div className="text-center text-xs lg:text-[13px] xl:text-[13px] font-medium text-[#06152b]">
                      <div>{formatNumber(creator.avg_views)}</div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Icon 
                          name={creator.avg_views_change_type === 'positive' ? 'PositiveChangeIcon.svg' : 'NegativeChangeIcon.svg'}
                          className="w-2 h-2 sm:w-3 sm:h-3 lg:w-3 lg:h-3 flex-shrink-0" 
                          alt={creator.avg_views_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
                        />
                        <span className={`text-[10px] lg:text-[11px] xl:text-[11px] font-medium ${
                          creator.avg_views_change_type === 'positive' ? 'text-[#1ad598]' : 'text-[#ea3a3d]'
                        }`}>
                          {creator.avg_views_change_type === 'positive' ? '+' : ''}{creator.avg_views_change?.toFixed(2) || '0.00'}%
                        </span>
                      </div>
                    </div>

                    {/* Engagement */}
                    <div className="text-center">
                      <div className="text-[#06152b] font-medium text-xs lg:text-[13px] xl:text-[13px]">
                        {creator.engagement.toFixed(2)}%
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Icon 
                          name={creator.engagement_change_type === 'positive' ? 'PositiveChangeIcon.svg' : 'NegativeChangeIcon.svg'}
                          className="w-2 h-2 sm:w-3 sm:h-3 lg:w-3 lg:h-3 flex-shrink-0" 
                          alt={creator.engagement_change_type === 'positive' ? 'Positive change' : 'Negative change'} 
                        />
                        <span className={`text-[10px] lg:text-[11px] xl:text-[11px] font-medium ${
                          creator.engagement_change_type === 'positive' ? 'text-[#1ad598]' : 'text-[#ea3a3d]'
                        }`}>
                          {creator.engagement_change_type === 'positive' ? '+' : ''}{creator.engagement_change?.toFixed(2) || '0.00'}%
                        </span>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-1 min-w-0">
                      {creator.niches.slice(0, 2).map((niche, index) => (
                        <div key={index} className="flex items-center">
                          <Badge
                            variant="outline"
                            className={`px-[6px] lg:px-[8px] xl:px-[10px] py-[2px] lg:py-[3px] xl:py-[4px] rounded-[4px] lg:rounded-[6px] xl:rounded-[8px] ${
                              niche.type === 'primary' 
                                ? 'bg-sky-50 border-[#dbe2eb] text-neutral-new900' 
                                : 'bg-green-50 border-green-200 text-green-700'
                            }`}
                          >
                            <span className="font-medium text-[10px] lg:text-[11px] xl:text-[12px]">
                              {niche.name}
                            </span>
                          </Badge>
                          {index === 1 && creator.niches.length > 2 && (
                            <span className="text-gray-500 ml-1 text-xs lg:text-[13px] xl:text-[13px]">
                              +{creator.niches.length - 2}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Location */}
                    <div className="text-xs lg:text-[13px] xl:text-[13px] text-[#06152b] text-center">
                      {creator.location ? (
                        <div className="flex flex-col">
                          <div className="truncate">
                            {creator.location.split(', ')[0]}
                          </div>
                          {creator.location.includes(', ') && (
                            <div className="truncate">
                              {creator.location.split(', ')[1]}
                            </div>
                          )}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </div>

                    {/* Buzz Score - Donut Chart */}
                    <div className="flex justify-center">
                      <div className="flex items-center justify-center w-full max-w-[70px] lg:max-w-[80px] xl:max-w-none">
                        <DonutChart 
                          score={creator.buzz_score} 
                          size={38}
                          strokeWidth={4}
                        />
                      </div>
                    </div>

                    {/* Empty space for alignment */}
                    <div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 mt-[20px] lg:mt-[25px] xl:mt-[30px] pt-[15px] lg:pt-[20px] xl:pt-[25px] border-t border-[#f1f4f9] w-full">
          <div className="flex flex-col items-center gap-[8px] sm:gap-[10px] lg:gap-[12px] xl:gap-[15px] w-full">
            {/* Pagination Buttons */}
            <div className="flex items-center justify-center gap-[4px] xs:gap-[6px] sm:gap-[8px] lg:gap-[10px] xl:gap-[12px] w-full overflow-x-auto">
              <div className="flex items-center gap-[4px] xs:gap-[6px] sm:gap-[8px] lg:gap-[10px] xl:gap-[12px] flex-shrink-0 min-w-fit px-2 sm:px-0">
              <Button
                variant="outline"
                onClick={previousPage}
                disabled={currentPage === 1}
                className="h-[28px] xs:h-[30px] lg:h-[34px] xl:h-[38px] px-[6px] xs:px-[8px] sm:px-[10px] lg:px-[14px] xl:px-[18px] bg-white border-[#dbe2eb] rounded-[6px] sm:rounded-[8px] font-medium text-[10px] xs:text-[11px] sm:text-[12px] lg:text-[13px] xl:text-[14px] text-neutral-new900 hover:bg-gray-50 hover:text-neutral-new900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-[3px] xs:gap-[4px] sm:gap-[6px] lg:gap-[8px] xl:gap-[10px] flex-shrink-0"
              >
                <Icon name="ArrowLeftIcon.svg" className="w-[10px] h-[10px] xs:w-[12px] xs:h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px]" alt="Previous" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-[2px] xs:gap-[3px] sm:gap-[4px] lg:gap-[6px] xl:gap-[8px] flex-shrink-0">
                {(() => {
                  const pages = [];
                  
                  // Always show page 1
                  pages.push(
                    <Button
                      key={1}
                      variant="outline"
                      onClick={() => handlePageChange(1)}
                      className={`h-[28px] xs:h-[30px] lg:h-[34px] xl:h-[38px] w-[28px] xs:w-[30px] lg:w-[34px] xl:w-[38px] p-0 rounded-[6px] sm:rounded-[8px] font-medium text-[10px] xs:text-[11px] sm:text-[12px] lg:text-[13px] xl:text-[14px] transition-colors flex-shrink-0 ${
                        currentPage === 1
                          ? 'bg-[linear-gradient(90deg,#557EDD_0%,#6C40E4_100%)] border-transparent text-white hover:bg-[linear-gradient(90deg,#4A6BC8_0%,#5A36C7_100%)] hover:text-white'
                          : 'bg-white border-[#dbe2eb] text-neutral-new900 hover:bg-gray-50 hover:text-neutral-new900'
                      }`}
                    >
                      1
                    </Button>
                  );
                  
                  // Responsive page count based on screen size
                  const maxVisiblePages = window.innerWidth < 480 ? 5 : window.innerWidth < 768 ? 6 : 7;
                  
                  if (totalPages <= maxVisiblePages) {
                    // Show all pages if within limit
                    for (let i = 2; i <= totalPages; i++) {
                      pages.push(
                        <Button
                          key={i}
                          variant="outline"
                          onClick={() => handlePageChange(i)}
                          className={`h-[28px] xs:h-[30px] lg:h-[34px] xl:h-[38px] w-[28px] xs:w-[30px] lg:w-[34px] xl:w-[38px] p-0 rounded-[6px] sm:rounded-[8px] font-medium text-[10px] xs:text-[11px] sm:text-[12px] lg:text-[13px] xl:text-[14px] transition-colors flex-shrink-0 ${
                            currentPage === i
                              ? 'bg-[linear-gradient(90deg,#557EDD_0%,#6C40E4_100%)] border-transparent text-white hover:bg-[linear-gradient(90deg,#4A6BC8_0%,#5A36C7_100%)] hover:text-white'
                              : 'bg-white border-[#dbe2eb] text-neutral-new900 hover:bg-gray-50 hover:text-neutral-new900'
                            }`}
                        >
                          {i}
                        </Button>
                      );
                    }
                  } else {
                    // Complex pagination with ellipsis
                    const showEarly = currentPage <= 3;
                    const showLate = currentPage >= totalPages - 2;
                    
                    if (showEarly) {
                      // Show pages 2, 3, 4, ..., last
                      const endPage = Math.min(4, totalPages - 1);
                      for (let i = 2; i <= endPage; i++) {
                        pages.push(
                          <Button
                            key={i}
                            variant="outline"
                            onClick={() => handlePageChange(i)}
                            className={`h-[28px] xs:h-[30px] lg:h-[34px] xl:h-[38px] w-[28px] xs:w-[30px] lg:w-[34px] xl:w-[38px] p-0 rounded-[6px] sm:rounded-[8px] font-medium text-[10px] xs:text-[11px] sm:text-[12px] lg:text-[13px] xl:text-[14px] transition-colors flex-shrink-0 ${
                              currentPage === i
                                ? 'bg-[linear-gradient(90deg,#557EDD_0%,#6C40E4_100%)] border-transparent text-white hover:bg-[linear-gradient(90deg,#4A6BC8_0%,#5A36C7_100%)] hover:text-white'
                                : 'bg-white border-[#dbe2eb] text-neutral-new900 hover:bg-gray-50 hover:text-neutral-new900'
                              }`}
                          >
                            {i}
                          </Button>
                        );
                      }
                      
                      if (totalPages > 5) {
                        pages.push(
                          <span key="ellipsis1" className="px-1 xs:px-2 text-[10px] xs:text-[11px] sm:text-[12px] lg:text-[13px] xl:text-[14px] text-gray-500 flex-shrink-0">
                            ...
                          </span>
                        );
                      }
                    } else if (showLate) {
                      // Show 1, ..., last-3, last-2, last-1, last
                      if (totalPages > 5) {
                        pages.push(
                          <span key="ellipsis2" className="px-1 xs:px-2 text-[10px] xs:text-[11px] sm:text-[12px] lg:text-[13px] xl:text-[14px] text-gray-500 flex-shrink-0">
                            ...
                          </span>
                        );
                      }
                      
                      const startPage = Math.max(2, totalPages - 3);
                      for (let i = startPage; i <= totalPages - 1; i++) {
                        if (i > 1) {
                          pages.push(
                            <Button
                              key={i}
                              variant="outline"
                              onClick={() => handlePageChange(i)}
                              className={`h-[28px] xs:h-[30px] lg:h-[34px] xl:h-[38px] w-[28px] xs:w-[30px] lg:w-[34px] xl:w-[38px] p-0 rounded-[6px] sm:rounded-[8px] font-medium text-[10px] xs:text-[11px] sm:text-[12px] lg:text-[13px] xl:text-[14px] transition-colors flex-shrink-0 ${
                                currentPage === i
                                  ? 'bg-[linear-gradient(90deg,#557EDD_0%,#6C40E4_100%)] border-transparent text-white hover:bg-[linear-gradient(90deg,#4A6BC8_0%,#5A36C7_100%)] hover:text-white'
                                  : 'bg-white border-[#dbe2eb] text-neutral-new900 hover:bg-gray-50 hover:text-neutral-new900'
                                }`}
                            >
                              {i}
                            </Button>
                          );
                        }
                      }
                    } else {
                      // Show 1, ..., current-1, current, current+1, ..., last
                      pages.push(
                        <span key="ellipsis3" className="px-1 xs:px-2 text-[10px] xs:text-[11px] sm:text-[12px] lg:text-[13px] xl:text-[14px] text-gray-500 flex-shrink-0">
                          ...
                        </span>
                      );
                      
                      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                        pages.push(
                          <Button
                            key={i}
                            variant="outline"
                            onClick={() => handlePageChange(i)}
                            className={`h-[28px] xs:h-[30px] lg:h-[34px] xl:h-[38px] w-[28px] xs:w-[30px] lg:w-[34px] xl:w-[38px] p-0 rounded-[6px] sm:rounded-[8px] font-medium text-[10px] xs:text-[11px] sm:text-[12px] lg:text-[13px] xl:text-[14px] transition-colors flex-shrink-0 ${
                              currentPage === i
                                ? 'bg-[linear-gradient(90deg,#557EDD_0%,#6C40E4_100%)] border-transparent text-white hover:bg-[linear-gradient(90deg,#4A6BC8_0%,#5A36C7_100%)] hover:text-white'
                                : 'bg-white border-[#dbe2eb] text-neutral-new900 hover:bg-gray-50 hover:text-neutral-new900'
                              }`}
                          >
                            {i}
                          </Button>
                        );
                      }
                      
                      pages.push(
                        <span key="ellipsis4" className="px-1 xs:px-2 text-[10px] xs:text-[11px] sm:text-[12px] lg:text-[13px] xl:text-[14px] text-gray-500 flex-shrink-0">
                          ...
                        </span>
                      );
                    }
                    
                    // Always show last page (if not page 1)
                    if (totalPages > 1) {
                      pages.push(
                        <Button
                          key={totalPages}
                          variant="outline"
                          onClick={() => handlePageChange(totalPages)}
                          className={`h-[28px] xs:h-[30px] lg:h-[34px] xl:h-[38px] w-[28px] xs:w-[30px] lg:w-[34px] xl:w-[38px] p-0 rounded-[6px] sm:rounded-[8px] font-medium text-[10px] xs:text-[11px] sm:text-[12px] lg:text-[13px] xl:text-[14px] transition-colors flex-shrink-0 ${
                            currentPage === totalPages
                              ? 'bg-[linear-gradient(90deg,#557EDD_0%,#6C40E4_100%)] border-transparent text-white hover:bg-[linear-gradient(90deg,#4A6BC8_0%,#5A36C7_100%)] hover:text-white'
                              : 'bg-white border-[#dbe2eb] text-neutral-new900 hover:bg-gray-50 hover:text-neutral-new900'
                            }`}
                        >
                          {totalPages}
                        </Button>
                      );
                    }
                  }
                  
                  return pages;
                })()}
              </div>
              
              <Button
                variant="outline"
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="h-[28px] xs:h-[30px] lg:h-[34px] xl:h-[38px] px-[6px] xs:px-[8px] sm:px-[10px] lg:px-[14px] xl:px-[18px] bg-white border-[#dbe2eb] rounded-[6px] sm:rounded-[8px] font-medium text-[10px] xs:text-[11px] sm:text-[12px] lg:text-[13px] xl:text-[14px] text-neutral-new900 hover:bg-gray-50 hover:text-neutral-new900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-[3px] xs:gap-[4px] sm:gap-[6px] lg:gap-[8px] xl:gap-[10px] flex-shrink-0"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <Icon name="ArrowRightIcon.svg" className="w-[10px] h-[10px] xs:w-[12px] xs:h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px]" alt="Next" />
              </Button>
              </div>
            </div>
            
            {/* Page Info - Now below buttons and centered */}
            <div className="text-[10px] xs:text-[11px] sm:text-[12px] lg:text-[13px] xl:text-[14px] font-medium text-[#71737c] font-['Inter',Helvetica] text-center px-2">
              Showing {((currentPage - 1) * 24) + 1} to {Math.min(currentPage * 24, totalCreators)} of {totalCreators} creators
            </div>
          </div>
        </div>
      )}

      {/* Expanded Profile Overlay */}
      {selectedCreator && (
        <ExpandedProfileOverlay
          creator={selectedCreator}
          isOpen={isOverlayOpen}
          onClose={handleOverlayClose}
        />
      )}
    </section>
  );
};