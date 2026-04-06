"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wifi, WifiOff, Clock, MapPin, Hash } from "lucide-react";
import { useCabinetDetail, StationSlot } from "@/hooks/use-cabinet-detail";

// ─── Slot status config ───────────────────────────────────────────────────────
const statusCfg: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  reserved: { bg: "bg-yellow-50",  text: "text-yellow-700", border: "border-yellow-300", icon: "🔋" },
  occupied: { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-300",   icon: "⚡" },
  empty:    { bg: "bg-gray-50",    text: "text-gray-400",   border: "border-gray-200",   icon: "○"  },
};

// ─── Stats Row ────────────────────────────────────────────────────────────────
function StatsRow({ slots }: { slots: StationSlot[] }) {
  const stats = [
    { label: "Total Slots",      value: slots.length,                                            color: "text-indigo-600", bg: "bg-indigo-50",  border: "border-indigo-200"  },
    { label: "Occupied",         value: slots.filter((s) => s.status === "occupied").length,     color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-200"    },
    { label: "Reserved",         value: slots.filter((s) => s.status === "reserved").length,     color: "text-yellow-600", bg: "bg-yellow-50",  border: "border-yellow-200"  },
    { label: "Empty",            value: slots.filter((s) => s.status === "empty").length,        color: "text-gray-500",   bg: "bg-gray-50",    border: "border-gray-200"    },
    { label: "Door Open",        value: slots.filter((s) => s.door_open).length,                 color: "text-red-500",    bg: "bg-red-50",     border: "border-red-200"     },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((s) => (
        <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-4 text-center`}>
          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          <p className="text-xs text-gray-500 mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Slot Map ─────────────────────────────────────────────────────────────────
function SlotMap({ slots, selected, onSelect }: {
  slots: StationSlot[];
  selected: StationSlot;
  onSelect: (s: StationSlot) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
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
      <div className="p-5">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {slots.map((slot) => {
            const cfg = statusCfg[slot.status] ?? statusCfg.empty;
            const isSelected = selected.id === slot.id;
            return (
              <button
                key={slot.id}
                onClick={() => onSelect(slot)}
                className={`flex flex-col items-center justify-center rounded-xl border-2 p-2 transition-all ${cfg.bg} ${cfg.border} ${
                  isSelected ? "ring-2 ring-indigo-500 ring-offset-1 scale-105" : "hover:scale-105"
                }`}
              >
                <span className="text-base leading-none">{cfg.icon}</span>
                {slot.battery && (
                  <span className={`text-[10px] font-bold mt-1 ${cfg.text}`}>
                    {slot.battery.battery_percentage}%
                  </span>
                )}
                <span className={`text-[9px] mt-0.5 ${cfg.text}`}>S{slot.slot_number}</span>
                {slot.door_open && <span className="text-[8px] text-red-500 mt-0.5">🔓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Slot Detail Panel ────────────────────────────────────────────────────────
function SlotDetailPanel({ slot }: { slot: StationSlot }) {
  const b = slot.battery;

  const rows = b ? [
    { label: "Slot No.",       value: `Slot ${slot.slot_number}` },
    { label: "Status",         value: slot.status.charAt(0).toUpperCase() + slot.status.slice(1) },
    { label: "Door",           value: slot.door_open ? "🔓 Open" : "🔒 Closed" },
    { label: "Battery ID",     value: b.battery_id },
    { label: "Type",           value: b.battery_type },
    { label: "SOC",            value: `${b.battery_percentage}%` },
    { label: "SOH",            value: `${b.soh}%` },
    { label: "Cycles",         value: b.cycle_count },
    { label: "Physical Dmg",   value: b.physical_damage ? "⚠️ Yes" : "✅ No" },
    { label: "Battery Status", value: b.status },
  ] : [
    { label: "Slot No.", value: `Slot ${slot.slot_number}` },
    { label: "Status",   value: "Empty" },
    { label: "Door",     value: slot.door_open ? "🔓 Open" : "🔒 Closed" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Slot Details – S{slot.slot_number}</h3>
      </div>
      <div className="px-5 py-4 divide-y divide-gray-50">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2.5">
            <p className="text-xs text-gray-400">{row.label}</p>
            <p className="text-xs font-semibold text-gray-800">{String(row.value)}</p>
          </div>
        ))}
      </div>
      {b && (
        <div className="px-5 pb-5 space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>SOC</span><span>{b.battery_percentage}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-green-500" style={{ width: `${b.battery_percentage}%` }} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>SOH</span><span>{b.soh}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${parseFloat(b.soh)}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props { cabinetId: string; }

export default function CabinetDetailIndex({ cabinetId }: Props) {
  const router = useRouter();
  const { data, loading, error } = useCabinetDetail(cabinetId);
  const [selectedSlot, setSelectedSlot] = useState<StationSlot | null>(null);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>
  );

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-red-500 text-sm">{error ?? "Cabinet not found"}</p>
      <button onClick={() => router.back()} className="text-indigo-600 text-sm underline">Go back</button>
    </div>
  );

  const active = selectedSlot ?? data.station_slots[0];
  const isActive = data.status === "active";

  return (
    <div className="space-y-5">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Cabinet Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Monitor slots & batteries – detailed view</p>
        </div>
      </div>

      {/* Cabinet Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <span className="text-indigo-600 font-bold text-xs">CAB</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm sm:text-base">{data.cabinet_id}</p>
              <p className="text-xs text-gray-500">{data.name}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{data.address}, {data.city}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Hash className="h-4 w-4 text-gray-400" />
              <span>{data.slots_count} slots</span>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              isActive ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
            }`}>
              {isActive ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <StatsRow slots={data.station_slots} />

      {/* Slot Map + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <SlotMap slots={data.station_slots} selected={active} onSelect={setSelectedSlot} />
        </div>
        <div>
          <SlotDetailPanel slot={active} />
        </div>
      </div>
    </div>
  );
}