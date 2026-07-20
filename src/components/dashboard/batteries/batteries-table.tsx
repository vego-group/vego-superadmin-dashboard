"use client";

import Link from "next/link";
import { RefreshCw, Eye, Pencil, Flag, Archive, RotateCcw, AlertTriangle } from "lucide-react";
import { Battery, BatteryAssignment } from "@/types/dashboard/battery";
import LifecycleBadge from "./lifecycle-badge";
import { useLang } from "@/lib/language-context";
import { LifecycleAction } from "./battery-status-modal";

interface Props {
  batteries: Battery[];
  isLoading: boolean;
  onEdit: (b: Battery) => void;
  onLifecycleAction: (b: Battery, action: LifecycleAction) => void;
}

export default function BatteriesTable({ batteries, isLoading, onEdit, onLifecycleAction }: Props) {
  const { t, lang } = useLang();
  const isRtl = lang === "ar";
  const thCls = `px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`;

  const assignmentCfg: Record<BatteryAssignment, { label: string; cls: string }> = {
    in_motorcycle: { label: t("In Motorcycle", "في دراجة"), cls: "bg-indigo-50 text-indigo-600 border border-indigo-100" },
    in_cabinet:    { label: t("In Cabinet", "في كابينة"),   cls: "bg-purple-50 text-purple-600 border border-purple-100" },
    unassigned:    { label: t("Unassigned", "غير معينة"),   cls: "bg-gray-50 text-gray-500 border border-gray-200" },
  };

  if (isLoading) return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex items-center justify-center gap-2 text-gray-400 text-sm">
      <RefreshCw className="h-4 w-4 animate-spin" /> {t("Loading batteries…", "جارٍ تحميل البطاريات…")}
    </div>
  );

  if (batteries.length === 0) return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-400 text-sm">
      {t("No batteries found.", "لا توجد بطاريات.")}
    </div>
  );

  const headers = [
    t("Battery ID", "معرف البطارية"),
    t("Type", "النوع"),
    t("Lifecycle", "دورة الحياة"),
    t("Assignment", "التعيين"),
    t("SoH", "الحالة الصحية"),
    t("Capacity (Ah)", "السعة (أمبير)"),
    t("Cycles", "الدورات"),
    t("Damage", "التلف"),
    t("Actions", "الإجراءات"),
  ];

  const renderActions = (b: Battery, compact = false) => {
    const btnCls = compact
      ? "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition"
      : "p-1.5 rounded-lg border transition";
    return (
      <>
        {/* bid lets the detail page fetch the full row in parallel with history
            (the list `search` filter needs the battery_id string, not the id). */}
        <Link href={`/dashboard/batteries/${b.id}?bid=${encodeURIComponent(b.battery_id)}`} title={t("View history", "عرض السجل")}
          className={`${btnCls} border-gray-200 text-gray-500 hover:bg-gray-50`}>
          <Eye className="h-3.5 w-3.5" />{compact && t("View", "عرض")}
        </Link>
        <button onClick={() => onEdit(b)} title={t("Edit", "تعديل")}
          className={`${btnCls} border-indigo-200 text-indigo-600 hover:bg-indigo-50`}>
          <Pencil className="h-3.5 w-3.5" />{compact && t("Edit", "تعديل")}
        </button>
        {b.lifecycle_status === "active" && (
          <button onClick={() => onLifecycleAction(b, "flag")} title={t("Flag for review", "وضع قيد المراجعة")}
            className={`${btnCls} border-yellow-200 text-yellow-600 hover:bg-yellow-50`}>
            <Flag className="h-3.5 w-3.5" />{compact && t("Flag", "مراجعة")}
          </button>
        )}
        {(b.lifecycle_status === "active" || b.lifecycle_status === "under_review") && (
          <button onClick={() => onLifecycleAction(b, "retire")} title={t("Retire / Decommission", "إخراج من الخدمة")}
            className={`${btnCls} border-red-200 text-red-500 hover:bg-red-50`}>
            <Archive className="h-3.5 w-3.5" />{compact && t("Retire", "إخراج")}
          </button>
        )}
        {(b.lifecycle_status === "under_review" || b.lifecycle_status === "retired") && (
          <button onClick={() => onLifecycleAction(b, "reinstate")} title={t("Reinstate", "إعادة للخدمة")}
            className={`${btnCls} border-green-200 text-green-600 hover:bg-green-50`}>
            <RotateCcw className="h-3.5 w-3.5" />{compact && t("Reinstate", "إعادة")}
          </button>
        )}
      </>
    );
  };

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
            {batteries.map((b) => {
              const asg = assignmentCfg[b.assignment];
              // soh is a decimal string ("98.50") — parse only for the color threshold.
              const sohNum = b.soh != null ? parseFloat(b.soh) : NaN;
              return (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-mono text-sm font-semibold text-gray-800">{b.battery_id}</p>
                    <p className="text-[10px] text-gray-400">{b.battery_percentage}% · {b.status || "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-purple-50 text-purple-600 border border-purple-100">{b.battery_type || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <LifecycleBadge status={b.lifecycle_status} />
                    {b.lifecycle_status === "retired" && b.decommission_reason && (
                      <p className="text-[10px] text-gray-400 mt-1 max-w-[180px] truncate" title={b.decommission_reason}>
                        {b.decommission_reason}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${asg.cls}`}>{asg.label}</span>
                    {b.assignment === "in_motorcycle" && b.motorcycle_id !== null && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{t("Motorcycle", "دراجة")} #{b.motorcycle_id}</p>
                    )}
                    {b.assignment === "in_cabinet" && b.cabinet_id !== null && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{t("Cabinet", "كابينة")} #{b.cabinet_id}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {b.soh != null ? (
                      <span className={`text-sm font-semibold ${sohNum >= 85 ? "text-green-600" : sohNum >= 70 ? "text-yellow-600" : "text-red-500"}`}>
                        {b.soh}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{b.capacity_ah ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{b.cycle_count}</td>
                  <td className="px-4 py-3">
                    {b.physical_damage ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-600 border border-red-200">
                        <AlertTriangle className="h-3 w-3" />{t("Damaged", "تالفة")}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">{renderActions(b)}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-100">
        {batteries.map((b) => {
          const asg = assignmentCfg[b.assignment];
          return (
            <div key={b.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm font-semibold text-gray-800">{b.battery_id}</p>
                <LifecycleBadge status={b.lifecycle_status} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 rounded-lg p-3">
                <div><p className="text-gray-400">{t("Type", "النوع")}</p><p className="font-medium text-gray-700">{b.battery_type || "—"}</p></div>
                <div><p className="text-gray-400">{t("Assignment", "التعيين")}</p><p className="font-medium text-gray-700">{asg.label}</p></div>
                <div><p className="text-gray-400">{t("SoH", "الحالة الصحية")}</p><p className="font-medium text-gray-700">{b.soh != null ? `${b.soh}%` : "—"} · {b.cycle_count} {t("cycles", "دورة")}</p></div>
                <div><p className="text-gray-400">{t("Capacity", "السعة")}</p><p className="font-medium text-gray-700">{b.capacity_ah != null ? `${b.capacity_ah} Ah` : "—"}</p></div>
              </div>
              {b.physical_damage && (
                <p className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-600 border border-red-200">
                  <AlertTriangle className="h-3 w-3" />{t("Physical damage", "تلف مادي")}
                </p>
              )}
              <div className="flex gap-2">{renderActions(b, true)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
