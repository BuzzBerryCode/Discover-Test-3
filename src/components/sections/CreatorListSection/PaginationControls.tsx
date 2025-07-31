import React from "react";
import { Button } from "../../ui/button";
import { Icon } from "../../ui/icon";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  previousPage: () => void;
  nextPage: () => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  handlePageChange,
  previousPage,
  nextPage,
}) => {
  if (totalPages <= 1) return null;

  // Responsive page count based on screen size
  const maxVisiblePages = typeof window !== 'undefined' && window.innerWidth < 480 ? 5 : typeof window !== 'undefined' && window.innerWidth < 768 ? 6 : 7;

  const getPages = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    pages.push(1);
    if (totalPages <= maxVisiblePages) {
      for (let i = 2; i <= totalPages; i++) pages.push(i);
    } else {
      const showEarly = currentPage <= 3;
      const showLate = currentPage >= totalPages - 2;
      if (showEarly) {
        for (let i = 2; i <= Math.min(4, totalPages - 1); i++) pages.push(i);
        if (totalPages > 5) pages.push('...');
      } else if (showLate) {
        pages.push('...');
        for (let i = totalPages - 3; i < totalPages; i++) pages.push(i);
      } else {
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex-shrink-0 mt-[20px] lg:mt-[25px] xl:mt-[30px] pt-[15px] lg:pt-[20px] xl:pt-[25px] border-t border-[#f1f4f9] w-full">
      <div className="flex flex-col items-center gap-[8px] sm:gap-[10px] lg:gap-[12px] xl:gap-[15px] w-full">
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
            <div className="flex items-center gap-[2px] xs:gap-[3px] sm:gap-[4px] lg:gap-[6px] xl:gap-[8px] flex-shrink-0">
              {getPages().map((page, idx) =>
                page === '...'
                  ? <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                  : <Button
                      key={`page-${page}`}
                      variant="outline"
                      onClick={() => handlePageChange(Number(page))}
                      className={`h-[28px] xs:h-[30px] lg:h-[34px] xl:h-[38px] w-[28px] xs:w-[30px] lg:w-[34px] xl:w-[38px] p-0 rounded-[6px] sm:rounded-[8px] font-medium text-[10px] xs:text-[11px] sm:text-[12px] lg:text-[13px] xl:text-[14px] transition-colors flex-shrink-0 ${currentPage === page ? 'bg-[linear-gradient(90deg,#557EDD_0%,#6C40E4_100%)] border-transparent text-white hover:bg-[linear-gradient(90deg,#4A6BC8_0%,#5A36C7_100%)] hover:text-white' : 'bg-white border-[#dbe2eb] text-neutral-new900 hover:bg-gray-50 hover:text-neutral-new900'}`}
                    >
                      {page}
                    </Button>
              )}
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
      </div>
    </div>
  );
};

export default PaginationControls; 