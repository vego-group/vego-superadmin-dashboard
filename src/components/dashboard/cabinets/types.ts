// src/components/dashboard/cabinates/types.ts
export type CabinetStatus = "active" | "offline" | "faulty";

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
  // optional fields (not in API yet)
  slots_total?: number;
  slots_available?: number;
  uptime_percent?: number;
  last_synced?: string;
}

export interface AddCabinetForm {
  cabinet_id: string;
  lat: string;
  lng: string;
  address: string;
  city: string;
  province: string;
  dev_id?: string; // optional — only required for fast charging
}

export interface EditCabinetForm {
  lat: string;
  lng: string;
  address: string;
  city: string;
  province: string;
  status: CabinetStatus;
}