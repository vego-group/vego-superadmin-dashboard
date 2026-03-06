// src/components/dashboard/cabinates/fast-charging/cabinet-card.tsx

import { Eye, Pencil, MapPin, Hash, Zap } from "lucide-react";
import { Cabinet } from "../types";

export const STATUS_CFG = {
  active: {
    label: "Active",
    dot: "bg-green-400",
    badge: "bg-green-50 text-green-600 border border-green-200",
    uptime: "text-green-500",
  },
  offline: {
    label: "Offline",
    dot: "bg-orange-400",
    badge: "bg-orange-50 text-orange-500 border border-orange-200",
    uptime: "text-orange-500",
  },
  faulty: {
    label: "Faulty",
    dot: "bg-red-400",
    badge: "bg-red-50 text-red-500 border border-red-200",
    uptime: "text-red-500",
  },
} as const;

const ACCENT = "#F59E0B";

interface Props {
  cabinet: Cabinet;
  onView: () => void;
  onEdit: () => void;
}

export default function CabinetCard({ cabinet, onView, onEdit }: Props) {
  const cfg = STATUS_CFG[cabinet.status];
  const slotPct = cabinet.slots_total > 0 ? (cabinet.slots_available / cabinet.slots_total) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Zap className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900 text-sm truncate">{cabinet.city}</h3>
            </div>
            <p className="text-xs text-gray-400 truncate pl-5">{cabinet.address}</p>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <p className="text-2xl font-black leading-none" style={{ color: ACCENT }}>{cabinet.slots_total}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Slots</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      <div className="h-px bg-gray-100 mx-4" />

      <div className="px-4 py-3 flex flex-col gap-2.5 flex-1">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-gray-400"><Hash className="h-3 w-3" />Cabinet ID</span>
          <span className="font-mono text-xs font-bold" style={{ color: ACCENT }}>{cabinet.cabinet_id}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-gray-400"><MapPin className="h-3 w-3" />Province</span>
          <span className="text-xs text-gray-600 font-medium">{cabinet.province}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Uptime</span>
          <span className={`text-sm font-bold ${cfg.uptime}`}>{cabinet.uptime_percent}%</span>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Available Slots</span>
            <span className="text-[10px] text-gray-500">{cabinet.slots_available}/{cabinet.slots_total}</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${slotPct}%`, backgroundColor: ACCENT }} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Coordinates</span>
          <span className="font-mono text-[11px] text-gray-400">{cabinet.lat.toFixed(4)}, {cabinet.lng.toFixed(4)}</span>
        </div>
      </div>

      <div className="px-4 pb-4 flex gap-2 mt-auto">
        <button onClick={onView} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
          <Eye className="h-3.5 w-3.5" />View
        </button>
        <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-all" style={{ backgroundColor: "#1C1FC1" }}>
          <Pencil className="h-3.5 w-3.5" />Edit
        </button>
      </div>
    </div>
  );
}