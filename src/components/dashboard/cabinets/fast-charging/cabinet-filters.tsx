// src/components/dashboard/cabinates/fast-charging/cabinet-filters.tsx
"use client";

import { Search, ChevronDown, Plus } from "lucide-react";
import { Cabinet } from "../types";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: Cabinet["status"] | "all";
  onStatusChange: (v: Cabinet["status"] | "all") => void;
  onAdd: () => void;
}

export default function CabinetFilters({ search, onSearchChange, statusFilter, onStatusChange, onAdd }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 sm:px-6 py-4 sm:py-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Fast Charging Cabinets</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage all fast charging cabinet locations</p>
        </div>
        <button onClick={onAdd} className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white hover:opacity-90 active:scale-[0.98] transition-all flex-shrink-0" style={{ backgroundColor: "#1C1FC1" }}>
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">Add Cabinet</span>
          <span className="xs:hidden">Add</span>
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input value={search} onChange={e => onSearchChange(e.target.value)} placeholder="Search cabinets…"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-indigo-300 transition-colors" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => onStatusChange(e.target.value as Cabinet["status"] | "all")}
            className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 sm:pl-4 pr-7 sm:pr-9 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-600 focus:outline-none focus:border-indigo-300 transition-colors cursor-pointer">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="offline">Offline</option>
            <option value="faulty">Faulty</option>
          </select>
          <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}