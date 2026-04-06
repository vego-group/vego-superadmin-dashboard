"use client";

import { Loader2, Globe } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS, authHeaders } from "@/config/api";
import { useLang } from "@/lib/language-context";

const CITY_TRANSLATIONS: Record<string, string> = {
  "Riyadh":  "الرياض",
  "Jeddah":  "جدة",
  "Dammam":  "الدمام",
  "Khobar":  "الخبر",
  "Madinah": "المدينة المنورة",
  "Mecca":   "مكة المكرمة",
  "Taif":    "الطائف",
  "Abha":    "أبها",
};

interface CityStat {
  city: string;
  battery_swap: { count: number; revenue: number };
  fast_charging: { count: number; revenue: number };
  total: { count: number; revenue: number };
  percentage: number;
}

export default function StatsByCity() {
  const { t, lang } = useLang();
  const [cities, setCities] = useState<CityStat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCityStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.DASHBOARD_STATS_BY_CITY, {
        headers: authHeaders(),
      });
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const maxRevenue = Math.max(...result.data.map((c: any) => Number(c.total?.revenue || 0)), 1);
        const formatted = result.data.map((item: any) => ({
          city:          item.city || "Unknown",
          battery_swap:  { count: Number(item.battery_swap?.count || 0),  revenue: Number(item.battery_swap?.revenue || 0)  },
          fast_charging: { count: Number(item.fast_charging?.count || 0), revenue: Number(item.fast_charging?.revenue || 0) },
          total:         { count: Number(item.total?.count || 0),         revenue: Number(item.total?.revenue || 0)         },
          percentage:    (Number(item.total?.revenue || 0) / maxRevenue) * 100,
        }));
        setCities(formatted);
      }
    } catch (error) {
      console.error("Error fetching city stats:", error);
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
                <span className="text-xs font-bold text-gray-600">
                  {t("SAR", "ريال")} {city.total.revenue.toLocaleString()}
                </span>
              </div>

              {/* Progress Bar */}
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
                <span>{city.total.count.toLocaleString()} {t("transactions", "معاملة")}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}