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
 * A masked example ("5XXXXXXXX" → "5") is treated as absent: it must only
 * affect display, never cap what the user can type (maxNationalLength) —
 * 7 matches the lower bound isValidPhone accepts without a regex.
 */
export const nationalExample = (country: Country): string => {
  if (!country.phoneExample) return "";
  const digits = toNationalDigits(country.phoneExample, [country]);
  return digits.length >= 7 ? digits : "";
};

const maxNationalLength = (country: Country): number => {
  const example = nationalExample(country);
  return example ? example.length : 12;
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
  const placeholder = nationalExample(country) || "5X XXX XXXX";

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
        onChange={(e) =>
          onChange(
            e.target.value
              .replace(/\D/g, "")
              .replace(/^0/, "")
              .slice(0, maxNationalLength(country))
          )
        }
        disabled={disabled}
        className="flex-1 h-full px-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-white disabled:bg-gray-50 rounded-r-xl"
      />
    </div>
  );
}
