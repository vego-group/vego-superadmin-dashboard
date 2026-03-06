// index.tsx
import OverviewStats from "./overview-stats";
import RevenueTrends from "./revenue-trends";
import RegionStatus from "./region-status";

export default function Overview() {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="px-2 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Overview
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
          Manage your assigned smart locker cabinets
        </p>
      </div>

      {/* Stats */}
      <OverviewStats />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        
        {/* Revenue - Full width on mobile, 2 columns on desktop */}
        <div className="lg:col-span-2">
          <RevenueTrends />
        </div>

        {/* Right Column - Only Region Status */}
        <div className="lg:col-span-1">
          <RegionStatus />
        </div>
      </div>
    </div>
  );
}