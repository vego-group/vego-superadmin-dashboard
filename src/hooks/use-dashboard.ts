// src/hooks/use-dashboard.ts
"use client";

import { logger } from '@/lib/logger';
import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS, authHeaders } from "@/config/api";

export interface DashboardCounts {
  total_users: number;
  total_admins: number;
  total_battery_swap_active: number;
  total_battery_swap_inactive: number;
  total_fast_charging_active: number;
  total_fast_charging_inactive: number;
}

export interface Alarm {
  id: number;
  iot_device_id: number;
  alarm_code: number;
  alarm_type: string;
  status: "unresolved" | "resolved";
  resolved_at: string | null;
  recorded_at: string;
  iot_device?: {
    id: number;
    serial: string;
    device_id: string;
    status: string;
    software_version: string;
  };
}

export interface AlarmsPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

// ─── Shared request layer ───────────────────────────────────────────────────
// The overview page mounts three consumers of this hook at once (OverviewStats,
// RegionStatus, RecentAlarms), and the Alarms page mounts another — each used to
// fire its own counts + alarms requests on mount (doubled again by dev
// StrictMode). That produced a burst of duplicate calls that overwhelmed the
// upstream keep-alive pool and surfaced as intermittent 502s.
//
// These module-level caches collapse that: concurrent callers share one
// in-flight promise, and a short TTL lets quick remounts / route changes reuse
// the last result instead of refetching. Each hook instance still keeps its own
// React state — it just subscribes to the shared fetch.
const COUNTS_TTL = 30_000;
const ALARMS_TTL = 15_000;

interface AlarmsResult {
  alarms: Alarm[];
  pagination: AlarmsPagination | null;
}

let countsCache: { data: DashboardCounts; at: number } | null = null;
let countsInflight: Promise<DashboardCounts> | null = null;

const alarmsCache = new Map<string, { data: AlarmsResult; at: number }>();
const alarmsInflight = new Map<string, Promise<AlarmsResult>>();

const alarmsKey = (page: number, status: string) => `${page}|${status}`;

function loadCounts(force = false): Promise<DashboardCounts> {
  if (!force && countsCache && Date.now() - countsCache.at < COUNTS_TTL) {
    return Promise.resolve(countsCache.data);
  }
  if (countsInflight) return countsInflight;

  countsInflight = (async () => {
    try {
      const res = await fetch(API_ENDPOINTS.DASHBOARD_COUNTS, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to fetch counts (${res.status})`);
      const json = await res.json();
      countsCache = { data: json.data as DashboardCounts, at: Date.now() };
      return countsCache.data;
    } finally {
      countsInflight = null;
    }
  })();

  return countsInflight;
}

function loadAlarms(page: number, status: string, force = false): Promise<AlarmsResult> {
  const key = alarmsKey(page, status);

  const cached = alarmsCache.get(key);
  if (!force && cached && Date.now() - cached.at < ALARMS_TTL) {
    return Promise.resolve(cached.data);
  }
  const existing = alarmsInflight.get(key);
  if (existing) return existing;

  const inflight = (async () => {
    try {
      const params = new URLSearchParams({ page: String(page), per_page: "15" });
      if (status !== "all") params.set("status", status);

      const res = await fetch(`${API_ENDPOINTS.ALARMS_LIST}?${params}`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to fetch alarms (${res.status})`);
      const result = await res.json();

      const data: AlarmsResult =
        result.success && result.data
          ? {
              alarms: result.data.data || [],
              pagination: {
                current_page:  result.data.current_page,
                last_page:     result.data.last_page,
                per_page:      result.data.per_page,
                total:         result.data.total,
                next_page_url: result.data.next_page_url,
                prev_page_url: result.data.prev_page_url,
              },
            }
          : { alarms: [], pagination: null };

      alarmsCache.set(key, { data, at: Date.now() });
      return data;
    } finally {
      alarmsInflight.delete(key);
    }
  })();

  alarmsInflight.set(key, inflight);
  return inflight;
}

export function useDashboard() {
  // Seed from the shared cache so a remount paints instantly instead of
  // flashing a loading state and refetching.
  const initialAlarms = alarmsCache.get(alarmsKey(1, "all"))?.data;

  const [counts, setCounts]               = useState<DashboardCounts | null>(countsCache?.data ?? null);
  const [isLoading, setIsLoading]         = useState(countsCache === null);
  const [error, setError]                 = useState<string | null>(null);
  const [alarms, setAlarms]               = useState<Alarm[]>(initialAlarms?.alarms ?? []);
  const [isLoadingAlarms, setIsLoadingAlarms] = useState(initialAlarms == null);
  const [pagination, setPagination]       = useState<AlarmsPagination | null>(initialAlarms?.pagination ?? null);
  const [currentPage, setCurrentPage]     = useState(1);
  const [statusFilter, setStatusFilter]   = useState<"all" | "unresolved" | "resolved">("all");

  // ─── Fetch Counts ───────────────────────────────────────────────────────────
  const fetchCounts = useCallback(async (force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      setCounts(await loadCounts(force));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch counts";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Fetch Alarms ───────────────────────────────────────────────────────────
  const fetchAlarms = useCallback(async (page = 1, status: "all" | "unresolved" | "resolved" = "all", force = false) => {
    setIsLoadingAlarms(true);
    try {
      const data = await loadAlarms(page, status, force);
      setAlarms(data.alarms);
      setPagination(data.pagination);
    } catch (err) {
      logger.error("❌ fetchAlarms:", err);
    } finally {
      setIsLoadingAlarms(false);
    }
  }, []);

  // ─── Resolve Alarm ──────────────────────────────────────────────────────────
  const resolveAlarm = async (id: number) => {
    // Only resolve alarms that are actually unresolved.
    const alarm = alarms.find((a) => a.id === id);
    if (!alarm || alarm.status === "resolved") return;

    // Optimistic update
    setAlarms((prev) => prev.filter((a) => a.id !== id));

    try {
      const res = await fetch(API_ENDPOINTS.ALARMS_RESOLVE(id), {
        method: "POST",
        headers: authHeaders(),
      });

      if (!res.ok) {
        // Roll back on failure.
        setAlarms((prev) => [...prev, alarm].sort((a, b) => a.id - b.id));
        logger.error("❌ resolveAlarm: server rejected");
        return;
      }
      // The cached alarm pages are now stale — drop them so the next load refetches.
      alarmsCache.clear();
    } catch (err) {
      // Roll back on network error.
      setAlarms((prev) => [...prev, alarm].sort((a, b) => a.id - b.id));
      logger.error("❌ resolveAlarm:", err);
    }
  };

  // ─── Pagination helpers ─────────────────────────────────────────────────────
  const goToPage = (page: number) => {
    setCurrentPage(page);
    fetchAlarms(page, statusFilter);
  };

  const changeStatusFilter = (status: "all" | "unresolved" | "resolved") => {
    setStatusFilter(status);
    setCurrentPage(1);
    fetchAlarms(1, status);
  };

  useEffect(() => {
    fetchCounts();
    fetchAlarms(1, "all");
  }, [fetchCounts, fetchAlarms]);

  return {
    counts, isLoading, error, fetchCounts,
    alarms, isLoadingAlarms, fetchAlarms, resolveAlarm,
    pagination, currentPage, goToPage,
    statusFilter, changeStatusFilter,
  };
}
