// src/components/dashboard/vehicle-control/types.ts

export type VehicleOwnerType = "individual" | "corporate_driver";
export type VehicleStatus = "active" | "charging" | "idle" | "maintenance";
export type GpsSignal = "strong" | "weak" | "none";

export interface SuperadminVehicle {
  id: string;
  plateNumber: string;
  model: string;
  status: VehicleStatus;
  batteryLevel: number;
  location: string;
  coordinates: { lat: number; lng: number };
  assignedDriverId?: string;
  assignedDriverName?: string;
  lastTripAt: string;
  totalDistanceKm: number;
  currentSpeedKmh: number;
  estimatedRangeKm: number;
  speedLimitKmh: number;
  isLocked: boolean;
  isEngineRunning: boolean;
  gpsSignal: GpsSignal;
  isOnline: boolean;

  ownerType: VehicleOwnerType;
  ownerId: string;
  ownerName: string;
  companyId?: string;
  companyName?: string;
}

export interface VehicleBattery {
  level: number;
  rangeKm: number;
  sohPct: number;
  voltage: number;
  temperature: number;
}

export interface VehicleStatistics {
  trips: number;
  swaps: number;
  alarms: number;
  totalDistanceKm: number;
}

export interface SuperadminDriver {
  id: string;
  name: string;
  phone?: string;
  companyId?: string;
  companyName?: string;
  status?: string;
}

export interface SuperadminUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  city?: string;
}

export type OwnerFilter = "all" | VehicleOwnerType;

/** A company group (or the "Individual Users" group) holding sub-groups by driver/user. */
export interface VehicleGroup {
  groupType: "company" | "user";
  groupId: string;
  groupName: string;
  subGroups: {
    subId: string;
    subName: string;
    vehicles: SuperadminVehicle[];
  }[];
}
