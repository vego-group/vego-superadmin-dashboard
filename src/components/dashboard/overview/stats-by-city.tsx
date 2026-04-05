"use client";

import { Loader2, Globe } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL, authHeaders } from "@/config/api";

interface CityStat {
  city: string;
  total_cabinets: number;
  total_stations: number;
  total_transactions: number;
  total_revenue: number;
  percentage: number;
}

export default function StatsByCity() {
  const [cities, setCities] = useState<CityStat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCityStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/dashboard/stats-by-city`, {
        method: "GET",
        headers: authHeaders(),
      });
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        // Find max revenue to calculate progress bar width
        const maxRevenue = Math.max(...result.data.map((c: any) => Number(c.total_revenue || 0)), 1);
        
        const formatted = result.data.map((item: any) => ({
          city: item.city || "Unknown City",
          total_cabinets: Number(item.total_cabinets || 0),
          total_stations: Number(item.total_stations || 0),
          total_transactions: Number(item.total_transactions || 0),
          total_revenue: Number(item.total_revenue || 0),
          percentage: (Number(item.total_revenue || 0) / maxRevenue) * 100,
        }));
        setCities(formatted);
      }
    } catch (error) {
      console.error("Error fetching city stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCityStats();
  }, [fetchCityStats]);

  // Distinct colors for the bars as per the UI design
  const barColors = ["bg-indigo-600", "bg-blue-600", "bg-emerald-500", "bg-amber-500"];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 h-fit min-h-[300px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 uppercase tracking-tight">
          Geographic Distribution <Globe className="h-4 w-4 text-indigo-500" />
        </h3>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
      </div>

      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between h-4 w-full bg-gray-50 animate-pulse rounded" />
              <div className="h-2 w-full bg-gray-50 animate-pulse rounded-full" />
            </div>
          ))
        ) : cities.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-50 rounded-xl">
            No geographic data available
          </div>
        ) : (
          cities.map((city, index) => (
            <div key={city.city + index} className="relative group">
              {/* City Name & Assets Info */}
              <div className="flex justify-between items-end mb-2">
                <div className="text-left">
                  <span className="text-sm font-bold text-gray-800">{city.city}</span>
                </div>
                <div className="text-right">
                   <span className="text-[11px] text-gray-400 font-medium">
                     {city.total_cabinets} Cabinets • {city.total_stations} Stations
                   </span>
                </div>
              </div>

              {/* Progress Bar Container (LTR) */}
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${barColors[index % barColors.length]}`}
                  style={{ width: `${city.percentage}%` }}
                />
              </div>

              {/* Financial Stats Footer */}
              <div className="flex justify-between mt-1 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                 <span>
                    {(city.total_transactions || 0).toLocaleString()} Transactions
                 </span>
                 <span className="font-bold text-gray-500">
                    SAR {(city.total_revenue || 0).toLocaleString()}
                 </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}