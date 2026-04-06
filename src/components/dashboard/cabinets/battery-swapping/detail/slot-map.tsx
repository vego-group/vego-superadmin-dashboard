"use client";

import { Slot, SlotStatus } from "./mock-data";

const statusCfg: Record<SlotStatus, { bg: string; text: string; border: string; icon: string }> = {
  available: { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-300",  icon: "🔋" },
  charging:  { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-300",   icon: "⚡" },
  faulty:    { bg: "bg-red-50",    text: "text-red-600",    border: "border-red-300",    icon: "⚠️" },
  blocked:   { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-300", icon: "🔒" },
  empty:     { bg: "bg-gray-50",   text: "text-gray-400",   border: "border-gray-200",   icon: "○"  },
};

interface Props {
  slots: Slot[];
  selectedSlot: Slot;
  onSelect: (slot: Slot) => void;
}

export default function SlotMap({ slots, selectedSlot, onSelect }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

      {/* Header + Legend */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Slot Map ({slots.length} slots)</h3>
          <p className="text-xs text-gray-400 mt-0.5">Click a slot to view battery details</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(statusCfg).map(([status, cfg]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded border ${cfg.bg} ${cfg.border}`} />
              <span className="text-[10px] text-gray-500 capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="p-5">
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {slots
            .slice()
            .sort((a, b) => b.number - a.number)
            .map((slot) => {
              const cfg = statusCfg[slot.status];
              const isSelected = selectedSlot.id === slot.id;
              return (
                <button
                  key={slot.id}
                  onClick={() => onSelect(slot)}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 p-2 transition-all ${cfg.bg} ${cfg.border} ${
                    isSelected ? "ring-2 ring-indigo-500 ring-offset-1 scale-105" : "hover:scale-105"
                  }`}
                >
                  <span className="text-base leading-none">{cfg.icon}</span>
                  {slot.soc !== undefined && (
                    <span className={`text-[10px] font-bold mt-1 ${cfg.text}`}>{slot.soc}%</span>
                  )}
                  <span className={`text-[9px] mt-0.5 ${cfg.text}`}>{slot.id}</span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}