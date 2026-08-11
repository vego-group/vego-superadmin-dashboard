import { IsoCountryCode } from "@/types/country";

export type MotorcycleStatus = "active" | "inactive" | "maintenance";

// Derived assignment bucket (not a backend field):
//  - unassigned: no fleet and no individual driver → free pool
//  - company:    belongs to a fleet
//  - individual: assigned to a driver with no fleet
export type AssignmentFilter = "all" | "unassigned" | "company" | "individual";

export function getAssignment(m: Pick<Motorcycle, "fleet_id" | "assigned_user_id">): Exclude<AssignmentFilter, "all"> {
  if (m.fleet_id != null) return "company";
  if (m.assigned_user_id != null) return "individual";
  return "unassigned";
}

export interface AssignedUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  fleet_id: number | null;
}

export interface Battery {
  id: number;
  battery_id: string;
  battery_type: string;
  physical_damage: boolean;
  status: string;
  battery_percentage: number | null;
  soh: string;
  cycle_count: number;
  motorcycle_id: number | null;
  battery_swap_cabinet_id: number | null;
}

export interface Motorcycle {
  id: number;
  device_id: string;
  brand: string | null;
  model: string | null;
  plate_number: string | null;
  assigned_user_id: number | null;
  fleet_id: number | null;
  fleet_name: string | null;
  battery_type: string;
  status: MotorcycleStatus;
  current_lat: string;
  current_lng: string;
  address: string | null;
  city: string | null;
  province: string | null;
  /** ISO country ("SA" | "JO") — §0.2. Validated into the branded type at fetch time. */
  iso_country_code?: IsoCountryCode | null;
  created_at: string;
  updated_at: string;
  assigned_user: AssignedUser | null;
  battery: Battery | null;
}