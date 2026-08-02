"use client";

import { logger } from '@/lib/logger';
import { Loader2, Globe } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS, authHeaders } from "@/config/api";
import { useLang } from "@/lib/language-context";
import { Money, formatCount, formatMoney, moneyToNumber, parseMoney, byCurrencyBlocks } from "@/lib/money";

const CITY_TRANSLATIONS: Record<string, string> = {
  "Riyadh":  "الرياض",
  "Jeddah":  "جدة",
  "Dammam":  "الدمام",
  "Khobar":  "الخبر",
  "Madinah": "المدينة المنورة",
  "Mecca":   "مكة المكرمة",
  "Taif":    "الطائف",
  "Abha":    "أبها",
  "Amman":   "عمّان",
};

interface CityStat {
  city: string;
  battery_swap: { count: number };
  fast_charging: { count: number };
  total: { count: number; revenue: Money | null };
  percentage: number;
}

interface CityTotals {
  /** One line per currency — never a cross-currency sum. */
  revenues: Money[];
  /** Cross-city transaction count, or null if the response omitted it. */
  count: number | null;
}

const TOTALS_SOURCE = "GET /dashboard/stats-by-city totals";

// §13a (confirmed shape): `totals` rides TOP-LEVEL alongside `data`, not inside
// it. The money field is `revenue` — `by_currency` is the source of truth and
// the flat `revenue` is filled only when the response names one currency.
// `count` is a count, not money, so it is summable across currencies and stays
// FLAT even in the mixed case where `revenue` goes null.
const parseTotals = (raw: unknown): CityTotals => {
  if (!raw || typeof raw !== "object") return { revenues: [], count: null };
  const rec = raw as Record<string, unknown>;
  const count = typeof rec.count === "number" ? rec.count : null;

  const flatCurrency = typeof rec.currency === "string" && rec.currency ? rec.currency : null;
  if (flatCurrency) {
    const money = parseMoney(rec.revenue, { currency: flatCurrency, source: TOTALS_SOURCE });
    return { revenues: money ? [money] : [], count };
  }
  return {
    revenues: byCurrencyBlocks(rec.by_currency)
      .map(({ currency, block }) => parseMoney(block.revenue, { currency, source: TOTALS_SOURCE }))
      .filter((m): m is Money => m !== null),
    count,
  };
};

export default function StatsByCity() {
  const { t, lang } = useLang();
  const [cities, setCities] = useState<CityStat[]>([]);
  const [totals, setTotals] = useState<CityTotals>({ revenues: [], count: null });
  const [loading, setLoading] = useState(true);

  const fetchCityStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.DASHBOARD_STATS_BY_CITY, {
        headers: authHeaders(),
      });
      const result = await response.json();

      // §13a: rows stay under `data`; `totals` and `filters` ride alongside it
      // at the top level.
      const rows: Array<Record<string, unknown>> = Array.isArray(result?.data) ? result.data : [];

      if (result.success) {
        // §13: every row carries country_code, currency, decimals and a
        // Money-block revenue — a city belongs to exactly one country, so
        // per-row formatting needs no envelope.
        const revenues = rows.map((c) =>
          parseMoney((c.total as Record<string, unknown>)?.revenue, {
            currency: typeof c.currency === "string" && c.currency ? c.currency : undefined,
            decimals: typeof c.decimals === "number" ? c.decimals : undefined,
            source: "GET /dashboard/stats-by-city total.revenue",
          })
        );
        // The percentage bars compare cities against a max — meaningless
        // across currencies, so each city is scaled against the largest
        // revenue IN ITS OWN CURRENCY. (Replaces the old mixed-currency
        // dead-end state: rows are per-currency well-formed now.)
        const maxByCurrency = new Map<string, number>();
        revenues.forEach((m) => {
          if (!m) return;
          maxByCurrency.set(m.currency, Math.max(maxByCurrency.get(m.currency) ?? 0, moneyToNumber(m)));
        });
        const formatted: CityStat[] = rows.map((item, i) => {
          const m = revenues[i];
          const max = m ? maxByCurrency.get(m.currency) || 0 : 0;
          const total = item.total as Record<string, unknown> | undefined;
          return {
            city:          String(item.city || "Unknown"),
            battery_swap:  { count: Number((item.battery_swap as Record<string, unknown>)?.count || 0)  },
            fast_charging: { count: Number((item.fast_charging as Record<string, unknown>)?.count || 0) },
            total:         { count: Number(total?.count || 0), revenue: m },
            percentage:    m && max > 0 ? (moneyToNumber(m) / max) * 100 : 0,
          };
        });
        setCities(formatted);
        setTotals(parseTotals(result.totals));
      }
    } catch (error) {
      logger.error("Error fetching city stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCityStats(); }, [fetchCityStats]);

  const barColors = ["bg-indigo-600", "bg-blue-600", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 h-fit min-h-[300px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 uppercase tracking-tight">
          {t("Geographic Distribution", "التوزيع الجغرافي")}
          <Globe className="h-4 w-4 text-indigo-500" />
        </h3>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
      </div>

      <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full bg-gray-50 animate-pulse rounded" />
              <div className="h-2 w-full bg-gray-50 animate-pulse rounded-full" />
            </div>
          ))
        ) : cities.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl">
            {t("No geographic data available", "لا توجد بيانات جغرافية")}
          </div>
        ) : (
          cities.map((city, index) => (
            <div key={city.city} className="space-y-1.5">
              {/* City + Total */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-800">
                  {lang === "ar" ? (CITY_TRANSLATIONS[city.city] ?? city.city) : city.city}
                </span>
                <span className="text-xs font-bold text-gray-600" dir="ltr">
                  {city.total.revenue ? formatMoney(city.total.revenue) : "—"}
                </span>
              </div>

              {/* Progress Bar — scaled against the max within the SAME currency */}
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${barColors[index % barColors.length]}`}
                  style={{ width: `${city.percentage}%` }}
                />
              </div>

              {/* Stats Footer */}
              <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                <div className="flex gap-3">
                  <span>🔋 {city.battery_swap.count} {t("cabinets", "خزانة")}</span>
                  <span>⚡ {city.fast_charging.count} {t("stations", "محطة")}</span>
                </div>
                <span>{formatCount(city.total.count, lang)} {t("transactions", "معاملة")}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cross-city totals — one revenue line per currency, never a
          cross-currency sum (§13). The transaction count IS summable across
          currencies, so it stays a single figure even when revenue splits. */}
      {!loading && (totals.revenues.length > 0 || totals.count != null) && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-start justify-between">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {t("Total Revenue", "إجمالي الإيرادات")}
          </span>
          <div className="text-end space-y-0.5">
            {totals.revenues.length > 0 ? (
              totals.revenues.map((m) => (
                <p key={m.currency} className="text-xs font-bold text-gray-700 tabular-nums" dir="ltr">
                  {formatMoney(m)}
                </p>
              ))
            ) : (
              <p className="text-xs font-bold text-gray-400">—</p>
            )}
            {totals.count != null && (
              <p className="text-[10px] font-medium text-gray-400 tabular-nums">
                {formatCount(totals.count, lang)} {t("transactions", "معاملة")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
