import React, { useState, useRef, useEffect } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Separator } from "../../components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "../../components/ui/toggle-group";
import { Icon } from "../../components/ui/icon";
import { DonutChart } from "../../components/ui/donut-chart";
import { ExpandedProfileOverlay } from "../../components/ui/expanded-profile-overlay";
import { AIToggle } from "../../components/ui/ai-toggle";
import { FilterDropdown } from "../../components/ui/filter-dropdown";
import { LocationFilterDropdown } from "../../components/ui/location-filter-dropdown";
import { PlatformFilterDropdown } from "../../components/ui/platform-filter-dropdown";
import { BuzzScoreFilterDropdown } from "../../components/ui/buzz-score-filter-dropdown";
import { RangeSlider } from "../../components/ui/range-slider";
import { useCreatorData } from "../../hooks/useCreatorData";
import { formatNumber, formatEngagement, getSocialMediaIcon, getMatchScoreColor } from "../../utils/formatters";
import { DatabaseFilters, CreatorListMode, ViewMode, SortField, SortDirection, SortState, Creator } from "../../types/database";

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

export default function DiscoverPage(): JSX.Element {
  const { creators, niches, metrics, applyFilters, loading, error, currentMode, switchMode, countries } = useCreatorData();

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
  
  // Buzz Score filter state
  const [selectedBuzzScores, setSelectedBuzzScores] = useState<Set<string>>(new Set());
  
  // Platform filter state
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  
  // Track which filters have been applied (confirmed)
  const [appliedFilters, setAppliedFilters] = useState<Set<string>>(new Set());
  
  // AI Toggle state
  const [toggleMode, setToggleMode] = useState<CreatorListMode>('ai');

  // Creator list states
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
  
  // Refs for measuring container width and filter buttons
  const containerRef = useRef<HTMLDivElement>(null);
  const viewAllButtonRef = useRef<HTMLButtonElement>(null);
  const clearAllButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterRowRef = useRef<HTMLDivElement>(null);
  const filterButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Get dynamic niche names from database
  const allCategories = niches.map(niche => niche.name);

  // Static metric configurations
  const metricConfigs = [
    {
      title: "Total Creators",
      iconSrc: "CreatorIcon.svg",
      getValue: () => metrics?.total_creators?.toString() || "0",
    },
    {
      title: "Avg. Followers",
      iconSrc: "FollowerIcon.svg",
      getValue: () => formatNumber(metrics?.avg_followers || 0),
    },
    {
      title: "Avg. Views",
      iconSrc: "AvgViewsIcon.svg",
      getValue: () => formatNumber(metrics?.avg_views || 0),
    },
    {
      title: "Avg. Engagement",
      iconSrc: "AvgEngagementIcon.svg",
      getValue: () => `${metrics?.avg_engagement?.toFixed(1) || "0.0"}%`,
    },
  ];

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

  // Handle buzz score toggle
  const handleBuzzScoreToggle = (score: string) => {
    const newSelectedScores = new Set(selectedBuzzScores);
    if (newSelectedScores.has(score)) {
      newSelectedScores.delete(score);
    } else {
      newSelectedScores.add(score);
    }
    setSelectedBuzzScores(newSelectedScores);
  };

  // Handle buzz score reset
  const handleBuzzScoreReset = () => {
    setSelectedBuzzScores(new Set());
  };

  // Handle buzz score confirm
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

    // Add selected buzz scores
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

    // Removed debug logging for security
    await applyFilters(databaseFilters, toggleMode);
  };

  // Handle toggle mode change
  const handleToggleModeChange = (mode: CreatorListMode) => {
    setToggleMode(mode);
    switchMode(mode);
  };

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
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

  if (loading) {
    return (
      <div className="flex flex-col gap-[15px] lg:gap-[20px] xl:gap-[25px] w-full h-full overflow-hidden bg-[#F9FAFB] p-[15px] lg:p-[20px] xl:p-[25px]">
        <div className="w-full h-[100px] bg-gray-100 rounded-lg animate-pulse mb-4" />
        <div className="w-full h-[80px] bg-gray-100 rounded-lg animate-pulse mb-4" />
        <div className="flex-1 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-[15px] lg:p-[20px] xl:p-[25px] bg-white rounded-[12px] flex-1 overflow-hidden shadow-sm">
        <div className="text-red-500 text-lg font-medium">Error loading discover page</div>
        <div className="text-gray-600 text-sm">{error}</div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[15px] lg:gap-[20px] xl:gap-[25px] w-full h-full overflow-hidden bg-[#F9FAFB] p-[15px] lg:p-[20px] xl:p-[25px]">
      {/* Page Header with Metrics */}
      <section className="flex flex-col xl:flex-row xl:items-center xl:justify-between w-full flex-shrink-0 gap-4 xl:gap-6 min-h-[80px]">
        {/* Title and subtitle */}
        <div className="flex flex-col justify-center flex-shrink-0">
          <h1 className="font-bold font-['Inter',Helvetica] text-neutral-100 text-[20px] lg:text-[24px] xl:text-[28px] leading-[26px] lg:leading-[30px] xl:leading-[34px] mb-[-2px]">
            Discover Creators
          </h1>
          <p className="font-['Inter',Helvetica] font-medium text-neutral-new600 text-[14px] lg:text-[16px] xl:text-[18px] leading-[18px] lg:leading-[20px] xl:leading-[22px]">
            Welcome to your dashboard
          </p>
        </div>

        {/* Divider - Hidden on mobile and tablet, visible on xl+ */}
        <div className="hidden xl:block h-[60px] w-px bg-[#e1e5e9] mx-6 flex-shrink-0" />

        {/* Dynamic Metric cards - Full width responsive grid optimized for larger screens */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-[8px] lg:gap-[10px] xl:gap-[12px] 2xl:gap-[15px] w-full xl:w-auto xl:flex-1 xl:max-w-none">
          {metricConfigs.map((metric, index) => (
            <Card key={index} className="bg-white rounded-[12px] border-0 shadow-sm h-[70px] lg:h-[80px] xl:h-[90px] 2xl:h-[100px] w-full">
              <CardContent className="flex items-center gap-[10px] lg:gap-[15px] xl:gap-[18px] px-[10px] lg:px-[15px] xl:px-[18px] py-[10px] lg:py-[15px] xl:py-[18px] h-full">
                {/* Icon - Responsive sizing for larger screens */}
                <div className="flex items-center justify-center flex-shrink-0">
                  <Icon
                    name={metric.iconSrc}
                    className="w-[32px] h-[32px] lg:w-[40px] lg:h-[40px] xl:w-[48px] xl:h-[48px] 2xl:w-[52px] 2xl:h-[52px]"
                    alt={metric.title}
                  />
                </div>

                {/* Dynamic Metric information - Enhanced responsive sizing */}
                <div className="flex flex-col justify-center h-[40px] lg:h-[50px] xl:h-[60px] min-w-[60px] lg:min-w-[80px] xl:min-w-[100px] flex-1">
                  <div className="font-['Inter',Helvetica] font-semibold text-[#71737c] text-[12px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px] leading-[14px] lg:leading-[16px] xl:leading-[18px] mb-[2px]">
                    {metric.title}
                  </div>
                  <div className="font-['Inter',Helvetica] font-semibold text-[#080d1c] text-[16px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-[18px] lg:leading-[20px] xl:leading-[22px] mb-[2px]">
                    {metric.getValue()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      {/* Filter Controls */}
      <Card className="p-[15px] lg:p-[20px] xl:p-[25px] w-full bg-white rounded-[12px] flex-shrink-0 shadow-sm overflow-visible">
        <div className="flex flex-col gap-[12px] lg:gap-[15px] xl:gap-[18px] w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-[12px] lg:gap-[16px] xl:gap-[20px]">
              <h2 className="font-semibold text-[18px] lg:text-[22px] xl:text-[26px] text-neutral-100 leading-[24px] lg:leading-[33px] xl:leading-[38px] font-['Inter',Helvetica]">
                Find Creators
              </h2>
              
              <Separator 
                orientation="vertical" 
                className="h-[24px] lg:h-[28px] xl:h-[32px] bg-[#e1e5e9]" 
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
                      className={`h-[32px] lg:h-[40px] xl:h-[44px] py-[6px] lg:py-[8px] xl:py-[10px] px-[8px] lg:px-[12px] xl:px-[16px] rounded-[8px] font-medium text-[12px] lg:text-[14px] xl:text-[15px] transition-colors cursor-pointer flex-shrink-0 border whitespace-nowrap ${
                        selectedCategories.has(category)
                          ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'
                          : 'bg-sky-50 border-[#dbe2eb] text-neutral-new900 hover:bg-sky-100'
                      }`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                <div className="flex items-center flex-shrink-0">
                  <Separator 
                    orientation="vertical" 
                    className="h-[32px] lg:h-[40px] xl:h-[44px] mr-[6px] lg:mr-[8px] xl:mr-[10px]" 
                  />

                  <Button
                    ref={clearAllButtonRef}
                    variant="outline"
                    onClick={handleClearAll}
                    disabled={selectedCategories.size === 0}
                    className={`h-[32px] lg:h-[40px] xl:h-[44px] py-[6px] lg:py-[8px] xl:py-[10px] px-[8px] lg:px-[12px] xl:px-[16px] rounded-[8px] font-medium text-[12px] lg:text-[14px] xl:text-[15px] flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] transition-colors whitespace-nowrap mr-[6px] lg:mr-[8px] xl:mr-[10px] ${
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
                      className="h-[32px] lg:h-[40px] xl:h-[44px] py-[6px] lg:py-[8px] xl:py-[10px] px-[8px] lg:px-[12px] xl:px-[16px] bg-basewhite border-[#dbe2eb] rounded-[8px] font-medium text-[12px] lg:text-[14px] xl:text-[15px] text-neutral-new900 flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] hover:bg-gray-50 transition-colors whitespace-nowrap"
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
                                  className={`text-left px-3 lg:px-4 xl:px-5 py-2 lg:py-3 xl:py-4 rounded-[8px] text-[12px] lg:text-[13px] xl:text-[14px] font-medium transition-colors ${
                                    selectedCategories.has(category)
                                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                      : 'text-neutral-new900 hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="truncate">{category}</span>
                                    {selectedCategories.has(category) && (
                                      <div className="w-2 h-2 lg:w-3 lg:h-3 xl:w-4 xl:h-4 bg-blue-600 rounded-full flex-shrink-0"></div>
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
                    className={`h-[32px] lg:h-[40px] xl:h-[44px] py-[6px] lg:py-[8px] xl:py-[10px] px-[4px] sm:px-[6px] lg:px-[8px] xl:px-[12px] rounded-[8px] font-medium text-[12px] lg:text-[14px] xl:text-[15px] flex items-center justify-center gap-[2px] sm:gap-[4px] lg:gap-[6px] xl:gap-[8px] transition-colors w-full min-w-0 ${
                      appliedFilters.has(filter.key)
                        ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'
                        : 'bg-basewhite border-[#dbe2eb] text-neutral-new900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon
                      name={filter.icon}
                      className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px] lg:w-[16px] lg:h-[16px] xl:w-[18px] xl:h-[18px] flex-shrink-0"
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
                      className={`w-[6px] h-[4px] sm:w-[8px] sm:h-[5px] lg:w-[10px] lg:h-[6px] xl:w-[12px] xl:h-[7px] flex-shrink-0 transition-transform ${
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
                    countries={countries}
                  />
                  )}

                  {/* Buzz Score filter dropdown */}
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
                className="hidden sm:block h-[32px] lg:h-[40px] xl:h-[44px]" 
              />

              <Button
                onClick={handleApplyFilters}
                disabled={loading}
                className="h-[32px] lg:h-[40px] xl:h-[44px] py-[6px] lg:py-[8px] xl:py-[10px] px-[12px] sm:px-[16px] lg:px-[24px] xl:px-[32px] bg-[linear-gradient(90deg,#557EDD_0%,#6C40E4_100%)] hover:bg-[linear-gradient(90deg,#4A6BC8_0%,#5A36C7_100%)] border-transparent rounded-[8px] font-medium text-[12px] lg:text-[14px] xl:text-[15px] text-white flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] hover:text-gray-100 transition-all justify-center whitespace-nowrap flex-shrink-0 min-w-[100px] sm:min-w-[120px] lg:min-w-[160px] xl:min-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed"
                variant="outline"
              >
                <Icon
                  name="FilterIcon.svg"
                  className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px] lg:w-[16px] lg:h-[16px] xl:w-[18px] xl:h-[18px] text-white flex-shrink-0"
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
      
      {/* Creator List/Cards */}
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
                    alt="List view icon"
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
                variant="outline"
                onClick={handleSelectAll}
                className="h-[32px] lg:h-[40px] xl:h-[44px] inline-flex items-center justify-center gap-[4px] lg:gap-[6px] xl:gap-[8px] px-[8px] lg:px-[12px] xl:px-[16px] py-[6px] lg:py-[8px] xl:py-[10px] bg-basewhite rounded-[8px] border-[#dbe2eb] hover:bg-gray-50 transition-colors text-[12px] lg:text-[14px] xl:text-[15px] flex-1 sm:flex-none flex-shrink-0 min-w-0 max-w-full"
              >
                <span className="font-medium text-neutral-new900 truncate min-w-0">
                  Select All
                </span>
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAll}
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
          {creators.length === 0 ? (
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
                          onCheckedChange={(checked) => {
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
                          <div className="font-bold text-[#1ad598] text-[11px] lg:text-[13px] xl:text-[14px] leading-[14px] lg:leading-[16px] xl:leading-[18px] text-center">
                            <div className="font-medium text-[#0A1529] text-[11px] lg:text-[13px] xl:text-[14px] leading-[14px] lg:leading-[16px] xl:leading-[18px] text-center">
                              {creator.engagement.toFixed(2)}%
                            </div>
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
                            className="px-[6px] lg:px-[8px] xl:px-[10px] py-[3px] lg:py-[4px] xl:py-[5px] bg-sky-50 rounded-[6px] border-[#dbe2eb]"
                          >
                            <span className="font-medium text-neutral-new900 text-[11px] lg:text-[12px] xl:text-[13px]">
                              {niche}
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
                          onCheckedChange={(checked) => {
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
                              className="px-[6px] lg:px-[8px] xl:px-[10px] py-[3px] lg:py-[4px] xl:py-[5px] bg-sky-50 rounded-[6px] border-[#dbe2eb] text-xs lg:text-[13px] xl:text-[13px]"
                            >
                              <span className="font-medium text-neutral-new900 truncate">
                                {niche}
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

        {/* Expanded Profile Overlay */}
        {selectedCreator && (
          <ExpandedProfileOverlay
            creator={selectedCreator}
            isOpen={isOverlayOpen}
            onClose={handleOverlayClose}
          />
        )}
      </section>
    </div>
  );
}