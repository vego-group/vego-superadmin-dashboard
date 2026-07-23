"use client";

import { logger } from '@/lib/logger';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import MotorcyclesStats   from "./motorcycles-stats";
import MotorcyclesFilters from "./motorcycles-filters";
import MotorcyclesTable   from "./motorcycles-table";
import AssignBatteryModal from "./assign-battery-modal";
import Pagination from "@/components/shared/pagination";
import { Motorcycle, MotorcycleStatus } from "./types";
import { useLang } from "@/lib/language-context";

export default function MotorcyclesIndex() {
  const { t } = useLang();
  const [motorcycles,   setMotorcycles]   = useState<Motorcycle[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState<MotorcycleStatus | "all">("all");
  const [assignTarget,  setAssignTarget]  = useState<Motorcycle | null>(null);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [itemsPerPage,  setItemsPerPage]  = useState(10);

  const fetchMotorcycles = useCallback(async () => {
    setIsLoading(true);
    try {
      setMotorcycles(await apiClient.get<Motorcycle[]>("motorcycles"));
    } catch (err) {
      logger.error("❌ fetchMotorcycles:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchMotorcycles(); }, [fetchMotorcycles]);

  const filtered = motorcycles.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      m.device_id.toLowerCase().includes(q) ||
      (m.city ?? "").toLowerCase().includes(q) ||
      (m.assigned_user?.name ?? "").toLowerCase().includes(q) ||
      (m.battery?.battery_id ?? "").toLowerCase().includes(q) ||
      (m.fleet_name ?? "").toLowerCase().includes(q);
    return matchSearch && (statusFilter === "all" || m.status === statusFilter);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  if (safePage !== currentPage) setCurrentPage(safePage);

  const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

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

      <MotorcyclesStats motorcycles={motorcycles} isLoading={isLoading} />
      <MotorcyclesFilters search={search} onSearchChange={setSearch} statusFilter={statusFilter} onStatusChange={setStatusFilter} />
      <MotorcyclesTable motorcycles={paginated} isLoading={isLoading} onAssignBattery={setAssignTarget} />

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
    </div>
  );
}