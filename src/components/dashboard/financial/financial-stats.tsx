"use client";

import {
  TrendingUp,
  CreditCard,
  BarChart2,
  ShoppingCart,
  ArrowLeftRight,
  AlertCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import { useFinancial } from "@/hooks/use-financial";
import { useLang } from "@/lib/language-context";
import { dateLocale, formatDate } from "@/lib/format-date";
import {
  Money,
  formatMoney,
  parseMoney,
  byCurrencyBlocks,
  parseConvertedBlock,
} from "@/lib/money";


interface FinancialStatsProps {
  fromDate: string;
  toDate: string;
  /** §13 opt-in `?currency=` conversion target ("" = off). */
  convertCurrency?: string;
}

// §13: `by_currency` is the source of truth and always present. The flat keys
// carry a currency only when the request was unambiguous (?country= filter) —
// `currency` is null otherwise and each currency renders as its own stat row.
// A null money value renders as "—", never a bare number.
interface StatField {
  key: string;
  label: [string, string]; // [en, ar]
  money: boolean;
  icon: typeof TrendingUp;
  color: string;
  bg: string;
}

const STAT_FIELDS: StatField[] = [
  { key: "total_revenue",      label: ["Total Revenue",      "إجمالي الإيرادات"],   money: true,  icon: TrendingUp,     color: "text-green-600",  bg: "bg-green-100"  },
  { key: "total_transactions", label: ["Total Transactions", "إجمالي المعاملات"],   money: false, icon: CreditCard,     color: "text-blue-600",   bg: "bg-blue-100"   },
  { key: "avg_transaction",    label: ["Avg. Transaction",   "متوسط المعاملة"],     money: true,  icon: BarChart2,      color: "text-purple-600", bg: "bg-purple-100" },
  { key: "pending_holds",      label: ["Pending Holds",      "الحجوزات المعلقة"],   money: true,  icon: ShoppingCart,   color: "text-orange-500", bg: "bg-orange-100" },
  { key: "refunds",            label: ["Refunds",            "المبالغ المستردة"],   money: true,  icon: ArrowLeftRight, color: "text-red-500",    bg: "bg-red-100"    },
];

function StatCard({
  field,
  label,
  money,
  count,
  countLocale,
}: {
  field: StatField;
  label: string;
  money?: Money | null;
  count?: number | null;
  countLocale: string;
}) {
  const Icon = field.icon;
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all hover:-translate-y-1 group">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600 opacity-80 group-hover:opacity-100 transition-opacity" />

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg transition-colors ${field.bg}`}>
            <Icon className={`h-4 w-4 ${field.color}`} />
          </div>
        </div>

        {field.money ? (
          <p className={`text-xl font-bold tracking-tight tabular-nums ${field.color}`} dir="ltr">
            {money ? formatMoney(money) : "—"}
          </p>
        ) : (
          <p className={`text-xl font-bold tracking-tight tabular-nums ${field.color}`} dir="ltr">
            {/* Same Latin-digit locale as dates — counts must match the money cards beside them. */}
            {count != null ? count.toLocaleString(countLocale) : "—"}
          </p>
        )}

        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
          {label}
        </p>
      </div>
    </div>
  );
}

/** One stat-card row from a stat block (flat response or one by_currency entry). */
function StatRow({
  block,
  currency,
  countLocale,
  t,
}: {
  block: Record<string, unknown>;
  /** The row's unambiguous currency, used as parse fallback for legacy values. */
  currency: string | null;
  countLocale: string;
  t: (en: string, ar: string) => string;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {STAT_FIELDS.map((f) => {
        if (f.money) {
          const money = parseMoney(block[f.key], {
            currency: currency ?? undefined,
            source: `GET /dashboard/financial ${f.key}`,
          });
          return (
            <StatCard key={f.key} field={f} label={t(...f.label)} money={money} countLocale={countLocale} />
          );
        }
        const raw = block[f.key];
        const count = typeof raw === "number" ? raw : raw != null && !isNaN(Number(raw)) ? Number(raw) : null;
        return (
          <StatCard key={f.key} field={f} label={t(...f.label)} count={count} countLocale={countLocale} />
        );
      })}
    </div>
  );
}

export default function FinancialStats({ fromDate, toDate, convertCurrency = "" }: FinancialStatsProps) {
  const { t, lang } = useLang();
  const { data, isLoading, error } = useFinancial(fromDate, toDate, convertCurrency || null);
  const countLocale = dateLocale(lang);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-white border border-gray-100 rounded-xl animate-pulse flex flex-col p-4 space-y-3">
            <div className="h-8 w-8 bg-gray-100 rounded-lg" />
            <div className="h-6 w-20 bg-gray-100 rounded" />
            <div className="h-4 w-12 bg-gray-50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    // Includes the 422 currency_not_supported message verbatim (§13).
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl flex items-center gap-2 text-sm">
        <AlertCircle className="h-4 w-4" />
        <span>{t(error, error)}</span>
      </div>
    );
  }

  const rec = (data ?? {}) as Record<string, unknown>;
  // Flat keys are trustworthy only when the response names their currency.
  const flatCurrency = typeof rec.currency === "string" && rec.currency ? rec.currency : null;
  const blocks = byCurrencyBlocks(rec.by_currency);
  const converted = parseConvertedBlock(rec.converted);

  // Caption rate pairs, e.g. "1 JOD = 5.26 SAR" (the target's 1:1 entry is noise).
  const ratePairs = converted
    ? Object.entries(converted.rates)
        .filter(([cur]) => cur !== converted.currency)
        .map(([cur, rate]) => `1 ${cur} = ${rate} ${converted.currency}`)
    : [];

  return (
    <div className="space-y-3">
      {flatCurrency ? (
        // Unambiguous (?country=-filtered) response — single row off the flat keys.
        <StatRow block={rec} currency={flatCurrency} countLocale={countLocale} t={t} />
      ) : blocks.length > 0 ? (
        // Cross-country response — one stat row per currency from by_currency.
        blocks.map(({ currency, block }) => (
          <div key={currency} className="space-y-1.5">
            <span className="inline-block text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5 tracking-wider">
              {currency}
            </span>
            <StatRow block={block} currency={currency} countLocale={countLocale} t={t} />
          </div>
        ))
      ) : (
        // No by_currency entries (empty platform) — a row of explicit dashes.
        <StatRow block={rec} currency={null} countLocale={countLocale} t={t} />
      )}

      {/* §13 opt-in converted total — reporting only. */}
      {converted && (
        <div className="space-y-1.5">
          {converted.complete ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
              <div className="p-4 flex flex-wrap items-baseline gap-x-6 gap-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {t(`Converted total (${converted.currency})`, `الإجمالي المحوَّل (${converted.currency})`)}
                </p>
                {Object.entries(converted.totals).map(([field, money]) => {
                  const known = STAT_FIELDS.find((f) => f.key === field);
                  return (
                    <p key={field} className="text-lg font-bold tabular-nums text-emerald-600" dir="ltr">
                      {formatMoney(money)}
                      {Object.keys(converted.totals).length > 1 && (
                        <span className="ms-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {known ? t(...known.label) : field.replace(/_/g, " ")}
                        </span>
                      )}
                    </p>
                  );
                })}
              </div>
            </div>
          ) : (
            // A partial total must NEVER read as a whole one: name the missing
            // currencies and label any figure as partial (§13). This is also the
            // state ops sees while the exchange_rates table is still empty.
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-sm text-amber-800">
              <p className="flex items-center gap-2 font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {t(
                  `Converted total is incomplete — no exchange rate recorded for: ${converted.missingRates.join(", ") || "?"}.`,
                  `الإجمالي المحوَّل غير مكتمل — لا يوجد سعر صرف مسجَّل لِـ: ${converted.missingRates.join("، ") || "؟"}.`
                )}
              </p>
              {converted.totals.total_revenue && (
                <p dir="ltr" className="tabular-nums">
                  {formatMoney(converted.totals.total_revenue)}{" "}
                  <span className="text-xs font-bold">
                    {t(
                      `(partial — excludes ${converted.missingRates.join(", ")})`,
                      `(جزئي — لا يشمل ${converted.missingRates.join("، ")})`
                    )}
                  </span>
                </p>
              )}
              <p className="text-xs">
                {t(
                  "Amounts in those currencies are excluded from the figure above. Enter exchange rates to complete it.",
                  "المبالغ بتلك العملات غير مشمولة في الرقم أعلاه. أدخل أسعار الصرف لإكماله."
                )}
              </p>
            </div>
          )}

          {/* Rate caption — conversion is reporting-only, never pricing/wallets (§13). */}
          {(ratePairs.length > 0 || converted.rateAsOf) && (
            <p className="flex items-center gap-1.5 text-[11px] text-gray-400 px-1">
              <Info className="h-3 w-3 shrink-0" />
              {t(
                `Converted${ratePairs.length ? ` at ${ratePairs.join(", ")}` : ""}${converted.rateAsOf ? ` as of ${formatDate(converted.rateAsOf, lang)}` : ""} — exchange rates are for reporting only and never affect pricing or wallets.`,
                `تم التحويل${ratePairs.length ? ` بسعر ${ratePairs.join("، ")}` : ""}${converted.rateAsOf ? ` كما في ${formatDate(converted.rateAsOf, lang)}` : ""} — أسعار الصرف لأغراض التقارير فقط ولا تؤثر على التسعير أو المحافظ.`
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
