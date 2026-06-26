// src/components/dashboard/vehicle-control/vehicle-api.ts
//
// Talks to the backend through the Next.js proxy (`/api/proxy/*`).
// The proxy base already points at `…/api/super-admin`, so the paths below
// resolve to `/super-admin/vehicle-control/*` on the backend.

import { logger } from "@/lib/logger";
import type {
  SuperadminVehicle,
  VehicleBattery,
  VehicleStatistics,
  VehicleOwnerType,
  VehicleStatus,
  GpsSignal,
  SuperadminDriver,
  SuperadminUser,
} from "./types";

const BASE = "/api/proxy/vehicle-control";

// ── helpers ──────────────────────────────────────────────────────────────────
type Raw = Record<string, unknown>;

/** Unwraps `{ data: … }` / `{ data: { data: … } }` envelopes and returns an array. */
function extractList(raw: unknown): Raw[] {
  if (Array.isArray(raw)) return raw as Raw[];
  if (raw && typeof raw === "object") {
    const obj = raw as Raw;
    if (Array.isArray(obj.data)) return obj.data as Raw[];
    if (obj.data && typeof obj.data === "object") {
      const inner = obj.data as Raw;
      if (Array.isArray(inner.data)) return inner.data as Raw[];
    }
  }
  return [];
}

/** Unwraps `{ data: … }` envelope and returns the object. */
function extractOne(raw: unknown): Raw {
  if (raw && typeof raw === "object") {
    const obj = raw as Raw;
    if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
      return obj.data as Raw;
    }
    return obj;
  }
  return {};
}

/** Reads the first defined value among several candidate keys (camelCase + snake_case). */
function pick<T>(r: Raw, keys: string[], fallback: T): T {
  for (const k of keys) {
    const v = r[k];
    if (v !== undefined && v !== null) return v as T;
  }
  return fallback;
}

function toNum(v: unknown, fallback = 0): number {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : fallback;
}

// ── mappers ──────────────────────────────────────────────────────────────────
export function mapVehicle(r: Raw): SuperadminVehicle {
  const coordsRaw = pick<Raw | null>(r, ["coordinates"], null) ?? {};
  const lat = toNum(pick(r, ["lat", "current_lat"], coordsRaw.lat), 0);
  const lng = toNum(pick(r, ["lng", "current_lng"], coordsRaw.lng), 0);

  const id = String(pick(r, ["id", "_id"], ""));
  const rawPlate = String(pick(r, ["plateNumber", "plate_number", "device_id"], "")).trim();
  const rawModel = String(pick(r, ["model"], "")).trim();

  return {
    id,
    // Backend may send null/empty plate & model — fall back to a stable, identifiable label.
    plateNumber: rawPlate || `Vego #${id}`,
    model: rawModel,
    status: pick<VehicleStatus>(r, ["status"], "idle"),
    batteryLevel: toNum(pick(r, ["batteryLevel", "battery_level", "battery_percentage"], 0)),
    location: String(pick(r, ["location", "address", "city"], "—")),
    coordinates: { lat, lng },
    assignedDriverId: pick<string | undefined>(r, ["assignedDriverId", "assigned_driver_id"], undefined),
    assignedDriverName: pick<string | undefined>(r, ["assignedDriverName", "assigned_driver_name"], undefined),
    lastTripAt: String(pick(r, ["lastTripAt", "last_trip_at", "updated_at"], "")),
    totalDistanceKm: toNum(pick(r, ["totalDistanceKm", "total_distance_km"], 0)),
    currentSpeedKmh: toNum(pick(r, ["currentSpeedKmh", "current_speed_kmh"], 0)),
    estimatedRangeKm: toNum(pick(r, ["estimatedRangeKm", "estimated_range_km"], 0)),
    speedLimitKmh: toNum(pick(r, ["speedLimitKmh", "speed_limit_kmh"], 45)),
    isLocked: Boolean(pick(r, ["isLocked", "is_locked"], false)),
    isEngineRunning: Boolean(pick(r, ["isEngineRunning", "is_engine_running"], false)),
    gpsSignal: pick<GpsSignal>(r, ["gpsSignal", "gps_signal"], "none"),
    isOnline: Boolean(pick(r, ["isOnline", "is_online"], false)),
    ownerType: pick<VehicleOwnerType>(r, ["ownerType", "owner_type"], "individual"),
    ownerId: String(pick(r, ["ownerId", "owner_id"], "")),
    ownerName: String(pick(r, ["ownerName", "owner_name"], "")),
    companyId: pick<string | undefined>(r, ["companyId", "company_id"], undefined),
    companyName: pick<string | undefined>(r, ["companyName", "company_name"], undefined),
  };
}

function mapBattery(r: Raw): VehicleBattery {
  let voltage = toNum(pick(r, ["voltage"], 0));
  // Some BMS report millivolts (e.g. 69200) — normalize to volts for display.
  if (voltage > 200) voltage = Math.round((voltage / 1000) * 10) / 10;

  return {
    level: toNum(pick(r, ["level", "batteryLevel", "battery_level"], 0)),
    rangeKm: toNum(pick(r, ["rangeKm", "range_km"], 0)),
    sohPct: toNum(pick(r, ["sohPct", "soh_pct", "soh"], 0)),
    voltage,
    temperature: toNum(pick(r, ["temperature", "temp"], 0)),
  };
}

