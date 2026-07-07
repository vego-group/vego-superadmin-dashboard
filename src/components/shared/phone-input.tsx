"use client";

/* eslint-disable @next/next/no-img-element -- tiny static flag asset, next/image is overkill */

// Saudi phone input: fixed +966 prefix with the KSA flag, 9 national digits.
// `value` holds the national digits only (e.g. "512345678"); compose the full
// number at submit time with `toApiPhone`.

interface Props {
  id?: string;
  value: string;
  onChange: (digits: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

/** "512345678" → "+966512345678" */
export const toApiPhone = (digits: string) => `+966${digits}`;

/** Extracts the national digits from any stored format ("+966512…", "966512…", "0512…"). */
export const toNationalDigits = (phone: string) =>
  phone.replace(/\D/g, "").replace(/^966/, "").replace(/^0/, "").slice(0, 9);

export default function PhoneInput({ id, value, onChange, disabled, hasError }: Props) {
  return (
    <div
      className={`flex items-center border rounded-xl overflow-hidden h-12 focus-within:ring-2 focus-within:ring-indigo-300 transition ${
        hasError ? "border-red-500" : "border-gray-300"
      }`}
      dir="ltr"
    >
      <div className="flex items-center gap-1.5 px-3 border-r border-gray-200 h-full bg-gray-50 shrink-0">
        <img src="/ksa-flag.png" alt="KSA" className="w-5 h-3.5 object-contain" />
        <span className="text-sm text-gray-600 font-medium">+966</span>
      </div>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        placeholder="5X XXX XXXX"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").replace(/^0/, "").slice(0, 9))}
        disabled={disabled}
        className="flex-1 h-full px-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-white disabled:bg-gray-50"
      />
    </div>
  );
}
