// src/hooks/use-dashboard.ts
"use client";

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

export function useDashboard() {
  const [counts, setCounts]               = useState<DashboardCounts | null>(null);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [alarms, setAlarms]               = useState<Alarm[]>([]);
  const [isLoadingAlarms, setIsLoadingAlarms] = useState(true);
  const [pagination, setPagination]       = useState<AlarmsPagination | null>(null);
  const [currentPage, setCurrentPage]     = useState(1);
  const [statusFilter, setStatusFilter]   = useState<"all" | "unresolved" | "resolved">("all");

  // ─── Fetch Counts ───────────────────────────────────────────────────────────
  const fetchCounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.DASHBOARD_COUNTS, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to fetch counts (${res.status})`);
      const data = await res.json();
      setCounts(data.data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch counts";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Fetch Alarms ───────────────────────────────────────────────────────────
  const fetchAlarms = useCallback(async (page = 1, status: "all" | "unresolved" | "resolved" = "all") => {
    setIsLoadingAlarms(true);
    try {
      const params = new URLSearchParams({ page: String(page), per_page: "15" });
      if (status !== "all") params.set("status", status);

      const res = await fetch(`${API_ENDPOINTS.ALARMS_LIST}?${params}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to fetch alarms (${res.status})`);
      const result = await res.json();

      if (result.success && result.data) {
        console.log("pagination:", result.data); // ← أضف ده
        setAlarms(result.data.data || []);
        setPagination({
          current_page:  result.data.current_page,
          last_page:     result.data.last_page,
          per_page:      result.data.per_page,
          total:         result.data.total,
          next_page_url: result.data.next_page_url,
          prev_page_url: result.data.prev_page_url,
        });
      }
    } catch (err) {
      console.error("❌ fetchAlarms:", err);
    } finally {
      setIsLoadingAlarms(false);
    }
  }, []);

  // ─── Resolve Alarm ──────────────────────────────────────────────────────────
  const resolveAlarm = async (id: number) => {
  // تأكد إن الـ alarm فعلاً unresolved قبل الإرسال
  const alarm = alarms.find((a) => a.id === id);
  if (!alarm || alarm.status === "resolved") return;

  // Optimistic update
  setAlarms((prev) =>
    prev.filter((a) => a.id !== id)
  );

  try {
    const res = await fetch(API_ENDPOINTS.ALARMS_RESOLVE(id), {
      method: "POST",
      headers: authHeaders(),
    });

    if (!res.ok) {
      // لو فشل — رجّع الـ alarm للقائمة
      setAlarms((prev) => [...prev, alarm].sort((a, b) => a.id - b.id));
      console.error("❌ resolveAlarm: server rejected");
    }
  } catch (err) {
    // لو في network error — رجّع الـ alarm
    setAlarms((prev) => [...prev, alarm].sort((a, b) => a.id - b.id));
    console.error("❌ resolveAlarm:", err);
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