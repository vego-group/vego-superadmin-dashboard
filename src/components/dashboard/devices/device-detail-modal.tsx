"use client";

import { X, Battery, Zap, MapPin, Calendar, Layers, Activity } from "lucide-react";
import { Device } from "./types";
import { useLang } from "@/lib/language-context";

interface Props { device: Device | null; onClose: () => void; }

export default function DeviceDetailModal({ device, onClose }: Props) {
  const { t, lang } = useLang();
  if (!device) return null;

  const isRtl = lang === "ar";
  const isCabinet = device.type === "cabinet";

  const statusCfg: Record<string, string> = {
    active:      "bg-emerald-50 text-emerald-700 border-emerald-200",
    inactive:    "bg-slate-50 text-slate-600 border-slate-200",
    maintenance: "bg-amber-50 text-amber-700 border-amber-200",
    error:       "bg-rose-50 text-rose-700 border-rose-200",
  };
  const status = device.status?.toLowerCase() || "inactive";
  const statusLabel: Record<string, string> = {
    active: t("Active", "نشط"),
    inactive: t("Inactive", "غير نشط"),
    maintenance: t("Maintenance", "صيانة"),
    error: t("Error", "خطأ"),
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString(isRtl ? "ar-SA" : "en-GB") : t("N/A", "غير متوفر");

  const rows = [
    {
      label: t("Type", "النوع"),
      value: isCabinet ? t("Battery Swap", "تبديل بطاريات") : t("Fast Charging", "شحن سريع"),
      icon: isCabinet ? <Battery className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />,
    },
    {
      label: t("Location", "الموقع"),
      value: [device.city, device.location].filter(Boolean).join(" · ") || "—",
      icon: <MapPin className="h-3.5 w-3.5" />,
    },
    {
      label: t("Capacity", "السعة"),
      value: `${isCabinet ? (device.availableSlots ?? 0) : device.slots} / ${device.slots} ${isCabinet ? t("Bat.", "بطارية") : t("Ports", "منفذ")}`,
      icon: <Layers className="h-3.5 w-3.5" />,
    },
    ...(device.uptime != null
      ? [{ label: t("Uptime", "وقت التشغيل"), value: `${device.uptime}%`, icon: <Activity className="h-3.5 w-3.5" /> }]
      : []),
    {
      label: t("Registered", "تاريخ التسجيل"),
      value: formatDate(device.createdAt),
      icon: <Calendar className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 w-full bg-gradient-to-r from-indigo-600 to-violet-600" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCabinet ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-600"}`}>
              {isCabinet ? <Battery className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 font-mono">{device.id}</h3>
              <p className="text-xs text-gray-400">{device.name || t("Unnamed Device", "جهاز بدون اسم")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusCfg[status] || statusCfg.inactive}`}>
              {statusLabel[status] || status}
            </span>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-3 gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">{row.icon}{row.label}</div>
                <p className="text-xs font-semibold text-gray-700 text-right truncate">{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
            {t("Close", "إغلاق")}
          </button>
        </div>
      </div>
    </div>
  );
}
