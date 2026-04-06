"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Slot } from "./mock-data";
import { API_ENDPOINTS, authHeaders } from "@/config/api";

interface Props {
  slot: Slot;
  cabinetId: string; // ← محتاجه عشان الـ API
}

type SlotAction = "reserve" | "disable" | "release";

export default function SlotDetail({ slot, cabinetId }: Props) {
  const [loading, setLoading] = useState<SlotAction | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleAction = async (action: SlotAction) => {
    setLoading(action);
    setFeedback(null);
    try {
      const res = await fetch(API_ENDPOINTS.CABINET_SLOT_ACTION(cabinetId, slot.number), {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", msg: data.message || "Done successfully" });
      } else {
        setFeedback({ type: "error", msg: data.message || "Action failed" });
      }
    } catch {
      setFeedback({ type: "error", msg: "Network error" });
    } finally {
      setLoading(null);
    }
  };

  const rows = [
    { label: "Slot ID",    value: slot.id },
    { label: "Status",     value: slot.status.charAt(0).toUpperCase() + slot.status.slice(1) },
    { label: "Battery ID", value: slot.batteryId   ?? "—" },
    { label: "Type",       value: slot.batteryType ?? "—" },
    { label: "SOC",        value: slot.soc !== undefined ? `${slot.soc}%` : "—" },
    { label: "SOH",        value: slot.soh !== undefined ? `${slot.soh}%` : "—" },
    { label: "Cycles",     value: slot.cycles  ?? "—" },
    { label: "Last Swap",  value: slot.lastSwap ?? "—" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Slot Details – {slot.id}</h3>
        {slot.status !== "empty" && (
          <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
            slot.eligible
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}>
            {slot.eligible
              ? <><CheckCircle2 className="h-3.5 w-3.5" /> Eligible</>
              : <><XCircle className="h-3.5 w-3.5" /> Not Eligible</>
            }
          </span>
        )}
      </div>

      {/* Rows */}
      <div className="px-5 py-4 divide-y divide-gray-50">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2.5">
            <p className="text-xs text-gray-400">{row.label}</p>
            <p className="text-xs font-semibold text-gray-800">{String(row.value)}</p>
          </div>
        ))}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`mx-5 mb-3 px-3 py-2 rounded-lg text-xs font-medium ${
          feedback.type === "success"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-600 border border-red-200"
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Actions */}
      {slot.status !== "empty" && (
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={() => handleAction("disable")}
            disabled={!!loading}
            className="flex-1 py-2 rounded-xl border border-orange-200 text-orange-600 text-xs font-medium hover:bg-orange-50 transition disabled:opacity-50 flex items-center justify-center gap-1"
          >
            {loading === "disable" ? <Loader2 className="h-3 w-3 animate-spin" /> : "🚫"} Disable
          </button>
          <button
            onClick={() => handleAction("reserve")}
            disabled={!!loading}
            className="flex-1 py-2 rounded-xl border border-indigo-200 text-indigo-600 text-xs font-medium hover:bg-indigo-50 transition disabled:opacity-50 flex items-center justify-center gap-1"
          >
            {loading === "reserve" ? <Loader2 className="h-3 w-3 animate-spin" /> : "🔒"} Reserve
          </button>
          <button
            onClick={() => handleAction("release")}
            disabled={!!loading}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-1"
          >
            {loading === "release" ? <Loader2 className="h-3 w-3 animate-spin" /> : "✅"} Release
          </button>
        </div>
      )}
    </div>
  );
}