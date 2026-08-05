// src/hooks/use-admins.ts
"use client";

import { logger } from '@/lib/logger';
import { useState, useEffect, useCallback } from "react";
import { Admin } from "@/types/dashboard/admin";
import { fetchStaffList } from "@/lib/staff-list";
import { useCountryView } from "@/lib/country-view-context";

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const normaliseAdmin = (raw: Record<string, unknown>): Admin => ({
  id: String(raw.id ?? ""),
  name: String(raw.name ?? "Unknown"),
  email: raw.email ? String(raw.email) : null,
  phone: raw.phone ? String(raw.phone) : null,
  address: raw.address ? String(raw.address) : null,
  city: raw.city ? String(raw.city) : null,
  state: raw.state ? String(raw.state) : null,
  zip: raw.zip ? String(raw.zip) : null,
  country: raw.country ? String(raw.country) : null,
  status: (raw.status === "inactive" || raw.status === "suspended") ? raw.status : "active",
  profile_picture: raw.profile_picture ? String(raw.profile_picture) : null,
  email_verified_at: raw.email_verified_at ? String(raw.email_verified_at) : null,
  phone_verified: Boolean(raw.phone_verified),
  account_type: raw.account_type === "fleet" ? "fleet" : "individual",
  fleet_id: raw.fleet_id ? Number(raw.fleet_id) : null,
  language: String(raw.language || "en"),
  created_at: String(raw.created_at ?? ""),
  updated_at: String(raw.updated_at ?? ""),
  deleted_at: raw.deleted_at ? String(raw.deleted_at) : null,
});

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAdmins() {
  const { countryParam } = useCountryView();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [countryFilterNotApplied, setCountryFilterNotApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { rows, countryFilterNotApplied: notApplied } = await fetchStaffList(
        "admins",
        countryParam,
        "Failed to fetch admins"
      );
      setAdmins(rows.map(normaliseAdmin));
      setCountryFilterNotApplied(notApplied);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch admins";
      setError(msg);
      logger.error("❌ fetchAdmins:", msg);
    } finally {
      setIsLoading(false);
    }
  }, [countryParam]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  return { admins, isLoading, error, fetchAdmins, countryFilterNotApplied };
}