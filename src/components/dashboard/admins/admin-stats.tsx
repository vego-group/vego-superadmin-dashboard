"use client";

import { Users, UserCheck, UserX, RefreshCw } from "lucide-react";
import { Admin } from "@/types/dashboard/admin";
import { useLang } from "@/lib/language-context";

interface Props {
  admins: Admin[];
  isLoading?: boolean;
}

const Skeleton = () => (
  <div className="h-7 w-12 bg-gray-200 rounded-md animate-pulse mt-1" />
);

export default function AdminStats({ admins, isLoading = false }: Props) {
  const { t } = useLang();

  const stats = [
    {
      title: t("Total Admins", "إجمالي المشرفين"),
      value: admins.length,
      icon: Users,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      gradient: "from-purple-600 to-indigo-600",
    },
    {
      title: t("Active", "نشط"),
      value: admins.filter((a) => a.status === "active").length,
      icon: UserCheck,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      gradient: "from-green-600 to-emerald-600",
    },
    {
      title: t("Inactive", "غير نشط"),
      value: admins.filter((a) => a.status === "inactive").length,
      icon: UserX,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      gradient: "from-yellow-600 to-orange-600",
    },
    {
      title: t("Suspended", "موقوف"),
      value: admins.filter((a) => a.status === "suspended").length,
      icon: RefreshCw,
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      gradient: "from-red-600 to-rose-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.title}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className={`h-1 w-full bg-gradient-to-r ${s.gradient}`} />
            <div className="p-3 sm:p-4 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
                  {s.title}
                </p>
                {isLoading ? (
                  <Skeleton />
                ) : (
                  <h3 className="text-lg sm:text-2xl font-semibold text-gray-900 mt-0.5 sm:mt-1">
                    {s.value}
                  </h3>
                )}
              </div>
              <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${s.iconBg}`}>
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}