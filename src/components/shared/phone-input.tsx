"use client";

// Shared phone input (CR-1): country-aware, fed by GET /countries.
// `value` holds the national digits only (e.g. "512345678"); compose the full
// number at submit time with `toE164`. When `countries` + `onCountryChange`
// are passed, the dial-code prefix is an embedded CountrySelect; otherwise the
// given country's dial code renders as a fixed prefix.

import CountrySelect from "@/components/shared/country-select";
import { Country } from "@/types/country";

interface Props {
  id?: string;
  value: string;
  onChange: (digits: string) => void;
  country: Country;
  countries?: Country[];
  onCountryChange?: (country: Country) => void;
  disabled?: boolean;
  hasError?: boolean;
}

/** Full E.164 for API payloads: ("512345678", SA) → "+966512345678". */
export const toE164 = (country: Country, digits: string) => `${country.dialCode}${digits}`;

/** Digits of a dial code: "+966" → "966". */
const dialDigits = (country: Country) => country.dialCode.replace(/\D/g, "");

/**
 * Extracts national digits from any stored format ("+966512…", "966512…",
 * "0512…"), trying the dial codes of the given countries.
 */
export const toNationalDigits = (phone: string, countries: Country[]): string => {
  let digits = phone.replace(/\D/g, "");
  const dial = countries.map(dialDigits).find((d) => digits.startsWith(d));
  if (dial) digits = digits.slice(dial.length);
  return digits.replace(/^0/, "");
};

/** The country whose dial code prefixes the stored number, if any. */
export const matchCountryByPhone = (countries: Country[], phone: string): Country | null => {
  const digits = phone.replace(/\D/g, "");
  return countries.find((c) => digits.startsWith(dialDigits(c))) ?? null;
};

/**
 * Validates a phone number against the country's `phone_regex`, which targets
 * the NATIONAL SIGNIFICANT NUMBER (SA "^5[0-9]{8}$", JO "^7[789][0-9]{7}$").
 * The input is normalised first — dial code and trunk 0 stripped — then the
 * regex is tested exactly once; trying multiple forms would let wrong-format
 * numbers pass. Falls back to a length check when the country has no regex.
 */
export const isValidPhone = (country: Country, phone: string): boolean => {
  const digits = toNationalDigits(phone, [country]);
  if (!digits) return false;
  if (!country.phoneRegex) return digits.length >= 7 && digits.length <= 12;
  try {
    return new RegExp(country.phoneRegex).test(digits);
  } catch {
    return digits.length >= 7 && digits.length <= 12;
  }
};

/**
 * Placeholder national digits, derived from the country's phone_example.
 * A masked example ("5X XXX XXXX" → "5") is treated as absent — it can't
 * stand in for real digits; maxNationalLength then derives the cap from the
 * phone_regex instead. 7 matches the lower bound isValidPhone accepts
 * without a regex.
 */
export const nationalExample = (country: Country): string => {
  if (!country.phoneExample) return "";
  const digits = toNationalDigits(country.phoneExample, [country]);
  return digits.length >= 7 ? digits : "";
};

/**
 * Example/hint text for error messages and placeholders: real example digits
 * when the API sends them, else the masked placeholder ("5X XXX XXXX") the
 * live API sends instead — so hints never render empty.
 */
export const phoneHint = (country: Country): string => {
  const hint = nationalExample(country) || country.phonePlaceholder || country.phoneExample;
  if (hint) return hint;
  // Row with a regex but neither example nor placeholder: show at least the
  // expected length so validation messages never render "(e.g. )".
  const max = country.phoneRegex ? maxLenFromRegex(country.phoneRegex) : null;
  return max ? "X".repeat(max) : "";
};

/**
 * Maximum digit count the country's phone_regex can accept, or null when the
 * pattern uses constructs this parser doesn't model. Covers the backend's
 * national-number shapes ("^5[0-9]{8}$", "^7[789][0-9]{7}$"): digit literals,
 * character classes, \d, and {n}/{n,m}/? quantifiers. Anything open-ended
 * (+, *, |, groups, {n,}) returns null so the caller falls back — the cap
 * must never be tighter than what the regex actually accepts.
 */
export const maxLenFromRegex = (pattern: string): number | null => {
  // A pattern RegExp rejects (e.g. swapped bounds "{12,5}") makes isValidPhone
  // fall back to its 7–12 length check — deriving a cap from it anyway could
  // pin the input below what validation accepts.
  try {
    new RegExp(pattern);
  } catch {
    return null;
  }
  const src = pattern.replace(/^\^/, "").replace(/\$$/, "");
  let total = 0;
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === "[") {
      const close = src.indexOf("]", i + 1);
      if (close === -1) return null;
      i = close + 1;
    } else if (ch === "\\" && src[i + 1] === "d") {
      i += 2;
    } else if (/[0-9]/.test(ch)) {
      i += 1;
    } else {
      return null;
    }
    let count = 1;
    if (src[i] === "{") {
      const close = src.indexOf("}", i + 1);
      if (close === -1) return null;
      const m = /^(\d+)(?:,(\d+))?$/.exec(src.slice(i + 1, close));
      if (!m) return null;
      count = parseInt(m[2] ?? m[1], 10);
      if (parseInt(m[1], 10) > count) return null;
      i = close + 1;
    } else if (src[i] === "?") {
      i += 1;
    } else if (src[i] === "+" || src[i] === "*") {
      return null;
    }
    total += count;
  }
  return total >= 4 && total <= 15 ? total : null;
};

const maxNationalLength = (country: Country): number => {
  const example = nationalExample(country);
  if (example) return example.length;
  const fromRegex = country.phoneRegex ? maxLenFromRegex(country.phoneRegex) : null;
  return fromRegex ?? 12;
};

export default function PhoneInput({
  id,
  value,
  onChange,
  country,
  countries,
  onCountryChange,
  disabled,
  hasError,
}: Props) {
  const selectable = countries && countries.length > 0 && onCountryChange;
  const placeholder = phoneHint(country) || "5X XXX XXXX";

  // No overflow-hidden on the container: the country dropdown is positioned
  // inside it and would be clipped to nothing (the menu opens below the 48px
  // row). Corners are rounded per-segment instead.
  return (
    <div
      className={`flex items-center border rounded-xl h-12 focus-within:ring-2 focus-within:ring-indigo-300 transition ${
        hasError ? "border-red-500" : "border-gray-300"
      }`}
      dir="ltr"
    >
      <div className="flex items-stretch border-r border-gray-200 h-full bg-gray-50 shrink-0 rounded-l-xl">
        {selectable ? (
          <CountrySelect
            countries={countries}
            value={country.isoCountryCode}
            onChange={onCountryChange}
            disabled={disabled}
            compact
          />
        ) : (
          <span className="flex items-center px-3 text-sm text-gray-600 font-medium">
            {country.dialCode}
          </span>
        )}
      </div>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          // toNationalDigits (not a bare digit-strip) so a pasted "+966512345678"
          // loses its dial code BEFORE the length cap is applied.
          const next = toNationalDigits(e.target.value, [country]);
          const max = maxNationalLength(country);
          // Over the cap: block the insertion (native-maxLength-like) instead
          // of slicing — truncation could silently reshape an over-long legacy
          // value into a DIFFERENT valid number. Deletions still pass so the
          // user can correct it; submit-time validation rejects what remains.
          onChange(next.length <= max || next.length < value.length ? next : value);
        }}
        disabled={disabled}
        className="flex-1 h-full px-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-white disabled:bg-gray-50 rounded-r-xl"
      />
    </div>
  );
}
