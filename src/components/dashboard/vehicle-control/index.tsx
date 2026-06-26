"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { logger } from "@/lib/logger";
import VehicleListPanel from "./vehicle-list-panel";
import VehicleDetails from "./vehicle-details";
import ControlPanel from "./control-panel";
import { filterVehicles, groupVehicles, deriveDrivers } from "./group-vehicles";
import {
  listVehicles, listDrivers, getBattery, getStatistics, assignDriver, unassignDriver,
  setPower, setLock, setSpeedLimit, emergencyStop,
} from "./vehicle-api";
import type { SuperadminVehicle, SuperadminDriver, VehicleBattery, VehicleStatistics, OwnerFilter } from "./types";

export default function VehicleControlIndex() {
  const { t } = useLang();
  const [vehicles, setVehicles] = useState<SuperadminVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>("all");
  const [query, setQuery] = useState("");

  const [battery, setBattery] = useState<VehicleBattery | null>(null);
  const [statistics, setStatistics] = useState<VehicleStatistics | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [fetchedDrivers, setFetchedDrivers] = useState<SuperadminDriver[]>([]);

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await listVehicles();
      setVehicles(list);
      setSelectedId((prev) => prev ?? list[0]?.id ?? null);
    } catch (err) {
      logger.error("fetchVehicles:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
    listDrivers().then(setFetchedDrivers);
  }, [fetchVehicles]);

  const visible = useMemo(() => filterVehicles(vehicles, ownerFilter, query), [vehicles, ownerFilter, query]);
  const groups = useMemo(() => groupVehicles(visible), [visible]);

  // Prefer the real drivers endpoint; fall back to drivers derived from the vehicle
  // list, and union the two so any currently-assigned driver always appears.
  const drivers = useMemo(() => {
    const merged = new Map<string, SuperadminDriver>();
    for (const d of deriveDrivers(vehicles)) merged.set(d.id, d);
    for (const d of fetchedDrivers) merged.set(d.id, d);
    return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [vehicles, fetchedDrivers]);
  const selected = useMemo(() => vehicles.find((v) => v.id === selectedId) ?? null, [vehicles, selectedId]);

  // Load live battery + statistics when the selection changes.
  useEffect(() => {
    if (!selectedId) {
      setBattery(null);
      setStatistics(null);
      return;
    }
    let cancelled = false;
    setIsDetailLoading(true);
    Promise.allSettled([getBattery(selectedId), getStatistics(selectedId)]).then(([b, s]) => {
      if (cancelled) return;
      setBattery(b.status === "fulfilled" ? b.value : null);
      setStatistics(s.status === "fulfilled" ? s.value : null);
      setIsDetailLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const patchSelected = useCallback(
    (patch: Partial<SuperadminVehicle>) => {
      if (!selectedId) return;
      setVehicles((prev) => prev.map((v) => (v.id === selectedId ? { ...v, ...patch } : v)));
    },
    [selectedId]
  );

  const handleAssign = useCallback(
    async (driverId: string) => {
      if (!selectedId) return false;
      const ok = await assignDriver(selectedId, driverId);
      if (ok) {
        const d = drivers.find((dr) => dr.id === driverId);
        patchSelected({ assignedDriverId: driverId, assignedDriverName: d?.name });
      }
      return ok;
    },
    [selectedId, drivers, patchSelected]
  );

  const handleUnassign = useCallback(async () => {
    if (!selectedId) return false;
    const ok = await unassignDriver(selectedId);
    if (ok) patchSelected({ assignedDriverId: undefined, assignedDriverName: undefined });
    return ok;
  }, [selectedId, patchSelected]);

  const handlePower = useCallback(
    async (next: boolean) => {
      if (!selectedId) return false;
      const ok = await setPower(selectedId, next);
      if (ok) patchSelected({ isEngineRunning: next });
      return ok;
    },
    [selectedId, patchSelected]
  );

  const handleLock = useCallback(
    async (next: boolean) => {
      if (!selectedId) return false;
      const ok = await setLock(selectedId, next);
      if (ok) patchSelected({ isLocked: next });
      return ok;
    },
    [selectedId, patchSelected]
  );

  const handleSpeedLimit = useCallback(
    async (kmh: number) => {
      if (!selectedId) return false;
      const ok = await setSpeedLimit(selectedId, kmh);
      if (ok) patchSelected({ speedLimitKmh: kmh });
      return ok;
    },
    [selectedId, patchSelected]
  );

  const handleEmergencyStop = useCallback(async () => {
    if (!selectedId) return false;
    const ok = await emergencyStop(selectedId);
    if (ok) patchSelected({ isEngineRunning: false, isLocked: true, currentSpeedKmh: 0 });
    return ok;
  }, [selectedId, patchSelected]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{t("Vehicle Control", "التحكم بالمركبات")}</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {t("All vehicles across individual users and companies", "كل المركبات للمستخدمين الأفراد والشركات")}
          </p>
        </div>
        <button
          onClick={fetchVehicles}
          disabled={isLoading}
          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr_320px] h-[calc(100vh-180px)] min-h-[600px]">
        <VehicleListPanel
          groups={groups}
          selectedId={selectedId}
          onSelect={setSelectedId}
          ownerFilter={ownerFilter}
          onOwnerFilterChange={setOwnerFilter}
          query={query}
          onQueryChange={setQuery}
          isLoading={isLoading}
        />
        <VehicleDetails vehicle={selected} battery={battery} statistics={statistics} isLoading={isDetailLoading} />
        <ControlPanel
          vehicle={selected}
          drivers={drivers}
          onPower={handlePower}
          onLock={handleLock}
          onSpeedLimit={handleSpeedLimit}
          onEmergencyStop={handleEmergencyStop}
          onAssignDriver={handleAssign}
          onUnassignDriver={handleUnassign}
        />
      </div>
    </div>
  );
}
