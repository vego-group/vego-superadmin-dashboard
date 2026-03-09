// src/hooks/use-dashboard.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "@/config/api";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DashboardCounts {
  total_users: number;
  total_admins: number;
  total_battery_swap_active: number;
  total_battery_swap_inactive: number;
  total_fast_charging_active: number;
  total_fast_charging_inactive: number;
}

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useDashboard() {
  const [counts, setCounts]       = useState<DashboardCounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.DASHBOARD_COUNTS, {
        method: "GET",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to fetch dashboard counts (${res.status})`);
      const data = await res.json();
      setCounts(data.data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch dashboard counts";
      setError(msg);
      console.error("❌ fetchDashboard:", msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return { counts, isLoading, error, fetchCounts };
}