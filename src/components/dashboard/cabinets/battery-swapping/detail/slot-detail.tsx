"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Slot } from "./mock-data";

interface Props { slot: Slot; }

export default function SlotDetail({ slot }: Props) {
  const rows = [
    { label: "Slot ID",      value: slot.id },
    { label: "Status",       value: slot.status.charAt(0).toUpperCase() + slot.status.slice(1) },
    { label: "Battery ID",   value: slot.batteryId   ?? "—" },
    { label: "Type",         value: slot.batteryType ?? "—" },
    { label: "SOC",          value: slot.soc !== undefined ? `${slot.soc}%` : "—" },
    { label: "SOH",          value: slot.soh !== undefined ? `${slot.soh}%` : "—" },
    { label: "Cycles",       value: slot.cycles ?? "—" },
    { label: "Last Swap",    value: slot.lastSwap ?? "—" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
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

      <div className="px-5 py-4 divide-y divide-gray-50">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2.5">
            <p className="text-xs text-gray-400">{row.label}</p>
            <p className="text-xs font-semibold text-gray-800">{String(row.value)}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      {slot.status !== "empty" && (
        <div className="px-5 pb-5 flex gap-2">
          <button className="flex-1 py-2 rounded-xl border border-orange-200 text-orange-600 text-xs font-medium hover:bg-orange-50 transition">
            🚫 Disable
          </button>
          <button className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition">
            🔒 Lock Slot
          </button>
        </div>
      )}
    </div>
  );
}