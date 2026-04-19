"use client";

import { Search } from "lucide-react";
import { MotorcycleStatus } from "./types";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: MotorcycleStatus | "all";
  onStatusChange: (v: MotorcycleStatus | "all") => void;
}

export default function MotorcyclesFilters({ search, onSearchChange, statusFilter, onStatusChange }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by device ID, driver, battery or city…"
          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-indigo-300 transition"
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as MotorcycleStatus | "all")}
        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:border-indigo-300 cursor-pointer"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="maintenance">Maintenance</option>
      </select>
    </div>
  );
}