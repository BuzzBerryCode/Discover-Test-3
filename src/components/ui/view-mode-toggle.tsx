import React from 'react';
import { Button } from './button';
import { Icon } from './icon';

interface ViewModeToggleProps {
  viewMode: 'cards' | 'list';
  onViewModeChange: (mode: 'cards' | 'list') => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="flex items-center bg-white border border-[#dbe2eb] rounded-[8px] p-0 overflow-hidden">
      <Button
        onClick={() => onViewModeChange('cards')}
        className={`h-[28px] lg:h-[32px] xl:h-[36px] px-[8px] lg:px-[10px] xl:px-[12px] py-[4px] lg:py-[6px] xl:py-[8px] font-medium text-[11px] lg:text-[12px] xl:text-[13px] transition-all duration-200 rounded-[6px] border-0 ${
          viewMode === 'cards'
            ? 'bg-gradient-to-r from-[#E7CBFD] to-[#E0DEEA] text-neutral-new900'
            : 'bg-white text-neutral-new900 hover:bg-gray-50'
        }`}
      >
        <Icon
          name={viewMode === 'cards' ? 'CardsModeIcon.svg' : 'CardsModeIconUnselected.svg'}
          className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px]"
          alt="Cards view"
        />
      </Button>
      <Button
        onClick={() => onViewModeChange('list')}
        className={`h-[28px] lg:h-[32px] xl:h-[36px] px-[8px] lg:px-[10px] xl:px-[12px] py-[4px] lg:py-[6px] xl:py-[8px] font-medium text-[11px] lg:text-[12px] xl:text-[13px] transition-all duration-200 rounded-[6px] border-0 ${
          viewMode === 'list'
            ? 'bg-gradient-to-r from-[#E7CBFD] to-[#E0DEEA] text-neutral-new900'
            : 'bg-white text-neutral-new900 hover:bg-gray-50'
        }`}
      >
        <Icon
          name={viewMode === 'list' ? 'ListIconSelected.svg' : 'ListIcon.svg'}
          className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px]"
          alt="List view"
        />
      </Button>
    </div>
  );
};