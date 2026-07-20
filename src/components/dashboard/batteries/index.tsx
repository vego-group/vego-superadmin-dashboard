"use client";

import { useState } from "react";
import { RefreshCw, Plus, AlertCircle } from "lucide-react";
import { Battery } from "@/types/dashboard/battery";
import { useBatteries } from "@/hooks/use-batteries";
import BatteriesStats from "./batteries-stats";
import BatteriesFilters from "./batteries-filters";
import BatteriesTable from "./batteries-table";
import BatteryAddModal from "./battery-add-modal";
import BatteryEditModal from "./battery-edit-modal";
import BatteryStatusModal, { LifecycleAction } from "./battery-status-modal";
import Pagination from "@/components/shared/pagination";
import { useLang } from "@/lib/language-context";

export default function BatteriesIndex() {
  const { t } = useLang();
  const {
    batteries, meta, isLoading, error,
    lifecycleStatus, setLifecycleStatus,
    assignment, setAssignment,
    fleetId, setFleetId,
    search, setSearch,
    page, setPage, perPage, setPerPage,
    fetchBatteries,
    createBattery, updateBattery, updateBatteryStatus,
  } = useBatteries();

  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Battery | null>(null);
  const [statusTarget, setStatusTarget] = useState<{ battery: Battery; action: LifecycleAction } | null>(null);

  // Server pagination when the backend returned paginator meta; otherwise slice locally.
  const serverPaged = meta !== null;
  const totalItems = meta?.total ?? batteries.length;
  const totalPages = serverPaged ? Math.max(1, meta.lastPage) : Math.max(1, Math.ceil(batteries.length / perPage));
  const safePage = Math.min(page, totalPages);
  if (safePage !== page) setPage(safePage);
  const rows = serverPaged ? batteries : batteries.slice((safePage - 1) * perPage, safePage * perPage);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{t("Batteries", "البطاريات")}</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {t("Manage battery inventory and lifecycle status", "إدارة مخزون البطاريات ودورة حياتها")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchBatteries} disabled={isLoading}
            className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition disabled:opacity-40">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90 transition"
            style={{ backgroundColor: "#1C1FC1" }}>
            <Plus className="h-4 w-4" />{t("Add Battery", "إضافة بطارية")}
          </button>
        </div>
      </div>

      <BatteriesStats batteries={batteries} totalCount={meta?.total ?? null} isLoading={isLoading} />

      <BatteriesFilters
        search={search} onSearchChange={setSearch}
        lifecycleStatus={lifecycleStatus} onLifecycleChange={setLifecycleStatus}
        assignment={assignment} onAssignmentChange={setAssignment}
        fleetId={fleetId} onFleetChange={setFleetId}
      />

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{error}</span>
        </div>
      )}

      <BatteriesTable
        batteries={rows}
        isLoading={isLoading}
        onEdit={setEditTarget}
        onLifecycleAction={(battery, action) => setStatusTarget({ battery, action })}
      />

      {totalItems > perPage && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={perPage}
            onPageChange={setPage}
            onItemsPerPageChange={(n) => { setPerPage(n); setPage(1); }}
            showItemsPerPageSelector={true}
          />
        </div>
      )}

      {showAdd && (
        <BatteryAddModal
          onSubmit={createBattery}
          onClose={() => setShowAdd(false)}
          onSuccess={() => setShowAdd(false)}
        />
      )}

      {editTarget && (
        <BatteryEditModal
          battery={editTarget}
          onSubmit={updateBattery}
          onClose={() => setEditTarget(null)}
          onSuccess={() => setEditTarget(null)}
        />
      )}

      {statusTarget && (
        <BatteryStatusModal
          battery={statusTarget.battery}
          action={statusTarget.action}
          onSubmit={(payload) => updateBatteryStatus(statusTarget.battery.id, payload)}
          onClose={() => setStatusTarget(null)}
          onSuccess={() => setStatusTarget(null)}
        />
      )}
    </div>
  );
}
