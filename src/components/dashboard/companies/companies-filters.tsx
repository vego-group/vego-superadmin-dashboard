"use client";

import { Search } from "lucide-react";
import { CompanyStatus } from "./types";
import { useLang } from "@/lib/language-context";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: CompanyStatus | "all";
  onStatusChange: (v: CompanyStatus | "all") => void;
}

export default function CompaniesFilters({ search, onSearchChange, statusFilter, onStatusChange }: Props) {
  const { t } = useLang();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t(
            "Search by company, contact, phone or CR no…",
            "ابحث بالشركة أو جهة الاتصال أو الهاتف أو الرقم التجاري…"
          )}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-indigo-300 transition-colors"
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as CompanyStatus | "all")}
        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:border-indigo-300 cursor-pointer"
      >
        <option value="all">{t("All Status", "كل الحالات")}</option>
        <option value="approved">{t("Approved", "موافق")}</option>
        <option value="pending">{t("Pending", "معلق")}</option>
        <option value="rejected">{t("Rejected", "مرفوض")}</option>
        <option value="suspended">{t("Suspended", "موقوف")}</option>
      </select>
    </div>
  );
}