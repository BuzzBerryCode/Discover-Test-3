import React, { useEffect, useRef } from 'react';
import { Button } from './button';

interface LocationFilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocations: Set<string>;
  onLocationToggle: (location: string) => void;
  onReset: () => void;
  onConfirm: () => void;
  triggerRef: React.RefObject<HTMLElement>;
  countries: string[];
}

export const LocationFilterDropdown: React.FC<LocationFilterDropdownProps> = ({
  isOpen,
  onClose,
  selectedLocations,
  onLocationToggle,
  onReset,
  onConfirm,
  triggerRef,
  countries,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Position dropdown
  useEffect(() => {
    if (isOpen && dropdownRef.current && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const dropdown = dropdownRef.current;
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      
      // Calculate optimal position
      let top = triggerRect.bottom + 8;
      let left = triggerRect.left;
      
      // Adjust for viewport boundaries
      const dropdownWidth = window.innerWidth < 640 ? 280 : window.innerWidth < 1024 ? 320 : 360;
      const dropdownHeight = 400; // Estimated max height
      
      // Horizontal positioning
      if (left + dropdownWidth > viewport.width) {
        left = triggerRect.right - dropdownWidth;
      }
      if (left < 8) {
        left = 8;
      }
      
      // Vertical positioning - show above if not enough space below
      if (top + dropdownHeight > viewport.height && triggerRect.top > dropdownHeight) {
        top = triggerRect.top - dropdownHeight - 8;
      }
      
      dropdown.style.position = 'fixed';
      dropdown.style.top = `${top}px`;
      dropdown.style.left = `${left}px`;
      dropdown.style.zIndex = '9999';
      
      // Handle scroll to keep dropdown positioned
      const handleScroll = () => {
        if (triggerRef.current && dropdownRef.current) {
          const newTriggerRect = triggerRef.current.getBoundingClientRect();
          let newTop = newTriggerRect.bottom + 8;
          let newLeft = newTriggerRect.left;
          
          // Reapply boundary checks
          if (newLeft + dropdownWidth > viewport.width) {
            newLeft = newTriggerRect.right - dropdownWidth;
          }
          if (newLeft < 8) {
            newLeft = 8;
          }
          
          if (newTop + dropdownHeight > viewport.height && newTriggerRect.top > dropdownHeight) {
            newTop = newTriggerRect.top - dropdownHeight - 8;
          }
          
          dropdownRef.current.style.top = `${newTop}px`;
          dropdownRef.current.style.left = `${newLeft}px`;
        }
      };
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [isOpen, triggerRef]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="w-[280px] sm:w-[320px] lg:w-[360px] bg-white border border-[#e5e7eb] rounded-[12px] shadow-lg overflow-hidden max-h-[90vh]"
    >
      <div className="p-3 sm:p-4">
        {/* Header */}
        <div className="mb-3 sm:mb-4">
          <h3 className="text-[14px] sm:text-[16px] font-semibold text-[#111827] mb-1">
            Filter by Location
          </h3>
        </div>

        {/* Countries list */}
        <div className="max-h-[240px] sm:max-h-[280px] lg:max-h-[320px] overflow-y-auto">
          <div className="space-y-2">
            {countries.map((country) => (
              <div
                key={country}
                className={`flex items-center space-x-2 sm:space-x-3 p-2 rounded-[6px] cursor-pointer transition-colors ${
                  selectedLocations.has(country)
                    ? 'bg-blue-100 hover:bg-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onLocationToggle(country)}
              >
                <span className={`text-[12px] sm:text-[14px] cursor-pointer flex-1 ${
                  selectedLocations.has(country)
                    ? 'text-blue-700 font-medium'
                    : 'text-[#111827]'
                }`}>
                  {country}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer with buttons */}
      <div className="p-2 sm:p-3 border-t border-[#f3f4f6] flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-7 sm:h-8 px-2 sm:px-3 text-[11px] sm:text-[12px] font-medium text-[#6b7280] hover:text-[#374151] hover:bg-[#f9fafb]"
        >
          Reset
        </Button>
        <Button
          size="sm"
          onClick={onConfirm}
          className="h-7 sm:h-8 px-3 sm:px-4 bg-[linear-gradient(90deg,#557EDD_0%,#6C40E4_100%)] hover:bg-[linear-gradient(90deg,#4A6BC8_0%,#5A36C7_100%)] text-white text-[11px] sm:text-[12px] font-medium rounded-[6px] border-0"
        >
          Confirm
        </Button>
      </div>
    </div>
  );
};