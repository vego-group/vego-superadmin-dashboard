// src/components/dashboard/cabinates/battery-swapping/index.tsx
"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

import CabinetStatsCards from "./cabinet-stats-cards";
import CabinetFilters from "./cabinet-filters";
import CabinetCard from "./cabinet-card";
import CabinetViewModal from "./cabinet-view-modal";
import CabinetEditModal from "./cabinet-edit-modal";
import CabinetAddModal from "./cabinet-add-modal";

import { Cabinet, AddCabinetForm, EditCabinetForm } from "../types";

// ─── Mock Data ────────────────────────────────────────────────────────────────
// TODO: replace with useBatterySwappingCabinets() API hook
const MOCK_DATA: Cabinet[] = [
  { id: "bs-1", cabinet_id: "BSC-001", lat: 30.04442, lng: 31.23571, address: "15 Tahrir Square, Downtown",      city: "Cairo",          province: "Cairo Governorate",      status: "active",  slots_total: 10, slots_available: 7,  uptime_percent: 98.5, last_synced: "2026-03-05T08:00:00Z" },
  { id: "bs-2", cabinet_id: "BSC-002", lat: 31.20012, lng: 29.91873, address: "42 Corniche Road, Montaza",       city: "Alexandria",     province: "Alexandria Governorate", status: "faulty",  slots_total: 10, slots_available: 0,  uptime_percent: 0,    last_synced: "2026-03-05T07:45:00Z" },
  { id: "bs-3", cabinet_id: "BSC-003", lat: 30.06261, lng: 31.24974, address: "7 Mohamed Naguib St, Heliopolis", city: "Cairo",          province: "Cairo Governorate",      status: "offline", slots_total: 10, slots_available: 0,  uptime_percent: 85.2, last_synced: "2026-03-04T22:00:00Z" },
  { id: "bs-4", cabinet_id: "BSC-004", lat: 29.97921, lng: 31.13421, address: "3 Faisal Street, Haram",          city: "Giza",           province: "Giza Governorate",       status: "active",  slots_total: 10, slots_available: 5,  uptime_percent: 98.5, last_synced: "2026-03-03T10:00:00Z" },
  { id: "bs-5", cabinet_id: "BSC-005", lat: 30.08512, lng: 31.33201, address: "11 Nasr Road, Nasr City",         city: "Cairo",          province: "Cairo Governorate",      status: "active",  slots_total: 8,  slots_available: 5,  uptime_percent: 98.5, last_synced: "2026-03-05T09:15:00Z" },
  { id: "bs-6", cabinet_id: "BSC-006", lat: 30.02341, lng: 31.47812, address: "90th Street, 5th Settlement",     city: "New Cairo",      province: "Cairo Governorate",      status: "active",  slots_total: 12, slots_available: 10, uptime_percent: 98.5, last_synced: "2026-03-05T08:30:00Z" },
  { id: "bs-7", cabinet_id: "BSC-007", lat: 30.01123, lng: 31.20541, address: "Abbas El Akkad, Nasr City",       city: "Cairo",          province: "Cairo Governorate",      status: "active",  slots_total: 8,  slots_available: 2,  uptime_percent: 97.1, last_synced: "2026-03-05T06:00:00Z" },
  { id: "bs-8", cabinet_id: "BSC-008", lat: 29.98731, lng: 31.44210, address: "Mall of Egypt, October City",     city: "6th of October", province: "Giza Governorate",       status: "offline", slots_total: 10, slots_available: 0,  uptime_percent: 72.0, last_synced: "2026-03-04T14:00:00Z" },
  { id: "bs-9", cabinet_id: "BSC-009", lat: 31.19341, lng: 29.94512, address: "Smouha Square, Smouha",           city: "Alexandria",     province: "Alexandria Governorate", status: "active",  slots_total: 6,  slots_available: 6,  uptime_percent: 99.0, last_synced: "2026-03-05T09:30:00Z" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function BatterySwappingIndex() {
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState<Cabinet["status"] | "all">("all");
  const [viewing, setViewing]             = useState<Cabinet | null>(null);
  const [editing, setEditing]             = useState<Cabinet | null>(null);
  const [showAdd, setShowAdd]             = useState(false);
  const isLoading                         = false; // TODO: from API hook

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleAdd = (form: AddCabinetForm) => {
    // TODO: POST /api/cabinets/battery-swapping
    console.log("[BatterySwapping] Add:", form);
  };

  const handleEdit = (id: string, form: EditCabinetForm) => {
    // TODO: PATCH /api/cabinets/battery-swapping/:id
    console.log("[BatterySwapping] Edit:", id, form);
  };

  // ─── Filter logic ────────────────────────────────────────────────────────────
  const filtered = MOCK_DATA.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      c.cabinet_id.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.province.toLowerCase().includes(q);
    return matchSearch && (statusFilter === "all" || c.status === statusFilter);
  });

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">

      {/* Page Header */}
      <div className="px-2 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Battery Swapping
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
          Manage battery swapping cabinet locations
        </p>
      </div>

      {/* Stats Cards */}
      <CabinetStatsCards data={MOCK_DATA} />

      {/* Filters */}
      <CabinetFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onAdd={() => setShowAdd(true)}
      />

      {/* Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2 text-sm">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading cabinets…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          No cabinets match your filters
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((cabinet) => (
            <CabinetCard
              key={cabinet.id}
              cabinet={cabinet}
              onView={() => setViewing(cabinet)}
              onEdit={() => setEditing(cabinet)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {viewing && (
        <CabinetViewModal cabinet={viewing} onClose={() => setViewing(null)} />
      )}
      {editing && (
        <CabinetEditModal
          cabinet={editing}
          onClose={() => setEditing(null)}
          onSave={handleEdit}
        />
      )}
      <CabinetAddModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAdd}
      />
    </div>
  );
}