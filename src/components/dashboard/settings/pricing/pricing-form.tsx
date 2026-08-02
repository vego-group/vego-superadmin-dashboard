"use client";

import { logger } from '@/lib/logger';
import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { useCountries } from "@/hooks/use-countries";
import { useCountryView } from "@/lib/country-view-context";
import { apiErrorMessage } from "@/lib/api-error";
import { IsoCountryCode } from "@/types/country";

interface Price {
  id: number;
  service_type: string;
  pricing_type: string;
  unit: string;
  /** Fixed-precision decimal string (§0.1) — never parseFloat it. */
  price_per_unit: string;
  currency: string;
  /** Fraction digits for the currency, when the API provides it (JOD = 3). */
  currency_decimals?: number;
  is_active: boolean;
  /** Commercial sign-off flags — the backend sends both spellings (§6). */
  is_confirmed?: boolean;
  is_placeholder?: boolean;
}

// Backend answers §6: driven from the row, never from a hardcoded market list.
const isPlaceholderPrice = (p: Price): boolean =>
  p.is_placeholder ?? (p.is_confirmed !== undefined ? !p.is_confirmed : false);

export default function PricingForm() {
  const { t, lang } = useLang();
  const { countries } = useCountries();
  const { view, scopedTo } = useCountryView();

  // ── Country selection (CR-1 §5: pricing is per country) ────────────────────
  const [country, setCountry] = useState<IsoCountryCode>(
    (scopedTo ?? (view !== "ALL" ? view : null) ?? ("SA" as IsoCountryCode))
  );

  // Follow the global view: scoped staff are locked; otherwise a specific
  // country view moves the form with it. "All" keeps the local selection.
  useEffect(() => {
    if (scopedTo) setCountry(scopedTo);
    else if (view !== "ALL") setCountry(view);
  }, [view, scopedTo]);

  const [prices, setPrices]       = useState<Price[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState<number | null>(null);
  const [saved, setSaved]         = useState<number | null>(null);
  const [edited, setEdited]       = useState<Record<number, string>>({});
  const [error, setError]         = useState<string | null>(null);

  // ── Fetch prices for the selected country ──────────────────────────────────
  const fetchPrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/prices?country=${country}`, {
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });
      // §0.3: 422 country_not_supported must surface, never be swallowed.
      if (!res.ok) throw new Error(await apiErrorMessage(res, "Failed to load pricing data", country));
      const json = await res.json();
      const list: Price[] = Array.isArray(json) ? json : (json.data ?? []);
      setPrices(list);
      const init: Record<number, string> = {};
      list.forEach((p) => { init[p.id] = p.price_per_unit; });
      setEdited(init);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load pricing data";
      logger.error("❌ Fetch prices failed:", msg);
      setError(msg);
      setPrices([]);
    } finally {
      setIsLoading(false);
    }
  }, [country]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // ── Update (PUT /prices/{country}/{service_type}, §6) ──────────────────────
  const handleSave = async (price: Price) => {
    setIsSaving(price.id);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/prices/${country}/${price.service_type}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        // Fixed-precision string per the money contract — no float round-trip.
        body: JSON.stringify({ price_per_unit: edited[price.id] }),
      });
      if (!res.ok) {
        throw new Error(await apiErrorMessage(res, t("Failed to update price", "فشل تحديث السعر"), country));
      }
      setPrices((prev) =>
        prev.map((p) => (p.id === price.id ? { ...p, price_per_unit: edited[price.id] } : p))
      );
      setSaved(price.id);
      setTimeout(() => setSaved(null), 2500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update price";
      logger.error("❌ Update price failed:", msg);
      setError(msg);
    } finally {
      setIsSaving(null);
    }
  };

  // ── Labels ─────────────────────────────────────────────────────────────────
  const getLabel = (serviceType: string, unit: string) => {
    const labels: Record<string, string> = {
      battery_swap: t("Battery Swap", "تبديل البطارية"),
      fast_charging: t("Fast Charging", "الشحن السريع"),
      motorcycle: t("Motorcycle", "دراجة نارية"),
    };
    const unitLabels: Record<string, string> = {
      swap: t("swap", "تبديلة"),
      kwh: t("kWh", "ك.و.س"),
      hour: t("hour", "ساعة"),
      day: t("day", "يوم"),
      week: t("week", "أسبوع"),
      month: t("month", "شهر"),
      service: t("service", "خدمة"),
      minute: t("minute", "دقيقة"),
    };
    return `${labels[serviceType] ?? serviceType} (${t("per", "لكل")} ${unitLabels[unit] ?? unit})`;
  };

  const countryLabel = (iso: IsoCountryCode) => {
    const c = countries.find((x) => x.isoCountryCode === iso);
    return c ? (lang === "ar" ? c.nameAr : c.name) : iso;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
          {t("Service Pricing", "أسعار الخدمات")}
        </h2>

        {/* Country selector — pricing is per country (CR-1 §5). Scoped staff
            only ever see their own country. */}
        {scopedTo ? (
          <span className="text-xs font-medium text-gray-500 border px-3 py-1.5 rounded-lg bg-gray-50">
            {countryLabel(scopedTo)}
          </span>
        ) : (
          <div className="flex items-center gap-1 border rounded-lg p-0.5">
            {countries.map((c) => (
              <button
                key={c.isoCountryCode}
                onClick={() => setCountry(c.isoCountryCode)}
                disabled={isSaving !== null}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  country === c.isoCountryCode
                    ? "bg-indigo-600 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {countryLabel(c.isoCountryCode)}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

      {isLoading ? (
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      ) : prices.length === 0 && !error ? (
        <p className="py-8 text-center text-xs text-gray-400">
          {t("No prices configured for this country yet.", "لا توجد أسعار مهيأة لهذه الدولة بعد.")}
        </p>
      ) : (
        <div className="space-y-6">
          {prices.map((price) => (
            <div key={price.id} className="border border-gray-100 rounded-xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-800">
                      {getLabel(price.service_type, price.unit)}
                    </p>
                    {isPlaceholderPrice(price) && (
                      <span
                        className="flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"
                        title={t(
                          "Seeded placeholder — not confirmed by commercial. Do not treat as a live price.",
                          "سعر مبدئي — غير معتمد تجارياً. لا يُعامل كسعر فعلي."
                        )}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {t("Placeholder — not confirmed", "مبدئي — غير معتمد")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {price.pricing_type === "fixed" ? t("Fixed", "ثابت") : t("Variable", "متغير")} · {price.currency}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  price.is_active
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-gray-100 text-gray-400"
                }`}>
                  {price.is_active ? t("Active", "نشط") : t("Inactive", "غير نشط")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step={price.currency_decimals === 3 ? "0.001" : "0.01"}
                  value={edited[price.id] ?? price.price_per_unit}
                  onChange={(e) => setEdited({ ...edited, [price.id]: e.target.value })}
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-colors"
                />
                <button
                  onClick={() => handleSave(price)}
                  disabled={isSaving === price.id}
                  className="shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2 min-w-[90px] justify-center"
                  style={{ backgroundColor: saved === price.id ? "#10b981" : "#1C1FC1" }}
                >
                  {isSaving === price.id ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" />{t("Saving...", "جاري الحفظ...")}</>
                  ) : saved === price.id ? (
                    t("Saved ✓", "تم الحفظ ✓")
                  ) : (
                    t("Save", "حفظ")
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
