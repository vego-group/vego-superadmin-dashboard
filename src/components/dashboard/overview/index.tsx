// index.tsx المعدل
import OverviewStats from "./overview-stats";
import RevenueTrends from "./revenue-trends";
import RegionStatus from "./region-status";
import RecentAlarms from "./recent-alarms";
import StatsByCity from "./stats-by-city"; // استيراد المكون الجديد

export default function Overview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-2 sm:px-0 flex justify-between items-end">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Overview</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
            Manage your assigned smart locker cabinets
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <OverviewStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* العمود الأيسر: الرسوم البيانية الكبيرة (2/3 المساحة) */}
        <div className="lg:col-span-2 space-y-6">
          <RevenueTrends />
          {/* إضافة التوزيع الجغرافي هنا */}
          <StatsByCity /> 
        </div>

        {/* العمود الأيمن: التنبيهات والحالة (1/3 المساحة) */}
        <div className="lg:col-span-1 space-y-6">
          <RegionStatus />
          <RecentAlarms /> 
        </div>

      </div>
    </div>
  );
}