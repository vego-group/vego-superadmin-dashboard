// src/hooks/use-users.ts
"use client";

import { logger } from '@/lib/logger';
import { useState, useEffect, useCallback } from "react";
import { Money, parseMoney } from "@/lib/money";
import { currencyForIso, IsoCountryCode, toIsoCountryCodeOrNull } from "@/types/country";
import { apiErrorMessage } from "@/lib/api-error";
import { useCountryView } from "@/lib/country-view-context";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  status: "active" | "inactive" | "blocked" | "pending";
  /** ISO country ("SA" | "JO") — §0.2: from `iso_country_code`, never the dial code. */
  isoCountryCode: IsoCountryCode | null;
  created_at: string;
  account_type?: string;
  fleet_id?: number | null;
  first_name?: string | null;
  last_name?: string | null;
  has_license?: boolean;
}

interface UsersApiResponse {
  // /users answers `status`; /users/list answers `success` — same paginator envelope.
  status?: boolean;
  success?: boolean;
  message: string;
  data: {
    current_page: number;
    data: Array<Record<string, unknown>>;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normaliseUser = (raw: Record<string, unknown>): User => {
  // Map status - normalize to expected values
  let status: User["status"] = "active";
  const rawStatus = String(raw.status ?? "active").toLowerCase();
  if (["active", "inactive", "blocked", "pending"].includes(rawStatus)) {
    status = rawStatus as User["status"];
  }

  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? "Unknown"),
    email: raw.email ? String(raw.email) : null,
    phone: raw.phone ? String(raw.phone) : null,
    address: raw.address ? String(raw.address) : null,
    city: raw.city ? String(raw.city) : null,
    status,
    isoCountryCode: toIsoCountryCodeOrNull(raw.iso_country_code),
    created_at: String(raw.created_at ?? ""),
    account_type: raw.account_type ? String(raw.account_type) : undefined,
    fleet_id: raw.fleet_id ? Number(raw.fleet_id) : null,
    first_name: raw.first_name ? String(raw.first_name) : null,
    last_name: raw.last_name ? String(raw.last_name) : null,
    has_license: Boolean(raw.has_license),
  };
};

// ─── Individual driver detail (GET /users/{id}) ────────────────────────────────
// Document review state. Backend uses "approved" (not "verified").
export type LicenseStatus = "not_uploaded" | "pending" | "approved" | "rejected";

export interface AssignedMotorcycle {
  id: number;
  device_id: string | null;
  plate_number: string | null;
}

export interface UserDetail extends User {
  wallet_balance: Money | null;
  license_number: string | null;
  license_expiry: string | null;
  license_photo_front_url: string | null;
  license_photo_back_url: string | null;
  license_status: LicenseStatus | null;
  plate_number: string | null;
  plate_photo_url: string | null;
  plate_status: LicenseStatus | null;
  assigned_motorcycle: AssignedMotorcycle | null;
}

const asLicenseStatus = (v: unknown): LicenseStatus | null => {
  const s = String(v ?? "").toLowerCase();
  return (["not_uploaded", "pending", "approved", "rejected"] as string[]).includes(s)
    ? (s as LicenseStatus)
    : null;
};

const asRecord = (v: unknown): Record<string, unknown> | null =>
  v && typeof v === "object" ? (v as Record<string, unknown>) : null;

export const normaliseUserDetail = (raw: Record<string, unknown>): UserDetail => {
  const moto = asRecord(raw.assigned_motorcycle) ?? asRecord(raw.motorcycle);
  return {
    ...normaliseUser(raw),
    // New money shape { balance, currency, minor_units, decimals }. A legacy
    // bare number takes its currency from the record's iso_country_code; with
    // neither it renders unit-less (never assumed SAR). Never reads *_sar.
    wallet_balance: parseMoney(raw.wallet_balance ?? raw.wallet, {
      ...currencyForIso(raw.iso_country_code),
      source: "GET /users/{id} wallet_balance",
    }),
    license_number: raw.license_number ? String(raw.license_number) : null,
    license_expiry: raw.license_expiry ? String(raw.license_expiry) : null,
    license_photo_front_url: raw.license_photo_front_url ? String(raw.license_photo_front_url) : null,
    license_photo_back_url: raw.license_photo_back_url ? String(raw.license_photo_back_url) : null,
    license_status: asLicenseStatus(raw.license_status),
    plate_number: raw.plate_number ? String(raw.plate_number) : null,
    plate_photo_url: raw.plate_photo_url ? String(raw.plate_photo_url) : null,
    plate_status: asLicenseStatus(raw.plate_status),
    assigned_motorcycle: moto
      ? {
          id: Number(moto.id ?? 0),
          device_id: moto.device_id ? String(moto.device_id) : null,
          plate_number: moto.plate_number ? String(moto.plate_number) : null,
        }
      : null,
  };
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useUsers() {
  const { countryParam } = useCountryView();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 15,
  });

  const fetchUsers = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      // type=individual → backend returns only fleet_id-null users, paginated on
      // the filtered set (see docs/backend-drivers-users.md §1). Fleet drivers
      // live on the Fleet Drivers page (GET /drivers) and no longer overlap.
      const params = new URLSearchParams({ type: "individual", page: String(page) });
      if (countryParam) params.set("country", countryParam);
      // GET /users refuses ?country= (422 country_filter_not_supported); the
      // country-capable listing the backend advertises is /users/list, with the
      // same paginator envelope. /users stays for the unfiltered view, whose
      // ?type=individual contract is confirmed (docs/backend-drivers-users.md §1).
      const endpoint = countryParam ? "users/list" : "users";
      const res = await fetch(`/api/proxy/${endpoint}?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      // §0.3: 422 country_not_supported must surface verbatim, never be swallowed.
      if (!res.ok) throw new Error(await apiErrorMessage(res, "Failed to fetch users", countryParam));

      const json: UsersApiResponse = await res.json();

      if (json.status === false || json.success === false) {
        throw new Error(json.message || "Failed to fetch users");
      }

      const rawUsers = json.data?.data ?? [];
      setUsers(rawUsers.map(normaliseUser));
      setPagination({
        currentPage: json.data.current_page,
        lastPage: json.data.last_page,
        total: json.data.total,
        perPage: json.data.per_page,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch users";
      setError(msg);
      logger.error("❌ fetchUsers:", msg);
    } finally {
      setIsLoading(false);
    }
  }, [countryParam]);

  const fetchPage = useCallback((page: number) => {
    fetchUsers(page);
  }, [fetchUsers]);

  const toggleBlockUser = useCallback((id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "blocked" : "active" }
          : u
      )
    );
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { 
    users, 
    isLoading, 
    error, 
    fetchUsers, 
    fetchPage,
    toggleBlockUser,
    pagination,
  };
}