// src/hooks/use-superadmins.ts
"use client";

import { logger } from "@/lib/logger";
import { useState, useEffect, useCallback } from "react";
import { Admin } from "@/types/dashboard/admin";
import { normaliseAdmin } from "./use-admins";

// Superadmins are naturally a handful of people — fetch one big page and let
// the UI filter client-side, same as the Admins page does.
export function useSuperAdmins() {
  const [superAdmins, setSuperAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuperAdmins = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/proxy/super-admins?per_page=100", {
        headers: { Accept: "application/json" },
      });
      const json = await res.json();
      if (!res.ok || json.status === false || json.success === false) {
        throw new Error(json.message || `Failed to fetch superadmins (${res.status})`);
      }

      const payload = json.data;
      const rows: Record<string, unknown>[] = Array.isArray(payload)
        ? payload
        : payload?.data ?? [];
      setSuperAdmins(rows.map(normaliseAdmin));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch superadmins";
      setError(msg);
      logger.error("❌ fetchSuperAdmins:", msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuperAdmins();
  }, [fetchSuperAdmins]);

  return { superAdmins, isLoading, error, fetchSuperAdmins };
}
