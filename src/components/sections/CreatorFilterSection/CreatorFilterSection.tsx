import React, { useState, useRef, useEffect } from "react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Separator } from "../../ui/separator";
import { Icon } from "../../ui/icon";
import { AIToggle } from "../../ui/ai-toggle";
import { FilterDropdown } from "../../ui/filter-dropdown";
import { LocationFilterDropdown } from "../../ui/location-filter-dropdown";
import { PlatformFilterDropdown } from "../../ui/platform-filter-dropdown";
import { BuzzScoreFilterDropdown } from "../../ui/buzz-score-filter-dropdown";
import { useCreatorData } from "../../../hooks/useCreatorData";
import { DatabaseFilters, CreatorListMode } from "../../../types/database";

// Filter configurations
const filterConfigs = {
  engagement: {
    min: 0,
    max: 500,
    step: 1,
    formatValue: (value: number) => `${value}%`,
    parseValue: (value: string) => parseFloat(value.replace('%', '')) || 0,
    title: 'Filter by Engagement',
    unit: 'Engagement',
  },
  followers: {
    min: 30000,
    max: 300000,
    step: 1000,
    formatValue: (value: number) => {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
      return value.toString();
    },
    parseValue: (value: string) => {
      const numStr = value.toLowerCase().replace(/[^0-9.]/g, '');
      const num = parseFloat(numStr);
      if (value.includes('m')) return num * 1000000;
      if (value.includes('k')) return num * 1000;
      return num || 0;
    },
    title: 'Filter by Followers',
    unit: 'Followers',
  },
  avgViews: {
    min: 5000,
    max: 5000000,
    step: 1000,
    formatValue: (value: number) => {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
      return value.toString();
    },
    parseValue: (value: string) => {
      const numStr = value.toLowerCase().replace(/[^0-9.]/g, '');
      const num = parseFloat(numStr);
      if (value.includes('m')) return num * 1000000;
      if (value.includes('k')) return num * 1000;
      return num || 0;
    },
    title: 'Filter by Avg. Views',
    unit: 'Views',
  },
};

