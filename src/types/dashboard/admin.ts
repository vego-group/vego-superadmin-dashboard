// src/types/dashboard/admin.ts
import { IsoCountryCode } from "@/types/country";

export interface Admin {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  /** §16: a staff country is a PERMISSION — null means global (all markets). */
  iso_country_code: IsoCountryCode | null;
  status: "active" | "inactive" | "suspended";
  profile_picture: string | null;
  email_verified_at: string | null;
  phone_verified: boolean;
  account_type: "individual" | "fleet";
  fleet_id: number | null;
  language: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AddAdminPayload {
  name: string;
  phone: string;
  role: "Admin" | "SuperAdmin";
  email?: string;
  password?: string;
  password_confirmation?: string;
}

export interface UpdateAdminPayload {
  name?: string;
  phone?: string;
  email?: string;
  role?: string;
  status?: Admin["status"];
}

export type AdminFormData = {
  name: string;
  phone: string;
  email: string;
  role: string;
  status: Admin["status"];
  password?: string;
  password_confirmation?: string;
};