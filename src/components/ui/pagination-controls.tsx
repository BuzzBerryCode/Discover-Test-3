import React from 'react';
import { Button } from './button';
import { Icon } from './icon';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalCreators: number;
  creatorsPerPage: number;
  onPageChange: (page: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalCreators,
  creatorsPerPage,
  onPageChange,
  onPreviousPage,
  onNextPage,
}) => {
  // Calculate the range of creators being shown
  const startCreator = (currentPage - 1) * creatorsPerPage + 1;
  const endCreator = Math.min(currentPage * creatorsPerPage, totalCreators);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination
      if (currentPage <= 3) {
        // Show first 5 pages
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        // Show last 5 pages
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show current page and 2 on each side
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-[8px] lg:gap-[10px] xl:gap-[12px] pt-[12px] lg:pt-[15px] xl:pt-[18px] border-t border-[#f3f4f6]">
      {/* Results info */}
      <div className="text-[11px] lg:text-[12px] xl:text-[13px] text-[#71737c] font-medium">
        Showing {startCreator}-{endCreator} of {totalCreators} creators
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px]">
        {/* Previous button */}
        <Button
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className={`h-[28px] lg:h-[32px] xl:h-[36px] px-[8px] lg:px-[10px] xl:px-[12px] py-[4px] lg:py-[6px] xl:py-[8px] rounded-[6px] font-medium text-[11px] lg:text-[12px] xl:text-[13px] transition-colors border ${
            currentPage === 1
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white border-[#dbe2eb] text-neutral-new900 hover:bg-gray-50'
          }`}
          variant="outline"
        >
          <Icon
            name="ArrowLeftIcon.svg"
            className="w-[10px] h-[10px] lg:w-[12px] lg:h-[12px] xl:w-[14px] xl:h-[14px]"
            alt="Previous page"
          />
        </Button>

        {/* Page numbers */}
        {getPageNumbers().map((pageNum) => (
          <Button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`h-[28px] lg:h-[32px] xl:h-[36px] px-[8px] lg:px-[10px] xl:px-[12px] py-[4px] lg:py-[6px] xl:py-[8px] rounded-[6px] font-medium text-[11px] lg:text-[12px] xl:text-[13px] transition-colors border min-w-[28px] lg:min-w-[32px] xl:min-w-[36px] ${
              currentPage === pageNum
                ? 'bg-[linear-gradient(90deg,#557EDD_0%,#6C40E4_100%)] border-transparent text-white'
                : 'bg-white border-[#dbe2eb] text-neutral-new900 hover:bg-gray-50'
            }`}
            variant="outline"
          >
            {pageNum}
          </Button>
        ))}

        {/* Next button */}
        <Button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className={`h-[28px] lg:h-[32px] xl:h-[36px] px-[8px] lg:px-[10px] xl:px-[12px] py-[4px] lg:py-[6px] xl:py-[8px] rounded-[6px] font-medium text-[11px] lg:text-[12px] xl:text-[13px] transition-colors border ${
            currentPage === totalPages
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white border-[#dbe2eb] text-neutral-new900 hover:bg-gray-50'
          }`}
          variant="outline"
        >
          <Icon
            name="ArrowRightIcon.svg"
            className="w-[10px] h-[10px] lg:w-[12px] lg:h-[12px] xl:w-[14px] xl:h-[14px]"
            alt="Next page"
          />
        </Button>
      </div>
    </div>
  );
};