export const CreatorFilterSection = (): JSX.Element => {
  const { niches, applyFilters, loading, currentMode, switchMode } = useCreatorData();

  // Filter dropdown options
  const filterOptions = [
    { name: "Followers", icon: "FollowersIcon.svg", key: "followers" },
    { name: "Avg. Views", icon: "EyeIcon.svg", key: "avgViews" },
    { name: "Engagement", icon: "EngagementIcon.svg", key: "engagement" },
    { name: "Location", icon: "LocationIcon.svg", key: "location" },
    { name: "Platform", icon: "PlatformIcon.svg", key: "platform" },
    { name: "Buzz Score", icon: "BuzzScoreIcon.svg", key: "buzzScore" },
  ];

  // State for dropdown and visible categories
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  
  // Filter dropdown states
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState({
    engagement: [0, 500] as [number, number],
    followers: [30000, 300000] as [number, number],
    avgViews: [5000, 5000000] as [number, number],
  });
  
  // Location filter state
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  
  // Match Score filter state
  const [selectedBuzzScores, setSelectedBuzzScores] = useState<Set<string>>(new Set());
  
  // Platform filter state
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  
  // Track which filters have been applied (confirmed)
  const [appliedFilters, setAppliedFilters] = useState<Set<string>>(new Set());
  
  // AI Toggle state
  const [toggleMode, setToggleMode] = useState<CreatorListMode>('ai');
  
  // Refs for measuring container width and filter buttons
  const containerRef = useRef<HTMLDivElement>(null);
  const viewAllButtonRef = useRef<HTMLButtonElement>(null);
  const clearAllButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterRowRef = useRef<HTMLDivElement>(null);
  const filterButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Get dynamic niche names from database
  const allCategories = niches.map(niche => niche.name);

  // Helper function to get niche styling (all are primary niches now)
  const getNicheStyles = (nicheName: string, isSelected: boolean) => {
    // All niches are primary niches (sky blue theme)
    return isSelected
      ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'
      : 'bg-sky-50 border-[#dbe2eb] text-neutral-new900 hover:bg-sky-100';
  };
  // Get ordered categories with selected ones first
  const getOrderedCategories = () => {
    const selected = allCategories.filter(cat => selectedCategories.has(cat));
    const unselected = allCategories.filter(cat => !selectedCategories.has(cat));
    return [...selected, ...unselected];
  };

  // Check if filter has non-default values
  const isFilterModified = (filterKey: string) => {
    if (filterKey === 'location') {
      return selectedLocations.size > 0;
    }
    
    if (filterKey === 'buzzScore') {
      return selectedBuzzScores.size > 0;
    }
    
    if (filterKey === 'platform') {
      return selectedPlatforms.size > 0;
    }
    
    const config = filterConfigs[filterKey as keyof typeof filterConfigs];
    const currentValue = filterValues[filterKey as keyof typeof filterValues];
    if (!config || !currentValue) return false;
    
    return currentValue[0] !== config.min || currentValue[1] !== config.max;
  };

  // Calculate visible categories based on container width
  useEffect(() => {
    const calculateVisibleCategories = () => {
      if (!containerRef.current || !viewAllButtonRef.current || !clearAllButtonRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const viewAllButtonWidth = viewAllButtonRef.current.offsetWidth;
      const clearAllButtonWidth = clearAllButtonRef.current.offsetWidth;
      const isXLScreen = window.innerWidth >= 1280;
      const isLargeScreen = window.innerWidth >= 1024;
      const gap = isXLScreen ? 10 : isLargeScreen ? 8 : 6;
      
      const dividerWidth = 1;
      const buttonsWidth = viewAllButtonWidth + clearAllButtonWidth + dividerWidth;
      const buttonGaps = gap * 4;
      const safetyMargin = isXLScreen ? 25 : 15;
      const reservedWidth = buttonsWidth + buttonGaps + safetyMargin;
      
      const availableWidth = Math.max(0, containerWidth - reservedWidth);
      
      const visible: string[] = [];
      const orderedCategories = getOrderedCategories();

      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.visibility = 'hidden';
      tempContainer.style.whiteSpace = 'nowrap';
      tempContainer.style.pointerEvents = 'none';
      tempContainer.style.top = '-9999px';
      document.body.appendChild(tempContainer);

      let totalTagsWidth = 0;

      for (let i = 0; i < orderedCategories.length; i++) {
        const category = orderedCategories[i];
        
        const tempBadge = document.createElement('button');
        tempBadge.className = `h-[32px] lg:h-[40px] xl:h-[44px] py-[6px] lg:py-[8px] xl:py-[10px] px-[8px] lg:px-[12px] xl:px-[16px] bg-sky-50 border border-[#dbe2eb] rounded-[8px] font-medium text-[12px] lg:text-[14px] xl:text-[15px] text-neutral-new900 ${
          selectedCategories.has(category) ? 'bg-blue-100 border-blue-300 text-blue-700' : ''
        }`;
        tempBadge.textContent = category;
        tempContainer.appendChild(tempBadge);

        const badgeWidth = tempBadge.offsetWidth;
        const gapWidth = i > 0 ? gap : 0;
        const totalWidthWithThisTag = totalTagsWidth + gapWidth + badgeWidth;
        
        if (totalWidthWithThisTag <= availableWidth) {
          visible.push(category);
          totalTagsWidth = totalWidthWithThisTag;
        } else {
          break;
        }

        tempContainer.removeChild(tempBadge);
      }

      document.body.removeChild(tempContainer);
      setVisibleCategories(visible);
    };

    const timeoutId = setTimeout(calculateVisibleCategories, 50);
    
    const handleResize = () => {
      clearTimeout((window as any).categoryResizeTimeout);
      (window as any).categoryResizeTimeout = setTimeout(calculateVisibleCategories, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout((window as any).categoryResizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedCategories, allCategories]);

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }
    setSelectedCategories(newSelected);
  };

  // Handle clear all
  const handleClearAll = () => {
    setSelectedCategories(new Set());
  };

  // Handle dropdown toggle
  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle filter dropdown toggle
  const toggleFilterDropdown = (filterKey: string) => {
    setOpenFilter(openFilter === filterKey ? null : filterKey);
  };

  // Handle filter value changes
  const handleFilterValueChange = (filterKey: string, value: [number, number]) => {
    setFilterValues(prev => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  // Handle location toggle
  const handleLocationToggle = (location: string) => {
    const newSelectedLocations = new Set(selectedLocations);
    if (newSelectedLocations.has(location)) {
      newSelectedLocations.delete(location);
    } else {
      newSelectedLocations.add(location);
    }
    setSelectedLocations(newSelectedLocations);
  };

  // Handle location reset
  const handleLocationReset = () => {
    setSelectedLocations(new Set());
  };

  // Handle location confirm
  const handleLocationConfirm = () => {
    const newAppliedFilters = new Set(appliedFilters);
    if (selectedLocations.size > 0) {
      newAppliedFilters.add('location');
    } else {
      newAppliedFilters.delete('location');
    }
    setAppliedFilters(newAppliedFilters);
    setOpenFilter(null);
  };

  // Handle match score toggle
  const handleBuzzScoreToggle = (score: string) => {
    const newSelectedScores = new Set(selectedBuzzScores);
    if (newSelectedScores.has(score)) {
      newSelectedScores.delete(score);
    } else {
      newSelectedScores.add(score);
    }
    setSelectedBuzzScores(newSelectedScores);
  };

  // Handle match score reset
  const handleBuzzScoreReset = () => {
    setSelectedBuzzScores(new Set());
  };

  // Handle match score confirm
  const handleBuzzScoreConfirm = () => {
    const newAppliedFilters = new Set(appliedFilters);
    if (selectedBuzzScores.size > 0) {
      newAppliedFilters.add('buzzScore');
    } else {
      newAppliedFilters.delete('buzzScore');
    }
    setAppliedFilters(newAppliedFilters);
    setOpenFilter(null);
  };

  // Handle platform toggle
  const handlePlatformToggle = (platform: string) => {
    const newSelectedPlatforms = new Set(selectedPlatforms);
    if (newSelectedPlatforms.has(platform)) {
      newSelectedPlatforms.delete(platform);
    } else {
      newSelectedPlatforms.add(platform);
    }
    setSelectedPlatforms(newSelectedPlatforms);
  };

  // Handle platform reset
  const handlePlatformReset = () => {
    setSelectedPlatforms(new Set());
  };

  // Handle platform confirm
  const handlePlatformConfirm = () => {
    const newAppliedFilters = new Set(appliedFilters);
    if (selectedPlatforms.size > 0) {
      newAppliedFilters.add('platform');
    } else {
      newAppliedFilters.delete('platform');
    }
    setAppliedFilters(newAppliedFilters);
    setOpenFilter(null);
  };

  // Handle filter apply (confirm)
  const handleFilterApply = (filterKey: string) => {
    const newAppliedFilters = new Set(appliedFilters);
    if (isFilterModified(filterKey)) {
      newAppliedFilters.add(filterKey);
    } else {
      newAppliedFilters.delete(filterKey);
    }
    setAppliedFilters(newAppliedFilters);
    setOpenFilter(null);
  };

  // Handle filter reset
  const handleFilterReset = (filterKey: string) => {
    const config = filterConfigs[filterKey as keyof typeof filterConfigs];
    if (config) {
      setFilterValues(prev => ({
        ...prev,
        [filterKey]: [config.min, config.max],
      }));
      
      const newAppliedFilters = new Set(appliedFilters);
      newAppliedFilters.delete(filterKey);
      setAppliedFilters(newAppliedFilters);
    }
  };

  // Handle Apply Filters button click - Convert to database filters and apply
  const handleApplyFilters = async () => {
    const databaseFilters: DatabaseFilters = {};

    // Add selected niches
    if (selectedCategories.size > 0) {
      databaseFilters.niches = Array.from(selectedCategories);
    }

    // Add selected locations
    if (selectedLocations.size > 0) {
      databaseFilters.locations = Array.from(selectedLocations);
    }

    // Add selected match scores
    if (selectedBuzzScores.size > 0) {
      databaseFilters.buzz_scores = Array.from(selectedBuzzScores);
    }

    // Add selected platforms
    if (selectedPlatforms.size > 0) {
      databaseFilters.platforms = Array.from(selectedPlatforms);
    }

    // Add range filters
    if (isFilterModified('engagement')) {
      databaseFilters.engagement_min = filterValues.engagement[0];
      databaseFilters.engagement_max = filterValues.engagement[1];
    }

    if (isFilterModified('followers')) {
      databaseFilters.followers_min = filterValues.followers[0];
      databaseFilters.followers_max = filterValues.followers[1];
    }

    if (isFilterModified('avgViews')) {
      databaseFilters.avg_views_min = filterValues.avgViews[0];
      databaseFilters.avg_views_max = filterValues.avgViews[1];
    }

    console.log('Applying filters to database:', databaseFilters);
    await applyFilters(databaseFilters, toggleMode);
  };

  // Handle toggle mode change
  const handleToggleModeChange = (mode: CreatorListMode) => {
    setToggleMode(mode);
    switchMode(mode);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <Card className="p-[12px] lg:p-[15px] xl:p-[18px] w-full bg-white rounded-[10px] flex-shrink-0 shadow-sm overflow-visible border-0">
      <div className="flex flex-col gap-[10px] lg:gap-[12px] xl:gap-[15px] w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-[10px] lg:gap-[12px] xl:gap-[15px]">
            <h2 className="font-semibold text-[16px] lg:text-[18px] xl:text-[20px] text-neutral-100 leading-[20px] lg:leading-[24px] xl:leading-[28px] font-['Inter',Helvetica]">
              Find Creators
            </h2>
            
            <Separator 
              orientation="vertical" 
              className="h-[20px] lg:h-[24px] xl:h-[28px] bg-[#e1e5e9]" 
            />
            
            <AIToggle
              value={toggleMode}
              onChange={handleToggleModeChange}
              className="flex-shrink-0"
            />
          </div>
        </div>

        {/* Dynamic Category badges row - Only show when All Creators is selected */}
        {toggleMode === 'all' && (
          <div className="relative w-full overflow-visible">
            <div 
              ref={containerRef}
              className="flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px] w-full min-w-0"
            >
              <div className="flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px] flex-1 min-w-0 overflow-hidden">
                {visibleCategories.map((category, index) => (
                  <Button
                    key={`visible-category-${index}`}
                    variant="outline"
                    onClick={() => handleCategorySelect(category)}
                    className={`h-[28px] lg:h-[32px] xl:h-[36px] py-[4px] lg:py-[6px] xl:py-[8px] px-[6px] lg:px-[10px] xl:px-[12px] rounded-[10px] font-medium text-[11px] lg:text-[12px] xl:text-[13px] transition-colors cursor-pointer flex-shrink-0 border whitespace-nowrap ${getNicheStyles(category, selectedCategories.has(category))}`}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <div className="flex items-center flex-shrink-0">
                <Separator 
                  orientation="vertical" 
                  className="h-[28px] lg:h-[32px] xl:h-[36px] mr-[6px] lg:mr-[8px] xl:mr-[10px]" 
                />

                <Button
                  ref={clearAllButtonRef}
                  variant="outline"
                  onClick={handleClearAll}
                  disabled={selectedCategories.size === 0}
                  className={`h-[28px] lg:h-[32px] xl:h-[36px] py-[4px] lg:py-[6px] xl:py-[8px] px-[6px] lg:px-[10px] xl:px-[12px] rounded-[8px] font-medium text-[11px] lg:text-[12px] xl:text-[13px] flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] transition-colors whitespace-nowrap mr-[6px] lg:mr-[8px] xl:mr-[10px] ${
                    selectedCategories.size === 0
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-basewhite border-[#dbe2eb] text-neutral-new900 hover:bg-gray-50'
                  }`}
                >
                  Clear All
                </Button>

                <div className="relative" ref={dropdownRef}>
                  <Button
                    ref={viewAllButtonRef}
                    variant="outline"
                    onClick={toggleDropdown}
                    type="button"
                    className="h-[28px] lg:h-[32px] xl:h-[36px] py-[4px] lg:py-[6px] xl:py-[8px] px-[6px] lg:px-[10px] xl:px-[12px] bg-basewhite border-[#dbe2eb] rounded-[8px] font-medium text-[11px] lg:text-[12px] xl:text-[13px] text-neutral-new900 flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    View All
                    <Icon
                      name="DropdownIcon.svg"
                      className={`w-[8px] h-[5px] lg:w-[10px] lg:h-[6px] xl:w-[12px] xl:h-[7px] transition-transform ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`}
                      alt="Dropdown icon"
                    />
                  </Button>

                  {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-[280px] lg:w-[320px] xl:w-[360px] bg-white border border-[#dbe2eb] rounded-[12px] shadow-lg z-[9999] max-h-[300px] lg:max-h-[350px] xl:max-h-[400px] overflow-hidden">
                      <div className="p-3 lg:p-4 xl:p-5">
                        <div className="text-[12px] lg:text-[13px] xl:text-[14px] font-medium text-gray-600 mb-2 px-2">
                          All Categories ({allCategories.length})
                        </div>
                        <div className="max-h-[240px] lg:max-h-[280px] xl:max-h-[320px] overflow-y-auto">
                          <div className="grid grid-cols-2 gap-2 lg:gap-3 xl:gap-4">
                            {getOrderedCategories().map((category, index) => (
                              <button
                                key={`dropdown-category-${index}`}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleCategorySelect(category);
                                }}
                                className={`text-left px-3 lg:px-4 xl:px-5 py-2 lg:py-3 xl:py-4 rounded-[10px] text-[12px] lg:text-[13px] xl:text-[14px] font-medium transition-colors ${
                                  selectedCategories.has(category)
                                    ? getNicheStyles(category, true).replace('border-blue-300', '').replace('border-[#dbe2eb]', '')
                                    : 'text-neutral-new900 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="truncate">{category}</span>
                                  {selectedCategories.has(category) && (
                                    <div className="w-2 h-2 lg:w-3 lg:h-3 xl:w-4 xl:h-4 rounded-full flex-shrink-0 bg-blue-600"></div>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-100 mt-3 lg:mt-4 xl:mt-5 pt-3 lg:pt-4 xl:pt-5 flex justify-between items-center">
                          <span className="text-[11px] lg:text-[12px] xl:text-[13px] text-gray-500">
                            {selectedCategories.size} selected
                          </span>
                          <div className="flex items-center gap-2 lg:gap-3 xl:gap-4">
                            {selectedCategories.size > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleClearAll();
                                }}
                                className="text-[11px] lg:text-[12px] xl:text-[13px] text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Clear All
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsDropdownOpen(false);
                              }}
                              className="text-[11px] lg:text-[12px] xl:text-[13px] text-gray-600 hover:text-gray-700 font-medium px-2 lg:px-3 xl:px-4 py-1 lg:py-2 xl:py-3 rounded bg-gray-100 hover:bg-gray-200"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter controls row */}
        <div 
          ref={filterRowRef}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-[8px] lg:gap-[8px] xl:gap-[10px] w-full"
        >
          <div className="flex items-center gap-[4px] sm:gap-[6px] lg:gap-[8px] xl:gap-[10px] flex-1 w-full min-w-0 overflow-hidden">
            {filterOptions.map((filter, index) => (
              <div key={`filter-${index}`} className="relative flex-1 min-w-0">
                <Button
                  ref={(el) => (filterButtonRefs.current[filter.key] = el)}
                  variant="outline"
                  onClick={() => toggleFilterDropdown(filter.key)}
                  className={`h-[28px] lg:h-[32px] xl:h-[36px] py-[4px] lg:py-[6px] xl:py-[8px] px-[3px] sm:px-[4px] lg:px-[6px] xl:px-[8px] rounded-[8px] font-medium text-[11px] lg:text-[12px] xl:text-[13px] flex items-center justify-center gap-[2px] sm:gap-[3px] lg:gap-[4px] xl:gap-[6px] transition-colors w-full min-w-0 ${
                    appliedFilters.has(filter.key)
                      ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'
                      : 'bg-basewhite border-[#dbe2eb] text-neutral-new900 hover:bg-gray-50'
                  }`}
                >
                  <Icon
                    name={filter.icon}
                    className="w-[10px] h-[10px] sm:w-[12px] sm:h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px] flex-shrink-0"
                    alt={`${filter.name} icon`}
                  />
                  <span className="hidden sm:block lg:hidden truncate min-w-0 text-[10px] sm:text-[11px]">
                    {filter.name === "Buzz Score" ? "Buzz" : 
                     filter.name === "Engagement" ? "Engage" :
                     filter.name === "Followers" ? "Follow" :
                     filter.name === "Avg. Views" ? "Views" :
                     filter.name === "Platform" ? "Platform" :
                     filter.name === "Location" ? "Location" : filter.name}
                  </span>
                  <span className="hidden lg:block truncate min-w-0">{filter.name}</span>
                  <Icon
                    name="DropdownIcon.svg"
                    className={`w-[5px] h-[3px] sm:w-[6px] sm:h-[4px] lg:w-[8px] lg:h-[5px] xl:w-[10px] xl:h-[6px] flex-shrink-0 transition-transform ${
                      openFilter === filter.key ? 'rotate-180' : ''
                    }`}
                    alt="Dropdown icon"
                  />
                </Button>

                {/* Location filter dropdown */}
                {filter.key === 'location' && (
                  <LocationFilterDropdown
                    isOpen={openFilter === 'location'}
                    onClose={() => setOpenFilter(null)}
                    selectedLocations={selectedLocations}
                    onLocationToggle={handleLocationToggle}
                    onReset={handleLocationReset}
                    onConfirm={handleLocationConfirm}
                    triggerRef={{ current: filterButtonRefs.current.location }}
                  />
                )}

                {/* Match Score filter dropdown */}
                {filter.key === 'buzzScore' && (
                  <BuzzScoreFilterDropdown
                    isOpen={openFilter === 'buzzScore'}
                    onClose={() => setOpenFilter(null)}
                    selectedScores={selectedBuzzScores}
                    onScoreToggle={handleBuzzScoreToggle}
                    onReset={handleBuzzScoreReset}
                    onConfirm={handleBuzzScoreConfirm}
                    triggerRef={{ current: filterButtonRefs.current.buzzScore }}
                  />
                )}

                {/* Platform filter dropdown */}
                {filter.key === 'platform' && (
                  <PlatformFilterDropdown
                    isOpen={openFilter === 'platform'}
                    onClose={() => setOpenFilter(null)}
                    selectedPlatforms={selectedPlatforms}
                    onPlatformToggle={handlePlatformToggle}
                    onReset={handlePlatformReset}
                    onConfirm={handlePlatformConfirm}
                    triggerRef={{ current: filterButtonRefs.current.platform }}
                  />
                )}

                {/* Range filter dropdowns */}
                {['engagement', 'followers', 'avgViews'].includes(filter.key) && (
                  <FilterDropdown
                    isOpen={openFilter === filter.key}
                    onClose={() => setOpenFilter(null)}
                    config={filterConfigs[filter.key as keyof typeof filterConfigs]}
                    value={filterValues[filter.key as keyof typeof filterValues]}
                    onValueChange={(value) => handleFilterValueChange(filter.key, value)}
                    onApply={() => handleFilterApply(filter.key)}
                    onReset={() => handleFilterReset(filter.key)}
                    triggerRef={{ current: filterButtonRefs.current[filter.key] }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-[6px] lg:gap-[8px] xl:gap-[10px] flex-shrink-0">
            <Separator 
              orientation="vertical" 
              className="hidden sm:block h-[28px] lg:h-[32px] xl:h-[36px]" 
            />

            <Button
              onClick={handleApplyFilters}
              disabled={loading}
              className="h-[28px] lg:h-[32px] xl:h-[36px] py-[4px] lg:py-[6px] xl:py-[8px] px-[10px] sm:px-[12px] lg:px-[18px] xl:px-[24px] bg-[linear-gradient(90deg,#557EDD_0%,#6C40E4_100%)] hover:bg-[linear-gradient(90deg,#4A6BC8_0%,#5A36C7_100%)] border-transparent rounded-[8px] font-medium text-[11px] lg:text-[12px] xl:text-[13px] text-white flex items-center gap-[3px] lg:gap-[4px] xl:gap-[6px] hover:text-gray-100 transition-all justify-center whitespace-nowrap flex-shrink-0 min-w-[80px] sm:min-w-[100px] lg:min-w-[120px] xl:min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
              variant="outline"
            >
              <Icon
                name="FilterIcon.svg"
                className="w-[10px] h-[10px] sm:w-[12px] sm:h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px] text-white flex-shrink-0"
                alt="Filter icon"
              />
              <span className="hidden lg:inline">{loading ? 'Applying...' : 'Apply Filters'}</span>
              <span className="hidden sm:inline lg:hidden">{loading ? 'Applying...' : 'Apply'}</span>
              <span className="sm:hidden">{loading ? '...' : 'Apply'}</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};