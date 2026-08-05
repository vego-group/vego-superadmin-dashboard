// src/hooks/use-superadmins.ts
"use client";

import { logger } from "@/lib/logger";
import { useState, useEffect, useCallback } from "react";
import { Admin } from "@/types/dashboard/admin";
import { normaliseAdmin } from "./use-admins";
import { fetchStaffList } from "@/lib/staff-list";
import { useCountryView } from "@/lib/country-view-context";

// Superadmins are naturally a handful of people — fetch one big page and let
// the UI search client-side, same as the Admins page does. The COUNTRY view,
// by contrast, filters server-side via ?country= (see lib/staff-list.ts).
export function useSuperAdmins() {
  const { countryParam } = useCountryView();
  const [superAdmins, setSuperAdmins] = useState<Admin[]>([]);
  const [countryFilterNotApplied, setCountryFilterNotApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuperAdmins = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { rows, countryFilterNotApplied: notApplied } = await fetchStaffList(
        "super-admins?per_page=100",
        countryParam,
        "Failed to fetch superadmins"
      );
      setSuperAdmins(rows.map(normaliseAdmin));
      setCountryFilterNotApplied(notApplied);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch superadmins";
      setError(msg);
      logger.error("❌ fetchSuperAdmins:", msg);
    } finally {
      setIsLoading(false);
    }
  }, [countryParam]);

  useEffect(() => {
    fetchSuperAdmins();
  }, [fetchSuperAdmins]);

  return { superAdmins, isLoading, error, fetchSuperAdmins, countryFilterNotApplied };
}
