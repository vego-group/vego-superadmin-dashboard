"use client";

// Shared country selector fed by GET /countries (CR-1). Two renderings:
// - default: full-width field showing flag + name (+ dial code)
// - compact: dial-code trigger, used as the prefix segment inside PhoneInput
// `value` is the branded IsoCountryCode; the change handler receives the whole
// Country row so callers get dial code / currency / regex without re-lookup.

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { Country, IsoCountryCode } from "@/types/country";

/** "SA" → 🇸🇦 (falls back to plain letters on platforms without flag emoji). */
const flagEmoji = (iso: IsoCountryCode) =>
  String.fromCodePoint(...[...iso].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

interface Props {
  countries: Country[];
  value: IsoCountryCode | null;
  onChange: (country: Country) => void;
  disabled?: boolean;
  compact?: boolean;
  id?: string;
}

export default function CountrySelect({ countries, value, onChange, disabled, compact, id }: Props) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = countries.find((c) => c.isoCountryCode === value) ?? null;
  const label = (c: Country) => (lang === "ar" ? c.nameAr : c.name);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${compact ? "h-full" : ""}`}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={
          compact
            ? "flex items-center gap-1.5 px-3 h-full bg-gray-50 hover:bg-gray-100 transition text-sm text-gray-600 font-medium disabled:opacity-60 rounded-l-xl"
            : "w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 hover:bg-gray-50 transition disabled:opacity-60"
        }
        dir="ltr"
      >
        {selected ? (
          <span className="flex items-center gap-1.5">
            <span aria-hidden>{flagEmoji(selected.isoCountryCode)}</span>
            <span>{compact ? selected.dialCode : `${label(selected)} (${selected.dialCode})`}</span>
          </span>
        ) : (
          <span className="text-gray-400">{t("Select country", "اختر الدولة")}</span>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 left-0 min-w-[220px] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-1">
          {countries.map((c) => (
            <button
              key={c.isoCountryCode}
              type="button"
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3.5 py-2 text-sm text-left hover:bg-indigo-50 transition ${
                c.isoCountryCode === value ? "bg-gray-50 font-semibold text-indigo-700" : "text-gray-700"
              }`}
              dir="ltr"
            >
              <span aria-hidden>{flagEmoji(c.isoCountryCode)}</span>
              <span className="flex-1">{label(c)}</span>
              <span className="text-xs text-gray-400">{c.dialCode}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
