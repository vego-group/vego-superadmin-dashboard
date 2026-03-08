// src/components/dashboard/cabinates/battery-swapping/index.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";

import CabinetStatsCards from "./cabinet-stats-cards";
import CabinetFilters from "./cabinet-filters";
import CabinetCard from "./cabinet-card";
import CabinetViewModal from "./cabinet-view-modal";
import CabinetEditModal from "./cabinet-edit-modal";
import CabinetAddModal from "./cabinet-add-modal";

import { Cabinet, AddCabinetForm, EditCabinetForm } from "../types";

// ─── API base ─────────────────────────────────────────────────────────────────
const API_BASE = "https://mobility-live.com/api";

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function BatterySwappingIndex() {
  const [cabinets, setCabinets]           = useState<Cabinet[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState<Cabinet["status"] | "all">("all");
  const [viewing, setViewing]             = useState<Cabinet | null>(null);
  const [editing, setEditing]             = useState<Cabinet | null>(null);
  const [showAdd, setShowAdd]             = useState(false);

  // ─── Fetch cabinets list ───────────────────────────────────────────────────
  const fetchCabinets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/cabinet`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch cabinets");
      const data = await res.json();
      // Support both { data: [...] } and [...] shapes
      const list: Cabinet[] = Array.isArray(data) ? data : (data.data ?? []);
      setCabinets(list);
    } catch (err) {
      console.error("❌ Fetch cabinets failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCabinets();
  }, [fetchCabinets]);

  // ─── Add — called by CabinetAddModal after successful POST ────────────────
  const handleAdd = useCallback((form: AddCabinetForm) => {
    // Optimistically build a Cabinet object from the submitted form
    // so it appears in the grid instantly without needing a re-fetch
    const optimistic: Cabinet = {
      id:               `temp-${Date.now()}`,
      cabinet_id:       form.cabinet_id,
      lat:              parseFloat(form.lat) || 0,
      lng:              parseFloat(form.lng) || 0,
      address:          form.address,
      city:             form.city,
      province:         form.province,
      status:           "active",
      slots_total:      0,
      slots_available:  0,
      uptime_percent:   0,
      last_synced:      new Date().toISOString(),
    };

    setCabinets((prev) => [optimistic, ...prev]);

    // Also re-fetch in background to get server-assigned id + real data
    fetchCabinets();
  }, [fetchCabinets]);

  // ─── Edit — PATCH then update local state ─────────────────────────────────
  const handleEdit = useCallback(async (id: string, form: EditCabinetForm) => {
    try {
      const res = await fetch(`${API_BASE}/cabinet/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update cabinet");

      // Update the cabinet in local state
      setCabinets((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                ...form,
                lat: parseFloat(form.lat) || c.lat,
                lng: parseFloat(form.lng) || c.lng,
              }
            : c
        )
      );
    } catch (err) {
      console.error("❌ Edit cabinet failed:", err);
    }
  }, []);

  // ─── Filter logic ─────────────────────────────────────────────────────────
  const filtered = cabinets.filter((c) => {
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
      <CabinetStatsCards data={cabinets} />

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