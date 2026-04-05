"use client";

import { Search, Filter, MapPin, ChevronDown } from "lucide-react";
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

export default function DevicesFilters({ 
  search, onSearchChange, 
  typeFilter, onTypeChange, 
  statusFilter, onStatusChange, 
  cityFilter, onCityChange, 
  cities 
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-4 items-center">

      {/* 1. Search Box */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search ID, Name, or Address..."
          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
        />
      </div>

      {/* 2. Type Filter Buttons */}
      <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
        {(["all", "cabinet", "charging"] as const).map((t) => (
          <button
            key={t}
            onClick={() => onTypeChange(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tight transition-all ${
              typeFilter === t
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "all" ? "All" : t === "cabinet" ? "🔋 Cabinets" : "⚡ Piles"}
          </button>
        ))}
      </div>

      {/* 3. Status Filter (Updated for API) */}
      <div className="relative">
        <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none z-10" />
        <select 
          value={statusFilter} 
          onChange={(e) => onStatusChange(e.target.value as any)}
          className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm font-semibold text-gray-600 focus:outline-none focus:border-indigo-400 cursor-pointer hover:bg-gray-100/50 transition-all"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      {/* 4. City Filter (Dynamic) */}
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none z-10" />
        <select 
          value={cityFilter} 
          onChange={(e) => onCityChange(e.target.value)}
          className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm font-semibold text-gray-600 focus:outline-none focus:border-indigo-400 cursor-pointer hover:bg-gray-100/50 transition-all"
        >
          {cities.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All Cities" : c}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

    </div>
  );
}