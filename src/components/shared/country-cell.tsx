"use client";

// Country cell for list tables (CR-1 §3): flag + localized name for a record's
// `iso_country_code`. Renders "—" when the record carries no country, so a
// missing backend field is visible rather than silently blank.

import { useLang } from "@/lib/language-context";
import { useCountries } from "@/hooks/use-countries";

export default function CountryCell({ iso }: { iso: string | null | undefined }) {
  const { lang } = useLang();
  const { countries } = useCountries();

  const code = typeof iso === "string" ? iso.trim().toUpperCase() : "";
  if (!/^[A-Z]{2}$/.test(code)) return <span className="text-gray-400">—</span>;

  const country = countries.find((c) => c.isoCountryCode === code);
  const flag = String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap" dir="ltr">
      <span aria-hidden>{flag}</span>
      <span>{country ? (lang === "ar" ? country.nameAr : country.name) : code}</span>
    </span>
  );
}
