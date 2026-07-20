// src/components/dashboard/batteries/battery-api.ts
//
// Battery lifecycle API. Mutations + history go through `apiClient` (proxy +
// cookie auth + envelope unwrapping). The list call uses a raw proxy fetch
// because apiClient.unwrap() collapses the Laravel paginator down to the bare
// array, and we need the pagination meta (total / current_page / last_page).

import { apiClient, ApiError } from "@/lib/api-client";
import { API_ENDPOINTS, authHeaders } from "@/config/api";
import {
  Battery,
  BatteryAssignment,
  BatteryHistory,
  BatteryLifecycleStatus,
  BatteryListResult,
  CreateBatteryPayload,
  UpdateBatteryPayload,
  UpdateBatteryStatusPayload,
  normaliseBattery,
  normaliseBatteryHistory,
  normaliseBatteryListResponse,
} from "@/types/dashboard/battery";

export interface BatteryListFilters {
  lifecycleStatus?: BatteryLifecycleStatus | "all";
  assignment?: BatteryAssignment | "all";
  fleetId?: string; // "" / "all" means no filter
  search?: string;
  page?: number;
  perPage?: number;
}

/**
 * Extracts a readable message from the four confirmed backend error shapes:
 *  - validation 422:   { message, errors: { field: string[] } }
 *  - lifecycle no-op:  { success: false, message }            (no `errors` key)
 *  - 404 not found:    { message }
 *  - 403 forbidden:    { status: false, message }             (RoleMiddleware quirk)
 * The `success`/`status` booleans carry no message info — always read `message`.
 */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const data = (err.data && typeof err.data === "object" ? err.data : {}) as Record<string, unknown>;
    if (data.errors && typeof data.errors === "object") {
      const flat = Object.values(data.errors as Record<string, unknown>)
        .flatMap((v) => (Array.isArray(v) ? v : [v]))
        .filter((v): v is string => typeof v === "string")
        .join(", ");
      if (flat) return flat;
    }
    if (typeof data.message === "string" && data.message) return data.message;
    return err.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
}

export const batteriesApi = {
  async list(filters: BatteryListFilters = {}): Promise<BatteryListResult> {
    const qs = new URLSearchParams();
    if (filters.lifecycleStatus && filters.lifecycleStatus !== "all") {
      qs.set("lifecycle_status", filters.lifecycleStatus);
    }
    if (filters.assignment && filters.assignment !== "all") qs.set("assignment", filters.assignment);
    if (filters.fleetId && filters.fleetId !== "all") qs.set("fleet_id", filters.fleetId);
    if (filters.search) qs.set("search", filters.search);
    if (filters.page) qs.set("page", String(filters.page));
    // No backend-enforced max — cap client-side so we never request huge pages.
    if (filters.perPage) qs.set("per_page", String(Math.min(filters.perPage, 100)));
    const q = qs.toString();

    const res = await fetch(`${API_ENDPOINTS.BATTERIES_LIST}${q ? `?${q}` : ""}`, {
      headers: authHeaders(),
    });
    const json: unknown = await res.json().catch(() => ({}));
    if (!res.ok) {
      const backendMsg = json && typeof json === "object" ? (json as { message?: unknown }).message : undefined;
      throw new Error(
        typeof backendMsg === "string" && backendMsg ? backendMsg : `Failed to fetch batteries (${res.status})`
      );
    }
    return normaliseBatteryListResponse(json);
  },

  /**
   * Resolves one full battery row. There is no GET /batteries/{id} show
   * endpoint — the confirmed path is the list `search` filter, which partial-
   * matches on the battery_id STRING (not the numeric id). Returns null when
   * no exact match comes back (e.g. the battery was deleted meanwhile).
   */
  async findByBatteryId(batteryId: string): Promise<Battery | null> {
    if (!batteryId) return null;
    const { items } = await batteriesApi.list({ search: batteryId, perPage: 50 });
    return (
      items.find((b) => b.battery_id === batteryId) ??
      items.find((b) => b.battery_id.toLowerCase() === batteryId.toLowerCase()) ??
      null
    );
  },

  async create(payload: CreateBatteryPayload): Promise<Battery> {
    const raw = await apiClient.post<Record<string, unknown>>("batteries", payload);
    return normaliseBattery(raw ?? {});
  },

  async update(id: number, payload: UpdateBatteryPayload): Promise<Battery> {
    const raw = await apiClient.put<Record<string, unknown>>(`batteries/${id}`, payload);
    return normaliseBattery(raw ?? {});
  },

  async updateStatus(id: number, payload: UpdateBatteryStatusPayload): Promise<Battery> {
    const raw = await apiClient.patch<Record<string, unknown>>(`batteries/${id}/status`, payload);
    return normaliseBattery(raw ?? {});
  },

  async getHistory(id: number | string): Promise<BatteryHistory> {
    return normaliseBatteryHistory(await apiClient.get<unknown>(`batteries/${id}/history`));
  },
};
