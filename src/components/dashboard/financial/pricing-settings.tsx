"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Battery,
  Zap,
  Bike,
  Save,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useLang } from "@/lib/language-context";

interface Price {
  id: number;
  service_type: string;
  pricing_type: string;
  unit: string;
  price_per_unit: string;
  currency: string;
  is_active: boolean;
}

export default function PricingSettings() {
  const { t } = useLang();

  // ── Maps ─────────────────────────────────────────────
  const pricingTypeMap: Record<string, string> = {
    flat: t("Flat", "سعر ثابت"),
    duration: t("Duration", "حسب المدة"),
  };

  const unitMap: Record<string, string> = {
    service: t("Service", "خدمة"),
    minute: t("Minute", "دقيقة"),
  };

  const currencyMap: Record<string, string> = {
    SAR: t("SAR", "ريال"),
  };

  // ── State ────────────────────────────────────────────
  const [prices, setPrices] = useState<Price[]>([]);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  // ── Fetch Prices ─────────────────────────────────────
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/proxy/prices");
        const json = await res.json();
        const list: Price[] = Array.isArray(json)
          ? json
          : json.data ?? [];

        setPrices(list);

        const init: Record<string, string> = {};
        list.forEach((p) => {
          init[p.service_type] = p.price_per_unit;
        });
        setEdited(init);
      } catch (err) {
        console.error("❌ Fetch failed:", err);
        setError("Failed to load pricing data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
  }, []);

  // ── Helpers ──────────────────────────────────────────
  const getServiceConfig = (type: string) => {
    const configs: Record<string, any> = {
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

  // ── Save ─────────────────────────────────────────────
  const handleSaveAll = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const changed = prices.filter(
        (p) => edited[p.service_type] !== p.price_per_unit
      );

      if (changed.length === 0) return;

      const requests = changed.map((p) =>
        fetch(`/api/proxy/prices/${p.service_type}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            price_per_unit: Number(edited[p.service_type]),
          }),
        })
      );

      await Promise.all(requests);

      // ✅ update local state
      setPrices((prev) =>
        prev.map((p) => ({
          ...p,
          price_per_unit: edited[p.service_type],
        }))
      );

      setSaveStatus("success");
      setEditMode(false);

      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error("❌ Save failed:", err);
      setError("Failed to save changes");
    } finally {
      setIsSaving(false);
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

  // ── Loading ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border p-12 flex flex-col items-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mb-2" />
        <p className="text-xs text-gray-500">
          {t("Loading pricing data...", "جاري تحميل البيانات...")}
        </p>
      </div>
    );
  }

  // ── UI ───────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-purple-600 to-indigo-600" />

      {/* Header */}
      <div className="px-5 py-4 border-b flex justify-between items-center">
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

        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="text-xs text-indigo-600 border px-3 py-1.5 rounded-lg"
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

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 px-5 py-2">{error}</p>
      )}

      {/* List */}
      <div className="divide-y">
        {prices.map((price) => {
          const config = getServiceConfig(price.service_type);
          const Icon = config.icon;

          return (
            <div
              key={price.id}
              className="px-5 py-4 flex items-center gap-4"
            >
              <div className={`p-2 rounded ${config.bg}`}>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold">{config.label}</p>
                <p className="text-xs text-gray-400">
                  {pricingTypeMap[price.pricing_type]} •{" "}
                  {unitMap[price.unit]}
                </p>
              </div>

              {editMode ? (
                <input
                  type="number"
                  step="0.01"
                  value={Number(edited[price.service_type])}
                  onChange={(e) =>
                    setEdited({
                      ...edited,
                      [price.service_type]: e.target.value,
                    })
                  }
                  className="w-20 border rounded px-2 py-1 text-sm"
                />
              ) : (
                <p className="text-sm font-bold text-indigo-600">
                  {Number(price.price_per_unit).toFixed(2)}{" "}
                  {price.currency}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}