"use client";

import { logger } from "@/lib/logger";
import { useState, useEffect, useCallback } from "react";
import { ComplaintStats, parseComplaintStats } from "@/types/dashboard/complaint";

// CR-6 §6: stat cards must come from GET /super-admin/complaints/stats — true
// totals — never from counting the currently loaded page (wrong past page 1).
// `country` scopes the totals to the active country view (CR-1 §3).
export function useComplaintStats(country: string | null = null) {
  const [stats, setStats] = useState<ComplaintStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const url = country
        ? `/api/proxy/complaints/stats?country=${country}`
        : "/api/proxy/complaints/stats";
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || `Failed to fetch complaint stats (${res.status})`);
      }
      setStats(parseComplaintStats(json.data ?? json));
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch complaint stats";
      setError(msg);
      logger.error("❌ fetchComplaintStats:", msg);
    }
  }, [country]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, error, fetchStats };
}
