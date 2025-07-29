import React from "react";
import { CreatorFilterSection } from "../sections/CreatorFilterSection/CreatorFilterSection";
import { CreatorListSection } from "../sections/CreatorListSection/CreatorListSection";
import { MetricsTitleSection } from "../sections/MetricsTitleSection/MetricsTitleSection";

// Dashboard-compatible Discover Page Component
// This component is designed to be integrated into a dashboard layout with sidebar
export const DiscoverPage = (): JSX.Element => {
  return (
    <div className="flex flex-col gap-[15px] lg:gap-[20px] xl:gap-[25px] w-full h-full overflow-hidden bg-[#F9FAFB] p-[15px] lg:p-[20px] xl:p-[25px]">
      {/* Page Header with Metrics */}
      <MetricsTitleSection />
      
      {/* Filter Controls */}
      <CreatorFilterSection />
      
      {/* Creator List/Cards */}
      <CreatorListSection />
    </div>
  );
};

export default DiscoverPage;