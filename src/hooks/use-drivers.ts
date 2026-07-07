// src/hooks/use-drivers.ts
"use client";

import { logger } from "@/lib/logger";
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { Driver, DriversPagination, FleetOption, DocumentStatus } from "@/types/dashboard/driver";

const DOC_STATUSES: DocumentStatus[] = ["not_uploaded", "pending", "verified", "rejected"];

const asRecord = (v: unknown): Record<string, unknown> | null =>
  v && typeof v === "object" ? (v as Record<string, unknown>) : null;

const asDocStatus = (v: unknown): DocumentStatus | null =>
  DOC_STATUSES.includes(v as DocumentStatus) ? (v as DocumentStatus) : null;

export const normaliseDriver = (raw: Record<string, unknown>): Driver => {
  const fleet = asRecord(raw.fleet);
  const motorcycle = asRecord(raw.motorcycle);
  return {
    id: Number(raw.id ?? 0),
    name: String(raw.name ?? "Unknown"),
    email: raw.email ? String(raw.email) : null,
    phone: raw.phone ? String(raw.phone) : null,
    status: String(raw.status ?? "active"),
    fleet_id: raw.fleet_id != null ? Number(raw.fleet_id) : fleet?.id != null ? Number(fleet.id) : null,
    fleet_name: fleet?.company_name
      ? String(fleet.company_name)
      : raw.fleet_name
        ? String(raw.fleet_name)
        : null,
    wallet_balance: raw.wallet_balance != null ? Number(raw.wallet_balance) : null,
    license_status: asDocStatus(raw.license_status),
    plate_status: asDocStatus(raw.plate_status),
    trips_count: raw.trips_count != null ? Number(raw.trips_count) : null,
    motorcycle_plate: motorcycle?.plate_number
      ? String(motorcycle.plate_number)
      : motorcycle?.device_id
        ? String(motorcycle.device_id)
        : null,
    created_at: String(raw.created_at ?? ""),
  };
};

export function useDrivers({
  fleetId = "all",
  status = "all",
  search = "",
  page = 1,
  perPage = 15,
}: {
  fleetId?: string;
  status?: string;
  search?: string;
  page?: number;
  perPage?: number;
} = {}) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [pagination, setPagination] = useState<DriversPagination>({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 15,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
      if (fleetId !== "all") params.set("fleet_id", fleetId);
      if (status !== "all") params.set("status", status);
      if (search.trim()) params.set("search", search.trim());

      // Raw fetch to keep the Laravel pagination meta (apiClient strips it).
      const res = await fetch(`/api/proxy/drivers?${params.toString()}`, {
        headers: { Accept: "application/json" },
      });
      const json = await res.json();
      if (!res.ok || json.success === false || json.status === false) {
        throw new Error(json.message || `Failed to fetch drivers (${res.status})`);
      }

      const paged = json.data ?? {};
      const rows: Record<string, unknown>[] = Array.isArray(paged) ? paged : paged.data ?? [];
      setDrivers(rows.map(normaliseDriver));
      setPagination({
        currentPage: Number(paged.current_page ?? 1),
        lastPage: Number(paged.last_page ?? 1),
        total: Number(paged.total ?? rows.length),
        perPage: Number(paged.per_page ?? perPage),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch drivers";
      setError(msg);
      logger.error("❌ fetchDrivers:", msg);
    } finally {
      setIsLoading(false);
    }
  }, [fleetId, status, search, page, perPage]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return { drivers, pagination, isLoading, error, fetchDrivers };
}

// Fleet names for the filter dropdown — one page of 100 covers current scale.
export function useFleetOptions() {
  const [fleets, setFleets] = useState<FleetOption[]>([]);

  useEffect(() => {
    apiClient
      .get<Record<string, unknown>[]>("fleets?per_page=100")
      .then((list) => {
        if (!Array.isArray(list)) return;
        setFleets(
          list.flatMap((f) => {
            const r = asRecord(f);
            if (!r?.id) return [];
            return [{ id: Number(r.id), company_name: String(r.company_name ?? `#${r.id}`) }];
          })
        );
      })
      .catch((err) => logger.error("❌ fetchFleetOptions:", err));
  }, []);

  return fleets;
}
