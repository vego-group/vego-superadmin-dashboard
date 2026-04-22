"use client";

import { Search } from "lucide-react";
import { MotorcycleStatus } from "./types";
import { useLang } from "@/lib/language-context";

interface Props {
  search: string; onSearchChange: (v: string) => void;
  statusFilter: MotorcycleStatus | "all"; onStatusChange: (v: MotorcycleStatus | "all") => void;
}

export default function MotorcyclesFilters({ search, onSearchChange, statusFilter, onStatusChange }: Props) {
  const { t } = useLang();
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("Search by device ID, driver, battery or city…", "ابحث بمعرف الجهاز أو السائق أو البطارية أو المدينة…")}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-indigo-300 transition" />
      </div>
      <select value={statusFilter} onChange={(e) => onStatusChange(e.target.value as MotorcycleStatus | "all")}
        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:border-indigo-300 cursor-pointer">
        <option value="all">{t("All Status", "كل الحالات")}</option>
        <option value="active">{t("Active", "نشط")}</option>
        <option value="inactive">{t("Inactive", "غير نشط")}</option>
        <option value="maintenance">{t("Maintenance", "صيانة")}</option>
      </select>
    </div>
  );
}