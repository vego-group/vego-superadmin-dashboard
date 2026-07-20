"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, RefreshCw, Battery as BatteryIcon, History, Repeat,
  Bike, Warehouse, AlertTriangle, Flag, Archive, RotateCcw,
  ArrowDownToLine, ArrowUpFromLine, StickyNote,
} from "lucide-react";
import { BatterySwapHistoryEntry } from "@/types/dashboard/battery";
import { useBatteryHistory, useBatteryRow } from "@/hooks/use-batteries";
import { batteriesApi } from "../battery-api";
import LifecycleBadge from "../lifecycle-badge";
import BatteryStatusModal, { LifecycleAction } from "../battery-status-modal";
import { useLang } from "@/lib/language-context";

const formatDateTime = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    + " · "
    + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

const motorcycleLabel = (m: BatterySwapHistoryEntry["motorcycle"]): string => {
  if (!m) return "—";
  return m.plate_number ?? ([m.brand, m.model].filter(Boolean).join(" ") || `#${m.id}`);
};

interface Props {
  batteryId: string;
  /** battery_id string from the list link (?bid=…) — lets the full-row fetch
   *  run in parallel with the history call instead of waiting for it. */
  batteryIdHint?: string | null;
}

export default function BatteryDetail({ batteryId, batteryIdHint = null }: Props) {
  const { t } = useLang();
  const router = useRouter();
  const { history, isLoading, error, fetchHistory } = useBatteryHistory(batteryId);
  const [statusAction, setStatusAction] = useState<LifecycleAction | null>(null);
  const [notesExpanded, setNotesExpanded] = useState(false);

  const battery = history?.battery ?? null;

  // The /history snapshot omits soh/capacity/cycles/notes/type/charge — merge
  // them in from the full list row. History stays the source of truth for the
  // fields it does carry.
  const rowLookupId = batteryIdHint ?? battery?.battery_id ?? null;
  const { row, isLoading: rowLoading, error: rowError } = useBatteryRow(rowLookupId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-gray-400 text-sm">
        <RefreshCw className="h-4 w-4 animate-spin" /> {t("Loading battery…", "جارٍ تحميل البطارية…")}
      </div>
    );
  }

  if (error || !battery) {
    return (
      <div className="py-24 text-center space-y-3">
        <p className="text-sm text-gray-500">{error ?? t("Battery not found", "البطارية غير موجودة")}</p>
        <button onClick={() => router.back()} className="text-sm text-indigo-600 hover:underline">
          {t("Go back", "رجوع")}
        </button>
      </div>
    );
  }

  const assignmentLabels: Record<typeof battery.assignment, string> = {
    in_motorcycle: t("In Motorcycle", "في دراجة"),
    in_cabinet: t("In Cabinet", "في كابينة"),
    unassigned: t("Unassigned", "غير معينة"),
  };

  // From /history — the source of truth for status/assignment/location.
  const snapshot: { label: string; value: React.ReactNode }[] = [
    { label: t("Operational Status", "الحالة التشغيلية"), value: battery.status || "—" },
    { label: t("Assignment", "التعيين"), value: assignmentLabels[battery.assignment] },
    {
      label: t("Current Motorcycle", "الدراجة الحالية"),
      value: battery.current_motorcycle
        ? (battery.current_motorcycle.plate_number ?? `#${battery.current_motorcycle.id}`)
        : "—",
    },
    {
      label: t("Current Cabinet", "الكابينة الحالية"),
      value: battery.current_cabinet
        ? `${battery.current_cabinet.cabinet_id ?? `#${battery.current_cabinet.id}`}${
            battery.current_cabinet.box_no != null ? ` · ${t("Box", "صندوق")} ${battery.current_cabinet.box_no}` : ""
          }`
        : "—",
    },
  ];

  // Merged in from the full list row (fields /history doesn't carry).
  const rowLabels = [
    t("Type", "النوع"),
    t("Charge", "الشحن"),
    t("SoH", "الحالة الصحية"),
    t("Capacity", "السعة"),
    t("Cycle Count", "عدد الدورات"),
  ];
  const rowSnapshot: { label: string; value: React.ReactNode }[] = row
    ? [
        { label: rowLabels[0], value: row.battery_type || "—" },
        { label: rowLabels[1], value: `${row.battery_percentage}%` },
        // soh is a decimal string ("98.50") — rendered raw for exact display.
        { label: rowLabels[2], value: row.soh != null ? `${row.soh}%` : "—" },
        { label: rowLabels[3], value: row.capacity_ah != null ? `${row.capacity_ah} Ah` : "—" },
        { label: rowLabels[4], value: row.cycle_count },
      ]
    : [];

  const longNotes = (row?.notes?.length ?? 0) > 180;

  const eventCfg: Record<BatterySwapHistoryEntry["event"], { label: string; cls: string; Icon: typeof ArrowDownToLine }> = {
    returned_to_cabinet: {
      label: t("Returned", "أُعيدت"),
      cls: "bg-purple-50 text-purple-600 border border-purple-100",
      Icon: ArrowDownToLine,
    },
    dispensed_to_motorcycle: {
      label: t("Dispensed", "صُرفت"),
      cls: "bg-indigo-50 text-indigo-600 border border-indigo-100",
      Icon: ArrowUpFromLine,
    },
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 font-mono">{battery.battery_id}</h1>
              <LifecycleBadge status={battery.lifecycle_status} />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {t("Battery lifecycle & swap history", "دورة حياة البطارية وسجل التبديل")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetchHistory}
            className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition">
            <RefreshCw className="h-4 w-4" />
          </button>
          {battery.lifecycle_status === "active" && (
            <button onClick={() => setStatusAction("flag")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-yellow-200 text-yellow-600 text-sm font-medium hover:bg-yellow-50 transition">
              <Flag className="h-4 w-4" />{t("Flag for review", "قيد المراجعة")}
            </button>
          )}
          {(battery.lifecycle_status === "active" || battery.lifecycle_status === "under_review") && (
            <button onClick={() => setStatusAction("retire")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition">
              <Archive className="h-4 w-4" />{t("Retire", "إخراج من الخدمة")}
            </button>
          )}
          {(battery.lifecycle_status === "under_review" || battery.lifecycle_status === "retired") && (
            <button onClick={() => setStatusAction("reinstate")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-green-200 text-green-600 text-sm font-medium hover:bg-green-50 transition">
              <RotateCcw className="h-4 w-4" />{t("Reinstate", "إعادة للخدمة")}
            </button>
          )}
        </div>
      </div>

      {/* Snapshot */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
        <div className="p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BatteryIcon className="h-4 w-4 text-indigo-600" />{t("Snapshot", "لمحة عامة")}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {snapshot.map((s) => (
              <div key={s.label}>
                <p className="text-xs text-gray-400">{s.label}</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">{s.value}</p>
              </div>
            ))}

            {/* Extra fields from the list row — skeletons while it resolves. */}
            {rowLoading && !row
              ? rowLabels.map((label) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400">{label}</p>
                    <div className="h-5 w-14 bg-gray-200 rounded animate-pulse mt-1" />
                  </div>
                ))
              : rowSnapshot.map((s) => (
                  <div key={s.label}>
                    <p className="text-xs text-gray-400">{s.label}</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{s.value}</p>
                  </div>
                ))}
          </div>

          {rowError && (
            <p className="mt-3 text-xs text-gray-400">
              {t("Unable to load additional details (SoH, capacity, notes).", "تعذر تحميل التفاصيل الإضافية (الحالة الصحية، السعة، الملاحظات).")}
            </p>
          )}

          {battery.physical_damage && (
            <p className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-red-50 text-red-600 border border-red-200">
              <AlertTriangle className="h-3.5 w-3.5" />{t("Physical damage reported", "تم الإبلاغ عن تلف مادي")}
            </p>
          )}

          {row?.notes && (
            <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2">
              <StickyNote className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className={`text-sm text-gray-600 whitespace-pre-wrap break-words ${!notesExpanded && longNotes ? "line-clamp-3" : ""}`}>
                  {row.notes}
                </p>
                {longNotes && (
                  <button onClick={() => setNotesExpanded((p) => !p)}
                    className="text-xs text-indigo-600 hover:underline mt-1">
                    {notesExpanded ? t("Show less", "عرض أقل") : t("Show more", "عرض المزيد")}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status history timeline */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
          <div className="p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <History className="h-4 w-4 text-indigo-600" />{t("Status History", "سجل الحالات")}
            </h3>
            {history!.status_history.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">{t("No lifecycle transitions yet.", "لا توجد تحولات بعد.")}</p>
            ) : (
              <ol className="relative border-s border-gray-200 ms-2 space-y-5">
                {history!.status_history.map((e, i) => (
                  <li key={i} className="ms-5">
                    <span className="absolute -start-[5px] mt-1.5 w-2.5 h-2.5 rounded-full bg-indigo-400 ring-4 ring-indigo-50" />
                    <div className="flex items-center gap-2 flex-wrap">
                      {e.from_status && <LifecycleBadge status={e.from_status} />}
                      {e.from_status && <span className="text-gray-300 text-xs">→</span>}
                      <LifecycleBadge status={e.to_status} />
                    </div>
                    {e.reason && <p className="text-sm text-gray-600 mt-1">{e.reason}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {e.changed_by ? `${e.changed_by.name} · ` : ""}{formatDateTime(e.at)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Swap history — one row per event (return OR dispense), newest first */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
          <div className="p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Repeat className="h-4 w-4 text-indigo-600" />{t("Swap History", "سجل التبديل")}
            </h3>
            {history!.swap_history.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">{t("No swaps recorded yet.", "لا توجد عمليات تبديل بعد.")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                      <th className="text-start py-2 pe-3 font-medium">{t("Date", "التاريخ")}</th>
                      <th className="text-start py-2 pe-3 font-medium">{t("Event", "الحدث")}</th>
                      <th className="text-start py-2 pe-3 font-medium">{t("Cabinet / Slot", "الكابينة / الفتحة")}</th>
                      <th className="text-start py-2 font-medium">{t("Motorcycle", "الدراجة")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {history!.swap_history.map((s, i) => {
                      const ev = eventCfg[s.event];
                      const EvIcon = ev.Icon;
                      return (
                        <tr key={i}>
                          <td className="py-2.5 pe-3 text-gray-600 whitespace-nowrap text-xs">
                            {formatDateTime(s.at)}
                          </td>
                          <td className="py-2.5 pe-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${ev.cls}`}>
                              <EvIcon className="h-3 w-3" />{ev.label}
                            </span>
                          </td>
                          <td className="py-2.5 pe-3 text-gray-700">
                            {s.cabinet ? (s.cabinet.name ?? s.cabinet.cabinet_id ?? `#${s.cabinet.id}`) : "—"}
                            <span className="text-xs text-gray-400">
                              {" · "}{t("Slot", "فتحة")} {s.slot_number != null ? s.slot_number : "—"}
                            </span>
                          </td>
                          <td className="py-2.5 text-gray-700">
                            {s.motorcycle ? (
                              <span className="font-mono text-xs">{motorcycleLabel(s.motorcycle)}</span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Touched motorcycles / cabinets — trace where a bad battery has been */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
          <div className="p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Bike className="h-4 w-4 text-indigo-600" />
              {t("Motorcycles Touched", "الدراجات التي استخدمتها")}
              <span className="text-xs text-gray-400 font-normal">({history!.motorcycles.length})</span>
            </h3>
            {history!.motorcycles.length === 0 ? (
              <p className="text-sm text-gray-400">{t("None recorded.", "لا يوجد.")}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {history!.motorcycles.map((m) => (
                  <span key={m.id} className="px-2.5 py-1 rounded-full text-xs font-mono bg-indigo-50 text-indigo-600 border border-indigo-100">
                    {m.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
          <div className="p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-indigo-600" />
              {t("Cabinets Touched", "الكابينات التي مرت بها")}
              <span className="text-xs text-gray-400 font-normal">({history!.cabinets.length})</span>
            </h3>
            {history!.cabinets.length === 0 ? (
              <p className="text-sm text-gray-400">{t("None recorded.", "لا يوجد.")}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {history!.cabinets.map((c) => (
                  <Link key={c.id} href={`/dashboard/cabinets/battery-swapping/${c.id}`}
                    className="px-2.5 py-1 rounded-full text-xs bg-purple-50 text-purple-600 border border-purple-100 hover:bg-purple-100 transition">
                    {c.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {statusAction && (
        <BatteryStatusModal
          battery={battery}
          action={statusAction}
          onSubmit={(payload) => batteriesApi.updateStatus(battery.id, payload)}
          onClose={() => setStatusAction(null)}
          onSuccess={() => { setStatusAction(null); fetchHistory(); }}
        />
      )}
    </div>
  );
}
