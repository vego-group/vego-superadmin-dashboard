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
  setPower, setLock, setSpeedLimit, emergencyStop, getLiveVehicle, mergeLiveVehicle,
  getImeiByMotorcycle,
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
  // motorcycle id → registered IMEI, from /iot-devices (null = registry unavailable).
  const [imeiMap, setImeiMap] = useState<Map<string, string> | null>(null);

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
    getImeiByMotorcycle().then(setImeiMap);
  }, [fetchVehicles]);

  // The registry only fills a *missing* IMEI (e.g. when the vehicle list
  // endpoint doesn't carry device_id at all) — it must never overwrite an IMEI
  // the vehicle record already has, or every vehicle loses its controls the
  // moment the registry fetch returns (empty list, pagination, field mismatch…).
  const enriched = useMemo(() => {
    if (!imeiMap) return vehicles;
    return vehicles.map((v) => (v.deviceImei ? v : { ...v, deviceImei: imeiMap.get(v.id) ?? "" }));
  }, [vehicles, imeiMap]);

  const visible = useMemo(() => filterVehicles(enriched, ownerFilter, query), [enriched, ownerFilter, query]);
  const groups = useMemo(() => groupVehicles(visible), [visible]);

  // Prefer the real drivers endpoint; fall back to drivers derived from the vehicle
  // list, and union the two so any currently-assigned driver always appears.
  const drivers = useMemo(() => {
    const merged = new Map<string, SuperadminDriver>();
    for (const d of deriveDrivers(vehicles)) merged.set(d.id, d);
    for (const d of fetchedDrivers) merged.set(d.id, d);
    return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [vehicles, fetchedDrivers]);
  const selected = useMemo(() => enriched.find((v) => v.id === selectedId) ?? null, [enriched, selectedId]);

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

  // Live IoT snapshot (?live=1): pulls the selected vehicle's real position and
  // engine state from the device. Patching is keyed by id, so a late response
  // after switching vehicles is harmless.
  const refreshLive = useCallback(async () => {
    if (!selectedId) return;
    const id = selectedId;
    const live = await getLiveVehicle(id);
    if (!live) return;
    setVehicles((prev) => prev.map((v) => (v.id === id ? mergeLiveVehicle(v, live) : v)));
  }, [selectedId]);

  // Refresh on selection, then keep it fresh every 15s.
  useEffect(() => {
    if (!selectedId) return;
    refreshLive();
    const timer = setInterval(refreshLive, 15_000);
    return () => clearInterval(timer);
  }, [selectedId, refreshLive]);

  // IoT commands are dispatched async — the device reports its new state a few
  // seconds later, so pull a fresh snapshot shortly after a successful command.
  const scheduleLiveConfirm = useCallback(() => {
    setTimeout(refreshLive, 4_000);
  }, [refreshLive]);

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

  // IoT actions target the device IMEI, not the motorcycle id.
  const selectedImei = selected?.deviceImei ?? "";

  const handlePower = useCallback(
    async (next: boolean) => {
      if (!selectedImei) return false;
      const ok = await setPower(selectedImei, next);
      if (ok) {
        patchSelected({ isEngineRunning: next });
        scheduleLiveConfirm();
      }
      return ok;
    },
    [selectedImei, patchSelected, scheduleLiveConfirm]
  );

  const handleLock = useCallback(
    async () => {
      if (!selectedImei) return false;
      const ok = await setLock(selectedImei);
      if (ok) {
        patchSelected({ isLocked: false });
        scheduleLiveConfirm();
      }
      return ok;
    },
    [selectedImei, patchSelected, scheduleLiveConfirm]
  );

  const handleSpeedLimit = useCallback(
    async (kmh: number) => {
      if (!selectedImei) return false;
      const ok = await setSpeedLimit(selectedImei, kmh);
      if (ok) {
        patchSelected({ speedLimitKmh: kmh });
        scheduleLiveConfirm();
      }
      return ok;
    },
    [selectedImei, patchSelected, scheduleLiveConfirm]
  );

  const handleEmergencyStop = useCallback(async () => {
    if (!selectedImei) return false;
    const ok = await emergencyStop(selectedImei);
    if (ok) {
      patchSelected({ isEngineRunning: false, isLocked: true, currentSpeedKmh: 0 });
      scheduleLiveConfirm();
    }
    return ok;
  }, [selectedImei, patchSelected, scheduleLiveConfirm]);

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
