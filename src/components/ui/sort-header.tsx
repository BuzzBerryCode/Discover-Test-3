import React from 'react';
import { Button } from './button';
import { Icon } from './icon';
import { SortField, SortDirection } from '../../types/database';

interface SortHeaderProps {
  field: SortField;
  currentSortField: SortField | null;
  currentSortDirection: SortDirection;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
  className?: string;
}

export const SortHeader: React.FC<SortHeaderProps> = ({
  field,
  currentSortField,
  currentSortDirection,
  onSort,
  children,
  className = "",
}) => {
  const isActive = currentSortField === field;
  
  return (
    <th className={`py-[8px] lg:py-[10px] xl:py-[12px] px-[6px] lg:px-[8px] xl:px-[10px] text-left ${className}`}>
      <Button
        onClick={() => onSort(field)}
        className="flex items-center gap-[4px] lg:gap-[6px] xl:gap-[8px] text-[#71737c] text-[11px] lg:text-[12px] xl:text-[13px] font-semibold hover:text-neutral-new900 transition-colors bg-transparent hover:bg-transparent p-0 h-auto"
        variant="ghost"
      >
        {children}
        <Icon
          name="SortIcon.svg"
          className={`w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[12px] xl:h-[12px] transition-transform ${
            isActive && currentSortDirection === 'desc' ? 'rotate-180' : ''
          } ${
            isActive ? 'opacity-100' : 'opacity-50'
          }`}
          alt="Sort"
        />
      </Button>
    </th>
  );
};