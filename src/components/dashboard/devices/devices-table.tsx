"use client";

import { useState } from "react";
import { Eye, Battery, Zap, MapPin, Calendar } from "lucide-react";
import { Device } from "./types";
import { useLang } from "@/lib/language-context";

const ITEMS_PER_PAGE = 8;

interface Props { devices: Device[]; }

export default function DevicesTable({ devices }: Props) {
  const { t, lang } = useLang();
  const isRtl = lang === "ar";
  const thCls = `py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest ${isRtl ? "text-right px-4" : "text-left px-4"}`;
  const [page, setPage] = useState(1);

  const statusCfg: Record<string, { label: string; dot: string; badge: string }> = {
    active:      { label: t("Active","نشط"),       dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    inactive:    { label: t("Inactive","غير نشط"),  dot: "bg-slate-400",   badge: "bg-slate-50 text-slate-600 border-slate-200"     },
    maintenance: { label: t("Maintenance","صيانة"), dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-700 border-amber-200"     },
    error:       { label: t("Error","خطأ"),         dot: "bg-rose-500",    badge: "bg-rose-50 text-rose-700 border-rose-200"        },
  };

  const totalPages = Math.max(1, Math.ceil(devices.length / ITEMS_PER_PAGE));
  const paginated  = devices.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("N/A","غير متوفر");
    return new Date(dateString).toLocaleDateString(isRtl ? "ar-SA" : "en-GB");
  };

  const headers = [
    t("Device Details","تفاصيل الجهاز"),
    t("Type","النوع"),
    t("Location","الموقع"),
    t("Status","الحالة"),
    t("Capacity","السعة"),
    t("Registered","تاريخ التسجيل"),
    t("Action","إجراء"),
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="h-1 w-full bg-gradient-to-r from-indigo-600 to-violet-600" />

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse" dir={isRtl ? "rtl" : "ltr"}>
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {headers.map((h, i) => <th key={i} className={i === 0 ? `${thCls} pl-6` : thCls}>{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map((device) => {
              const currentStatus = device.status?.toLowerCase() || "inactive";
              const cfg = statusCfg[currentStatus] || statusCfg.inactive;
              return (
                <tr key={device.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{device.id}</span>
                      <span className="text-xs text-gray-400 font-medium truncate max-w-[150px]">{device.name || t("Unnamed Device","جهاز بدون اسم")}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-tight ${device.type === "cabinet" ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700"}`}>
                      {device.type === "cabinet" ? <Battery className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                      {device.type === "cabinet" ? t("Cabinet","خزانة") : t("Pile","شاحن")}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-3.5 w-3.5 text-gray-300" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-none">{device.city}</span>
                        <span className="text-[11px] text-gray-400 mt-1 truncate max-w-[180px]">{device.location}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${cfg.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${cfg.dot}`} />{cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-gray-800">{device.type === "cabinet" ? (device.availableSlots ?? 0) : device.slots}</span>
                      <span className="text-xs text-gray-400 font-medium">/ {device.slots} {device.type === "cabinet" ? t("Bat.","بطارية") : t("Ports","منفذ")}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Calendar className="h-3 w-3" />{formatDate(device.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-100 bg-white text-gray-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-sm transition-all" title={t("View Details","عرض التفاصيل")}>
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-100">
        {paginated.map((device) => {
          const currentStatus = device.status?.toLowerCase() || "inactive";
          const cfg = statusCfg[currentStatus] || statusCfg.inactive;
          return (
            <div key={device.id} className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-sm font-bold text-gray-900">{device.id}</p>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mt-0.5">
                    {device.type === "cabinet" ? t("Cabinet","خزانة") : t("Pile","شاحن")}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${cfg.badge}`}>{cfg.label}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-3">
                <div><p className="text-[10px] text-gray-400 uppercase font-bold">{t("City","المدينة")}</p><p className="text-xs font-semibold text-gray-700">{device.city}</p></div>
                <div><p className="text-[10px] text-gray-400 uppercase font-bold">{t("Capacity","السعة")}</p><p className="text-xs font-semibold text-gray-700">{device.type === "cabinet" ? (device.availableSlots ?? 0) : device.slots}/{device.slots}</p></div>
                <div className="col-span-2"><p className="text-[10px] text-gray-400 uppercase font-bold">{t("Location","الموقع")}</p><p className="text-xs font-semibold text-gray-700 truncate">{device.location}</p></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50 bg-gray-50/30">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            {t("Showing","عرض")} <span className="text-gray-700">{(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, devices.length)}</span> {t("of","من")} {devices.length}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="h-8 px-3 text-[10px] font-bold uppercase tracking-tighter rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition">
              {t("Prev","السابق")}
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`h-8 w-8 text-[10px] font-bold rounded-lg transition ${page === p ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
                  {p.toLocaleString(isRtl ? "ar-SA" : "en-US")}
                </button>
              ))}
            </div>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="h-8 px-3 text-[10px] font-bold uppercase tracking-tighter rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition">
              {t("Next","التالي")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}