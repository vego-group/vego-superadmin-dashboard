// Locale-aware date formatting (CR-1 defect: formatDateTime hardcoded en-GB,
// ignoring the language toggle; some call sites hardcoded ar-SA, which is
// Saudi-specific — wrong for a Jordanian deployment. Plain "ar" keeps the
// Gregorian calendar with Arabic month names in both countries).
//
// Digits are pinned to Latin (`-u-nu-latn`): formatMoney renders Latin digits
// unconditionally (big.js, locale-independent), so Arabic-Indic dates would put
// two digit systems in one table row. Both target markets use Latin digits in
// operational/financial UIs. Month/weekday names stay Arabic.

type Lang = "en" | "ar";

export const dateLocale = (lang: Lang): string => (lang === "ar" ? "ar-u-nu-latn" : "en-GB");

const parse = (iso: string | null | undefined): Date | null => {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
};

/** "05 Mar 2026" / "٠٥ مارس ٢٠٢٦". Returns "—" for missing/invalid input. */
export function formatDate(iso: string | null | undefined, lang: Lang): string {
  const d = parse(iso);
  if (!d) return "—";
  return d.toLocaleDateString(dateLocale(lang), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Appends the financial date-range params (CR-1 defect fix). ONE format —
 * ISO `YYYY-MM-DD`, exactly what `<input type="date">` produces — and ONE key
 * pair: `date_from`/`date_to`, the backend's preferred pair (answers §5). All
 * four reporting endpoints (including /wallet/transactions/report, which
 * previously read only from/to and silently dropped our dates) now accept it,
 * so the historical duplicated `start_date`/`end_date` keys are gone.
 */
export function appendDateRangeParams(params: URLSearchParams, from?: string, to?: string): void {
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  if (from && ISO_DATE.test(from)) params.set("date_from", from);
  if (to && ISO_DATE.test(to)) params.set("date_to", to);
}

/** formatDate plus 24h time. Returns "—" for missing/invalid input. */
export function formatDateTime(iso: string | null | undefined, lang: Lang): string {
  const d = parse(iso);
  if (!d) return "—";
  return d.toLocaleString(dateLocale(lang), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
