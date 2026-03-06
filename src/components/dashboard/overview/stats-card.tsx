// stats-card.tsx
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBg?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  iconBg = "bg-gray-100",
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 relative overflow-hidden hover:shadow-md transition-shadow duration-200">
      
      {/* Top Purple Line */}
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

      <div className="p-3 sm:p-4 flex items-start justify-between">
        <div className="flex-1 min-w-0"> {/* Added min-w-0 to prevent text overflow */}
          <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
            {title}
          </p>
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mt-0.5 sm:mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
        </div>

        <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}