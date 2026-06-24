export type ZoneType = "normal" | "slow" | "restricted";

export interface ZonePoint {
  lat: number;
  lng: number;
}

export interface Zone {
  id: string;
  name: string; // = name_en (used for display & search fallback)
  name_en: string;
  name_ar: string;
  type: ZoneType;
  speedLimitKmh: number; // from speed_limit
  active: boolean; // from is_active
  polygon: ZonePoint[]; // parsed from coordinates (WKT)
  createdAt: string;
  source?: "super-admin" | "fleet"; // present in fleet-zones response
}

// ─── Raw shape from backend ──────────────────────────────────────────────────
export interface ApiZone {
  id: number | string;
  name_en: string;
  name_ar: string;
  type: string;
  speed_limit: number | null;
  coordinates: string; // WKT POLYGON
  is_active: boolean;
  created_at?: string;
  source?: "super-admin" | "fleet";
}

// ─── Form values (frontend) ──────────────────────────────────────────────────
export interface ZoneFormValues {
  name_en: string;
  name_ar: string;
  type: ZoneType;
  speedLimitKmh: number;
  active: boolean;
  polygon: ZonePoint[];
}
