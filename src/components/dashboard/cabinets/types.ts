// src/components/dashboard/cabinates/types.ts

export type CabinetStatus = "active" | "offline" | "faulty";

export interface Cabinet {
  id: string;
  cabinet_id: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  province: string;
  status: CabinetStatus;
  slots_total: number;
  slots_available: number;
  uptime_percent: number;
  last_synced: string;
}

export interface AddCabinetForm {
  cabinet_id: string;
  lat: string;
  lng: string;
  address: string;
  city: string;
  province: string;
}

export interface EditCabinetForm {
  lat: string;
  lng: string;
  address: string;
  city: string;
  province: string;
  status: CabinetStatus;
}