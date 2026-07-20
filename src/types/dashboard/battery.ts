// src/types/dashboard/battery.ts
// Battery lifecycle domain types + normalisers, matching the confirmed backend
// contract (controller/model source + test suite — not guesswork).
//
// Cross-endpoint field-name note: mobile/fleet-admin responses call the charge
// level `soc`; the super-admin endpoints call the same underlying value
// `battery_percentage`. Also, `GET /mobile/battery/mine` returns its fields flat
// under `data` (not nested in a `battery` key) — relevant if that endpoint is
// ever consumed here.

export type BatteryLifecycleStatus = "active" | "under_review" | "retired";
export type BatteryAssignment = "in_motorcycle" | "in_cabinet" | "unassigned";

export const BATTERY_LIFECYCLE_STATUSES: BatteryLifecycleStatus[] = ["active", "under_review", "retired"];

/** The only values create/update accept for `status` — anything else 422s. */
export type BatterySettableStatus = "active" | "charging" | "maintenance";
export const BATTERY_SETTABLE_STATUSES: BatterySettableStatus[] = ["active", "charging", "maintenance"];

// Rows can additionally carry location values (in_cabinet / in_motorcycle) owned
// by the assign-battery/swap flows — read-only in this module. `(string & {})`
// keeps the union open for backend additions without losing autocompletion.
export type BatteryStatus = BatterySettableStatus | "in_cabinet" | "in_motorcycle" | (string & {});

export interface Battery {
  id: number;
  battery_id: string;
  battery_type: string;
  /** Operational/location status — distinct from lifecycle_status. */
  status: BatteryStatus;
  lifecycle_status: BatteryLifecycleStatus;
  /** Charge level; mobile/fleet-admin endpoints expose the same value as `soc`. */
  battery_percentage: number;
  /**
   * Laravel decimal:2 cast — serialized as a string (e.g. "98.50") or null.
   * Kept raw for exact display; parseFloat() at the point of use for math/sorting.
   */
  soh: string | null;
  capacity_ah: number | null;
  cycle_count: number;
  physical_damage: boolean;
  notes: string | null;
  decommission_reason: string | null;
  decommissioned_at: string | null;
  motorcycle_id: number | null;
  cabinet_id: number | null;
  fleet_id: number | null;
  assignment: BatteryAssignment;
  created_at: string;
  updated_at: string;
}

/**
 * Row shape of `GET /fleet-admin/batteries`. Materially different from the
 * super-admin list: NOT paginated (bare array under `data`), exposes raw model
 * fields (`motorcycle_id`, `battery_swap_cabinet_id`, `cabinet_box_no`,
 * `updated_at`) directly, and the cabinet relation key is `battery_swap_cabinet`
 * (full model), not `cabinet`.
 *
 * Scope note: the endpoint returns a UNION of the fleet's own fitted batteries,
 * every battery in any cabinet (shared pool), and every unassigned spare — so
 * UI copy should say "Batteries" / "Available battery inventory", never
 * "Your fleet's batteries".
 */
export interface FleetAdminBattery extends Battery {
  cabinet_box_no: number | string | null;
}

export interface CreateBatteryPayload {
  battery_id: string;
  battery_type: string;
  status: BatterySettableStatus;
  battery_percentage: number;
  // Sent as a number — Laravel casts it; it comes BACK as a decimal string.
  soh: number;
  capacity_ah: number;
  cycle_count: number;
  physical_damage: boolean;
  notes?: string;
}

export interface UpdateBatteryPayload {
  soh?: number;
  cycle_count?: number;
  capacity_ah?: number;
  physical_damage?: boolean;
  notes?: string;
}

export interface UpdateBatteryStatusPayload {
  lifecycle_status: BatteryLifecycleStatus;
  reason?: string;
}

// ─── Dispensability ───────────────────────────────────────────────────────────
/**
 * Whether a battery can actually be taken from a cabinet. Cabinet-level
 * `available_batteries` / `ready_batteries` counts are computed purely from
 * `status === 'in_cabinet' && charge >= 80` and do NOT exclude retired,
 * under-review, or physically damaged units — never derive per-unit
 * eligibility from those counts; they are rough capacity display only.
 */
