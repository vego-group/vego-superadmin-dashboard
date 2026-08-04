// src/types/country.ts
// Country contract (§0.2): the API's `country_code` on a user is the DIAL code
// ("+966") — the live register flow has always written it that way. The ISO
// country ("SA" | "JO") arrives separately as `iso_country_code`. The two are
// branded so one can never be passed where the other is expected.

declare const dialCodeBrand: unique symbol;
declare const isoCountryCodeBrand: unique symbol;

/** Dial code with leading "+", e.g. "+966". API field: `country_code`. */
export type DialCode = string & { readonly [dialCodeBrand]: true };

/** ISO 3166-1 alpha-2, e.g. "SA" | "JO". API field: `iso_country_code`. */
export type IsoCountryCode = string & { readonly [isoCountryCodeBrand]: true };

export const asDialCode = (v: string): DialCode => {
  if (!/^\+\d{1,4}$/.test(v)) throw new Error(`Invalid dial code: "${v}"`);
  return v as DialCode;
};

export const asIsoCountryCode = (v: string): IsoCountryCode => {
  const upper = v.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) throw new Error(`Invalid ISO country code: "${v}"`);
  return upper as IsoCountryCode;
};

/**
 * Boundary parser for record fields: unknown API value → branded code or null.
 * Every normaliser that stores a record's `iso_country_code` goes through this,
 * so a Country column can only ever read a validated, branded value.
 */
export const toIsoCountryCodeOrNull = (v: unknown): IsoCountryCode | null => {
  if (typeof v !== "string" || !v.trim()) return null;
  try {
    return asIsoCountryCode(v.trim());
  } catch {
    return null;
  }
};

/**
 * Detects a server that silently IGNORED the `?country=` filter: any returned
 * row carrying a known ISO code different from the requested one. Rows with no
 * code are inconclusive and never trigger the warning. Callers must surface
 * this as a visible warning — NEVER client-side filter as a workaround, which
 * would fake per-country pagination/totals.
 */
export const countryFilterIgnored = (
  requested: string | null | undefined,
  rowIsoCodes: Array<string | null | undefined>
): boolean => !!requested && rowIsoCodes.some((c) => !!c && c !== requested);

// ─── GET /countries ───────────────────────────────────────────────────────────

export interface Country {
  isoCountryCode: IsoCountryCode;
  dialCode: DialCode;
  name: string;
  nameAr: string;
  currency: string;
  currencyDecimals: number;
  /**
   * Backend regex matching the NATIONAL SIGNIFICANT NUMBER — no dial code, no
   * trunk 0 (SA "^5[0-9]{8}$", JO "^7[789][0-9]{7}$"). Validate via `isValidPhone`,
   * which normalises the input to national digits before testing.
   */
  phoneRegex: string | null;
  /**
   * e.g. "+966512345678" — shown as input placeholder/hint. The live API may
   * send a MASKED example instead ("5X XXX XXXX"); `nationalExample` treats
   * that as absent, and `phoneHint` falls back to `phonePlaceholder`.
   */
  phoneExample: string | null;
  /** Masked display hint, e.g. "5X XXX XXXX". API field: `phone_placeholder`. */
  phonePlaceholder: string | null;
  /** Fixed-precision amount strings, per the money contract. */
  quickTopupAmounts: string[];
  vehicleTerm: string | null;
  vehicleTermAr: string | null;
}

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);

const rec = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" ? (v as Record<string, unknown>) : {};

/** Normalises one row of GET /countries; returns null on rows we can't trust. */
export const parseCountry = (raw: Record<string, unknown>): Country | null => {
  try {
    const iso = asIsoCountryCode(String(raw.iso_country_code ?? raw.code ?? ""));
    const dial = asDialCode(String(raw.dial_code ?? ""));
    return {
      isoCountryCode: iso,
      dialCode: dial,
      // Live rows carry `name_en`/`name_ar`; older shapes used `name`.
      name: str(raw.name) ?? str(raw.name_en) ?? iso,
      nameAr: str(raw.name_ar) ?? str(raw.name) ?? str(raw.name_en) ?? iso,
      currency: str(raw.currency) ?? "SAR",
      currencyDecimals: typeof raw.currency_decimals === "number" ? raw.currency_decimals : 2,
      phoneRegex: str(raw.phone_regex),
      phoneExample: str(raw.phone_example),
      phonePlaceholder: str(raw.phone_placeholder),
      quickTopupAmounts: Array.isArray(raw.quick_topup_amounts)
        ? raw.quick_topup_amounts.map((a) => String(a))
        : [],
      // Live rows send vehicle_term as an {ar, en} object; older shapes as two
      // string fields.
      vehicleTerm: str(raw.vehicle_term) ?? str(rec(raw.vehicle_term).en),
      vehicleTermAr: str(raw.vehicle_term_ar) ?? str(rec(raw.vehicle_term).ar),
    };
  } catch {
    return null;
  }
};

// Seeded fallback so pre-auth screens (login) stay usable if GET /countries is
// unreachable. Mirrors the backend seed; server data always wins once loaded.
export const DEFAULT_COUNTRIES: Country[] = [
  {
    isoCountryCode: "SA" as IsoCountryCode,
    dialCode: "+966" as DialCode,
    name: "Saudi Arabia",
    nameAr: "السعودية",
    currency: "SAR",
    currencyDecimals: 2,
    phoneRegex: "^5[0-9]{8}$",
    phoneExample: "+966512345678",
    phonePlaceholder: "5X XXX XXXX",
    quickTopupAmounts: ["50", "100", "200", "500"],
    vehicleTerm: null,
    vehicleTermAr: "دباب",
  },
  {
    isoCountryCode: "JO" as IsoCountryCode,
    dialCode: "+962" as DialCode,
    name: "Jordan",
    nameAr: "الأردن",
    currency: "JOD",
    currencyDecimals: 3,
    phoneRegex: "^7[789][0-9]{7}$",
    phoneExample: "+962791234567",
    phonePlaceholder: "7X XXX XXXX",
    quickTopupAmounts: ["2", "5", "10", "20"],
    vehicleTerm: null,
    vehicleTermAr: "دراجة نارية",
  },
];

/**
 * Fixed currency for a record's `iso_country_code` (SA → SAR/2, JO → JOD/3).
 * Feed the result to `parseMoney`'s fallback while endpoints still send legacy
 * bare-number amounts. Returns undefined when the record carries no usable ISO
 * code — parseMoney then tags the value UNKNOWN_CURRENCY instead of guessing.
 */
export const currencyForIso = (
  iso: unknown
): { currency: string; decimals: number } | undefined => {
  if (typeof iso !== "string" || !iso.trim()) return undefined;
  const upper = iso.trim().toUpperCase();
  const match = DEFAULT_COUNTRIES.find((c) => c.isoCountryCode === upper);
  return match ? { currency: match.currency, decimals: match.currencyDecimals } : undefined;
};
