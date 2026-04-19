"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Battery, Zap, Bike } from "lucide-react";

interface Price {
  id: number; service_type: string; pricing_type: string;
  unit: string; price_per_unit: string; currency: string; is_active: boolean;
}

const serviceConfig: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
  battery_swap:  { icon: <Battery className="h-5 w-5 text-green-600" />,  bg: "bg-green-100",  color: "text-green-600"  },
  fast_charging: { icon: <Zap className="h-5 w-5 text-blue-600" />,       bg: "bg-blue-100",   color: "text-blue-600"   },
  motorcycle:    { icon: <Bike className="h-5 w-5 text-purple-600" />,    bg: "bg-purple-100", color: "text-purple-600" },
};

export default function SalesPricingIndex() {
  const [prices,  setPrices]  = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/proxy/prices", { headers: { Accept: "application/json" } })
      .then(r => r.json())
      .then(json => setPrices(json.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Service Pricing</h1>
        <p className="text-sm text-gray-500 mt-1">Current pricing plans — read only</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm py-12">
          <RefreshCw className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {prices.map((p) => {
            const cfg = serviceConfig[p.service_type] ?? { icon: null, bg: "bg-gray-100", color: "text-gray-600" };
            return (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl ${cfg.bg}`}>{cfg.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 capitalize">{p.service_type.replace("_", " ")}</p>
                      <p className="text-xs text-gray-400 capitalize">{p.pricing_type}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price per {p.unit}</span>
                      <span className="font-bold text-gray-900">{parseFloat(p.price_per_unit).toFixed(2)} {p.currency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}