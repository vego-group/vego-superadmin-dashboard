// src/lib/money.ts
// Platform money contract (§0.1): amounts are fixed-precision DECIMAL STRINGS,
// e.g. { balance: "120.500", currency: "JOD", minor_units: 120500, decimals: 3 }.
// All arithmetic/formatting goes through big.js — never parseFloat/toFixed on a
// float in a display path. The deprecated `*_sar` aliases are intentionally
// never read here; they disappear from the API in two releases.

import Big from "big.js";
import { logger } from "@/lib/logger";
import { dateLocale } from "@/lib/format-date";

export interface Money {
  /** Fixed-precision decimal string, e.g. "120.500". */
  amount: string;
  /**
   * ISO currency code, e.g. "SAR" | "JOD" — or UNKNOWN_CURRENCY ("") when a
   * legacy endpoint sent a bare number and no record context could supply one.
   */
  currency: string;
  /** Fraction digits for this currency (SAR 2, JOD 3). */
  decimals: number;
  /** Integer amount in minor units, when the API provided it. */
  minorUnits?: number;
}

/**
 * Sentinel for "the API gave us an amount but nothing tells us its currency".
 * formatMoney renders such values WITHOUT a currency unit — never asserting a
 * default like SAR, which would mislabel Jordanian records.
 */
export const UNKNOWN_CURRENCY = "";

const DECIMAL_STRING = /^-?\d+(\.\d+)?$/;

/** Fraction digits present in a decimal string ("120.500" → 3). */
const fractionDigits = (amount: string): number => {
  const dot = amount.indexOf(".");
  return dot === -1 ? 0 : amount.length - dot - 1;
};

