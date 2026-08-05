// src/lib/staff-list.ts
// Country-aware fetch for the staff lists (super-admins, admins, staff?role=…).
//
// §0.3: the country view filters SERVER-side via `?country=` — client-side
// filtering is forbidden (it would fake per-country totals). An endpoint that
// does not honour the param refuses it with 422 country_filter_not_supported
// (§3), in which case the unfiltered list is refetched and
// `countryFilterNotApplied` tells the page to show the amber warning instead
// of dying on an error. The day the backend adds support, the warning simply
// stops appearing.

import { apiErrorFromBody, isCountryFilterNotSupported } from "@/lib/api-error";
import { countryFilterIgnored, toIsoCountryCodeOrNull } from "@/types/country";

export interface StaffListResult {
  rows: Record<string, unknown>[];
  /** True when the returned list is NOT scoped to the selected country. */
  countryFilterNotApplied: boolean;
}

const getJson = async (url: string): Promise<{ res: Response; json: unknown }> => {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    // Non-JSON body — apiErrorFromBody falls back to the generic message.
  }
  return { res, json };
};

const failed = (res: Response, json: unknown): boolean => {
  const rec = json && typeof json === "object" ? (json as Record<string, unknown>) : null;
  return !res.ok || rec?.status === false || rec?.success === false;
};

/** Rows from either a plain array `data` or a Laravel-paginated `data.data`. */
const extractRows = (json: unknown): Record<string, unknown>[] => {
  const data = (json as Record<string, unknown> | null)?.data;
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  const nested = (data as Record<string, unknown> | null)?.data;
  return Array.isArray(nested) ? (nested as Record<string, unknown>[]) : [];
};

export async function fetchStaffList(
  path: string, // proxy path, may already carry a query ("staff?role=sales")
  countryParam: string | null,
  fallbackError: string
): Promise<StaffListResult> {
  const base = `/api/proxy/${path}`;
  const withCountry = countryParam
    ? `${base}${path.includes("?") ? "&" : "?"}country=${countryParam}`
    : base;

  let { res, json } = await getJson(withCountry);
  let countryRefused = false;

  if (countryParam && failed(res, json) && isCountryFilterNotSupported(res.status, json)) {
    countryRefused = true;
    ({ res, json } = await getJson(base));
  }

  if (failed(res, json)) {
    throw new Error(apiErrorFromBody(res.status, json, fallbackError, countryParam));
  }

  const rows = extractRows(json);
  return {
    rows,
    // Row-level check stays as cheap insurance against a server that silently
    // ignores the param instead of 422ing (same pattern as use-drivers).
    countryFilterNotApplied:
      countryRefused ||
      countryFilterIgnored(
        countryParam,
        rows.map((r) => toIsoCountryCodeOrNull(r.iso_country_code))
      ),
  };
}
