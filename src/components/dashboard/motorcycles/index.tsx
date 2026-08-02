"use client";

import { logger } from '@/lib/logger';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Building2, User, X, AlertCircle } from "lucide-react";
import { useCountryView } from "@/lib/country-view-context";
import { apiErrorFromCaught } from "@/lib/api-error";
import { toIsoCountryCodeOrNull } from "@/types/country";
import MotorcyclesStats   from "./motorcycles-stats";
import MotorcyclesFilters from "./motorcycles-filters";
import MotorcyclesTable   from "./motorcycles-table";
import AssignBatteryModal from "./assign-battery-modal";
import AssignToCompanyModal from "./assign-company-modal";
import AssignToDriverModal from "./assign-driver-modal";
import UnassignModal from "./unassign-modal";
import Pagination from "@/components/shared/pagination";
import { Motorcycle, MotorcycleStatus, AssignmentFilter, getAssignment } from "./types";
import { useLang } from "@/lib/language-context";

export default function MotorcyclesIndex() {
  const { t } = useLang();
  const { countryParam } = useCountryView();
  const [motorcycles,   setMotorcycles]   = useState<Motorcycle[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState<MotorcycleStatus | "all">("all");
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>("all");
  const [assignTarget,  setAssignTarget]  = useState<Motorcycle | null>(null);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [itemsPerPage,  setItemsPerPage]  = useState(10);

  // Bulk selection + assignment flows
  const [selectedIds,   setSelectedIds]   = useState<Set<number>>(new Set());
  const [showAssignCompany, setShowAssignCompany] = useState(false);
  const [driverTarget,  setDriverTarget]  = useState<Motorcycle | null>(null);
  const [unassignTarget, setUnassignTarget] = useState<Motorcycle | null>(null);

  const fetchMotorcycles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const path = countryParam ? `motorcycles?country=${countryParam}` : "motorcycles";
      const rows = await apiClient.get<Motorcycle[]>(path);
      // Validate the country field into the branded type at the boundary.
      setMotorcycles(
        rows.map((m) => ({ ...m, iso_country_code: toIsoCountryCodeOrNull(m.iso_country_code) }))
      );
    } catch (err) {
      // §0.3: 422 country_not_supported must surface, never be swallowed.
      const msg = apiErrorFromCaught(err, "Failed to fetch motorcycles", countryParam);
      setError(msg);
      logger.error("❌ fetchMotorcycles:", msg);
    } finally {
      setIsLoading(false);
    }
  }, [countryParam]);

  useEffect(() => { fetchMotorcycles(); }, [fetchMotorcycles]);

  const filtered = motorcycles.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      m.device_id.toLowerCase().includes(q) ||
      (m.city ?? "").toLowerCase().includes(q) ||
      (m.assigned_user?.name ?? "").toLowerCase().includes(q) ||
      (m.battery?.battery_id ?? "").toLowerCase().includes(q) ||
      (m.fleet_name ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    const matchAssignment = assignmentFilter === "all" || getAssignment(m) === assignmentFilter;
    return matchSearch && matchStatus && matchAssignment;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  if (safePage !== currentPage) setCurrentPage(safePage);

  const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  // Unassigned pool (free motorcycles) available for company/driver assignment.
  const unassignedPool = motorcycles.filter((m) => getAssignment(m) === "unassigned");
  const selectedMotorcycles = motorcycles.filter((m) => selectedIds.has(m.id));

  // ── Selection helpers ──────────────────────────────────────────────────────
  const toggle = (id: number) => setSelectedIds((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const toggleAll = () => setSelectedIds((prev) => {
    const pageIds = paginated.map((m) => m.id);
    const allSelected = pageIds.every((id) => prev.has(id));
    const next = new Set(prev);
    pageIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
    return next;
  });
  const clearSelection = () => setSelectedIds(new Set());

  const afterAssign = () => {
    setShowAssignCompany(false);
    setDriverTarget(null);
    setUnassignTarget(null);
    clearSelection();
    fetchMotorcycles();
  };

  // Guard: individual-driver assignment is 1 motorcycle → 1 driver.
  const openDriverModal = () => {
    if (selectedMotorcycles.length === 1) setDriverTarget(selectedMotorcycles[0]);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{t("Motorcycles", "الدراجات النارية")}</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">{t("Manage fleet motorcycles and battery assignments", "إدارة دراجات الأسطول وتعيينات البطاريات")}</p>
        </div>
        <button onClick={fetchMotorcycles} disabled={isLoading}
          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition disabled:opacity-40">
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <MotorcyclesStats motorcycles={motorcycles} isLoading={isLoading} />
      <MotorcyclesFilters
        search={search} onSearchChange={setSearch}
        statusFilter={statusFilter} onStatusChange={setStatusFilter}
        assignmentFilter={assignmentFilter} onAssignmentChange={setAssignmentFilter}
      />

      {/* Bulk selection action bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-2 z-20 flex flex-wrap items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/80 backdrop-blur px-4 py-3 shadow-sm">
          <span className="text-sm font-semibold text-indigo-700">
            {selectedIds.size} {t("selected", "محدد")}
          </span>
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <button onClick={() => setShowAssignCompany(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition"
              style={{ backgroundColor: "#1C1FC1" }}>
              <Building2 className="h-3.5 w-3.5" /> {t("Assign to Company", "تعيين لشركة")}
            </button>
            <button onClick={openDriverModal} disabled={selectedIds.size !== 1}
              title={selectedIds.size !== 1 ? t("Select exactly one motorcycle", "حدد دراجة واحدة فقط") : ""}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 border border-indigo-300 hover:bg-indigo-100 transition disabled:opacity-40 disabled:cursor-not-allowed">
              <User className="h-3.5 w-3.5" /> {t("Assign to Driver", "تعيين لسائق")}
            </button>
            <button onClick={clearSelection}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition">
              <X className="h-3.5 w-3.5" /> {t("Clear", "إلغاء التحديد")}
            </button>
          </div>
        </div>
      )}

      <MotorcyclesTable
        motorcycles={paginated} isLoading={isLoading} onAssignBattery={setAssignTarget}
        onUnassign={setUnassignTarget}
        selectedIds={selectedIds} onToggle={toggle} onToggleAll={toggleAll}
      />

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

      {assignTarget && (
        <AssignBatteryModal motorcycle={assignTarget} onClose={() => setAssignTarget(null)}
          onSuccess={() => { setAssignTarget(null); fetchMotorcycles(); }} />
      )}

      {showAssignCompany && (
        <AssignToCompanyModal
          pool={unassignedPool}
          preselectedIds={Array.from(selectedIds).filter((id) => unassignedPool.some((m) => m.id === id))}
          onClose={() => setShowAssignCompany(false)}
          onSuccess={afterAssign}
        />
      )}

      {driverTarget && (
        <AssignToDriverModal motorcycle={driverTarget}
          onClose={() => setDriverTarget(null)} onSuccess={afterAssign} />
      )}

      {unassignTarget && (
        <UnassignModal motorcycle={unassignTarget}
          onClose={() => setUnassignTarget(null)} onSuccess={afterAssign} />
      )}
    </div>
  );
}
