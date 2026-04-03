"use client";

import { Search } from "lucide-react";
import { DeviceStatus, DeviceType } from "./types";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: "all" | DeviceType;
  onTypeChange: (v: "all" | DeviceType) => void;
  statusFilter: "all" | DeviceStatus;
  onStatusChange: (v: "all" | DeviceStatus) => void;
  cityFilter: string;
  onCityChange: (v: string) => void;
  cities: string[];
}

export default function DevicesFilters({ search, onSearchChange, typeFilter, onTypeChange, statusFilter, onStatusChange, cityFilter, onCityChange, cities }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">

      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by ID, location or city…"
          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-indigo-300 transition-colors"
        />
      </div>

      {/* Type filter buttons */}
      <div className="flex gap-2">
        {(["all", "cabinet", "charging"] as const).map((t) => (
          <button key={t} onClick={() => onTypeChange(t)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition ${
              typeFilter === t ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            {t === "all" ? "All" : t === "cabinet" ? "🔋 Cabinet" : "⚡ Charging"}
          </button>
        ))}
      </div>

      {/* Status */}
      <select value={statusFilter} onChange={(e) => onStatusChange(e.target.value as "all" | DeviceStatus)}
        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:border-indigo-300 transition-colors cursor-pointer">
        <option value="all">All Status</option>
        <option value="connected">Connected</option>
        <option value="disconnected">Disconnected</option>
        <option value="maintenance">Maintenance</option>
      </select>

      {/* City */}
      <select value={cityFilter} onChange={(e) => onCityChange(e.target.value)}
        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:border-indigo-300 transition-colors cursor-pointer">
        {cities.map((c) => (
          <option key={c} value={c}>{c === "all" ? "All Cities" : c}</option>
        ))}
      </select>
    </div>
  );
}