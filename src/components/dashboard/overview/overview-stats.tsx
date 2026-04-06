// src/components/dashboard/overview/overview-stats.tsx
"use client";

import { Users, Battery, Zap, UserCog } from "lucide-react";
import StatsCard from "./stats-card";
import { useDashboard } from "@/hooks/use-dashboard";
import { useLang } from "@/lib/language-context";

export default function OverviewStats() {
  const { counts, isLoading } = useDashboard();
  const { t } = useLang();

  const stats = [
    {
      title: t("Total Users",           "إجمالي المستخدمين"),
      value: counts?.total_users ?? 0,
      icon: <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />,
      iconBg: "bg-blue-100",
    },
    {
      title: t("Total Admins",          "إجمالي المشرفين"),
      value: counts?.total_admins ?? 0,
      icon: <UserCog className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />,
      iconBg: "bg-purple-100",
    },
    {
      title: t("Battery Swap Active",   "تبديل البطاريات"),
      value: counts?.total_battery_swap_active ?? 0,
      icon: <Battery className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />,
      iconBg: "bg-green-100",
    },
    {
      title: t("Fast Charging Active",  "الشحن السريع"),
      value: counts?.total_fast_charging_active ?? 0,
      icon: <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />,
      iconBg: "bg-orange-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      {stats.map((stat) => (
        <StatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          iconBg={stat.iconBg}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}