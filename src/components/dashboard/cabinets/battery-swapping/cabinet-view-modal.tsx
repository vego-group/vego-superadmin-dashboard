// src/components/dashboard/cabinates/battery-swapping/cabinet-view-modal.tsx

import { X, Battery, Hash, MapPin, Map, Building2, Layers, RefreshCw } from "lucide-react";
import { Cabinet } from "../types";
import { STATUS_CFG } from "./cabinet-card";

const ACCENT = "#00E5BE";

interface Props {
  cabinet: Cabinet;
  onClose: () => void;
}

export default function CabinetViewModal({ cabinet, onClose }: Props) {
  const cfg = STATUS_CFG[cabinet.status];

  const rows = [
    {
      icon: <Hash className="h-3.5 w-3.5" />,
      label: "Cabinet ID",
      value: cabinet.cabinet_id,
    },
    {
      icon: <MapPin className="h-3.5 w-3.5" />,
      label: "Coordinates",
      value: `${cabinet.lat.toFixed(5)}, ${cabinet.lng.toFixed(5)}`,
    },
    {
      icon: <Map className="h-3.5 w-3.5" />,
      label: "Address",
      value: cabinet.address,
    },
    {
      icon: <Building2 className="h-3.5 w-3.5" />,
      label: "City",
      value: cabinet.city,
    },
    {
      icon: <Building2 className="h-3.5 w-3.5" />,
      label: "Province",
      value: cabinet.province,
    },
    // Only show Slots if data exists
    ...(cabinet.slots_total !== undefined
      ? [{
          icon: <Layers className="h-3.5 w-3.5" />,
          label: "Slots",
          value: `${cabinet.slots_available ?? 0} available / ${cabinet.slots_total} total`,
        }]
      : []
    ),
    // Only show Last Sync if data exists
    ...(cabinet.last_synced
      ? [{
          icon: <RefreshCw className="h-3.5 w-3.5" />,
          label: "Last Sync",
          value: new Date(cabinet.last_synced).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        }]
      : []
    ),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Purple Line */}
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${ACCENT}18`, color: ACCENT }}
            >
              <Battery className="h-4 w-4" />
            </div>
            <div>
              <p className="font-mono text-sm font-bold text-gray-800">
                {cabinet.cabinet_id}
              </p>
              <p className="text-gray-400 text-xs truncate max-w-[220px]">
                {cabinet.address}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status + Uptime */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>

            {/* Uptime — only if available */}
            {cabinet.uptime_percent !== undefined && (
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Uptime</p>
                <p className={`text-sm font-bold ${cfg.uptime}`}>
                  {cabinet.uptime_percent}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Rows */}
        <div className="px-6 py-4 flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0 w-28">
                {row.icon}
                {row.label}
              </div>
              <span className="text-xs text-gray-700 font-medium text-right">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#1C1FC1" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}