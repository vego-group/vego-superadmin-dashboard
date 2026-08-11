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

// The motorcycles table uses its own status vocabulary (e.g. "inactive"), which
// isn't a VehicleStatus — map it instead of casting the raw string through.
const KNOWN_STATUSES: VehicleStatus[] = ["active", "charging", "idle", "maintenance"];
function toVehicleStatus(v: unknown): VehicleStatus {
  const s = String(v ?? "").toLowerCase();
  if ((KNOWN_STATUSES as string[]).includes(s)) return s as VehicleStatus;
  if (s === "inactive" || s === "blocked" || s === "suspended") return "idle";
  return "idle";
}

// ── mappers ──────────────────────────────────────────────────────────────────
export function mapVehicle(r: Raw): SuperadminVehicle {
  const coordsRaw = pick<Raw | null>(r, ["coordinates"], null) ?? {};
  const lat = toNum(pick(r, ["lat", "current_lat"], coordsRaw.lat), 0);
  const lng = toNum(pick(r, ["lng", "current_lng"], coordsRaw.lng), 0);

  const id = String(pick(r, ["id", "_id"], ""));
  const rawPlate = String(pick(r, ["plateNumber", "plate_number"], "")).trim();
  // Device identifier used as the display label when no real plate exists
  // (e.g. "MOTO019"). Falls back through the different payload shapes.
  const deviceLabel = String(pick(r, ["motorcycle_id", "motorcycleId", "device_id", "deviceId"], "")).trim();
  const rawModel = String(pick(r, ["model"], "")).trim();

  // On the motorcycles payload the IMEI is the `device_id` string itself
  // (e.g. "862499071461720"); explicit imei fields win if ever present.
  const iot = pick<Raw | null>(r, ["iot_device", "iotDevice", "device"], null) ?? {};
  const imei = String(
    pick(r, ["imei", "device_imei"], "") ||
    pick(iot, ["imei"], "") ||
    pick(r, ["device_id", "deviceId"], "")
  );

  // Relations on the ?live=1 payload: battery + assigned_user.
  const batteryRel = pick<Raw | null>(r, ["battery"], null) ?? {};
  const assignedUser = pick<Raw | null>(r, ["assigned_user", "assignedUser"], null) ?? {};
  const assignedId = pick<unknown>(r, ["assignedDriverId", "assigned_driver_id", "assigned_user_id"], undefined);

  return {
    id,
    deviceImei: imei,
    // Prefer the real plate; otherwise show the device id (motorcycle_id, e.g.
    // "MOTO019") before the last-resort synthetic label.
    plateNumber: rawPlate || deviceLabel || `Vego #${id}`,
    model: rawModel,
    status: toVehicleStatus(pick(r, ["status"], "idle")),
    batteryLevel: toNum(pick(r, ["batteryLevel", "battery_level", "battery_percentage"], batteryRel.battery_percentage)),
    location: String(pick(r, ["location", "address", "city"], "—")),
    coordinates: { lat, lng },
    assignedDriverId: assignedId != null ? String(assignedId) : undefined,
    assignedDriverName:
      pick<string | undefined>(r, ["assignedDriverName", "assigned_driver_name"], undefined) ??
      (assignedUser.name ? String(assignedUser.name) : undefined),
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

  const sohRaw = pick<unknown>(r, ["sohPct", "soh_pct", "soh"], null);
  let sohPct: number | null = null;
  if (sohRaw !== null && sohRaw !== undefined && sohRaw !== "") {
    const n = toNum(sohRaw, Number.NaN);
    if (Number.isFinite(n) && n > 0) sohPct = n;
  }

  return {
    level: toNum(pick(r, ["level", "batteryLevel", "battery_level"], 0)),
    rangeKm: toNum(pick(r, ["rangeKm", "range_km"], 0)),
    sohPct,
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

// Live IoT snapshot — MUST pull from Vego first via ?live=1 (refreshMotorcycle).
// vehicle-control show is DB/GPS cache only and must not short-circuit the live path.
export async function getLiveVehicle(id: string): Promise<SuperadminVehicle | null> {
  try {
    const live = await fetch(`/api/proxy/motorcycles/${id}?live=1`, {
      headers: { Accept: "application/json" },
    });
    if (live.ok) return mapVehicle(extractOne(await live.json()));

    const cached = await fetch(`${BASE}/vehicles/${id}`, {
      headers: { Accept: "application/json" },
    });
    if (cached.ok) return mapVehicle(extractOne(await cached.json()));

    logger.warn(`getLiveVehicle: live endpoints failed (${live.status}/${cached.status})`);
    return null;
  } catch (err) {
    logger.error("getLiveVehicle:", err);
    return null;
  }
}

// Overlay only the live telemetry onto the list row — mapVehicle fills absent
// fields with defaults, so a blind spread would wipe good list data.
export function mergeLiveVehicle(base: SuperadminVehicle, live: SuperadminVehicle): SuperadminVehicle {
  return {
    ...base,
    // /vehicle-control/vehicles doesn't include the IMEI — pick it up from the
    // motorcycles record so IoT control actions become possible.
    deviceImei: base.deviceImei || live.deviceImei,
    ...(live.coordinates.lat || live.coordinates.lng ? { coordinates: live.coordinates } : {}),
    ...(live.location !== "—" ? { location: live.location } : {}),
    ...(live.batteryLevel > 0 ? { batteryLevel: live.batteryLevel } : {}),
    ...(live.gpsSignal !== "none" ? { gpsSignal: live.gpsSignal } : {}),
    currentSpeedKmh: live.currentSpeedKmh,
    isEngineRunning: live.isEngineRunning,
    isLocked: live.isLocked,
    isOnline: live.isOnline,
    status: live.status,
    lastTripAt: live.lastTripAt || base.lastTripAt,
  };
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
    const json = await res.json().catch(() => ({})) as Record<string, unknown>;
    return res.ok && json.success === true;
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
    const json = await res.json().catch(() => ({})) as Record<string, unknown>;
    return res.ok && json.success === true;
  } catch (err) {
    logger.error("unassignDriver:", err);
    return false;
  }
}

// ── control actions ──────────────────────────────────────────────────────────
// Superadmin vehicle control goes through motorcycle id:
//   POST /super-admin/vehicle-control/vehicles/{motorcycle}/{power|lock|speed-limit|emergency-stop}
// Backend then reaches the physical bike via Vego IoT. Ack = "command accepted";
// live poll confirms the new state shortly after.
const IOT_BASE = "/api/proxy/iot-devices";

// Registry helper — used only to enrich the list UI with IMEI labels.
// Returns null when the registry can't be read (callers then keep the fallback).
export async function getImeiByMotorcycle(): Promise<Map<string, string> | null> {
  try {
    const res = await fetch(`${IOT_BASE}?per_page=100`, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const map = new Map<string, string>();
    const devices = extractList(await res.json());
    for (const d of devices) {
      const imei = String(pick(d, ["imei", "device_imei"], ""));
      const moto = pick<Raw | null>(d, ["assigned_motorcycle", "assignedMotorcycle", "motorcycle"], null);
      const motoId = pick<unknown>(d, ["motorcycle_id", "motorcycleId"], moto?.id ?? null);
      if (imei && motoId != null) map.set(String(motoId), imei);
    }
    if (devices.length > 0 && map.size === 0) {
      logger.warn("getImeiByMotorcycle: registry returned devices but none are linked to a motorcycle", devices[0]);
    }
    return map;
  } catch (err) {
    logger.error("getImeiByMotorcycle:", err);
    return null;
  }
}

/** Outcome of a vehicle control command, carrying the engine receipt verdict. */
export type ControlResult = {
  ok: boolean;
  /** `delivery_status` from the engine receipt; null on legacy ACK-less devices. */
  deliveryStatus: string | null;
  /** Accepted, but the device has not confirmed the physical state yet. */
  unconfirmed: boolean;
};

async function postVehicleControl(
  motorcycleId: string,
  action: string,
  body?: Record<string, unknown>,
): Promise<ControlResult> {
  const fail: ControlResult = { ok: false, deliveryStatus: null, unconfirmed: false };
  if (!motorcycleId) {
    logger.error(`vehicle-control ${action}: missing motorcycle id`);
    return fail;
  }
  try {
    const res = await fetch(`${BASE}/vehicles/${encodeURIComponent(motorcycleId)}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const json = await res.json().catch(() => ({})) as Record<string, unknown>;
    const data = (json.data && typeof json.data === "object" ? json.data : {}) as Record<string, unknown>;
    const rawDelivery = data.delivery_status;
    const deliveryStatus = typeof rawDelivery === "string" && rawDelivery !== "" ? rawDelivery : null;
    const ok = res.ok && json.success === true;
    if (!ok) {
      logger.error(
        `vehicle-control ${action} failed (${res.status}) for ${motorcycleId}:`,
        json.message ?? json.data ?? json,
      );
      return { ...fail, deliveryStatus };
    }
    // Anything short of an explicit `confirmed` (accepted / queued / legacy
    // null) means the device hasn't proven the physical state yet.
    return { ok: true, deliveryStatus, unconfirmed: deliveryStatus !== "confirmed" };
  } catch (err) {
    logger.error(`vehicle-control ${action}:`, err);
    return fail;
  }
}

export const setPower = (motorcycleId: string, isEngineRunning: boolean) =>
  postVehicleControl(motorcycleId, "power", { isEngineRunning });

export const setLock = (motorcycleId: string, isLocked: boolean) =>
  postVehicleControl(motorcycleId, "lock", { isLocked });

export const setSpeedLimit = (motorcycleId: string, speedLimitKmh: number) =>
  postVehicleControl(motorcycleId, "speed-limit", { speedLimitKmh });

export const emergencyStop = (motorcycleId: string) =>
  postVehicleControl(motorcycleId, "emergency-stop");
