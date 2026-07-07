"use client";

import { logger } from '@/lib/logger';
import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { useLang } from "@/lib/language-context";


import CabinetStatsCards   from "./cabinet-stats-cards";
import CabinetFilters      from "./cabinet-filters";
import CabinetCard         from "./cabinet-card";
import CabinetViewModal    from "./cabinet-view-modal";
import CabinetEditModal    from "./cabinet-edit-modal";
import CabinetAddModal     from "./cabinet-add-modal";
import DeleteConfirmModal  from "../delete-confirm-modal";
import Pagination          from "@/components/shared/pagination";
import CabinetMap          from "./cabinet-map-client";

import { Cabinet, AddCabinetForm, EditCabinetForm } from "../types";

// ─── Normalise Cabinet ────────────────────────────────────────────────────────
const normaliseCabinet = (raw: any): Cabinet => ({
  id:              String(raw.id ?? ""),
  cabinet_id:      String(raw.cabinet_id ?? ""),
  name:            raw.name ? String(raw.name) : null,
  lat:             parseFloat(String(raw.lat  ?? "0")),
  lng:             parseFloat(String(raw.lng  ?? "0")),
  address:         String(raw.address  ?? ""),
  city:            String(raw.city     ?? ""),
  province:        String(raw.province ?? ""),
  status: (
    ["active", "offline", "faulty", "inactive", "maintenance"].includes(String(raw.status))
      ? raw.status
      : "active"
  ) as Cabinet["status"],
  created_at:      String(raw.created_at  ?? ""),
  updated_at:      String(raw.updated_at  ?? ""),
  slots_count:     raw.slots_count ? Number(raw.slots_count) : 0,
  slots_total:     raw.slots_count ? Number(raw.slots_count) : 0,
  slots_available: raw.batteries   ? raw.batteries.length    : 0,
});

export default function BatterySwappingIndex() {
  const { t } = useLang();
  const [cabinets, setCabinets]           = useState<Cabinet[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState<Cabinet["status"] | "all">("all");
  const [viewing, setViewing]             = useState<Cabinet | null>(null);
  const [editing, setEditing]             = useState<Cabinet | null>(null);
  const [showAdd, setShowAdd]             = useState(false);
  const [deletingId, setDeletingId]       = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget]   = useState<Cabinet | null>(null);
  const [isDeleting, setIsDeleting]       = useState(false);
  const [currentPage, setCurrentPage]     = useState(1);
  const [itemsPerPage, setItemsPerPage]   = useState(12);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchCabinets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/proxy/cabinet/list", {
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch cabinets");
      const json = await res.json();
      const list = Array.isArray(json) ? json : (json.data ?? []);
      setCabinets(list.map(normaliseCabinet));
    } catch (err) {
      logger.error("❌ Fetch cabinets failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCabinets(); }, [fetchCabinets]);

  // ─── Add ──────────────────────────────────────────────────────────────────
  const handleAdd = useCallback((form: AddCabinetForm) => {
    const optimistic: Cabinet = {
      id:             `temp-${Date.now()}`,
      cabinet_id:     form.cabinet_id,
      name:           form.name?.trim() || null,
      lat:            parseFloat(form.lat)  || 0,
      lng:            parseFloat(form.lng)  || 0,
      address:        form.address,
      city:           form.city,
      province:       form.province,
      status:         "active",
      created_at:     new Date().toISOString(),
      updated_at:     new Date().toISOString(),
      slots_count:    form.slots_count ? parseInt(form.slots_count, 10) : 0,
      slots_total:    form.slots_count ? parseInt(form.slots_count, 10) : 0,
      slots_available: 0,
    };
    setCabinets((prev) => [optimistic, ...prev]);
    fetchCabinets();
  }, [fetchCabinets]);

  // ─── Edit ─────────────────────────────────────────────────────────────────
  const handleEdit = useCallback(async (id: string, form: EditCabinetForm) => {
    setCabinets((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              name:        form.name?.trim() || null,
              lat:         parseFloat(form.lat)  || c.lat,
              lng:         parseFloat(form.lng)  || c.lng,
              address:     form.address,
              city:        form.city,
              province:    form.province,
              status:      form.status,
              slots_count: form.slots_count ? parseInt(form.slots_count, 10) : c.slots_count,
              slots_total: form.slots_count ? parseInt(form.slots_count, 10) : c.slots_total,
            }
          : c
      )
    );
    await fetchCabinets();
  }, [fetchCabinets]);

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = useCallback((cabinet: Cabinet) => {
    setDeleteTarget(cabinet);
    setDeletingId(cabinet.id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    setCabinets((prev) => prev.filter((c) => c.id !== deletingId));
    try {
      const res = await fetch(`/api/proxy/cabinet/delete/${deletingId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });
      if (!res.ok) {
        await fetchCabinets();
        throw new Error("Failed to delete cabinet");
      }
    } catch (err) {
      logger.error("❌ Delete cabinet failed:", err);
      await fetchCabinets();
    } finally {
      setDeleteTarget(null);
      setDeletingId(null);
      setIsDeleting(false);
    }
  }, [deletingId, fetchCabinets]);

  // ─── Filter ───────────────────────────────────────────────────────────────
  const filtered = cabinets.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      c.cabinet_id.toLowerCase().includes(q) ||
      (c.name ?? "").toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)        ||
      c.address.toLowerCase().includes(q)     ||
      c.province.toLowerCase().includes(q);
    return matchSearch && (statusFilter === "all" || c.status === statusFilter);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  if (safePage !== currentPage) setCurrentPage(safePage);

  const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const handleMapSelect = (cabinet: Cabinet) => setViewing(cabinet);

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div className="px-2 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
  {t("Battery Swapping", "تبديل البطاريات")}
</h1>

<p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
  {t("Manage battery swapping cabinet locations", "إدارة مواقع خزائن تبديل البطاريات")}
</p>
      </div>

      <CabinetStatsCards data={cabinets} />

      <CabinetMap
        cabinets={filtered}
        onCabinetSelect={handleMapSelect}
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
          t("Loading cabinets…","جارٍ تحميل الخزائن…")
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          t("No cabinets match your filters","لا توجد خزائن تطابق الفلاتر")
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {paginated.map((cabinet) => (
              <CabinetCard
                key={cabinet.id}
                cabinet={cabinet}
                onView={()   => setViewing(cabinet)}
                onEdit={()   => setEditing(cabinet)}
                onDelete={() => handleDelete(cabinet)}
              />
            ))}
          </div>

          {filtered.length > itemsPerPage && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                showItemsPerPageSelector={true}
              />
            </div>
          )}
        </>
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
      <DeleteConfirmModal
        cabinet={deleteTarget}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => { setDeleteTarget(null); setDeletingId(null); }}
      />
      <CabinetAddModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAdd}
      />
    </div>
  );
}