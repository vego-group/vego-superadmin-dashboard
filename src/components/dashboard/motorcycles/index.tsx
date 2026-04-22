"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import MotorcyclesStats   from "./motorcycles-stats";
import MotorcyclesFilters from "./motorcycles-filters";
import MotorcyclesTable   from "./motorcycles-table";
import AssignBatteryModal from "./assign-battery-modal";
import { Motorcycle, MotorcycleStatus } from "./types";
import { useLang } from "@/lib/language-context";

export default function MotorcyclesIndex() {
  const { t } = useLang();
  const [motorcycles,   setMotorcycles]   = useState<Motorcycle[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState<MotorcycleStatus | "all">("all");
  const [assignTarget,  setAssignTarget]  = useState<Motorcycle | null>(null);

  const fetchMotorcycles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res  = await fetch("/api/proxy/motorcycles", { headers: { Accept: "application/json" } });
      const json = await res.json();
      if (json.success) setMotorcycles(json.data);
    } catch (err) {
      console.error("❌ fetchMotorcycles:", err);
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
      (m.battery?.battery_id ?? "").toLowerCase().includes(q);
    return matchSearch && (statusFilter === "all" || m.status === statusFilter);
  });

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
      <MotorcyclesTable motorcycles={filtered} isLoading={isLoading} onAssignBattery={setAssignTarget} />

      {assignTarget && (
        <AssignBatteryModal motorcycle={assignTarget} onClose={() => setAssignTarget(null)}
          onSuccess={() => { setAssignTarget(null); fetchMotorcycles(); }} />
      )}
    </div>
  );
}