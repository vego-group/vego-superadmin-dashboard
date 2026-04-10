// src/components/dashboard/cabinates/battery-swapping/cabinet-stats-cards.tsx
import { useLang } from "@/lib/language-context";
import { Battery, CheckCircle2, WifiOff, AlertTriangle } from "lucide-react";
import { Cabinet } from "../types";

interface Props {
  data: Cabinet[];
}

export default function CabinetStatsCards({ data }: Props) {
  const { t } = useLang();
  const stats = [
  {
    title: t("Total Cabinets", "إجمالي الخزائن"),
    value: data.length,
    icon: <Battery className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />,
    iconBg: "bg-blue-100",
  },
  {
    title: t("Active","نشط"),
    value: data.filter((c) => c.status === "active").length,
    icon: <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />,
    iconBg: "bg-green-100",
  },
  {
    title: t("Inactive","غير نشط"),
    value: data.filter((c) => c.status === "inactive" || c.status === "offline").length,
    icon: <WifiOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />,
    iconBg: "bg-gray-100",
  },
  {
    title: t("Maintenance","صيانة"),
    value: data.filter((c) => c.status === "maintenance" || c.status === "faulty").length,
    icon: <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />,
    iconBg: "bg-orange-100",
  },
];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((s) => (
        <div
          key={s.title}
          className="bg-white rounded-lg border border-gray-200 relative overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          {/* Top Purple Line */}
          <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

          <div className="p-3 sm:p-4 flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
                {s.title}
              </p>
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mt-0.5 sm:mt-1">
                {s.value}
              </h3>
            </div>
            <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${s.iconBg}`}>
              {s.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}