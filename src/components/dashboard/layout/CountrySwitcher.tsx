"use client";

// Topbar country switcher (CR-1 §3): All / Jordan / Saudi Arabia, persisted
// like the language toggle. A VIEW filter over every list module — not a
// permission. Scoped staff (non-null iso_country_code) are locked to their own
// country: no other option is even offered.

import { Globe } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { useCountries } from "@/hooks/use-countries";
import { useCountryView, CountryView } from "@/lib/country-view-context";
import { IsoCountryCode } from "@/types/country";

/** "SA" → 🇸🇦 */
const flagEmoji = (iso: IsoCountryCode) =>
  String.fromCodePoint(...[...iso].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

export default function CountrySwitcher() {
  const { t, lang } = useLang();
  const { countries } = useCountries();
  const { view, setView, scopedTo } = useCountryView();

  if (scopedTo) {
    const country = countries.find((c) => c.isoCountryCode === scopedTo);
    return (
      <div
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 shadow-sm text-sm text-gray-700"
        title={t(
          "Your account is scoped to this country",
          "حسابك مقيّد بهذه الدولة"
        )}
      >
        <Globe className="h-4 w-4 text-gray-400" />
        <span aria-hidden>{flagEmoji(scopedTo)}</span>
        <span className="font-medium">
          {country ? (lang === "ar" ? country.nameAr : country.name) : scopedTo}
        </span>
      </div>
    );
  }

  const options: Array<{ value: CountryView; label: string; flag?: string }> = [
    { value: "ALL", label: t("All", "الكل") },
    ...countries.map((c) => ({
      value: c.isoCountryCode as CountryView,
      label: lang === "ar" ? c.nameAr : c.name,
      flag: flagEmoji(c.isoCountryCode),
    })),
  ];

  return (
    <div
      className="inline-flex items-center gap-1 p-1 rounded-xl bg-white border border-gray-200 shadow-sm"
      role="group"
      aria-label={t("Country view filter", "تصفية العرض حسب الدولة")}
    >
      <Globe className="h-4 w-4 text-gray-400 mx-1.5 shrink-0" aria-hidden />
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setView(opt.value)}
          aria-pressed={view === opt.value}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
            view === opt.value
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {opt.flag && (
            <span className="mr-1" aria-hidden>
              {opt.flag}
            </span>
          )}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
