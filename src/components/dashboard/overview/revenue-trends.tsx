// revenue-trends.tsx
"use client";
import { logger } from '@/lib/logger';
import { useLang } from "@/lib/language-context";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, authHeaders } from '@/config/api';
import { Money, formatMoney, moneyToNumber, parseMoney } from '@/lib/money';
import { Loader2, TrendingUp, AlertCircle } from "lucide-react";

// --- التنسيقات ---
// CR-1 §4: platform revenue can span currencies. Each currency gets its OWN
// series — one Y axis can't sum SAR and JOD into one line. Fixed hue order per
// currency slot (validated for CVD separation on the light surface).
const SERIES_COLORS = ['#4F46E5', '#0D9488', '#B45309'];
const CHART_COLORS = { grid: '#F3F4F6' };

const SOURCE = "GET /dashboard/daily-revenue series";

/** One day's three figures for ONE currency (§13a: `total` = swap + fast_charging). */
interface DayMoney {
  total: Money;
  swap: Money | null;
  fastCharging: Money | null;
}

interface DayRow {
  date: string;
  /** One numeric axis value per currency code (chart geometry only). */
  [currency: string]: string | number | Record<string, DayMoney> | undefined;
  /** Display path — original fixed-precision strings, per currency. */
  __moneys?: Record<string, DayMoney>;
}

