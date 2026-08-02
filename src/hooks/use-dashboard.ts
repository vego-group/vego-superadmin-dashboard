// src/hooks/use-dashboard.ts
"use client";

import { logger } from '@/lib/logger';
import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS, authHeaders } from "@/config/api";
import { apiErrorMessage } from "@/lib/api-error";
import { useCountryView } from "@/lib/country-view-context";
import { IsoCountryCode, countryFilterIgnored, toIsoCountryCodeOrNull } from "@/types/country";

export interface DashboardCounts {
  total_users: number;
  total_admins: number;
  total_battery_swap_active: number;
  total_battery_swap_inactive: number;
  total_fast_charging_active: number;
  total_fast_charging_inactive: number;
  /**
   * §13a: wallet balances are grouped PER CURRENCY under `by_currency`, keyed
   * by currency code — `total_balance` for the money, `wallet_count` for the
   * count. Parse with `walletBalances`. The flat `total_balance_sar` alias
   * lives INSIDE this object (not top-level on counts) and is populated only
   * when the total is unambiguously SAR; it is deliberately never read (money
   * contract §12 — aliases sunset 2026-11-01), so its null needs no
   * special-casing here.
   */
  wallets?: Record<string, unknown> | null;
}

export interface Alarm {
  id: number;
  iot_device_id: number;
  alarm_code: number;
  alarm_type: string;
  status: "unresolved" | "resolved";
  resolved_at: string | null;
  recorded_at: string;
  /** ISO country ("SA" | "JO") — §0.2. Optional until every row carries it. */
  iso_country_code?: IsoCountryCode | null;
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

// Cache key MUST include the country filter, or a country switch would be
// served a stale unfiltered page for up to ALARMS_TTL.
const alarmsKey = (page: number, status: string, country: string | null) =>
  `${page}|${status}|${country ?? "ALL"}`;

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

function loadAlarms(
  page: number,
  status: string,
  country: string | null,
  force = false
): Promise<AlarmsResult> {
  const key = alarmsKey(page, status, country);

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
      if (country) params.set("country", country);

      const res = await fetch(`${API_ENDPOINTS.ALARMS_LIST}?${params}`, { headers: authHeaders() });
      // §0.3: 422 country_not_supported must surface, never be swallowed.
      if (!res.ok) throw new Error(await apiErrorMessage(res, "Failed to fetch alarms", country));
      const result = await res.json();

      const data: AlarmsResult =
        result.success && result.data
          ? {
              // Sanitise the country field at the boundary so the Country
              // column only ever reads a validated, branded code.
              alarms: ((result.data.data || []) as Array<Record<string, unknown>>).map(
                (a) => ({
                  ...(a as unknown as Alarm),
                  iso_country_code: toIsoCountryCodeOrNull(a.iso_country_code),
                })
              ),
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
  const { countryParam } = useCountryView();

  // Seed from the shared cache so a remount paints instantly instead of
  // flashing a loading state and refetching. (First render always sees the
  // "ALL" view — the persisted country is applied after mount by the provider.)
  const initialAlarms = alarmsCache.get(alarmsKey(1, "all", null))?.data;

  const [counts, setCounts]               = useState<DashboardCounts | null>(countsCache?.data ?? null);
  const [isLoading, setIsLoading]         = useState(countsCache === null);
  const [error, setError]                 = useState<string | null>(null);
  const [alarms, setAlarms]               = useState<Alarm[]>(initialAlarms?.alarms ?? []);
  const [isLoadingAlarms, setIsLoadingAlarms] = useState(initialAlarms == null);
  const [pagination, setPagination]       = useState<AlarmsPagination | null>(initialAlarms?.pagination ?? null);
  const [currentPage, setCurrentPage]     = useState(1);
  const [statusFilter, setStatusFilter]   = useState<"all" | "unresolved" | "resolved">("all");
  const [alarmsError, setAlarmsError]     = useState<string | null>(null);
  // GET /alarms ?country= is CONFIRMED supported (backend answers §3 — scoped
  // through the alarm's motorcycle), and unsupported endpoints now 422 with
  // country_filter_not_supported rather than silently ignoring the param. The
  // row-level check stays as cheap insurance against a silent-ignore regression.
  const [alarmsCountryFilterNotApplied, setAlarmsCountryFilterNotApplied] = useState(false);

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
    setAlarmsError(null);
    try {
      const data = await loadAlarms(page, status, countryParam, force);
      setAlarms(data.alarms);
      setPagination(data.pagination);
      // Visible warning only — never client-side filter (that would fake
      // per-country pagination and totals).
      setAlarmsCountryFilterNotApplied(
        countryFilterIgnored(countryParam, data.alarms.map((a) => a.iso_country_code))
      );
    } catch (err) {
      // §0.3: keep the message (incl. country_not_supported) for the UI.
      const msg = err instanceof Error ? err.message : "Failed to fetch alarms";
      setAlarmsError(msg);
      logger.error("❌ fetchAlarms:", msg);
    } finally {
      setIsLoadingAlarms(false);
    }
  }, [countryParam]);

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
    alarms, isLoadingAlarms, alarmsError, alarmsCountryFilterNotApplied, fetchAlarms, resolveAlarm,
    pagination, currentPage, goToPage,
    statusFilter, changeStatusFilter,
  };
}
