"use client";

import { logger } from '@/lib/logger';
import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Battery,
  Zap,
  Bike,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useLang } from "@/lib/language-context";
import { formatMoney } from "@/lib/money";
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

// Backend answers §6: every price row carries is_confirmed / is_placeholder,
// so the badge is driven from the row — never from a hardcoded market list.
const isPlaceholderPrice = (p: Price): boolean =>
  p.is_placeholder ?? (p.is_confirmed !== undefined ? !p.is_confirmed : false);

export default function PricingSettings() {
  const { t, lang } = useLang();
  const { countries } = useCountries();
  const { view, scopedTo } = useCountryView();

  // ── Country selection (CR-1 §5: pricing is per country) ──────────────
  const [country, setCountry] = useState<IsoCountryCode>(
    (scopedTo ?? (view !== "ALL" ? view : null) ?? ("SA" as IsoCountryCode))
  );

  // Follow the global view: scoped staff are locked; otherwise a specific
  // country view moves the card with it. "All" keeps the local selection.
  useEffect(() => {
    if (scopedTo) setCountry(scopedTo);
    else if (view !== "ALL") setCountry(view);
  }, [view, scopedTo]);

  // ── Maps ─────────────────────────────────────────────
  const pricingTypeMap: Record<string, string> = {
    flat: t("Flat", "سعر ثابت"),
    duration: t("Duration", "حسب المدة"),
  };

  const unitMap: Record<string, string> = {
    service: t("Service", "خدمة"),
    minute: t("Minute", "دقيقة"),
  };

  // ── State ────────────────────────────────────────────
  const [prices, setPrices] = useState<Price[]>([]);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  // Commercial sign-off (§6) — the row awaiting the confirm dialog, if any.
  const [signingOff, setSigningOff] = useState<Price | null>(null);
  const [isSigningOff, setIsSigningOff] = useState(false);

  // ── Fetch prices for the selected country ────────────
  const fetchPrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setEditMode(false);
    try {
      const res = await fetch(`/api/proxy/prices?country=${country}`);
      // §0.3: 422 country_not_supported must surface, never be swallowed.
      if (!res.ok) throw new Error(await apiErrorMessage(res, "Failed to load pricing data", country));
      const json = await res.json();
      const list: Price[] = Array.isArray(json) ? json : json.data ?? [];

      setPrices(list);

      const init: Record<string, string> = {};
      list.forEach((p) => {
        init[p.service_type] = p.price_per_unit;
      });
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

  // ── Helpers ──────────────────────────────────────────
  const getServiceConfig = (type: string) => {
    const configs: Record<string, { label: string; icon: typeof Settings; color: string; bg: string }> = {
      battery_swap: {
        label: t("Battery Swap", "تبديل البطارية"),
        icon: Battery,
        color: "text-green-600",
        bg: "bg-green-100",
      },
      fast_charging: {
        label: t("Fast Charging", "الشحن السريع"),
        icon: Zap,
        color: "text-blue-600",
        bg: "bg-blue-100",
      },
      motorcycle: {
        label: t("Motorcycle Service", "خدمة الدراجات"),
        icon: Bike,
        color: "text-purple-600",
        bg: "bg-purple-100",
      },
    };

    return (
      configs[type] || {
        label: type,
        icon: Settings,
        color: "text-gray-600",
        bg: "bg-gray-100",
      }
    );
  };

  const hasChanges = prices.some(
    (p) => edited[p.service_type] !== p.price_per_unit
  );

  // ── Save (PUT /prices/{country}/{service_type}) ──────
  // Every response is checked individually — a rejected save must NEVER show
  // "Saved" (CR-1 defect: the old Promise.all had no res.ok check, which with
  // per-country pricing becomes a silent mispricing bug).
  const handleSaveAll = async () => {
    setIsSaving(true);
    setError(null);

    const changed = prices.filter(
      (p) => edited[p.service_type] !== p.price_per_unit
    );
    if (changed.length === 0) {
      setIsSaving(false);
      return;
    }

    const results = await Promise.all(
      changed.map(async (p) => {
        try {
          const res = await fetch(`/api/proxy/prices/${country}/${p.service_type}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            // Fixed-precision string per the money contract — no float round-trip.
            body: JSON.stringify({ price_per_unit: edited[p.service_type] }),
          });
          if (!res.ok) {
            return { p, ok: false as const, msg: await apiErrorMessage(res, `Failed to save ${p.service_type}`, country) };
          }
          return { p, ok: true as const };
        } catch {
          return { p, ok: false as const, msg: `Failed to save ${p.service_type} (network error)` };
        }
      })
    );

    const failed = results.filter((r) => !r.ok);
    const succeeded = results.filter((r) => r.ok).map((r) => r.p.service_type);

    // Reflect only the saves the server actually accepted.
    setPrices((prev) =>
      prev.map((p) =>
        succeeded.includes(p.service_type)
          ? { ...p, price_per_unit: edited[p.service_type] }
          : p
      )
    );

    if (failed.length > 0) {
      setError(
        failed
          .map((f) => ("msg" in f && f.msg) || f.p.service_type)
          .join(" · ")
      );
      // Stay in edit mode so the rejected values are visibly unsaved.
    } else {
      setSaveStatus("success");
      setEditMode(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
    setIsSaving(false);
  };

  // ── Commercial sign-off (§6) ─────────────────────────
  // PUT /prices/{country}/{service_type} with is_confirmed: true marks the
  // price as commercially LIVE — hence the explicit confirm dialog.
  const handleSignOff = async () => {
    if (!signingOff) return;
    setIsSigningOff(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/prices/${country}/${signingOff.service_type}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_confirmed: true }),
      });
      if (!res.ok) {
        throw new Error(await apiErrorMessage(res, `Failed to confirm ${signingOff.service_type}`, country));
      }
      setPrices((prev) =>
        prev.map((p) =>
          p.service_type === signingOff.service_type
            ? { ...p, is_confirmed: true, is_placeholder: false }
            : p
        )
      );
      setSigningOff(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm price");
    } finally {
      setIsSigningOff(false);
    }
  };

  // ── Cancel ───────────────────────────────────────────
  const handleCancel = () => {
    const reset: Record<string, string> = {};
    prices.forEach((p) => {
      reset[p.service_type] = p.price_per_unit;
    });

    setEdited(reset);
    setEditMode(false);
    setError(null);
  };

  const countryLabel = (iso: IsoCountryCode) => {
    const c = countries.find((x) => x.isoCountryCode === iso);
    return c ? (lang === "ar" ? c.nameAr : c.name) : iso;
  };

  // ── UI ───────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-purple-600 to-indigo-600" />

      {/* Header */}
      <div className="px-5 py-4 border-b flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">
            {t("Service Pricing", "تسعير الخدمات")}
          </h2>

          {saveStatus === "success" && (
            <span className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="h-3 w-3" />
              {t("Saved", "تم الحفظ")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
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
                  disabled={isSaving}
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

          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              disabled={isLoading || prices.length === 0}
              className="text-xs text-indigo-600 border px-3 py-1.5 rounded-lg disabled:opacity-40"
            >
              <Settings className="inline h-3.5 w-3.5 mr-1" />
              {t("Edit", "تعديل")}
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveAll}
                disabled={isSaving || !hasChanges}
                className="text-xs text-white bg-indigo-600 px-3 py-1.5 rounded-lg disabled:opacity-50"
              >
                {isSaving ? "..." : <Save className="inline h-3.5 w-3.5 mr-1" />}
                {t("Save", "حفظ")}
              </button>

              <button
                onClick={handleCancel}
                className="text-xs text-gray-500 border px-3 py-1.5 rounded-lg"
              >
                <X className="inline h-3.5 w-3.5 mr-1" />
                {t("Cancel", "إلغاء")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 px-5 py-2">{error}</p>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mb-2" />
          <p className="text-xs text-gray-500">
            {t("Loading pricing data...", "جاري تحميل البيانات...")}
          </p>
        </div>
      ) : prices.length === 0 && !error ? (
        <p className="px-5 py-8 text-center text-xs text-gray-400">
          {t("No prices configured for this country yet.", "لا توجد أسعار مهيأة لهذه الدولة بعد.")}
        </p>
      ) : (
        <div className="divide-y">
          {prices.map((price) => {
            const config = getServiceConfig(price.service_type);
            const Icon = config.icon;
            const placeholder = isPlaceholderPrice(price);

            return (
              <div
                key={price.id ?? price.service_type}
                className="px-5 py-4 flex items-center gap-4"
              >
                <div className={`p-2 rounded ${config.bg}`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold">{config.label}</p>
                    {placeholder && (
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
                    {placeholder && !editMode && (
                      <button
                        onClick={() => setSigningOff(price)}
                        disabled={isSaving || isSigningOff}
                        className="text-[10px] font-medium text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 px-2 py-0.5 rounded-full transition disabled:opacity-40"
                      >
                        {t("Sign off", "اعتماد")}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {pricingTypeMap[price.pricing_type] ?? price.pricing_type} •{" "}
                    {unitMap[price.unit] ?? price.unit}
                  </p>
                </div>

                {editMode ? (
                  <input
                    type="number"
                    step={price.currency_decimals === 3 ? "0.001" : "0.01"}
                    value={edited[price.service_type] ?? ""}
                    onChange={(e) =>
                      setEdited({
                        ...edited,
                        [price.service_type]: e.target.value,
                      })
                    }
                    className="w-24 border rounded px-2 py-1 text-sm"
                  />
                ) : (
                  // Per-row currency + decimals — never a hardcoded unit (§0.1).
                  <p className="text-sm font-bold text-indigo-600" dir="ltr">
                    {formatMoney(price.price_per_unit, price.currency, price.currency_decimals)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Sign-off confirm dialog — confirming marks the price commercially
          LIVE (billed against), so it must never be a one-click action. */}
      {signingOff && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl p-5 max-w-sm w-full space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {t("Confirm this price as commercially live?", "اعتماد هذا السعر تجارياً؟")}
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {t(
                    "This marks the price as confirmed and live — customers will be billed against it. Who confirmed it and when is recorded.",
                    "سيُعتمد السعر ويصبح فعلياً — سيُحاسَب العملاء على أساسه. يتم تسجيل من اعتمده ومتى."
                  )}
                </p>
                <p className="text-sm font-bold text-gray-800 mt-2" dir="ltr">
                  {getServiceConfig(signingOff.service_type).label}:{" "}
                  {formatMoney(signingOff.price_per_unit, signingOff.currency, signingOff.currency_decimals)}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSigningOff(null)}
                disabled={isSigningOff}
                className="text-xs text-gray-500 border px-3 py-1.5 rounded-lg disabled:opacity-40"
              >
                {t("Cancel", "إلغاء")}
              </button>
              <button
                onClick={handleSignOff}
                disabled={isSigningOff}
                className="text-xs text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSigningOff && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {t("Confirm price", "اعتماد السعر")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
