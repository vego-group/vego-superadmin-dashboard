"use client";

import { useState, useEffect } from "react";
import { Search, Info } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { logger } from "@/lib/logger";
import { BatteryAssignment, BatteryLifecycleStatus } from "@/types/dashboard/battery";
import { useLang } from "@/lib/language-context";

interface FleetOption { id: number; name: string; }

interface Props {
  search: string; onSearchChange: (v: string) => void;
  lifecycleStatus: BatteryLifecycleStatus | "all"; onLifecycleChange: (v: BatteryLifecycleStatus | "all") => void;
  assignment: BatteryAssignment | "all"; onAssignmentChange: (v: BatteryAssignment | "all") => void;
  fleetId: string; onFleetChange: (v: string) => void;
}

export default function BatteriesFilters({
  search, onSearchChange,
  lifecycleStatus, onLifecycleChange,
  assignment, onAssignmentChange,
  fleetId, onFleetChange,
}: Props) {
  const { t } = useLang();
  const [fleets, setFleets] = useState<FleetOption[]>([]);

  useEffect(() => {
    const fetchFleets = async () => {
      try {
        const raw = await apiClient.get<unknown>("fleets");
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray((raw as { data?: unknown[] })?.data)
            ? (raw as { data: unknown[] }).data
            : [];
        setFleets(
          (list as Record<string, unknown>[])
            .filter((f) => f.id != null)
            .map((f) => ({ id: Number(f.id), name: String(f.name ?? f.company_name ?? `#${f.id}`) }))
        );
      } catch (err) {
        logger.error("fetchFleets (battery filters):", err);
        setFleets([]);
      }
    };
    fetchFleets();
  }, []);

  const selectCls =
    "bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:border-indigo-300 cursor-pointer";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("Search by battery ID…", "ابحث بمعرف البطارية…")}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-indigo-300 transition"
        />
      </div>

      <select value={lifecycleStatus} onChange={(e) => onLifecycleChange(e.target.value as BatteryLifecycleStatus | "all")} className={selectCls}>
        <option value="all">{t("All Lifecycle", "كل دورات الحياة")}</option>
        <option value="active">{t("Active", "نشطة")}</option>
        <option value="under_review">{t("Under Review", "قيد المراجعة")}</option>
        <option value="retired">{t("Retired", "خارج الخدمة")}</option>
      </select>

      <select value={assignment} onChange={(e) => onAssignmentChange(e.target.value as BatteryAssignment | "all")} className={selectCls}>
        <option value="all">{t("All Assignments", "كل التعيينات")}</option>
        <option value="in_motorcycle">{t("In Motorcycle", "في دراجة")}</option>
        <option value="in_cabinet">{t("In Cabinet", "في كابينة")}</option>
        <option value="unassigned">{t("Unassigned", "غير معينة")}</option>
      </select>

      <select value={fleetId} onChange={(e) => onFleetChange(e.target.value)} className={selectCls}>
        <option value="all">{t("All Fleets", "كل الأساطيل")}</option>
        {fleets.map((f) => (
          <option key={f.id} value={String(f.id)}>{f.name}</option>
        ))}
      </select>

      {/* fleet_id only matches batteries fitted to that fleet's motorcycles, so
          combining it with assignment=in_cabinet always returns an empty list. */}
      {fleetId !== "all" && assignment === "in_cabinet" && (
        <p className="w-full flex items-start gap-1.5 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
          <Info className="h-3.5 w-3.5 mt-px shrink-0" />
          {t(
            "The fleet filter only matches batteries fitted to that fleet's motorcycles — combined with \"In Cabinet\" it always returns no results.",
            "فلتر الأسطول يطابق فقط البطاريات المركبة على دراجات ذلك الأسطول — دمجه مع \"في كابينة\" لا يعيد أي نتائج."
          )}
        </p>
      )}
    </div>
  );
}
