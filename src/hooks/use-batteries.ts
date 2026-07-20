// src/hooks/use-batteries.ts
"use client";

import { logger } from "@/lib/logger";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Battery,
  BatteryAssignment,
  BatteryHistory,
  BatteryLifecycleStatus,
  BatteryListMeta,
  CreateBatteryPayload,
  UpdateBatteryPayload,
  UpdateBatteryStatusPayload,
} from "@/types/dashboard/battery";
import { batteriesApi } from "@/components/dashboard/batteries/battery-api";

// ─── List + mutations ─────────────────────────────────────────────────────────
export function useBatteries() {
  const [batteries, setBatteries] = useState<Battery[]>([]);
  // null meta ⇒ the backend returned a plain array (client-side pagination).
  const [meta, setMeta] = useState<BatteryListMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lifecycleStatus, setLifecycleStatusState] = useState<BatteryLifecycleStatus | "all">("all");
  const [assignment, setAssignmentState] = useState<BatteryAssignment | "all">("all");
  const [fleetId, setFleetIdState] = useState<string>("all");
  const [search, setSearchState] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Every filter change restarts from page 1.
  const setLifecycleStatus = useCallback((v: BatteryLifecycleStatus | "all") => { setLifecycleStatusState(v); setPage(1); }, []);
  const setAssignment = useCallback((v: BatteryAssignment | "all") => { setAssignmentState(v); setPage(1); }, []);
  const setFleetId = useCallback((v: string) => { setFleetIdState(v); setPage(1); }, []);
  const setSearch = useCallback((v: string) => { setSearchState(v); setPage(1); }, []);

  // Guards against a slow response overwriting a newer one.
  const requestSeq = useRef(0);

  const fetchBatteries = useCallback(async () => {
    const seq = ++requestSeq.current;
    setIsLoading(true);
    setError(null);
    try {
      const result = await batteriesApi.list({
        lifecycleStatus,
        assignment,
        fleetId,
        search: search.trim(),
        page,
        perPage,
      });
      if (seq !== requestSeq.current) return;
      setBatteries(result.items);
      setMeta(result.meta);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      const msg = err instanceof Error ? err.message : "Failed to fetch batteries";
      setError(msg);
      logger.error("❌ fetchBatteries:", msg);
    } finally {
      if (seq === requestSeq.current) setIsLoading(false);
    }
  }, [lifecycleStatus, assignment, fleetId, search, page, perPage]);

  // Debounced so typing in the search box doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(fetchBatteries, 300);
    return () => clearTimeout(timer);
  }, [fetchBatteries]);

  const createBattery = useCallback(async (payload: CreateBatteryPayload): Promise<Battery> => {
    const created = await batteriesApi.create(payload);
    await fetchBatteries();
    return created;
  }, [fetchBatteries]);

  const updateBattery = useCallback(async (id: number, payload: UpdateBatteryPayload): Promise<Battery> => {
    const updated = await batteriesApi.update(id, payload);
    await fetchBatteries();
    return updated;
  }, [fetchBatteries]);

  const updateBatteryStatus = useCallback(async (id: number, payload: UpdateBatteryStatusPayload): Promise<Battery> => {
    const updated = await batteriesApi.updateStatus(id, payload);
    await fetchBatteries();
    return updated;
  }, [fetchBatteries]);

  return {
    batteries, meta, isLoading, error,
    lifecycleStatus, setLifecycleStatus,
    assignment, setAssignment,
    fleetId, setFleetId,
    search, setSearch,
    page, setPage, perPage, setPerPage,
    fetchBatteries,
    createBattery, updateBattery, updateBatteryStatus,
  };
}

// ─── Single full row (detail view) ────────────────────────────────────────────
// The /history snapshot is slim (no soh/capacity/cycles/notes) — the detail page
// merges in the full list row, looked up by the battery_id STRING. Pass null
// until that string is known; the fetch starts as soon as it becomes available.
export function useBatteryRow(batteryId: string | null) {
  const [row, setRow] = useState<Battery | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!batteryId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    (async () => {
      try {
        const found = await batteriesApi.findByBatteryId(batteryId);
        if (!cancelled) setRow(found);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to fetch battery details";
        if (!cancelled) setError(msg);
        logger.error("❌ useBatteryRow:", msg);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [batteryId]);

  return { row, isLoading, error };
}

// ─── History (detail view) ────────────────────────────────────────────────────
export function useBatteryHistory(id: number | string | null) {
  const [history, setHistory] = useState<BatteryHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (id === null || id === "") return;
    setIsLoading(true);
    setError(null);
    try {
      setHistory(await batteriesApi.getHistory(id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch battery history";
      setError(msg);
      logger.error("❌ fetchBatteryHistory:", msg);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  return { history, isLoading, error, fetchHistory };
}
