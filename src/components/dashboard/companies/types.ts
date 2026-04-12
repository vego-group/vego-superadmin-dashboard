export type CompanyStatus = "pending" | "approved" | "rejected" | "suspended";

export interface Company {
  id: number;
  company_code: string | null;
  company_name: string;
  contact_person_name: string;
  contact_email: string;
  contact_phone: string;
  commercial_reg_no: string;
  commercial_reg_file: string | null;
  commercial_license_file: string | null;
  status: CompanyStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  review_note: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  max_motorcycles: number;
  max_drivers: number;
  billing_type: string;
  tax_id: string | null;
  created_at: string;
  updated_at: string;
  drivers_count: number;
  motorcycles_count: number;
}

export interface FleetCounts {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  suspended: number;
}