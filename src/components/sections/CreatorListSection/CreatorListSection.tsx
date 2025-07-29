import React, { useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Icon } from "../../ui/icon";
import { ExpandedProfileOverlay } from "../../ui/expanded-profile-overlay";
import { CreatorCard } from "../../ui/creator-card";
import { CreatorListRow } from "../../ui/creator-list-row";
import { PaginationControls } from "../../ui/pagination-controls";
import { ViewModeToggle } from "../../ui/view-mode-toggle";
import { useCreatorData } from "../../../hooks/useCreatorData";
import { Creator, ViewMode, SortField, SortDirection } from "../../../types/database";

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

  // Handle creator selection for expanded view
  const handleCreatorClick = (creator: Creator) => {
    setSelectedCreator(creator);
  };

  // Handle closing expanded view
  const handleCloseExpandedView = () => {
    setSelectedCreator(null);
  };

  // Loading state
  if (loading) {
    return (
      <Card className="p-[15px] lg:p-[20px] xl:p-[25px] w-full bg-white rounded-[10px] flex-1 overflow-hidden border-0 shadow-sm">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-[#71737c] text-[14px] lg:text-[16px] font-medium">Loading creators...</p>
          </div>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="p-[15px] lg:p-[20px] xl:p-[25px] w-full bg-white rounded-[10px] flex-1 overflow-hidden border-0 shadow-sm">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <Icon
              name="ErrorIcon.svg"
              className="w-12 h-12 mx-auto mb-4 text-red-500"
              alt="Error"
            />
            <p className="text-red-600 text-[14px] lg:text-[16px] font-medium mb-2">Error loading creators</p>
            <p className="text-[#71737c] text-[12px] lg:text-[14px]">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  // Empty state
  if (!creators || creators.length === 0) {
    return (
      <Card className="p-[15px] lg:p-[20px] xl:p-[25px] w-full bg-white rounded-[10px] flex-1 overflow-hidden border-0 shadow-sm">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <Icon
              name="EmptyStateIcon.svg"
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              alt="No creators found"
            />
            <p className="text-[#71737c] text-[16px] lg:text-[18px] font-medium mb-2">No creators found</p>
            <p className="text-[#71737c] text-[14px] lg:text-[16px]">Try adjusting your filters to see more results.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-[15px] lg:p-[20px] xl:p-[25px] w-full bg-white rounded-[10px] flex-1 overflow-hidden border-0 shadow-sm">
        <div className="flex flex-col h-full">
          {/* Header with view toggle and results count */}
          <div className="flex items-center justify-between mb-[15px] lg:mb-[20px] xl:mb-[25px] flex-shrink-0">
            <div className="flex items-center gap-[8px] lg:gap-[12px] xl:gap-[16px]">
              <h3 className="text-[#06152b] text-[16px] lg:text-[18px] xl:text-[20px] font-semibold">
                {currentMode === 'ai' ? 'AI Recommended Creators' : 'All Creators'}
              </h3>
              <span className="text-[#71737c] text-[14px] lg:text-[16px] xl:text-[18px] font-medium">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[12px] lg:gap-[16px] xl:gap-[20px] h-full overflow-y-auto">
                {creators.map((creator) => (
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
                  <thead className="sticky top-0 bg-white border-b border-gray-200 z-10">
                    <tr>
                      <th className="px-[8px] lg:px-[12px] xl:px-[16px] py-[8px] lg:py-[12px] xl:py-[16px] text-left">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('match_score')}
                          className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] text-[#71737c] text-[12px] lg:text-[14px] xl:text-[16px] font-semibold hover:text-[#06152b] p-0 h-auto"
                        >
                          Creator
                          <Icon
                            name="SortIcon.svg"
                            className={`w-[10px] h-[10px] lg:w-[12px] lg:h-[12px] xl:w-[14px] xl:h-[14px] transition-transform ${
                              sortField === 'match_score' && sortDirection === 'asc' ? 'rotate-180' : ''
                            }`}
                            alt="Sort"
                          />
                        </Button>
                      </th>
                      
                      {/* Match Score Column - Only show in AI mode */}
                      {currentMode === 'ai' && (
                        <th className="px-[8px] lg:px-[12px] xl:px-[16px] py-[8px] lg:py-[12px] xl:py-[16px] text-center">
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('match_score')}
                            className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] text-[#71737c] text-[12px] lg:text-[14px] xl:text-[16px] font-semibold hover:text-[#06152b] p-0 h-auto"
                          >
                            Match Score
                            <Icon
                              name="SortIcon.svg"
                              className={`w-[10px] h-[10px] lg:w-[12px] lg:h-[12px] xl:w-[14px] xl:h-[14px] transition-transform ${
                                sortField === 'match_score' && sortDirection === 'asc' ? 'rotate-180' : ''
                              }`}
                              alt="Sort"
                            />
                          </Button>
                        </th>
                      )}
                      
                      <th className="px-[8px] lg:px-[12px] xl:px-[16px] py-[8px] lg:py-[12px] xl:py-[16px] text-center">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('followers')}
                          className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] text-[#71737c] text-[12px] lg:text-[14px] xl:text-[16px] font-semibold hover:text-[#06152b] p-0 h-auto"
                        >
                          Followers
                          <Icon
                            name="SortIcon.svg"
                            className={`w-[10px] h-[10px] lg:w-[12px] lg:h-[12px] xl:w-[14px] xl:h-[14px] transition-transform ${
                              sortField === 'followers' && sortDirection === 'asc' ? 'rotate-180' : ''
                            }`}
                            alt="Sort"
                          />
                        </Button>
                      </th>
                      
                      <th className="px-[8px] lg:px-[12px] xl:px-[16px] py-[8px] lg:py-[12px] xl:py-[16px] text-center">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('avg_views')}
                          className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] text-[#71737c] text-[12px] lg:text-[14px] xl:text-[16px] font-semibold hover:text-[#06152b] p-0 h-auto"
                        >
                          Avg. Views
                          <Icon
                            name="SortIcon.svg"
                            className={`w-[10px] h-[10px] lg:w-[12px] lg:h-[12px] xl:w-[14px] xl:h-[14px] transition-transform ${
                              sortField === 'avg_views' && sortDirection === 'asc' ? 'rotate-180' : ''
                            }`}
                            alt="Sort"
                          />
                        </Button>
                      </th>
                      
                      <th className="px-[8px] lg:px-[12px] xl:px-[16px] py-[8px] lg:py-[12px] xl:py-[16px] text-center">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('engagement')}
                          className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] text-[#71737c] text-[12px] lg:text-[14px] xl:text-[16px] font-semibold hover:text-[#06152b] p-0 h-auto"
                        >
                          Engagement
                          <Icon
                            name="SortIcon.svg"
                            className={`w-[10px] h-[10px] lg:w-[12px] lg:h-[12px] xl:w-[14px] xl:h-[14px] transition-transform ${
                              sortField === 'engagement' && sortDirection === 'asc' ? 'rotate-180' : ''
                            }`}
                            alt="Sort"
                          />
                        </Button>
                      </th>
                      
                      <th className="px-[8px] lg:px-[12px] xl:px-[16px] py-[8px] lg:py-[12px] xl:py-[16px] text-left">
                        <span className="text-[#71737c] text-[12px] lg:text-[14px] xl:text-[16px] font-semibold">
                          Niches
                        </span>
                      </th>
                      
                      <th className="px-[8px] lg:px-[12px] xl:px-[16px] py-[8px] lg:py-[12px] xl:py-[16px] text-left">
                        <span className="text-[#71737c] text-[12px] lg:text-[14px] xl:text-[16px] font-semibold">
                          Recent Posts
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {creators.map((creator) => (
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
          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalCreators={totalCreators}
              onPageChange={handlePageChange}
              onPreviousPage={previousPage}
              onNextPage={nextPage}
            />
          )}
        </div>
      </Card>

      {/* Expanded Profile Overlay */}
      {selectedCreator && (
        <ExpandedProfileOverlay
          creator={selectedCreator}
          isOpen={!!selectedCreator}
          onClose={handleCloseExpandedView}
        />
      )}
    </>
  );
};