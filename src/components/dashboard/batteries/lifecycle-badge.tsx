"use client";

import { BatteryLifecycleStatus } from "@/types/dashboard/battery";
import { useLang } from "@/lib/language-context";

export function useLifecycleCfg() {
  const { t } = useLang();
  const cfg: Record<BatteryLifecycleStatus, { label: string; badge: string; dot: string }> = {
    active:       { label: t("Active", "نشطة"),            badge: "bg-green-50 text-green-700 border border-green-200",   dot: "bg-green-400"  },
    under_review: { label: t("Under Review", "قيد المراجعة"), badge: "bg-yellow-50 text-yellow-700 border border-yellow-200", dot: "bg-yellow-400" },
    retired:      { label: t("Retired", "خارج الخدمة"),     badge: "bg-gray-100 text-gray-500 border border-gray-200",     dot: "bg-gray-400"   },
  };
  return cfg;
}

export default function LifecycleBadge({ status }: { status: BatteryLifecycleStatus }) {
  const cfg = useLifecycleCfg()[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
