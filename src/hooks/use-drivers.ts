// src/hooks/use-drivers.ts
"use client";

import { logger } from "@/lib/logger";
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { parseMoney } from "@/lib/money";
import { countryFilterIgnored, currencyForIso, toIsoCountryCodeOrNull } from "@/types/country";
import { apiErrorFromBody } from "@/lib/api-error";
import { useCountryView } from "@/lib/country-view-context";
import { Driver, DriversPagination, FleetOption, DocumentStatus } from "@/types/dashboard/driver";

const DOC_STATUSES: DocumentStatus[] = ["not_uploaded", "pending", "approved", "rejected"];

const asRecord = (v: unknown): Record<string, unknown> | null =>
  v && typeof v === "object" ? (v as Record<string, unknown>) : null;

const asDocStatus = (v: unknown): DocumentStatus | null =>
  DOC_STATUSES.includes(v as DocumentStatus) ? (v as DocumentStatus) : null;

export const normaliseDriver = (raw: Record<string, unknown>): Driver => {
  const fleet = asRecord(raw.fleet);
  const motorcycle = asRecord(raw.motorcycle);
  const vehicle = asRecord(raw.assigned_vehicle);
  return {
    id: Number(raw.id ?? 0),
    name: String(raw.name ?? "Unknown"),
    email: raw.email ? String(raw.email) : null,
    phone: raw.phone ? String(raw.phone) : null,
    status: String(raw.status ?? "active"),
    // §0.2 guard: on a USER payload `country_code` is the dial code ("+962"),
    // so it is only ever a fallback here — toIsoCountryCodeOrNull rejects
    // anything that isn't 2-letter ISO, so a dial code can never slip through.
    isoCountryCode: toIsoCountryCodeOrNull(raw.iso_country_code ?? raw.country_code),
    // §14: `?country=` matches drivers through their FLEET's country, so this
    // is the field the Country column reads.
    fleetCountry: toIsoCountryCodeOrNull(
      raw.fleet_country ?? fleet?.iso_country_code ?? fleet?.country_code
    ),
    fleet_id: raw.fleet_id != null ? Number(raw.fleet_id) : fleet?.id != null ? Number(fleet.id) : null,
    fleet_name: fleet?.company_name
      ? String(fleet.company_name)
      : raw.fleet_name
        ? String(raw.fleet_name)
        : null,
    // New money shape { balance, currency, ... }. A legacy bare number takes
    // its currency from the record's iso_country_code; with neither it renders
    // unit-less (never assumed SAR).
    wallet_balance: parseMoney(raw.wallet_balance ?? raw.wallet, {
      ...currencyForIso(raw.iso_country_code),
      source: "GET /drivers wallet_balance",
    }),
    license_status: asDocStatus(raw.license_status),
    plate_status: asDocStatus(raw.plate_status),
    motorcycle_plate: motorcycle?.plate_number
      ? String(motorcycle.plate_number)
      : motorcycle?.device_id
        ? String(motorcycle.device_id)
        : null,
    created_at: String(raw.created_at ?? ""),

    // Full-profile fields (populated on the detail endpoint)
    address: raw.address ? String(raw.address) : null,
    city: raw.city ? String(raw.city) : null,
    has_license: Boolean(raw.has_license),
    license_number: raw.license_number ? String(raw.license_number) : null,
    license_expiry: raw.license_expiry ? String(raw.license_expiry) : null,
    license_photo_front_url: raw.license_photo_front_url ? String(raw.license_photo_front_url) : null,
    license_photo_back_url: raw.license_photo_back_url ? String(raw.license_photo_back_url) : null,
    plate_number: raw.plate_number ? String(raw.plate_number) : null,
    plate_photo_url: raw.plate_photo_url ? String(raw.plate_photo_url) : null,
    assigned_vehicle: vehicle
      ? {
          id: Number(vehicle.id ?? 0),
          device_id: vehicle.device_id ? String(vehicle.device_id) : null,
          model: vehicle.model ? String(vehicle.model) : null,
          plate_number: vehicle.plate_number ? String(vehicle.plate_number) : null,
        }
      : null,
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
  const { countryParam } = useCountryView();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  // GET /drivers ?country= is CONFIRMED supported (backend answers §3 — scoped
  // by the driver's fleet's country), and any endpoint that doesn't support it
  // now 422s with country_filter_not_supported rather than silently ignoring
  // it. The row-level check below stays as cheap insurance against a
  // regression to silent-ignore.
  const [countryFilterNotApplied, setCountryFilterNotApplied] = useState(false);
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
      if (countryParam) params.set("country", countryParam);

      // Raw fetch to keep the Laravel pagination meta (apiClient strips it).
      const res = await fetch(`/api/proxy/drivers?${params.toString()}`, {
        headers: { Accept: "application/json" },
      });
      const json = await res.json();
      if (!res.ok || json.success === false || json.status === false) {
        // §0.3: 422 country_not_supported must surface, never be swallowed.
        throw new Error(apiErrorFromBody(res.status, json, "Failed to fetch drivers", countryParam));
      }

      const paged = json.data ?? {};
      const rows: Record<string, unknown>[] = Array.isArray(paged) ? paged : paged.data ?? [];
      const normalised = rows.map(normaliseDriver);
      setDrivers(normalised);
      // Visible warning only — never client-side filter (that would fake
      // per-country pagination and totals).
      // Compare on the FLEET country — that is what the server filters on, so
      // a driver whose own country differs from their fleet's is not evidence
      // the filter was ignored.
      setCountryFilterNotApplied(
        countryFilterIgnored(countryParam, normalised.map((d) => d.fleetCountry))
      );
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
  }, [fleetId, status, search, page, perPage, countryParam]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return { drivers, pagination, isLoading, error, fetchDrivers, countryFilterNotApplied };
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
