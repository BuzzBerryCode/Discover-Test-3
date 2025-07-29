import React from 'react';
import { Button } from './button';
import { Icon } from './icon';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalCreators: number;
  onPageChange: (page: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalCreators,
  onPageChange,
  onPreviousPage,
  onNextPage,
}) => {
  // Calculate visible page numbers
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-[12px] lg:gap-[16px] xl:gap-[20px] pt-[12px] lg:pt-[16px] xl:pt-[20px] border-t border-gray-100">
      {/* Results info */}
      <div className="text-[#71737c] text-[12px] lg:text-[14px] xl:text-[16px] font-medium">
        Showing {((currentPage - 1) * 24) + 1}-{Math.min(currentPage * 24, totalCreators)} of {totalCreators} creators
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px]">
        {/* Previous button */}
        <Button
          variant="outline"
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className="h-[32px] lg:h-[36px] xl:h-[40px] w-[32px] lg:w-[36px] xl:w-[40px] p-0 border-[#dbe2eb] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon
            name="ArrowLeftIcon.svg"
            className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px]"
            alt="Previous page"
          />
        </Button>

        {/* Page numbers */}
        {visiblePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-[8px] lg:px-[12px] xl:px-[16px] py-[6px] lg:py-[8px] xl:py-[10px] text-[#71737c] text-[12px] lg:text-[14px] xl:text-[16px] font-medium">
                ...
              </span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => onPageChange(page as number)}
                className={`h-[32px] lg:h-[36px] xl:h-[40px] min-w-[32px] lg:min-w-[36px] xl:min-w-[40px] px-[8px] lg:px-[12px] xl:px-[16px] text-[12px] lg:text-[14px] xl:text-[16px] font-medium ${
                  currentPage === page
                    ? 'bg-[linear-gradient(90deg,#557EDD_0%,#6C40E4_100%)] text-white border-transparent hover:bg-[linear-gradient(90deg,#4A6BC8_0%,#5A36C7_100%)]'
                    : 'border-[#dbe2eb] text-[#71737c] hover:bg-gray-50'
                }`}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        {/* Next button */}
        <Button
          variant="outline"
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="h-[32px] lg:h-[36px] xl:h-[40px] w-[32px] lg:w-[36px] xl:w-[40px] p-0 border-[#dbe2eb] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon
            name="ArrowRightIcon.svg"
            className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px]"
            alt="Next page"
          />
        </Button>
      </div>
    </div>
  );
};