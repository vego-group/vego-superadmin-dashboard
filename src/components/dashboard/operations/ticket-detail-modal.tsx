"use client";

import { useState } from "react";
import { Wrench, Loader2, X, AlertCircle, History } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { MaintenanceTicket, MaintenanceStatus } from "@/types/dashboard/maintenance";

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface Props {
  ticket: MaintenanceTicket | null;
  onUpdateStatus: (id: number, status: MaintenanceStatus, note?: string) => Promise<void>;
  onClose: () => void;
}

export default function TicketDetailModal({ ticket, onUpdateStatus, onClose }: Props) {
  const { t } = useLang();
  const [newStatus, setNewStatus] = useState<MaintenanceStatus | "">("");
  const [note, setNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ticket) return null;

  const statusConfig: Record<MaintenanceStatus, { label: string; cls: string }> = {
    open: { label: t("Open", "مفتوحة"), cls: "bg-blue-100 text-blue-700" },
    in_progress: { label: t("In Progress", "قيد التنفيذ"), cls: "bg-yellow-100 text-yellow-700" },
    resolved: { label: t("Resolved", "تم الحل"), cls: "bg-green-100 text-green-700" },
  };

  const priorityLabels: Record<string, string> = {
    low: t("Low", "منخفضة"),
    medium: t("Medium", "متوسطة"),
    high: t("High", "عالية"),
    urgent: t("Urgent", "عاجلة"),
  };

  // Only forward transitions make sense to offer.
  const nextStatuses: MaintenanceStatus[] =
    ticket.status === "open" ? ["in_progress", "resolved"]
    : ticket.status === "in_progress" ? ["resolved"]
    : [];

  const handleUpdate = async () => {
    if (!newStatus) return;
    setIsUpdating(true);
    setError(null);
    try {
      await onUpdateStatus(ticket.id, newStatus, note);
      setNewStatus("");
      setNote("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Failed to update status", "فشل تحديث الحالة"));
    } finally {
      setIsUpdating(false);
    }
  };

  const sCfg = statusConfig[ticket.status];

  const row = (label: string, value: string | null) => (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-xs font-medium text-gray-700 text-end">{value ?? "—"}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 w-full bg-gradient-to-r from-[#1C1FC1] to-[#3E1596]" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50">
              <Wrench className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{ticket.ticket_number}</h3>
              <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${sCfg.cls}`}>
                {sCfg.label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Ticket info */}
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            {row(t("Motorcycle", "الدراجة"), ticket.motorcycle?.plate_number ?? ticket.motorcycle?.device_id ?? `#${ticket.motorcycle_id}`)}
            {row(t("Model", "الموديل"), [ticket.motorcycle?.brand, ticket.motorcycle?.model].filter(Boolean).join(" ") || null)}
            {ticket.fleet_name && row(t("Fleet", "الشركة"), ticket.fleet_name)}
            {ticket.driver_name && row(t("Driver", "السائق"), ticket.driver_name)}
            {row(t("Issue Type", "نوع العطل"), ticket.issue_type)}
            {row(t("Priority", "الأولوية"), priorityLabels[ticket.priority] ?? ticket.priority)}
            {row(t("Created", "تاريخ الإنشاء"), formatDate(ticket.created_at))}
            {ticket.resolved_at && row(t("Resolved", "تاريخ الحل"), formatDate(ticket.resolved_at))}
            {ticket.resolved_by && row(t("Resolved By", "تم الحل بواسطة"), ticket.resolved_by)}
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">{t("Description", "الوصف")}</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description || "—"}</p>
          </div>

          {/* History */}
          {ticket.history.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
                <History className="h-3.5 w-3.5" />
                {t("History", "السجل")}
              </p>
              <div className="space-y-2">
                {ticket.history.map((h, i) => {
                  const hCfg = statusConfig[h.status] ?? statusConfig.open;
                  return (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl border border-gray-100">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0 ${hCfg.cls}`}>
                        {hCfg.label}
                      </span>
                      <div className="min-w-0">
                        {h.note && <p className="text-xs text-gray-700">{h.note}</p>}
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {[h.by, formatDate(h.created_at)].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status update */}
          {nextStatuses.length > 0 && (
            <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-3">
              <p className="text-xs font-semibold text-gray-700">
                {t("Update Status", "تحديث الحالة")}
              </p>

              {error && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                {nextStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => setNewStatus(s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border transition ${
                      newStatus === s
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    {statusConfig[s].label}
                  </button>
                ))}
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder={t("Add a note (optional)…", "أضف ملاحظة (اختياري)…")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition resize-none"
              />

              <button
                onClick={handleUpdate}
                disabled={!newStatus || isUpdating}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("Updating…", "جارٍ التحديث…")}
                  </>
                ) : (
                  t("Save", "حفظ")
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
