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
    <div className="flex items-center bg-white border border-[#dbe2eb] rounded-[8px] p-[2px] lg:p-[3px] xl:p-[4px]">
      <Button
        variant="ghost"
        onClick={() => onViewModeChange('cards')}
        className={`h-[24px] lg:h-[28px] xl:h-[32px] w-[24px] lg:w-[28px] xl:w-[32px] p-0 rounded-[6px] transition-colors ${
          viewMode === 'cards'
            ? 'bg-[linear-gradient(90deg,#557EDD_0%,#6C40E4_100%)] text-white'
            : 'text-[#71737c] hover:bg-gray-50'
        }`}
      >
        <Icon
          name={viewMode === 'cards' ? "CardsModeIcon.svg" : "CardsModeIconUnselected.svg"}
          className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px]"
          alt="Cards view"
        />
      </Button>
      <Button
        variant="ghost"
        onClick={() => onViewModeChange('list')}
        className={`h-[24px] lg:h-[28px] xl:h-[32px] w-[24px] lg:w-[28px] xl:w-[32px] p-0 rounded-[6px] transition-colors ${
          viewMode === 'list'
            ? 'bg-[linear-gradient(90deg,#557EDD_0%,#6C40E4_100%)] text-white'
            : 'text-[#71737c] hover:bg-gray-50'
        }`}
      >
        <Icon
          name={viewMode === 'list' ? "ListIconSelected.svg" : "ListIcon.svg"}
          className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] xl:w-[16px] xl:h-[16px]"
          alt="List view"
        />
      </Button>
    </div>
  );
};