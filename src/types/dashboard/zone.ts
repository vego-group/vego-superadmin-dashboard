import { IsoCountryCode } from "@/types/country";

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
  /** ISO country ("SA" | "JO") — §0.2: from `iso_country_code`, never the dial code. */
  isoCountryCode: IsoCountryCode | null;
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
  iso_country_code?: string | null;
  /** Zone rows answer the ISO market code here ("JO" | "SA"), or null on legacy
   *  scope-global rows — unlike users, where `country_code` is the dial code. */
  country_code?: string | null;
  /** "global" on legacy rows created before zones were country-scoped. */
  scope?: string | null;
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
  /** Market the zone belongs to — required on save so no new zone lands as
   *  scope-global (invisible under a country tab). */
  country: IsoCountryCode | null;
}
