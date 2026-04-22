"use client";

import { MapPin, RefreshCw, Zap } from "lucide-react";
import { Motorcycle, MotorcycleStatus } from "./types";
import { useLang } from "@/lib/language-context";

interface Props { motorcycles: Motorcycle[]; isLoading: boolean; onAssignBattery: (m: Motorcycle) => void; }

export default function MotorcyclesTable({ motorcycles, isLoading, onAssignBattery }: Props) {
  const { t, lang } = useLang();
  const isRtl = lang === "ar";
  const thCls = `px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`;

  const statusCfg: Record<MotorcycleStatus, { label: string; badge: string; dot: string }> = {
    active:      { label: t("Active","نشط"),       badge: "bg-green-50 text-green-700 border border-green-200",    dot: "bg-green-400"  },
    inactive:    { label: t("Inactive","غير نشط"),  badge: "bg-gray-50 text-gray-500 border border-gray-200",       dot: "bg-gray-400"   },
    maintenance: { label: t("Maintenance","صيانة"), badge: "bg-orange-50 text-orange-600 border border-orange-200", dot: "bg-orange-400" },
  };

  if (isLoading) return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex items-center justify-center gap-2 text-gray-400 text-sm">
      <RefreshCw className="h-4 w-4 animate-spin" /> {t("Loading motorcycles…","جارٍ تحميل الدراجات…")}
    </div>
  );

  if (motorcycles.length === 0) return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-400 text-sm">
      {t("No motorcycles found.","لا توجد دراجات.")}
    </div>
  );

  const headers = [
    t("Device ID","معرف الجهاز"),
    t("Status","الحالة"),
    t("Battery","البطارية"),
    t("Driver","السائق"),
    t("Fleet","الأسطول"),
    t("Location","الموقع"),
    t("Battery Type","نوع البطارية"),
    t("Actions","الإجراءات"),
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full" dir={isRtl ? "rtl" : "ltr"}>
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {headers.map((h, i) => <th key={i} className={thCls}>{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {motorcycles.map((m) => {
              const cfg = statusCfg[m.status];
              return (
                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-mono text-sm font-semibold text-gray-800">{m.device_id}</p>
                    {m.plate_number && <p className="text-xs text-gray-400">{m.plate_number}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {m.battery ? (
                      <div>
                        <p className="text-xs font-semibold text-gray-700">{m.battery.battery_id}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
                            <div className={`h-full rounded-full ${m.battery.battery_percentage >= 60 ? "bg-green-500" : m.battery.battery_percentage >= 30 ? "bg-yellow-500" : "bg-red-500"}`}
                              style={{ width: `${m.battery.battery_percentage}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{m.battery.battery_percentage}%</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">SOH: {m.battery.soh}% · {m.battery.cycle_count} {t("cycles","دورة")}</p>
                      </div>
                    ) : <span className="text-xs text-gray-300 italic">{t("No battery","لا توجد بطارية")}</span>}
                  </td>
                  <td className="px-4 py-3">
                    {m.assigned_user ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
                          {m.assigned_user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-700">{m.assigned_user.name}</p>
                          <p className="text-[10px] text-gray-400">{m.assigned_user.phone}</p>
                        </div>
                      </div>
                    ) : <span className="text-xs text-gray-300 italic">{t("Unassigned","غير مسند")}</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {m.fleet_id ? `${t("Fleet","أسطول")} #${m.fleet_id}` : <span className="text-gray-300 italic text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-1">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">{m.city ?? "—"}</p>
                        <p className="text-[10px] text-gray-400">{m.address ?? ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-purple-50 text-purple-600 border border-purple-100">{m.battery_type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => onAssignBattery(m)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition whitespace-nowrap">
                      <Zap className="h-3.5 w-3.5" />
                      {m.battery ? t("Reassign Battery","إعادة تعيين البطارية") : t("Assign Battery","تعيين البطارية")}
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
        {motorcycles.map((m) => {
          const cfg = statusCfg[m.status];
          return (
            <div key={m.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm font-semibold text-gray-800">{m.device_id}</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 rounded-lg p-3">
                <div><p className="text-gray-400">{t("Driver","السائق")}</p><p className="font-medium text-gray-700">{m.assigned_user?.name ?? t("Unassigned","غير مسند")}</p></div>
                <div><p className="text-gray-400">{t("Fleet","الأسطول")}</p><p className="font-medium text-gray-700">{m.fleet_id ? `#${m.fleet_id}` : "—"}</p></div>
                <div><p className="text-gray-400">{t("Battery","البطارية")}</p><p className="font-medium text-gray-700">{m.battery ? `${m.battery.battery_id} · ${m.battery.battery_percentage}%` : t("None","لا يوجد")}</p></div>
                <div><p className="text-gray-400">{t("City","المدينة")}</p><p className="font-medium text-gray-700">{m.city ?? "—"}</p></div>
              </div>
              <button onClick={() => onAssignBattery(m)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-indigo-200 text-indigo-600 text-xs font-medium hover:bg-indigo-50 transition">
                <Zap className="h-3.5 w-3.5" />
                {m.battery ? t("Reassign Battery","إعادة تعيين البطارية") : t("Assign Battery","تعيين البطارية")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}