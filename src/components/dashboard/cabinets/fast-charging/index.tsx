"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";

import CabinetStatsCards from "./cabinet-stats-cards";
import CabinetFilters    from "./cabinet-filters";
import CabinetCard       from "./cabinet-card";
import CabinetViewModal  from "./cabinet-view-modal";
import CabinetEditModal  from "./cabinet-edit-modal";
import CabinetAddModal   from "./cabinet-add-modal";
import CabinetMap        from "./cabinet-map-client";

import { Cabinet, AddCabinetForm, EditCabinetForm } from "../types";

// ─── Normalise Pile ───────────────────────────────────────────────────────────
// الـ API بيرجع: dev_id, name, ports_count (مش cabinet_id ولا slots_count)
const normalisePile = (raw: Record<string, unknown>): Cabinet => {
  // ports_count ممكن يييجي number أو string من الـ API
  const rawPorts = raw.ports_count;
  const portsNum = rawPorts !== undefined && rawPorts !== null && rawPorts !== ""
    ? Number(rawPorts)
    : undefined;

  return {
    id:          String(raw.id ?? ""),
    cabinet_id:  String(raw.dev_id ?? raw.cabinet_id ?? ""),
    name:        raw.name && String(raw.name).trim() !== "" ? String(raw.name).trim() : null,
    lat:         parseFloat(String(raw.lat  ?? "0")),
    lng:         parseFloat(String(raw.lng  ?? "0")),
    address:     String(raw.address  ?? ""),
    city:        String(raw.city     ?? ""),
    province:    String(raw.province ?? ""),
    status: (
      ["active", "offline", "faulty", "inactive", "maintenance"].includes(String(raw.status))
        ? raw.status
        : "active"
    ) as Cabinet["status"],
    created_at:  String(raw.created_at  ?? ""),
    updated_at:  String(raw.updated_at  ?? ""),
    slots_count: !isNaN(portsNum as number) ? portsNum : undefined,
  };
};

export default function FastChargingIndex() {
  const [cabinets, setCabinets]         = useState<Cabinet[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<Cabinet["status"] | "all">("all");
  const [viewing, setViewing]           = useState<Cabinet | null>(null);
  const [editing, setEditing]           = useState<Cabinet | null>(null);
  const [showAdd, setShowAdd]           = useState(false);

  // ─── Sync editing/viewing بعد كل تحديث للـ cabinets ──────────────────────
  useEffect(() => {
    if (editing) {
      const updated = cabinets.find((c) => c.id === editing.id);
      if (updated) setEditing(updated);
    }
    if (viewing) {
      const updated = cabinets.find((c) => c.id === viewing.id);
      if (updated) setViewing(updated);
    }
  }, [cabinets]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchPiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/proxy/pile/list", {
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch piles");
      const json = await res.json();
      const list = Array.isArray(json) ? json : (json.data ?? []);
      setCabinets(list.map(normalisePile));
    } catch (err) {
      console.error("❌ Fetch piles failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPiles(); }, [fetchPiles]);

  // ─── Add ──────────────────────────────────────────────────────────────────
  const handleAdd = useCallback((form: AddCabinetForm) => {
    const portsNum = form.slots_count ? parseInt(form.slots_count, 10) : undefined;
    const optimistic: Cabinet = {
      id:          `temp-${Date.now()}`,
      cabinet_id:  form.dev_id || form.cabinet_id,
      name:        form.name?.trim() || null,
      lat:         parseFloat(form.lat)  || 0,
      lng:         parseFloat(form.lng)  || 0,
      address:     form.address,
      city:        form.city,
      province:    form.province,
      status:      "active",
      created_at:  new Date().toISOString(),
      updated_at:  new Date().toISOString(),
      slots_count: portsNum && !isNaN(portsNum) ? portsNum : undefined,
    };
    setCabinets((prev) => [optimistic, ...prev]);
    fetchPiles();
  }, [fetchPiles]);

  // ─── Edit ─────────────────────────────────────────────────────────────────
  const handleEdit = useCallback(async (id: string, form: EditCabinetForm) => {
    const portsNum = form.slots_count ? parseInt(form.slots_count, 10) : undefined;
    setCabinets((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              name:        form.name?.trim() || null,
              address:     form.address,
              city:        form.city,
              province:    form.province,
              status:      form.status,
              lat:         parseFloat(form.lat) || c.lat,
              lng:         parseFloat(form.lng) || c.lng,
              // نحدّث slots_count فوراً بالقيمة الجديدة
              slots_count: portsNum && !isNaN(portsNum) ? portsNum : c.slots_count,
            }
          : c
      )
    );
    await fetchPiles();
  }, [fetchPiles]);

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id: string) => {
    setCabinets((prev) => prev.filter((c) => c.id !== id));
    try {
      const res = await fetch(`/api/proxy/pile/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });
      if (!res.ok) {
        await fetchPiles();
        throw new Error("Failed to delete pile");
      }
    } catch (err) {
      console.error("❌ Delete pile failed:", err);
    }
  }, [fetchPiles]);

  // ─── Filter ───────────────────────────────────────────────────────────────
  const filtered = cabinets.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      c.cabinet_id.toLowerCase().includes(q) ||
      (c.name ?? "").toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)         ||
      c.address.toLowerCase().includes(q)      ||
      c.province.toLowerCase().includes(q);
    return matchSearch && (statusFilter === "all" || c.status === statusFilter);
  });

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div className="px-2 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Fast Charging</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
          Manage fast charging pile locations
        </p>
      </div>

      <CabinetStatsCards data={cabinets} />

      <CabinetMap
        cabinets={filtered}
        onCabinetSelect={(cabinet) => setViewing(cabinet)}
      />

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
          Loading piles…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          No piles match your filters
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((cabinet) => (
            <CabinetCard
              key={cabinet.id}
              cabinet={cabinet}
              onView={()   => setViewing(cabinet)}
              onEdit={()   => setEditing(cabinet)}
              onDelete={() => handleDelete(cabinet.id)}
            />
          ))}
        </div>
      )}

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