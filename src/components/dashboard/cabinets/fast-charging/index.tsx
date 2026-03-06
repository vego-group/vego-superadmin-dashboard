// src/components/dashboard/cabinates/fast-charging/index.tsx
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
// TODO: replace with useFastChargingCabinets() API hook
const MOCK_DATA: Cabinet[] = [
  { id: "fc-1", cabinet_id: "FCC-001", lat: 30.05712, lng: 31.22724, address: "88 Ramsis Street, Abbassia",         city: "Cairo",          province: "Cairo Governorate",      status: "active",  slots_total: 6,  slots_available: 4, uptime_percent: 97.3, last_synced: "2026-03-05T08:10:00Z" },
  { id: "fc-2", cabinet_id: "FCC-002", lat: 31.21561, lng: 29.95534, address: "21 Port Said St, Sidi Gaber",        city: "Alexandria",     province: "Alexandria Governorate", status: "active",  slots_total: 6,  slots_available: 6, uptime_percent: 99.1, last_synced: "2026-03-05T07:55:00Z" },
  { id: "fc-3", cabinet_id: "FCC-003", lat: 30.01312, lng: 31.20891, address: "5 Ring Road, New Cairo Interchange", city: "Cairo",          province: "Cairo Governorate",      status: "faulty",  slots_total: 8,  slots_available: 0, uptime_percent: 0,    last_synced: "2026-03-02T16:00:00Z" },
  { id: "fc-4", cabinet_id: "FCC-004", lat: 30.09123, lng: 31.34561, address: "Cairo Festival City, Ring Road",     city: "New Cairo",      province: "Cairo Governorate",      status: "active",  slots_total: 10, slots_available: 2, uptime_percent: 95.0, last_synced: "2026-03-05T09:00:00Z" },
  { id: "fc-5", cabinet_id: "FCC-005", lat: 29.98731, lng: 31.44210, address: "Mall of Egypt, October City",        city: "6th of October", province: "Giza Governorate",       status: "offline", slots_total: 8,  slots_available: 0, uptime_percent: 78.5, last_synced: "2026-03-04T18:30:00Z" },
  { id: "fc-6", cabinet_id: "FCC-006", lat: 31.19341, lng: 29.94512, address: "City Centre Alexandria, Smoha",      city: "Alexandria",     province: "Alexandria Governorate", status: "active",  slots_total: 6,  slots_available: 3, uptime_percent: 96.2, last_synced: "2026-03-05T08:45:00Z" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function FastChargingIndex() {
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<Cabinet["status"] | "all">("all");
  const [viewing, setViewing]           = useState<Cabinet | null>(null);
  const [editing, setEditing]           = useState<Cabinet | null>(null);
  const [showAdd, setShowAdd]           = useState(false);
  const isLoading                       = false; // TODO: from API hook

  const handleAdd = (form: AddCabinetForm) => {
    // TODO: POST /api/cabinets/fast-charging
    console.log("[FastCharging] Add:", form);
  };

  const handleEdit = (id: string, form: EditCabinetForm) => {
    // TODO: PATCH /api/cabinets/fast-charging/:id
    console.log("[FastCharging] Edit:", id, form);
  };

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
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Fast Charging</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
          Manage fast charging cabinet locations
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
          <RefreshCw className="h-4 w-4 animate-spin" />Loading cabinets…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">No cabinets match your filters</div>
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
      {viewing && <CabinetViewModal cabinet={viewing} onClose={() => setViewing(null)} />}
      {editing && <CabinetEditModal cabinet={editing} onClose={() => setEditing(null)} onSave={handleEdit} />}
      <CabinetAddModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAdd} />
    </div>
  );
}