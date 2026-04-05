// src/components/dashboard/cabinates/types.ts
export type CabinetStatus = "active" | "offline" | "faulty" | "inactive" | "maintenance";

export interface Cabinet {
  id: string;
  cabinet_id: string;
  name: string | null;
  lat: number;
  lng: number;
  address: string;
  city: string;
  province: string;
  status: CabinetStatus;
  created_at: string;
  updated_at: string;
  slots_count?: number;
  slots_total?: number;
  slots_available?: number;
  uptime_percent?: number;
  last_synced?: string;
}

export interface AddCabinetForm {
  cabinet_id: string;
  name: string;         // ← مش optional عشان عندنا field ليه
  lat: string;
  lng: string;
  address: string;
  city: string;
  province: string;
  dev_id?: string;
  slots_count: string;  // ← مش optional عشان عندنا field ليه
}

export interface EditCabinetForm {
  name: string;         // ← جديد
  lat: string;
  lng: string;
  address: string;
  city: string;
  province: string;
  status: CabinetStatus;
  slots_count: string;  // ← جديد
}