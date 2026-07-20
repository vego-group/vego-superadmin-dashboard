"use client";

import { Battery as BatteryIcon, CheckCircle2, SearchCheck, Archive } from "lucide-react";
import { Battery } from "@/types/dashboard/battery";
import { useLang } from "@/lib/language-context";

interface Props {
  batteries: Battery[];
  /** Server-side total when the list is paginated; falls back to loaded count. */
  totalCount: number | null;
  isLoading: boolean;
}

const Skeleton = () => <div className="h-7 w-12 bg-gray-200 rounded-md animate-pulse mt-1" />;

export default function BatteriesStats({ batteries, totalCount, isLoading }: Props) {
  const { t } = useLang();

  const stats = [
    { label: t("Total", "الإجمالي"),             value: totalCount ?? batteries.length,                                        icon: BatteryIcon,  bg: "bg-blue-100",   color: "text-blue-600"   },
    { label: t("Active", "نشطة"),                value: batteries.filter((b) => b.lifecycle_status === "active").length,       icon: CheckCircle2, bg: "bg-green-100",  color: "text-green-600"  },
    { label: t("Under Review", "قيد المراجعة"),  value: batteries.filter((b) => b.lifecycle_status === "under_review").length, icon: SearchCheck,  bg: "bg-yellow-100", color: "text-yellow-600" },
    { label: t("Retired", "خارج الخدمة"),        value: batteries.filter((b) => b.lifecycle_status === "retired").length,      icon: Archive,      bg: "bg-gray-100",   color: "text-gray-500"   },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
            <div className="p-4 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
                {isLoading ? <Skeleton /> : <p className={`text-2xl font-semibold mt-1 ${s.color}`}>{s.value}</p>}
              </div>
              <div className={`p-2 rounded-lg ${s.bg}`}><Icon className={`h-5 w-5 ${s.color}`} /></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
