import React, { useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Icon } from "../../ui/icon";
import { CreatorCard } from "../../ui/creator-card";
import { CreatorListRow } from "../../ui/creator-list-row";
import { ViewModeToggle } from "../../ui/view-mode-toggle";
import { PaginationControls } from "../../ui/pagination-controls";
import { SortHeader } from "../../ui/sort-header";
import { ExpandedProfileOverlay } from "../../ui/expanded-profile-overlay";
import { useCreatorData } from "../../../hooks/useCreatorData";
import { Creator, SortField, SortDirection, ViewMode } from "../../../types/database";

const CREATORS_PER_PAGE = 24;

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

  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle creator selection
  const handleCreatorClick = (creator: Creator) => {
    setSelectedCreator(creator);
  };

  // Handle closing expanded profile
  const handleCloseProfile = () => {
    setSelectedCreator(null);
  };

  // Sort creators based on current sort settings
  const sortedCreators = React.useMemo(() => {
    if (!sortField) return creators;

    return [...creators].sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortField) {
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

      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }, [creators, sortField, sortDirection]);

  // Loading state
  if (loading) {
    return (
      <Card className="p-[12px] lg:p-[15px] xl:p-[18px] w-full bg-white rounded-[10px] flex-1 shadow-sm border-0">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-[#71737c] text-[14px] font-medium">Loading creators...</p>
          </div>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="p-[12px] lg:p-[15px] xl:p-[18px] w-full bg-white rounded-[10px] flex-1 shadow-sm border-0">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <Icon
              name="ErrorIcon.svg"
              className="w-12 h-12 text-red-500 mx-auto mb-4"
              alt="Error"
            />
            <p className="text-red-600 text-[16px] font-semibold mb-2">Error Loading Creators</p>
            <p className="text-[#71737c] text-[14px] font-medium">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  // Empty state
  if (sortedCreators.length === 0) {
    return (
      <Card className="p-[12px] lg:p-[15px] xl:p-[18px] w-full bg-white rounded-[10px] flex-1 shadow-sm border-0">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <Icon
              name="EmptyStateIcon.svg"
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              alt="No creators found"
            />
            <p className="text-[#71737c] text-[16px] font-semibold mb-2">No creators found</p>
            <p className="text-[#71737c] text-[14px] font-medium">Try adjusting your filters to see more results.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-[12px] lg:p-[15px] xl:p-[18px] w-full bg-white rounded-[10px] flex-1 shadow-sm border-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header with view toggle and results count */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[8px] lg:gap-[10px] xl:gap-[12px] mb-[12px] lg:mb-[15px] xl:mb-[18px]">
            <div className="flex items-center gap-[8px] lg:gap-[10px] xl:gap-[12px]">
              <h3 className="font-semibold text-[14px] lg:text-[16px] xl:text-[18px] text-neutral-100">
                {currentMode === 'ai' ? 'AI Recommended Creators' : 'All Creators'}
              </h3>
              <span className="text-[#71737c] text-[12px] lg:text-[14px] xl:text-[16px] font-medium">
                ({totalCreators} results)
              </span>
            </div>
            
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-hidden">
            {viewMode === 'cards' ? (
              /* Cards View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[8px] lg:gap-[10px] xl:gap-[12px] h-full overflow-y-auto">
                {sortedCreators.map((creator) => (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    currentMode={currentMode}
                    onCreatorClick={handleCreatorClick}
                  />
                ))}
              </div>
            ) : (
              /* List View */
              <div className="h-full overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white border-b border-[#f3f4f6] z-10">
                    <tr>
                      <SortHeader
                        field="followers"
                        currentSortField={sortField}
                        currentSortDirection={sortDirection}
                        onSort={handleSort}
                        className="text-left"
                      >
                        Creator
                      </SortHeader>
                      
                      {currentMode === 'ai' && (
                        <SortHeader
                          field="match_score"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                          className="text-center"
                        >
                          Match Score
                        </SortHeader>
                      )}
                      
                      <SortHeader
                        field="followers"
                        currentSortField={sortField}
                        currentSortDirection={sortDirection}
                        onSort={handleSort}
                        className="text-center"
                      >
                        Followers
                      </SortHeader>
                      
                      <SortHeader
                        field="avg_views"
                        currentSortField={sortField}
                        currentSortDirection={sortDirection}
                        onSort={handleSort}
                        className="text-center"
                      >
                        Avg. Views
                      </SortHeader>
                      
                      <SortHeader
                        field="engagement"
                        currentSortField={sortField}
                        currentSortDirection={sortDirection}
                        onSort={handleSort}
                        className="text-center"
                      >
                        Engagement
                      </SortHeader>
                      
                      <th className="py-[8px] lg:py-[10px] xl:py-[12px] px-[6px] lg:px-[8px] xl:px-[10px] text-center text-[#71737c] text-[11px] lg:text-[12px] xl:text-[13px] font-semibold">
                        Buzz Score
                      </th>
                      
                      <th className="py-[8px] lg:py-[10px] xl:py-[12px] px-[6px] lg:px-[8px] xl:px-[10px] text-center text-[#71737c] text-[11px] lg:text-[12px] xl:text-[13px] font-semibold">
                        Recent Posts
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCreators.map((creator) => (
                      <CreatorListRow
                        key={creator.id}
                        creator={creator}
                        currentMode={currentMode}
                        onCreatorClick={handleCreatorClick}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalCreators={totalCreators}
            creatorsPerPage={CREATORS_PER_PAGE}
            onPageChange={handlePageChange}
            onPreviousPage={previousPage}
            onNextPage={nextPage}
          />
        </div>
      </Card>

      {/* Expanded Profile Overlay */}
      {selectedCreator && (
        <ExpandedProfileOverlay
          creator={selectedCreator}
          isOpen={!!selectedCreator}
          onClose={handleCloseProfile}
        />
      )}
    </>
  );
};