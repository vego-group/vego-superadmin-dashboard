// src/types/dashboard/driver.ts
// Read-only, cross-fleet driver oversight (GET /super-admin/drivers).

export type DocumentStatus = "not_uploaded" | "pending" | "verified" | "rejected";

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
  trips_count: number | null;
  motorcycle_plate: string | null;
  created_at: string;
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