export const isBatteryDispensable = (
  b: Pick<Battery, "lifecycle_status" | "physical_damage">
): boolean => b.lifecycle_status === "active" && !b.physical_damage;

// ─── History (GET /batteries/{id}/history) ────────────────────────────────────
// Not paginated — always full, newest first. The four arrays are always present
// ([] when empty, never null/omitted) and `battery` is always present.

/** A motorcycle or cabinet the battery has touched (id + display label). */
export interface BatteryRelationRef {
  id: number;
  label: string;
}

export interface BatteryHistorySnapshot {
  id: number;
  battery_id: string;
  status: BatteryStatus;
  lifecycle_status: BatteryLifecycleStatus;
  physical_damage: boolean;
  assignment: BatteryAssignment;
  current_motorcycle: { id: number; plate_number: string | null } | null;
  current_cabinet: { id: number; cabinet_id: string | null; box_no: number | string | null } | null;
}

export interface BatteryStatusHistoryEntry {
  from_status: BatteryLifecycleStatus | null;
  to_status: BatteryLifecycleStatus;
  reason: string | null;
  changed_by: { id: number; name: string } | null;
  at: string;
}

/**
 * Each entry is ONE direction of ONE swap session — a full swap typically
 * produces two entries (possibly different sessions/timestamps).
 */
export type BatterySwapEvent = "returned_to_cabinet" | "dispensed_to_motorcycle";

export interface BatterySwapHistoryEntry {
  swap_session_id: number | null;
  event: BatterySwapEvent;
  /** Swap-session status. */
  status: string | null;
  cabinet: { id: number; cabinet_id: string | null; name: string | null } | null;
  /** Integer for returned_to_cabinet; null for dispensed_to_motorcycle (dispense slots aren't persisted). */
  slot_number: number | null;
  motorcycle: { id: number; brand: string | null; model: string | null; plate_number: string | null } | null;
  at: string;
}

export interface BatteryHistory {
  battery: BatteryHistorySnapshot | null;
  status_history: BatteryStatusHistoryEntry[];
  swap_history: BatterySwapHistoryEntry[];
  motorcycles: BatteryRelationRef[];
  cabinets: BatteryRelationRef[];
}

// ─── List result ──────────────────────────────────────────────────────────────
export interface BatteryListMeta {
  total: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
}

