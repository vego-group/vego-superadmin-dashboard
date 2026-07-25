// src/types/dashboard/driver.ts
// Read-only, cross-fleet driver oversight (GET /super-admin/drivers).

// Backend uses "approved" (not "verified") for a cleared document.
export type DocumentStatus = "not_uploaded" | "pending" | "approved" | "rejected";

export interface AssignedVehicle {
  id: number;
  device_id: string | null;
  model: string | null;
  plate_number: string | null;
}

export interface Driver {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  fleet_id: number | null;
  fleet_name: string | null;
  wallet_balance: number | null;
  license_status: DocumentStatus | null;
  plate_status: DocumentStatus | null;
  motorcycle_plate: string | null;
  created_at: string;

  // Full-profile fields (present on GET /drivers/{id} detail; null on list rows)
  address: string | null;
  city: string | null;
  has_license: boolean;
  license_number: string | null;
  license_expiry: string | null;
  license_photo_front_url: string | null;
  license_photo_back_url: string | null;
  plate_number: string | null;
  plate_photo_url: string | null;
  assigned_vehicle: AssignedVehicle | null;
}

export interface DriversPagination {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
}

export interface FleetOption {
  id: number;
  company_name: string;
}
