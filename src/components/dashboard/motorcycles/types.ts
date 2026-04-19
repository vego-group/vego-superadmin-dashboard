export type MotorcycleStatus = "active" | "inactive" | "maintenance";

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
  battery_percentage: number;
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
  battery_type: string;
  status: MotorcycleStatus;
  current_lat: string;
  current_lng: string;
  address: string | null;
  city: string | null;
  province: string | null;
  created_at: string;
  updated_at: string;
  assigned_user: AssignedUser | null;
  battery: Battery | null;
}