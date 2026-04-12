"use client";

import { Monitor, Wifi, WifiOff, Wrench } from "lucide-react";
import { Device } from "./types";
import { useLang } from "@/lib/language-context";

interface Props {
  devices: Device[];
}

export default function DevicesStats({ devices }: Props) {
  const { t, lang } = useLang();

  // Mapping API statuses to the dashboard stats
  const stats = [
    {
      label: t("Total Devices", "إجمالي الأجهزة"),
      value: devices.length,
      icon: Monitor,
      bg: "bg-indigo-50",
      color: "text-indigo-600",
      borderColor: "from-indigo-500 to-blue-500",
    },
    {
      label: t("Active", "نشط"),
      value: devices.filter((d) => d.status === "active").length,
      icon: Wifi,
      bg: "bg-emerald-50",
      color: "text-emerald-600",
      borderColor: "from-emerald-400 to-teal-500",
    },
    {
      label: t("Inactive", "غير نشط"),
      value: devices.filter((d) => d.status === "inactive").length,
      icon: WifiOff,
      bg: "bg-slate-50",
      color: "text-slate-500",
      borderColor: "from-slate-300 to-slate-500",
    },
    {
      label: t("Maintenance", "صيانة"),
      value: devices.filter((d) => d.status === "maintenance").length,
      icon: Wrench,
      bg: "bg-amber-50",
      color: "text-amber-600",
      borderColor: "from-amber-400 to-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group"
          >
            {/* Dynamic Gradient Top Bar */}
            <div className={`h-1 w-full bg-gradient-to-r ${s.borderColor} opacity-80 group-hover:opacity-100 transition-opacity`} />
            
            <div className="p-5 flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                  {s.label}
                </p>
                <p className={`text-2xl font-bold ${s.color}`}>
                  {s.value.toLocaleString(lang === "ar" ? "ar-SA" : "en-US")}
                </p>
              </div>
              
              <div className={`p-2.5 rounded-xl ${s.bg} transition-transform group-hover:scale-110 duration-300`}>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}