function mapDriver(r: Raw): SuperadminDriver {
  return {
    id: String(pick(r, ["id", "_id"], "")),
    name: String(pick(r, ["name", "fullName", "full_name"], "—")),
    phone: pick<string | undefined>(r, ["phone"], undefined),
    companyId: pick<string | undefined>(r, ["companyId", "company_id"], undefined),
    companyName: pick<string | undefined>(r, ["companyName", "company_name"], undefined),
    status: pick<string | undefined>(r, ["status"], undefined),
  };
}

function mapUser(r: Raw): SuperadminUser {
  return {
    id: String(pick(r, ["id", "_id"], "")),
    name: String(pick(r, ["name", "fullName", "full_name"], "—")),
    phone: pick<string | undefined>(r, ["phone"], undefined),
    email: pick<string | undefined>(r, ["email"], undefined),
    city: pick<string | undefined>(r, ["city"], undefined),
  };
}

function mapStatistics(r: Raw): VehicleStatistics {
  return {
    trips: toNum(pick(r, ["trips"], 0)),
    swaps: toNum(pick(r, ["swaps"], 0)),
    alarms: toNum(pick(r, ["alarms"], 0)),
    totalDistanceKm: toNum(pick(r, ["totalDistanceKm", "total_distance_km"], 0)),
  };
}

// ── requests ─────────────────────────────────────────────────────────────────
export async function listVehicles(params?: {
  ownerType?: VehicleOwnerType;
  companyId?: string;
  userId?: string;
  search?: string;
}): Promise<SuperadminVehicle[]> {
  const qs = new URLSearchParams();
  if (params?.ownerType) qs.set("ownerType", params.ownerType);
  if (params?.companyId) qs.set("companyId", params.companyId);
  if (params?.userId) qs.set("userId", params.userId);
  if (params?.search) qs.set("search", params.search);
  const q = qs.toString();
  const res = await fetch(`${BASE}/vehicles${q ? `?${q}` : ""}`, {
    headers: { Accept: "application/json" },
  });
  const json = await res.json();
  return extractList(json).map(mapVehicle);
}

export async function listDrivers(params?: { companyId?: string; search?: string; status?: string }): Promise<SuperadminDriver[]> {
  try {
    const qs = new URLSearchParams();
    if (params?.companyId) qs.set("companyId", params.companyId);
    if (params?.search) qs.set("search", params.search);
    if (params?.status) qs.set("status", params.status);
    const q = qs.toString();
    const res = await fetch(`${BASE}/drivers${q ? `?${q}` : ""}`, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    return extractList(await res.json()).map(mapDriver);
  } catch (err) {
    logger.error("listDrivers:", err);
    return [];
  }
}

export async function listUsers(search?: string): Promise<SuperadminUser[]> {
  try {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await fetch(`${BASE}/users${q}`, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    return extractList(await res.json()).map(mapUser);
  } catch (err) {
    logger.error("listUsers:", err);
    return [];
  }
}

export async function getUserVehicles(userId: string): Promise<SuperadminVehicle[]> {
  try {
    const res = await fetch(`${BASE}/users/${userId}/vehicles`, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    return extractList(await res.json()).map(mapVehicle);
  } catch (err) {
    logger.error("getUserVehicles:", err);
    return [];
  }
}

export async function getBattery(id: string): Promise<VehicleBattery | null> {
  try {
    const res = await fetch(`${BASE}/vehicles/${id}/battery`, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    return mapBattery(extractOne(await res.json()));
  } catch (err) {
    logger.error("getBattery:", err);
    return null;
  }
}

export async function getStatistics(id: string): Promise<VehicleStatistics | null> {
  try {
    const res = await fetch(`${BASE}/vehicles/${id}/statistics`, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    return mapStatistics(extractOne(await res.json()));
  } catch (err) {
    logger.error("getStatistics:", err);
    return null;
  }
}

export async function assignDriver(vehicleId: string, driverId: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/vehicles/${vehicleId}/assign-driver`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ driverId, driver_id: driverId }),
    });
    return res.ok;
  } catch (err) {
    logger.error("assignDriver:", err);
    return false;
  }
}

export async function unassignDriver(vehicleId: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/vehicles/${vehicleId}/assign-driver`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });
    return res.ok;
  } catch (err) {
    logger.error("unassignDriver:", err);
    return false;
  }
}

// ── control actions ──────────────────────────────────────────────────────────
async function postControl(vehicleId: string, action: string, body?: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/vehicles/${vehicleId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    return res.ok;
  } catch (err) {
    logger.error(`${action}:`, err);
    return false;
  }
}

export const setPower = (id: string, isEngineRunning: boolean) =>
  postControl(id, "power", { isEngineRunning });

export const setLock = (id: string, isLocked: boolean) =>
  postControl(id, "lock", { isLocked });

export const setSpeedLimit = (id: string, speedLimitKmh: number) =>
  postControl(id, "speed-limit", { speedLimitKmh });

export const emergencyStop = (id: string) => postControl(id, "emergency-stop");