interface TooltipEntry {
  dataKey: string;
  stroke: string;
  payload: DayRow;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  t,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  t: (en: string, ar: string) => string;
}) => {
  if (!active || !payload?.length) return null;
  const moneys: Record<string, DayMoney> = payload[0].payload?.__moneys ?? {};
  return (
    <div className="bg-white p-3 shadow-xl rounded-xl border border-gray-100 ring-1 ring-black/5">
      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">{label}</p>
      {payload.map((entry) => {
        const day = moneys[entry.dataKey];
        return (
          <div key={entry.dataKey} className="not-first:mt-1.5">
            <p className="flex items-center gap-1.5 text-sm font-bold text-gray-800" dir="ltr">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.stroke }}
                aria-hidden
              />
              {day ? formatMoney(day.total) : "—"}
            </p>
            {/* §13a: the line charts the TOTAL; the swap / fast-charging split
                that composes it is read here rather than adding two more lines
                per currency to a chart that can already carry three. */}
            {day && (day.swap || day.fastCharging) && (
              <p className="ps-4 text-[10px] font-medium text-gray-400 tabular-nums" dir="ltr">
                {day.swap && `${t("Swap", "التبديل")} ${formatMoney(day.swap)}`}
                {day.swap && day.fastCharging && " · "}
                {day.fastCharging &&
                  `${t("Fast charging", "الشحن السريع")} ${formatMoney(day.fastCharging)}`}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function RevenueTrends() {
  const { t } = useLang();
  const [data, setData] = useState<DayRow[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/dashboard/daily-revenue`, {
        method: 'GET',
        headers: authHeaders(),
      });

      const result = await response.json();

      if (!result.success || !result.data) throw new Error(result.message || "Invalid data format");

      const payload = result.data as Record<string, unknown>;
      const currencySet = new Set<string>();
      const byDate = new Map<string, DayRow>();

      const addPoint = (date: string, currency: string, day: DayMoney) => {
        if (!date) return;
        const key = currency || "—";
        currencySet.add(key);
        const row: DayRow = byDate.get(date) ?? { date, __moneys: {} };
        row[key] = moneyToNumber(day.total);
        row.__moneys![key] = day;
        byDate.set(date, row);
      };

      // §13a (confirmed shape): a point's three figures are fixed-precision
      // STRINGS ("18.750"), NOT Money blocks — a 365-point chart would bloat if
      // the currency repeated on every point, so the SERIES declares `currency`
      // and `decimals` once and every point is parsed with them. Never
      // parseFloat: JSON 18.75 for a 3-decimal JOD value is the precision bug
      // the money contract exists to prevent.
      const readPoint = (
        p: Record<string, unknown>,
        currency: string,
        decimals: number | undefined
      ): DayMoney | null => {
        const fallback = { currency: currency || undefined, decimals, source: SOURCE };
        const total = parseMoney(p.total, fallback);
        if (!total) return null;
        return {
          total,
          swap: parseMoney(p.swap, fallback),
          fastCharging: parseMoney(p.fast_charging, fallback),
        };
      };

      // §13a: `series` is the source of truth — one entry per currency, points
      // under `chart`. SAR and JOD cannot share a y-axis, so each series keeps
      // its own line. When the range spans currencies the top-level `chart` is
      // [] and `currency` is null; with a single currency the same points are
      // also mirrored flat, read below only if `series` came back empty.
      const series = Array.isArray(payload.series) ? payload.series : [];
      for (const entry of series) {
        if (!entry || typeof entry !== "object") continue;
        const e = entry as Record<string, unknown>;
        const currency = typeof e.currency === "string" ? e.currency : "";
        const decimals = typeof e.decimals === "number" ? e.decimals : undefined;
        for (const p of (Array.isArray(e.chart) ? e.chart : []) as Array<Record<string, unknown>>) {
          const day = readPoint(p, currency, decimals);
          if (day) addPoint(String(p.date ?? ""), currency, day);
        }
      }

      if (byDate.size === 0 && Array.isArray(payload.chart) && payload.chart.length > 0) {
        // Flat single-currency mirror. Should not be reached — `series` is
        // populated in the single-currency case too — so say so loudly.
        logger.warn(
          `[${SOURCE}] empty/absent \`series\` with a populated top-level \`chart\` — ` +
            `reading the flat mirror. The confirmed shape (§13a) always sends \`series\`.`
        );
        const currency = typeof payload.currency === "string" ? payload.currency : "";
        const decimals = typeof payload.decimals === "number" ? payload.decimals : undefined;
        for (const p of payload.chart as Array<Record<string, unknown>>) {
          const day = readPoint(p, currency, decimals);
          if (day) addPoint(String(p.date ?? ""), currency, day);
        }
      }

      // Merged series interleave dates — ISO dates sort lexicographically.
      // Fixed, stable currency order — a currency keeps its color across loads.
      setData([...byDate.values()].sort((a, b) => a.date.localeCompare(b.date)));
      setCurrencies([...currencySet].sort());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection Error";
      logger.error("Fetch error:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 relative min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-tight">
              {t("Daily Revenue Trends", "اتجاهات الإيرادات اليومية")}
            </h3>
          </div>
          <p className="text-xs text-gray-400 font-medium">{t("Visualizing total daily earnings", "عرض إجمالي الأرباح اليومية")}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Legend — identity per currency (only needed for ≥ 2 series). */}
          {currencies.length > 1 && (
            <div className="flex items-center gap-3">
              {currencies.map((cur, i) => (
                <span key={cur} className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }}
                    aria-hidden
                  />
                  {cur}
                </span>
              ))}
            </div>
          )}
          {loading && <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />}
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center h-[300px] bg-red-50/50 rounded-xl border border-dashed border-red-200">
          <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button onClick={fetchRevenueData} className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
            {t("Try Again", "حاول مجدداً")}
          </button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-200" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-sm text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
          {t("No revenue data for this period", "لا توجد بيانات إيرادات لهذه الفترة")}
        </div>
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {currencies.map((cur, i) => (
                  <linearGradient key={cur} id={`colorRev-${cur}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SERIES_COLORS[i % SERIES_COLORS.length]} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={SERIES_COLORS[i % SERIES_COLORS.length]} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{fontSize: 10, fill: '#9CA3AF'}}
                minTickGap={30} // لمنع تداخل التواريخ
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{fontSize: 10, fill: '#9CA3AF'}}
                tickFormatter={(val) => `${val}`}
              />
              <Tooltip content={<CustomTooltip t={t} />} />
              {currencies.map((cur, i) => (
                <Area
                  key={cur}
                  type="monotone"
                  dataKey={cur}
                  stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                  fill={`url(#colorRev-${cur})`}
                  strokeWidth={2.5}
                  activeDot={{ r: 6, fill: SERIES_COLORS[i % SERIES_COLORS.length], strokeWidth: 4, stroke: '#fff' }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