/** Adds thousands separators to the integer part of a decimal string. */
const group = (fixed: string): string => {
  const neg = fixed.startsWith("-");
  const [int, frac] = (neg ? fixed.slice(1) : fixed).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}${grouped}${frac != null ? `.${frac}` : ""}`;
};

/**
 * Formats a money amount for display: "1,234.50 SAR", "120.500 JOD".
 * Accepts either a `Money` object or the raw decimal string plus currency.
 * When `decimals` is omitted the string's own precision is kept — the backend
 * already sends amounts at the currency's fixed precision.
 */
export function formatMoney(amount: string | Money, currency?: string, decimals?: number): string {
  const raw = typeof amount === "string" ? amount : amount.amount;
  const cur = typeof amount === "string" ? currency ?? "" : amount.currency;
  const dec = typeof amount === "string" ? decimals : decimals ?? amount.decimals;

  const value = DECIMAL_STRING.test(raw.trim()) ? raw.trim() : null;
  if (value == null) return cur ? `${raw} ${cur}` : raw; // pass through non-numeric input untouched

  const fixed = new Big(value).toFixed(dec ?? fractionDigits(value));
  return cur ? `${group(fixed)} ${cur}` : group(fixed);
}

/**
 * Locale-pinned COUNT formatting ("1,234,567") — for row totals, stat counts,
 * page numbers; never for money (that's formatMoney). Pins the numbering system
 * the same way dates do (`ar-u-nu-latn`), so counts always match the Latin
 * digits formatMoney renders. A bare `n.toLocaleString()` inherits the BROWSER
 * locale and silently drifts to Arabic-Indic digits on an OS set to an
 * Arabic-digit locale — always come through here instead.
 */
export function formatCount(n: number, lang: "en" | "ar"): string {
  return n.toLocaleString(dateLocale(lang));
}

interface ParseMoneyFallback {
  /** Currency from the caller's record context (e.g. via `currencyForIso(raw.iso_country_code)`). */
  currency?: string;
  decimals?: number;
  /** Endpoint/field label for the dev-only unknown-currency warning. */
  source?: string;
}

// One warning per endpoint/field so the console shows WHICH endpoints still
// send legacy currency-less amounts, without spamming per row.
const warnedSources = new Set<string>();
const warnUnknownCurrency = (source: string | undefined) => {
  const key = source ?? "(unlabelled parseMoney call)";
  if (warnedSources.has(key)) return;
  warnedSources.add(key);
  logger.warn(
    `[money] ${key}: amount has no determinable currency — endpoint not yet on the ` +
      `{ amount, currency, decimals } shape and the record carries no iso_country_code. ` +
      `Rendering without a currency unit.`
  );
};

/**
 * Normalises an API money value into `Money`.
 * - New shape: `{ amount | balance, currency, minor_units, decimals }`.
 * - Legacy shape (until every endpoint has migrated): a bare number or numeric
 *   string. Its currency comes from `fallback.currency` (derived from the
 *   record's country by the caller); when none exists the Money is tagged
 *   UNKNOWN_CURRENCY and renders unit-less — never silently defaulted to SAR.
 * Never reads `*_sar` aliases.
 */
export function parseMoney(raw: unknown, fallback: ParseMoneyFallback = {}): Money | null {
  if (raw == null) return null;

  const currencyOrUnknown = (): string => {
    if (fallback.currency) return fallback.currency;
    warnUnknownCurrency(fallback.source);
    return UNKNOWN_CURRENCY;
  };

  if (typeof raw === "object") {
    const rec = raw as Record<string, unknown>;
    const amountRaw = rec.amount ?? rec.balance;
    if (amountRaw == null) return null;
    const amount = typeof amountRaw === "number" ? amountRaw.toString() : String(amountRaw);
    if (!DECIMAL_STRING.test(amount.trim())) return null;
    const decimals =
      typeof rec.decimals === "number" ? rec.decimals : fallback.decimals ?? fractionDigits(amount.trim());
    return {
      amount: amount.trim(),
      currency: typeof rec.currency === "string" && rec.currency ? rec.currency : currencyOrUnknown(),
      decimals,
      ...(typeof rec.minor_units === "number" ? { minorUnits: rec.minor_units } : {}),
    };
  }

  // Legacy numeric field. String(value) preserves what the API sent — no float math.
  const amount = typeof raw === "number" ? raw.toString() : String(raw).trim();
  if (!DECIMAL_STRING.test(amount)) return null;
  const decimals = fallback.decimals ?? Math.max(fractionDigits(amount), 2);
  return { amount, currency: currencyOrUnknown(), decimals };
}

const CURRENCY_CODE = /^[A-Z]{3}$/;

/**
 * CR-1 §4: a platform-wide money value can span countries. The backend may send
 *  - a single money object / legacy bare number → one entry
 *  - an array of money objects (one per currency) → grouped entries
 *  - an object keyed by currency `{ SAR: "...", JOD: "..." }` → grouped entries
 * Always render one entry PER currency — never sum across them.
 */
export function parseMoneyGroup(raw: unknown, fallback: ParseMoneyFallback = {}): Money[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.map((x) => parseMoney(x, fallback)).filter((m): m is Money => m !== null);
  }
  if (typeof raw === "object") {
    const rec = raw as Record<string, unknown>;
    if (rec.amount == null && rec.balance == null) {
      const entries = Object.entries(rec).filter(([k]) => CURRENCY_CODE.test(k));
      if (entries.length > 0) {
        return entries
          .map(([cur, amt]) => parseMoney(amt, { ...fallback, currency: cur }))
          .filter((m): m is Money => m !== null);
      }
    }
  }
  const single = parseMoney(raw, fallback);
  return single ? [single] : [];
}

/**
 * Numeric value for aggregation/comparison ONLY (chart axes, max/percentage
 * math). Never feed the result back into a display path — format the original
 * string with `formatMoney` instead. Before summing a set of values, call
 * `guardSingleCurrency` — summing across currencies is meaningless.
 */
export function moneyToNumber(money: Money | null): number {
  return money ? Number(money.amount) : 0;
}

// ─── §13 multi-currency aggregate envelope ───────────────────────────────────
// Cross-country aggregates group per currency: `by_currency` is ALWAYS present
// and is the source of truth; the flat keys carry a currency only when the
// request was unambiguous (?country=) and are null otherwise. A null renders as
// "—" or a per-currency breakdown — never a bare number.

/** One `by_currency` entry: the currency plus that currency's stat block. */
export interface CurrencyBlock {
  currency: string;
  /** The raw per-currency stats (total_revenue, refunds, …) for field lookup. */
  block: Record<string, unknown>;
}

/**
 * `by_currency` map → stable, ordered entries. Tolerates a missing/empty map
 * (an empty platform) by returning []. Entry order is alphabetical so a
 * currency keeps its slot (and chart color) across loads.
 */
export function byCurrencyBlocks(raw: unknown): CurrencyBlock[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  return Object.entries(raw as Record<string, unknown>)
    .filter((e): e is [string, Record<string, unknown>] =>
      CURRENCY_CODE.test(e[0]) && !!e[1] && typeof e[1] === "object"
    )
    .map(([currency, block]) => ({ currency, block }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}

/**
 * The opt-in `?currency=` conversion block (§13). Reporting only — never feeds
 * pricing or wallets. When `complete` is false the currencies in
 * `missingRates` have no recorded exchange rate and the totals EXCLUDE them:
 * the UI must name them and must not present a partial total as a whole one.
 */
export interface ConvertedBlock {
  currency: string;
  /** `{ JOD: 5.26, SAR: 1 }` — how many target units one source unit buys. */
  rates: Record<string, number>;
  rateAsOf: string | null;
  missingRates: string[];
  complete: boolean;
  /** Money fields found on the block (total_revenue, …), keyed by field name. */
  totals: Record<string, Money>;
}

export function parseConvertedBlock(raw: unknown): ConvertedBlock | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const rec = raw as Record<string, unknown>;
  if (typeof rec.currency !== "string" || !rec.currency) return null;

  const rates: Record<string, number> = {};
  if (rec.rates && typeof rec.rates === "object") {
    for (const [cur, rate] of Object.entries(rec.rates as Record<string, unknown>)) {
      const n = typeof rate === "number" ? rate : Number(rate);
      if (CURRENCY_CODE.test(cur) && Number.isFinite(n)) rates[cur] = n;
    }
  }

  const missingRates = Array.isArray(rec.missing_rates)
    ? rec.missing_rates.filter((c): c is string => typeof c === "string" && !!c)
    : [];

  const totals: Record<string, Money> = {};
  for (const [field, value] of Object.entries(rec)) {
    if (["currency", "rates", "rate_as_of", "missing_rates", "complete"].includes(field)) continue;
    const money = parseMoney(value, { currency: rec.currency });
    if (money) totals[field] = money;
  }

  return {
    currency: rec.currency,
    rates,
    rateAsOf: typeof rec.rate_as_of === "string" && rec.rate_as_of ? rec.rate_as_of : null,
    missingRates,
    // Missing/invalid `complete` counts as INCOMPLETE — the failure mode this
    // block exists to prevent is a partial total read as a whole one.
    complete: rec.complete === true,
    totals,
  };
}

export class MixedCurrencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MixedCurrencyError";
  }
}

/**
 * Guard before aggregating money values with `moneyToNumber`: a set spanning
 * more than one currency must never be summed into one series/bar.
 * Throws `MixedCurrencyError` in development; returns false in production so
 * the caller renders an explicit "mixed currency" state instead of a wrong sum.
 * (Per-currency grouping is S2 — this only makes the unsafe sum impossible.)
 */
export function guardSingleCurrency(monies: Array<Money | null>, source: string): boolean {
  const currencies = new Set(
    monies.flatMap((m) => (m && m.currency !== UNKNOWN_CURRENCY ? [m.currency] : []))
  );
  if (currencies.size <= 1) return true;
  const message = `${source}: refusing to aggregate mixed currencies (${[...currencies].join(", ")})`;
  if (process.env.NODE_ENV !== "production") throw new MixedCurrencyError(message);
  return false;
}
