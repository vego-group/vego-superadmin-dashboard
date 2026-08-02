// src/hooks/use-operations.ts
"use client";

import { logger } from "@/lib/logger";
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { apiErrorFromBody } from "@/lib/api-error";
import { useCountryView } from "@/lib/country-view-context";
import { countryFilterIgnored, toIsoCountryCodeOrNull } from "@/types/country";
import {
  MaintenanceTicket,
  MaintenancePriority,
  MaintenanceStatus,
  OperationsSummary,
  TicketsPagination,
  TicketHistoryEntry,
} from "@/types/dashboard/maintenance";

// ─── Normalisers ─────────────────────────────────────────────────────────────
// The ticket payload shape isn't fully pinned down yet, so map defensively the
// same way use-admins does.

const PRIORITIES: MaintenancePriority[] = ["low", "medium", "high", "urgent"];
const STATUSES: MaintenanceStatus[] = ["open", "in_progress", "resolved"];

const asRecord = (v: unknown): Record<string, unknown> | null =>
  v && typeof v === "object" ? (v as Record<string, unknown>) : null;

const normaliseHistory = (raw: unknown): TicketHistoryEntry[] => {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry) => {
    const e = asRecord(entry);
    if (!e) return [];
    return [{
      status: STATUSES.includes(e.status as MaintenanceStatus) ? (e.status as MaintenanceStatus) : "open",
      note: e.note ? String(e.note) : null,
      by: e.by ? String(e.by) : (asRecord(e.user)?.name ? String(asRecord(e.user)!.name) : null),
      created_at: String(e.created_at ?? ""),
    }];
  });
};

export const normaliseTicket = (raw: Record<string, unknown>): MaintenanceTicket => {
  const moto = asRecord(raw.motorcycle);
  const fleet = asRecord(raw.fleet) ?? asRecord(moto?.fleet);
  const driver = asRecord(moto?.assigned_user);
  const resolvedBy = asRecord(raw.resolved_by);

  return {
    id: Number(raw.id ?? 0),
    ticket_number: String(raw.ticket_number ?? `MT-${raw.id ?? "?"}`),
    motorcycle_id: Number(raw.motorcycle_id ?? moto?.id ?? 0),
    issue_type: String(raw.issue_type ?? "other"),
    description: String(raw.description ?? ""),
    priority: PRIORITIES.includes(raw.priority as MaintenancePriority)
      ? (raw.priority as MaintenancePriority)
      : "medium",
    status: STATUSES.includes(raw.status as MaintenanceStatus)
      ? (raw.status as MaintenanceStatus)
      : "open",
    motorcycle: moto
      ? {
          id: Number(moto.id ?? 0),
          device_id: moto.device_id ? String(moto.device_id) : null,
          plate_number: moto.plate_number ? String(moto.plate_number) : null,
          brand: moto.brand ? String(moto.brand) : null,
          model: moto.model ? String(moto.model) : null,
          status: moto.status ? String(moto.status) : null,
        }
      : null,
    isoCountryCode:
      toIsoCountryCodeOrNull(raw.iso_country_code) ?? toIsoCountryCodeOrNull(moto?.iso_country_code),
    fleet_name: fleet?.name ? String(fleet.name) : null,
    driver_name: driver?.name ? String(driver.name) : null,
    resolved_at: raw.resolved_at ? String(raw.resolved_at) : null,
    resolved_by: resolvedBy?.name
      ? String(resolvedBy.name)
      : raw.resolved_by && typeof raw.resolved_by !== "object"
        ? String(raw.resolved_by)
        : null,
    history: normaliseHistory(raw.history),
    created_at: String(raw.created_at ?? ""),
  };
};

// ─── Summary ─────────────────────────────────────────────────────────────────
export function useOperationsSummary() {
  const [summary, setSummary] = useState<OperationsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get<Record<string, unknown>>("operations/summary");
      setSummary({
        offline_cabinets: Number(data?.offline_cabinets ?? 0),
        active_alarms: Number(data?.active_alarms ?? 0),
        open_incidents: Number(data?.open_incidents ?? 0),
        motorcycles_in_maintenance: Number(data?.motorcycles_in_maintenance ?? 0),
        open_maintenance_tickets: Number(data?.open_maintenance_tickets ?? 0),
        new_complaints: Number(data?.new_complaints ?? 0),
      });
    } catch (err) {
      // The page still works without the header cards — log and move on.
      logger.error("❌ fetchOperationsSummary:", err);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, isLoading, fetchSummary };
}

// ─── Tickets list ────────────────────────────────────────────────────────────
export function useMaintenanceTickets({
  status = "all",
  page = 1,
  perPage = 20,
}: {
  status?: string;
  page?: number;
  perPage?: number;
} = {}) {
  const { countryParam } = useCountryView();
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [pagination, setPagination] = useState<TicketsPagination>({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // GET /maintenance-tickets ?country= is CONFIRMED supported (backend answers
  // §3 — scoped through the ticket's motorcycle), and unsupported endpoints now
  // 422 with country_filter_not_supported rather than silently ignoring the
  // param. The row-level check stays as cheap insurance against a regression.
  const [countryFilterNotApplied, setCountryFilterNotApplied] = useState(false);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
      if (status !== "all") params.set("status", status);
      if (countryParam) params.set("country", countryParam);

      // Raw fetch (not apiClient) because we need the pagination meta that
      // apiClient.unwrap strips from Laravel-paginated envelopes.
      const res = await fetch(`/api/proxy/maintenance-tickets?${params.toString()}`, {
        headers: { Accept: "application/json" },
      });
      const json = await res.json();
      if (!res.ok || json.success === false || json.status === false) {
        // §0.3: 422 country_not_supported must surface, never be swallowed.
        throw new Error(apiErrorFromBody(res.status, json, "Failed to fetch tickets", countryParam));
      }

      const paged = json.data ?? {};
      const rows: Record<string, unknown>[] = Array.isArray(paged) ? paged : paged.data ?? [];
      const normalised = rows.map(normaliseTicket);
      setTickets(normalised);
      // Visible warning only — never client-side filter (that would fake
      // per-country pagination and totals).
      setCountryFilterNotApplied(
        countryFilterIgnored(countryParam, normalised.map((tk) => tk.isoCountryCode))
      );
      setPagination({
        currentPage: Number(paged.current_page ?? 1),
        lastPage: Number(paged.last_page ?? 1),
        total: Number(paged.total ?? rows.length),
        perPage: Number(paged.per_page ?? perPage),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch tickets";
      setError(msg);
      logger.error("❌ fetchMaintenanceTickets:", msg);
    } finally {
      setIsLoading(false);
    }
  }, [status, page, perPage, countryParam]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, pagination, isLoading, error, fetchTickets, countryFilterNotApplied };
}
