import { IsoCountryCode, toIsoCountryCodeOrNull } from "@/types/country";

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
  // Public, absolute URLs the backend derives from the stored file paths.
  // The bare *_file fields are relative storage paths and 404 if opened directly.
  commercial_reg_file_url: string | null;
  commercial_license_file_url: string | null;
  status: CompanyStatus;
  /** ISO country ("SA" | "JO") — §0.2. Validated into the branded type by `normaliseCompany`. */
  iso_country_code: IsoCountryCode | null;
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

type Raw = Record<string, unknown>;

/**
 * Fleet rows are otherwise consumed verbatim, but the country field is
 * validated into the branded IsoCountryCode at the boundary — a Country column
 * can never read an unvalidated string.
 */
export const normaliseCompany = (raw: Raw): Company => ({
  ...(raw as unknown as Company),
  iso_country_code: toIsoCountryCodeOrNull(raw.iso_country_code),
});

/**
 * GET /fleets response → rows + last page. Handles BOTH the Laravel-paginated
 * envelope ({ data: { data: [...], last_page } }) and a bare array under data.
 */
export const normaliseCompanyList = (
  json: unknown
): { companies: Company[]; lastPage: number } => {
  const env = (json && typeof json === "object" ? json : {}) as Raw;
  const paged = env.data ?? env;
  const rows: Raw[] = Array.isArray(paged)
    ? (paged as Raw[])
    : paged && typeof paged === "object" && Array.isArray((paged as Raw).data)
      ? ((paged as Raw).data as Raw[])
      : [];
  const lastPage = Array.isArray(paged) ? 1 : Number((paged as Raw)?.last_page ?? 1);
  return { companies: rows.map(normaliseCompany), lastPage };
};

export interface FleetCounts {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  suspended: number;
}