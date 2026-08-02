// Device Types
import { IsoCountryCode } from "@/types/country";

export type DeviceType = "cabinet" | "charging";

// موحد وواضح
export type DeviceStatus = "active" | "inactive" | "maintenance";

// Main Device Interface
export interface Device {
  id: string;
  internalId: number;
  type: DeviceType;
  name: string | null;
  location: string;
  city: string;
  /** ISO country ("SA" | "JO") — §0.2: from `iso_country_code`, never the dial code. */
  isoCountryCode?: IsoCountryCode | null;
  status: DeviceStatus;
  slots: number;
  availableSlots?: number;
  createdAt: string;

  // 🔥 Dashboard / Telemetry Data
  firmware?: string;
  lastHeartbeat?: string;
  todayOps?: number;
  uptime?: number;
}