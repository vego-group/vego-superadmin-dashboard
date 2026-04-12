"use client";

import { useState } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { useLang } from "@/lib/language-context";
import {
  AlertCircle, CheckCircle2, ChevronLeft, ChevronRight,
  Search, Filter, ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const ALARM_TYPE_LABELS: Record<string, { en: string; ar: string; color: string }> = {
  overvoltage:      { en: "Overvoltage",       ar: "جهد زائد",          color: "bg-red-50 text-red-700"      },
  vehicle_fault:    { en: "Vehicle Fault",     ar: "عطل مركبة",         color: "bg-orange-50 text-orange-700"},
  low_battery:      { en: "Low Battery",       ar: "بطارية منخفضة",     color: "bg-amber-50 text-amber-700"  },
  firmware_update:  { en: "Firmware Update",   ar: "تحديث البرنامج",    color: "bg-purple-50 text-purple-700"},
  motor_fault:      { en: "Motor Fault",       ar: "عطل المحرك",        color: "bg-red-50 text-red-700"      },
  brake_fault:      { en: "Brake Fault",       ar: "عطل الفرامل",       color: "bg-orange-50 text-orange-700"},
  rear_wheel_lock:  { en: "Rear Wheel Lock",   ar: "قفل العجلة الخلفية",color: "bg-yellow-50 text-yellow-700"},
};

export default function AlarmsPage() {
  const { alarms, isLoadingAlarms, resolveAlarm, pagination, currentPage, goToPage, changeStatusFilter } = useDashboard();
  const { t, lang } = useLang();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = alarms.filter((alarm) => {
    const q = searchTerm.toLowerCase();
    return (
      alarm.iot_device?.serial?.toLowerCase().includes(q) ||
      alarm.iot_device?.device_id?.toLowerCase().includes(q) ||
      alarm.alarm_type?.toLowerCase().includes(q)
    );
  });

  const getAlarmLabel = (type: string) => {
    const cfg = ALARM_TYPE_LABELS[type];
    if (!cfg) return { label: type.replace(/_/g, " "), color: "bg-gray-50 text-gray-700" };
    return { label: lang === "ar" ? cfg.ar : cfg.en, color: cfg.color };
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" />
          {t("Back to Dashboard", "العودة للرئيسية")}
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900">
          {t("Alarms Management", "إدارة التنبيهات")}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {t("View and manage all IOT device alerts", "عرض وإدارة جميع تنبيهات أجهزة إنترنت الأشياء")}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t("Search by Serial or Type...", "ابحث بالرقم التسلسلي أو النوع...")}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-gray-400 hidden md:block" />
          <select
            className="w-full md:w-48 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => changeStatusFilter(e.target.value as "all" | "unresolved" | "resolved")}
          >
            <option value="all">{t("All Status", "كل الحالات")}</option>
            <option value="unresolved">{t("Active (Unresolved)", "نشط (غير محلول)")}</option>
            <option value="resolved">{t("Resolved", "محلول")}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{t("Device Info", "معلومات الجهاز")}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{t("Alarm Type", "نوع التنبيه")}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{t("Date & Time", "التاريخ والوقت")}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{t("Status", "الحالة")}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">{t("Actions", "إجراءات")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingAlarms ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-5">
                        <div className="h-4 bg-gray-100 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400">
                    <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">{t("No alarms found", "لا توجد تنبيهات")}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((alarm) => {
                  const { label, color } = getAlarmLabel(alarm.alarm_type);
                  return (
                    <tr key={alarm.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 text-sm">{alarm.iot_device?.serial ?? "—"}</p>
                        <p className="text-[11px] text-gray-500 font-mono uppercase">{alarm.iot_device?.device_id ?? "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${color}`}>
                          {label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 font-medium">
                          {new Date(alarm.recorded_at).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-GB")}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(alarm.recorded_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {alarm.status === "unresolved" ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                            <span className="h-1.5 w-1.5 bg-red-600 rounded-full animate-pulse" />
                            {t("ACTIVE", "نشط")}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {t("RESOLVED", "محلول")}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {alarm.status === "unresolved" && (
                          <button
                            onClick={() => resolveAlarm(alarm.id)}
                            className="border border-indigo-200 text-indigo-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                          >
                            {t("Resolve", "حل")}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-medium text-gray-500">
            {t("Showing", "عرض")} {filtered.length} {t("of", "من")} {pagination?.total ?? 0} {t("entries", "إدخال")}
          </span>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={!pagination?.prev_page_url}
              className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-30 transition"
              aria-label={t("Previous page", "الصفحة السابقة")}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {(() => {
              const total = pagination?.last_page ?? 1;
              const pages: (number | "...")[] = [];

              if (total <= 7) {
                for (let i = 1; i <= total; i++) pages.push(i);
              } else {
                pages.push(1);

                if (currentPage > 4) pages.push("...");

                const start = Math.max(2, currentPage - 1);
                const end   = Math.min(total - 1, currentPage + 1);
                for (let i = start; i <= end; i++) pages.push(i);

                if (currentPage < total - 3) pages.push("...");

                pages.push(total);
              }

              return pages.map((page, idx) =>
                page === "..." ? (
                  <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page as number)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                      page === currentPage
                        ? "bg-indigo-600 text-white border border-indigo-600"
                        : "border border-gray-200 text-gray-600 hover:bg-white"
                    }`}
                  >
                    {page}
                  </button>
                )
              );
            })()}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={!pagination?.next_page_url}
              className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-30 transition"
              aria-label={t("Next page", "الصفحة التالية")}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}