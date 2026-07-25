// src/hooks/use-users.ts
"use client";

import { logger } from '@/lib/logger';
import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  status: "active" | "inactive" | "blocked" | "pending";
  created_at: string;
  account_type?: string;
  fleet_id?: number | null;
  first_name?: string | null;
  last_name?: string | null;
  has_license?: boolean;
}

interface UsersApiResponse {
  status: boolean;
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
  wallet_balance: number | null;
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
    wallet_balance: raw.wallet_balance != null ? Number(raw.wallet_balance) : null,
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
      const res = await fetch(`/api/proxy/users?type=individual&page=${page}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch users (${res.status})`);

      const json: UsersApiResponse = await res.json();

      if (!json.status) {
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
  }, []);

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