/** meta is null when the backend returned a plain (unpaginated) array. */
export interface BatteryListResult {
  items: Battery[];
  meta: BatteryListMeta | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
type Raw = Record<string, unknown>;

function pick(r: Raw, keys: string[]): unknown {
  for (const k of keys) {
    const v = r[k];
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
}

function toNum(v: unknown, fallback = 0): number {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : fallback;
}

function toNumOrNull(v: unknown): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = toNum(v, NaN);
  return Number.isFinite(n) ? n : null;
}

function toStrOrNull(v: unknown): string | null {
  return v === undefined || v === null || v === "" ? null : String(v);
}

export function toLifecycleStatus(v: unknown): BatteryLifecycleStatus {
  const s = String(v ?? "").toLowerCase();
  return (BATTERY_LIFECYCLE_STATUSES as string[]).includes(s) ? (s as BatteryLifecycleStatus) : "active";
}

function toLifecycleStatusOrNull(v: unknown): BatteryLifecycleStatus | null {
  if (v === undefined || v === null || v === "") return null;
  const s = String(v).toLowerCase();
  return (BATTERY_LIFECYCLE_STATUSES as string[]).includes(s) ? (s as BatteryLifecycleStatus) : null;
}

function isRaw(v: unknown): v is Raw {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function toAssignment(explicit: unknown, motorcycleId: number | null, cabinetId: number | null): BatteryAssignment {
  const s = String(explicit ?? "").toLowerCase();
  if (s === "in_motorcycle" || s === "in_cabinet" || s === "unassigned") return s as BatteryAssignment;
  // Fallback derivation — super-admin rows always carry `assignment` directly.
  return motorcycleId !== null ? "in_motorcycle" : cabinetId !== null ? "in_cabinet" : "unassigned";
}

// ─── Normalisers ──────────────────────────────────────────────────────────────
export function normaliseBattery(raw: Raw): Battery {
  const motorcycleId = toNumOrNull(pick(raw, ["motorcycle_id", "motorcycleId"]));
  const cabinetId = toNumOrNull(
    pick(raw, ["battery_swap_cabinet_id", "cabinet_id", "batterySwapCabinetId", "cabinetId"])
  );

  return {
    id: toNum(pick(raw, ["id", "_id"]), 0),
    battery_id: String(pick(raw, ["battery_id", "batteryId"]) ?? ""),
    battery_type: String(pick(raw, ["battery_type", "batteryType"]) ?? ""),
    status: String(pick(raw, ["status"]) ?? ""),
    lifecycle_status: toLifecycleStatus(pick(raw, ["lifecycle_status", "lifecycleStatus"])),
    battery_percentage: toNum(pick(raw, ["battery_percentage", "batteryPercentage", "soc"])),
    // decimal:2 cast — keep the raw string ("98.50") for exact display.
    soh: toStrOrNull(pick(raw, ["soh"])),
    capacity_ah: toNumOrNull(pick(raw, ["capacity_ah", "capacityAh"])),
    cycle_count: toNum(pick(raw, ["cycle_count", "cycleCount"])),
    physical_damage: Boolean(pick(raw, ["physical_damage", "physicalDamage"])),
    notes: toStrOrNull(pick(raw, ["notes"])),
    decommission_reason: toStrOrNull(pick(raw, ["decommission_reason", "decommissionReason"])),
    decommissioned_at: toStrOrNull(pick(raw, ["decommissioned_at", "decommissionedAt"])),
    motorcycle_id: motorcycleId,
    cabinet_id: cabinetId,
    fleet_id: toNumOrNull(pick(raw, ["fleet_id", "fleetId"])),
    assignment: toAssignment(pick(raw, ["assignment"]), motorcycleId, cabinetId),
    created_at: String(pick(raw, ["created_at", "createdAt"]) ?? ""),
    updated_at: String(pick(raw, ["updated_at", "updatedAt"]) ?? ""),
  };
}

/** Fleet-admin rows: same base fields plus raw `cabinet_box_no`; the nested
 *  `battery_swap_cabinet` / `motorcycle.iot_device.latest_battery` relations
 *  are tolerated but not mapped. */
export function normaliseFleetAdminBattery(raw: Raw): FleetAdminBattery {
  return {
    ...normaliseBattery(raw),
    cabinet_box_no: (pick(raw, ["cabinet_box_no", "cabinetBoxNo"]) as number | string | undefined) ?? null,
  };
}

/** `GET /fleet-admin/batteries` is never paginated — `data` is a bare array. */
export function normaliseFleetAdminBatteryList(json: unknown): FleetAdminBattery[] {
  const list = Array.isArray(json) ? json : isRaw(json) && Array.isArray(json.data) ? json.data : [];
  return (list as Raw[]).map(normaliseFleetAdminBattery);
}

function paginatorMeta(obj: Raw): BatteryListMeta | null {
  if (pick(obj, ["total", "current_page", "currentPage"]) === undefined) return null;
  const perPage = toNum(pick(obj, ["per_page", "perPage"]), 15);
  const total = toNum(pick(obj, ["total"]), 0);
  return {
    total,
    currentPage: toNum(pick(obj, ["current_page", "currentPage"]), 1),
    lastPage: toNum(pick(obj, ["last_page", "lastPage"]), Math.max(1, Math.ceil(total / Math.max(1, perPage)))),
    perPage,
  };
}

/** Accepts the raw (pre-unwrap) list JSON: plain array, Laravel paginator, or enveloped paginator. */
export function normaliseBatteryListResponse(json: unknown): BatteryListResult {
  if (Array.isArray(json)) return { items: (json as Raw[]).map(normaliseBattery), meta: null };
  if (isRaw(json)) {
    if (Array.isArray(json.data)) {
      return { items: (json.data as Raw[]).map(normaliseBattery), meta: paginatorMeta(json) };
    }
    if (isRaw(json.data)) {
      const inner = json.data;
      if (Array.isArray(inner.data)) {
        return { items: (inner.data as Raw[]).map(normaliseBattery), meta: paginatorMeta(inner) };
      }
    }
  }
  return { items: [], meta: null };
}

// ─── History normalisers (confirmed key names — no alternates) ────────────────
function toRawArray(v: unknown): Raw[] {
  return Array.isArray(v) ? (v as Raw[]) : [];
}

function normaliseHistorySnapshot(raw: Raw): BatteryHistorySnapshot {
  const moto = isRaw(raw.current_motorcycle) ? raw.current_motorcycle : null;
  const cab = isRaw(raw.current_cabinet) ? raw.current_cabinet : null;
  return {
    id: toNum(raw.id, 0),
    battery_id: String(raw.battery_id ?? ""),
    status: String(raw.status ?? ""),
    lifecycle_status: toLifecycleStatus(raw.lifecycle_status),
    physical_damage: Boolean(raw.physical_damage),
    assignment: toAssignment(raw.assignment, null, null),
    current_motorcycle: moto
      ? { id: toNum(moto.id, 0), plate_number: toStrOrNull(moto.plate_number) }
      : null,
    current_cabinet: cab
      ? {
          id: toNum(cab.id, 0),
          cabinet_id: toStrOrNull(cab.cabinet_id),
          box_no: (cab.box_no as number | string | undefined) ?? null,
        }
      : null,
  };
}

function normaliseStatusHistoryEntry(raw: Raw): BatteryStatusHistoryEntry {
  const by = isRaw(raw.changed_by) ? raw.changed_by : null;
  return {
    from_status: toLifecycleStatusOrNull(raw.from_status),
    to_status: toLifecycleStatus(raw.to_status),
    reason: toStrOrNull(raw.reason),
    changed_by: by ? { id: toNum(by.id, 0), name: String(by.name ?? "") } : null,
    at: String(raw.at ?? ""),
  };
}

function normaliseSwapHistoryEntry(raw: Raw): BatterySwapHistoryEntry {
  const cab = isRaw(raw.cabinet) ? raw.cabinet : null;
  const moto = isRaw(raw.motorcycle) ? raw.motorcycle : null;
  const event = raw.event === "dispensed_to_motorcycle" ? "dispensed_to_motorcycle" : "returned_to_cabinet";
  return {
    swap_session_id: toNumOrNull(raw.swap_session_id),
    event,
    status: toStrOrNull(raw.status),
    cabinet: cab
      ? { id: toNum(cab.id, 0), cabinet_id: toStrOrNull(cab.cabinet_id), name: toStrOrNull(cab.name) }
      : null,
    slot_number: toNumOrNull(raw.slot_number),
    motorcycle: moto
      ? {
          id: toNum(moto.id, 0),
          brand: toStrOrNull(moto.brand),
          model: toStrOrNull(moto.model),
          plate_number: toStrOrNull(moto.plate_number),
        }
      : null,
    at: String(raw.at ?? ""),
  };
}

function motorcycleChip(raw: Raw): BatteryRelationRef {
  const id = toNum(pick(raw, ["id", "_id"]), 0);
  const plate = toStrOrNull(raw.plate_number);
  const brandModel = [toStrOrNull(raw.brand), toStrOrNull(raw.model)].filter(Boolean).join(" ");
  return { id, label: plate ?? (brandModel || `#${id}`) };
}

function cabinetChip(raw: Raw): BatteryRelationRef {
  const id = toNum(pick(raw, ["id", "_id"]), 0);
  return { id, label: toStrOrNull(raw.name) ?? toStrOrNull(raw.cabinet_id) ?? `#${id}` };
}

/** Accepts the history payload after apiClient unwrapping (tolerates one extra data level). */
export function normaliseBatteryHistory(json: unknown): BatteryHistory {
  let root: Raw = isRaw(json) ? json : {};
  const knownKeys = ["battery", "status_history", "swap_history"];
  if (!knownKeys.some((k) => k in root) && isRaw(root.data)) root = root.data;

  return {
    battery: isRaw(root.battery) ? normaliseHistorySnapshot(root.battery) : null,
    status_history: toRawArray(root.status_history).map(normaliseStatusHistoryEntry),
    swap_history: toRawArray(root.swap_history).map(normaliseSwapHistoryEntry),
    motorcycles: toRawArray(root.motorcycles).map(motorcycleChip),
    cabinets: toRawArray(root.cabinets).map(cabinetChip),
  };
}
