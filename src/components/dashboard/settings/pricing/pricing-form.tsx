"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface Price {
  id: number;
  service_type: string;
  pricing_type: string;
  unit: string;
  price_per_unit: string;
  currency: string;
  is_active: boolean;
}

export default function PricingForm() {
  const [prices, setPrices]     = useState<Price[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState<string | null>(null);
  const [saved, setSaved]         = useState<string | null>(null);
  const [edited, setEdited]       = useState<Record<string, string>>({});

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/proxy/prices', {
          headers: { "Content-Type": "application/json", Accept: "application/json" },
        });
        const json = await res.json();
        const list: Price[] = Array.isArray(json) ? json : (json.data ?? []);
        setPrices(list);
        // initialize edited values
        const init: Record<string, string> = {};
        list.forEach((p) => { init[p.service_type] = p.price_per_unit; });
        setEdited(init);
      } catch (err) {
        console.error("❌ Fetch prices failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrices();
  }, []);

  // ── Update ─────────────────────────────────────────────────────────────────
  const handleSave = async (serviceType: string) => {
    setIsSaving(serviceType);
    try {
      const res = await fetch(`/api/proxy/prices/${serviceType}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ price_per_unit: edited[serviceType] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update price");
      setSaved(serviceType);
      setTimeout(() => setSaved(null), 2500);
    } catch (err) {
      console.error("❌ Update price failed:", err);
    } finally {
      setIsSaving(null);
    }
  };

  // ── Labels ─────────────────────────────────────────────────────────────────
  const getLabel = (serviceType: string, unit: string) => {
    const labels: Record<string, string> = {
      battery_swap: "Battery Swap",
      fast_charging: "Fast Charging",
      motorcycle: "Motorcycle",
    };
    return `${labels[serviceType] ?? serviceType} (per ${unit})`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-6">
        Service Pricing
      </h2>

      <div className="space-y-6">
        {prices.map((price) => (
          <div key={price.service_type} className="border border-gray-100 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {getLabel(price.service_type, price.unit)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {price.pricing_type} · {price.currency}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                price.is_active
                  ? "bg-green-50 text-green-600 border border-green-200"
                  : "bg-gray-100 text-gray-400"
              }`}>
                {price.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                step="0.01"
                value={edited[price.service_type] ?? price.price_per_unit}
                onChange={(e) => setEdited({ ...edited, [price.service_type]: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-colors"
              />
              <button
                onClick={() => handleSave(price.service_type)}
                disabled={isSaving === price.service_type}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2 min-w-[100px] justify-center"
                style={{ backgroundColor: saved === price.service_type ? "#10b981" : "#1C1FC1" }}
              >
                {isSaving === price.service_type ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving...</>
                ) : saved === price.service_type ? (
                  "Saved ✓"
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}