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
  CheckCircle2 
} from "lucide-react";

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
  const [prices, setPrices] = useState<Price[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "success">("idle");

  // ── Fetch Data ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/proxy/prices');
        const json = await res.json();
        const list: Price[] = Array.isArray(json) ? json : (json.data ?? []);
        setPrices(list);
        
        // تجهيز القيم القابلة للتعديل
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

  // ── Update Data ───────────────────────────────────────────────────────────
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // تحديث كل الخدمات التي تم تعديلها
      const updatePromises = Object.keys(edited).map(serviceType => 
        fetch(`/api/proxy/prices/${serviceType}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ price_per_unit: edited[serviceType] }),
        })
      );

      await Promise.all(updatePromises);
      
      setSaveStatus("success");
      setEditMode(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error("❌ Update failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // إعادة القيم للأصل
    const reset: Record<string, string> = {};
    prices.forEach((p) => { reset[p.service_type] = p.price_per_unit; });
    setEdited(reset);
    setEditMode(false);
  };

  // ── UI Helpers ────────────────────────────────────────────────────────────
  const getServiceConfig = (type: string) => {
    const configs: Record<string, any> = {
      battery_swap: { label: "Battery Swap", icon: Battery, color: "text-green-600", bg: "bg-green-100" },
      fast_charging: { label: "Fast Charging", icon: Zap, color: "text-blue-600", bg: "bg-blue-100" },
      motorcycle: { label: "Motorcycle Service", icon: Bike, color: "text-purple-600", bg: "bg-purple-100" },
    };
    return configs[type] || { label: type, icon: Settings, color: "text-gray-600", bg: "bg-gray-100" };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mb-2" />
        <p className="text-xs text-gray-500 font-medium">Loading pricing data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900">Service Pricing</h2>
          {saveStatus === "success" && (
            <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full animate-fade-in">
              <CheckCircle2 className="h-3 w-3" /> SAVED
            </span>
          )}
        </div>

        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold border border-indigo-100 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition-all active:scale-95"
          >
            <Settings className="h-3.5 w-3.5" />
            Edit Prices
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center gap-1.5 text-xs text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all font-bold"
            >
              {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {isSaving ? "Saving..." : "Save All"}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Pricing List */}
      <div className="divide-y divide-gray-50">
        {prices.map((price) => {
          const config = getServiceConfig(price.service_type);
          const Icon = config.icon;

          return (
            <div key={price.service_type} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
              <div className={`p-2 rounded-lg shrink-0 ${config.bg}`}>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-800">{config.label}</p>
                  {!price.is_active && (
                    <span className="text-[9px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded uppercase">Inactive</span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 font-medium uppercase tracking-wider">
                  {price.pricing_type} • {price.unit}
                </p>
              </div>

              <div className="shrink-0">
                {editMode ? (
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                    <input
                      type="number"
                      step="0.01"
                      value={edited[price.service_type]}
                      onChange={(e) => setEdited({ ...edited, [price.service_type]: e.target.value })}
                      className="w-20 py-1.5 bg-transparent text-sm font-bold text-indigo-600 outline-none"
                    />
                    <span className="text-[10px] font-bold text-gray-400">{price.currency}</span>
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="text-sm font-black text-indigo-600">
                      {Number(price.price_per_unit).toFixed(2)} <span className="text-[10px] ml-0.5">{price.currency}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}