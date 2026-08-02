"use client";

import { logger } from '@/lib/logger';
import { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { useCountryView } from "@/lib/country-view-context";
import { apiErrorMessage } from "@/lib/api-error";

import CabinetStatsCards from "./cabinet-stats-cards";
import CabinetFilters    from "./cabinet-filters";
import CabinetCard       from "./cabinet-card";
import CabinetViewModal  from "./cabinet-view-modal";
import CabinetEditModal  from "./cabinet-edit-modal";
import CabinetAddModal   from "./cabinet-add-modal";
import DeleteConfirmModal from "../delete-confirm-modal";
import Pagination from "@/components/shared/pagination";
import CabinetMap        from "./cabinet-map-client";

import { Cabinet, AddCabinetForm, EditCabinetForm } from "../types";
import { toIsoCountryCodeOrNull } from "@/types/country";

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
    // Some scoped rows answer the ISO code under `country_code` (like zones);
    // the parser rejects anything that isn't 2-letter ISO, so a dial code can
    // never slip through.
    iso_country_code: toIsoCountryCodeOrNull(raw.iso_country_code ?? raw.country_code),
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
  const { t } = useLang(); // ← ADD THIS
  const { countryParam } = useCountryView();
  const [cabinets, setCabinets]         = useState<Cabinet[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<Cabinet["status"] | "all">("all");
  const [viewing, setViewing]           = useState<Cabinet | null>(null);
  const [editing, setEditing]           = useState<Cabinet | null>(null);
  const [showAdd, setShowAdd]           = useState(false);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cabinet | null>(null);
  const [isDeleting, setIsDeleting]     = useState(false);
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

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
    setError(null);
    try {
      const url = countryParam ? `/api/proxy/pile/list?country=${countryParam}` : "/api/proxy/pile/list";
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });
      // §0.3: 422 country_not_supported must surface, never be swallowed.
      if (!res.ok) throw new Error(await apiErrorMessage(res, "Failed to fetch piles", countryParam));
      const json = await res.json();
      const list = Array.isArray(json) ? json : (json.data ?? []);
      setCabinets(list.map(normalisePile));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch piles";
      setError(msg);
      logger.error("❌ Fetch piles failed:", msg);
    } finally {
      setIsLoading(false);
    }
  }, [countryParam]);

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
      iso_country_code: null,
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
  const handleDelete = useCallback((cabinet: Cabinet) => {
    setDeleteTarget(cabinet);
    setDeletingId(cabinet.id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    setCabinets((prev) => prev.filter((c) => c.id !== deletingId));
    try {
      const res = await fetch(`/api/proxy/pile/delete/${deletingId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });
      if (!res.ok) {
        await fetchPiles();
        throw new Error("Failed to delete pile");
      }
    } catch (err) {
      logger.error("❌ Delete pile failed:", err);
      await fetchPiles();
    } finally {
      setDeleteTarget(null);
      setDeletingId(null);
      setIsDeleting(false);
    }
  }, [deletingId, fetchPiles]);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  if (safePage !== currentPage) setCurrentPage(safePage);

  const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div className="px-2 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          {t("Fast Charging", "الشحن السريع")}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
          {t("Manage fast charging pile locations", "إدارة مواقع محطات الشحن السريع")}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
          {t("Loading piles…", "جارٍ تحميل المحطات…")}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          {t("No piles match your filters", "لا توجد محطات تطابق الفلاتر")}
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