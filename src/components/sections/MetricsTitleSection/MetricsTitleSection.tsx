import React from "react";
import { Card, CardContent } from "../../ui/card";
import { Icon } from "../../ui/icon";
import { useCreatorData } from "../../../hooks/useCreatorData";
import { formatPercentage, getTrendIcon, getTrendColor } from "../../../utils/formatters";

// Responsive number formatting - full numbers on larger screens, abbreviated on smaller
const formatNumberResponsive = (num: number): string => {
  // For very large screens (xl and above), show full numbers
  if (window.innerWidth >= 1280) {
    return num.toLocaleString();
  }
  // For large screens (lg), show full numbers up to 999,999
  if (window.innerWidth >= 1024) {
    if (num < 1000000) {
      return num.toLocaleString();
    }
    return `${(num / 1000000).toFixed(1)}M`;
  }
  // For medium and smaller screens, use abbreviated format
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toString();
};
export const MetricsTitleSection = (): JSX.Element => {
  const { metrics, loading } = useCreatorData();

  // Static metric configurations
  const metricConfigs = [
    {
      title: "Total Creators",
      iconSrc: "CreatorIcon.svg", // Keep existing for Total Creators
      getValue: () => metrics?.total_creators?.toString() || "0",
    },
    {
      title: "Avg. Followers",
      iconSrc: "FollowerIcon.svg",
      getValue: () => formatNumberResponsive(metrics?.avg_followers || 0),
    },
    {
      title: "Avg. Views",
      iconSrc: "AvgViewsIcon.svg",
      getValue: () => formatNumberResponsive(metrics?.avg_views || 0),
    },
    {
      title: "Avg. Engagement",
      iconSrc: "AvgEngagementIcon.svg",
      getValue: () => `${metrics?.avg_engagement?.toFixed(1) || "0.0"}%`,
    },
  ];

  if (loading) {
    return (
      <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full flex-shrink-0 gap-3 lg:gap-4 xl:gap-5 min-h-[60px] lg:min-h-[70px]">
        <div className="flex flex-col justify-center flex-shrink-0">
          <h1 className="font-bold font-['Inter',Helvetica] text-neutral-100 text-[18px] lg:text-[20px] xl:text-[22px] leading-[22px] lg:leading-[24px] xl:leading-[26px] mb-[-1px]">
            Discover Creators
          </h1>
          <p className="font-['Inter',Helvetica] font-medium text-neutral-new600 text-[13px] lg:text-[14px] xl:text-[15px] leading-[16px] lg:leading-[18px] xl:leading-[19px]">
            Loading metrics...
          </p>
        </div>
        <div className="hidden lg:block h-[50px] lg:h-[55px] w-px bg-[#e1e5e9] mx-4 lg:mx-5 flex-shrink-0" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[6px] lg:gap-[8px] xl:gap-[10px] w-full lg:w-auto lg:flex-1 lg:max-w-none">
          {Array(4).fill(0).map((_, index) => (
            <Card key={index} className="bg-white rounded-[10px] border-0 shadow-sm h-[60px] lg:h-[65px] xl:h-[70px] w-full animate-pulse">
              <CardContent className="flex items-center gap-[8px] lg:gap-[10px] xl:gap-[12px] px-[8px] lg:px-[12px] xl:px-[14px] py-[8px] lg:py-[10px] xl:py-[12px] h-full">
                <div className="w-[28px] h-[28px] lg:w-[32px] lg:h-[32px] xl:w-[36px] xl:h-[36px] bg-gray-200 rounded-full flex-shrink-0" />
                <div className="flex flex-col justify-center h-[35px] lg:h-[40px] xl:h-[45px] min-w-[50px] lg:min-w-[60px] xl:min-w-[70px] flex-1">
                  <div className="h-3 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full flex-shrink-0 gap-3 lg:gap-4 xl:gap-5 min-h-[60px] lg:min-h-[70px]">
      {/* Title and subtitle */}
      <div className="flex flex-col justify-center flex-shrink-0">
        <h1 className="font-bold font-['Inter',Helvetica] text-neutral-100 text-[18px] lg:text-[20px] xl:text-[22px] leading-[22px] lg:leading-[24px] xl:leading-[26px] mb-[-1px]">
          Discover Creators
        </h1>
        <p className="font-['Inter',Helvetica] font-medium text-neutral-new600 text-[13px] lg:text-[14px] xl:text-[15px] leading-[16px] lg:leading-[18px] xl:leading-[19px]">
          Welcome to your dashboard
        </p>
      </div>

      {/* Divider - Hidden on mobile, visible on lg+ */}
      <div className="hidden lg:block h-[50px] lg:h-[55px] w-px bg-[#e1e5e9] mx-4 lg:mx-5 flex-shrink-0" />

      {/* Dynamic Metric cards - Responsive grid with smaller sizing */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[6px] lg:gap-[8px] xl:gap-[10px] w-full lg:w-auto lg:flex-1 lg:max-w-none">
        {metricConfigs.map((metric, index) => (
          <Card key={index} className="bg-white rounded-[10px] border-0 shadow-sm h-[60px] lg:h-[65px] xl:h-[70px] w-full">
            <CardContent className="flex items-center gap-[8px] lg:gap-[10px] xl:gap-[12px] px-[8px] lg:px-[12px] xl:px-[14px] py-[8px] lg:py-[10px] xl:py-[12px] h-full">
              {/* Icon - Smaller responsive sizing */}
              <div className="flex items-center justify-center flex-shrink-0">
                <Icon
                  name={metric.iconSrc}
                  className="w-[28px] h-[28px] lg:w-[32px] lg:h-[32px] xl:w-[36px] xl:h-[36px]"
                  alt={metric.title}
                />
              </div>

              {/* Dynamic Metric information - Smaller responsive sizing */}
              <div className="flex flex-col justify-center h-[35px] lg:h-[40px] xl:h-[45px] min-w-[50px] lg:min-w-[60px] xl:min-w-[70px] flex-1">
                <div className="font-['Inter',Helvetica] font-semibold text-[#71737c] text-[11px] lg:text-[12px] xl:text-[13px] leading-[13px] lg:leading-[14px] xl:leading-[15px] mb-[1px]">
                  {metric.title}
                </div>
                <div className="font-['Inter',Helvetica] font-semibold text-[#080d1c] text-[14px] lg:text-[15px] xl:text-[16px] leading-[16px] lg:leading-[17px] xl:leading-[18px] mb-[1px]">
                  {metric.getValue()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};