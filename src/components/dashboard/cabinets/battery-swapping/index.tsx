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
import { API_ENDPOINTS, authHeaders } from "@/config/api";

const normaliseCabinet = (raw: Record<string, unknown>): Cabinet => ({
  id:              String(raw.id ?? ""),
  cabinet_id:      String(raw.cabinet_id ?? ""),
  name:            raw.name ? String(raw.name) : null,
  lat:             parseFloat(String(raw.lat ?? "0")),
  lng:             parseFloat(String(raw.lng ?? "0")),
  address:         String(raw.address ?? ""),
  city:            String(raw.city ?? ""),
  province:        String(raw.province ?? ""),
  status:          (["active", "offline", "faulty"].includes(String(raw.status))
                     ? raw.status : "active") as Cabinet["status"],
  created_at:      String(raw.created_at ?? ""),
  updated_at:      String(raw.updated_at ?? ""),
  slots_total:     typeof raw.slots_total === "number" ? raw.slots_total : undefined,
  slots_available: typeof raw.slots_available === "number" ? raw.slots_available : undefined,
  uptime_percent:  typeof raw.uptime_percent === "number" ? raw.uptime_percent : undefined,
  last_synced:     raw.last_synced ? String(raw.last_synced) : undefined,
});

export default function BatterySwappingIndex() {
  const [cabinets, setCabinets]         = useState<Cabinet[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<Cabinet["status"] | "all">("all");
  const [viewing, setViewing]           = useState<Cabinet | null>(null);
  const [editing, setEditing]           = useState<Cabinet | null>(null);
  const [showAdd, setShowAdd]           = useState(false);

  const fetchCabinets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/proxy/cabinet/list', {
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});
      if (!res.ok) throw new Error("Failed to fetch cabinets");
      const json = await res.json();
      const list = Array.isArray(json) ? json : (json.data ?? []);
      setCabinets(list.map(normaliseCabinet));
    } catch (err) {
      console.error("❌ Fetch cabinets failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCabinets(); }, [fetchCabinets]);

  const handleAdd = useCallback((form: AddCabinetForm) => {
    const optimistic: Cabinet = {
      id:         `temp-${Date.now()}`,
      cabinet_id: form.cabinet_id,
      name:       null,
      lat:        parseFloat(form.lat) || 0,
      lng:        parseFloat(form.lng) || 0,
      address:    form.address,
      city:       form.city,
      province:   form.province,
      status:     "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCabinets((prev) => [optimistic, ...prev]);
    fetchCabinets();
  }, [fetchCabinets]);

  const handleEdit = useCallback(async (id: string, form: EditCabinetForm) => {
    // ⚠️  Backend bug: /cabinet/delete is broken — using local update only for now
    setCabinets((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...form, lat: parseFloat(form.lat) || c.lat, lng: parseFloat(form.lng) || c.lng }
          : c
      )
    );
  }, []);

const handleDelete = useCallback(async (id: string) => {
  setCabinets((prev) => prev.filter((c) => c.id !== id));
  try {
    const res = await fetch(`/api/proxy/cabinet/delete/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    if (!res.ok) {
      await fetchCabinets();
      throw new Error("Failed to delete cabinet");
    }
  } catch (err) {
    console.error("❌ Delete cabinet failed:", err);
  }
}, [fetchCabinets]);

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
      <div className="px-2 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Battery Swapping</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
          Manage battery swapping cabinet locations
        </p>
      </div>

      <CabinetStatsCards data={cabinets} />
      <CabinetFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onAdd={() => setShowAdd(true)}
      />

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
              onDelete={() => handleDelete(cabinet.id)}
            />
          ))}
        </div>
      )}

      {viewing && <CabinetViewModal cabinet={viewing} onClose={() => setViewing(null)} />}
      {editing && (
        <CabinetEditModal cabinet={editing} onClose={() => setEditing(null)} onSave={handleEdit} />
      )}
      <CabinetAddModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAdd} />
    </div>
  );
}