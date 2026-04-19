"use client";

import { useEffect, useState } from "react";
import { Users, Building2, Bike, Battery, TrendingUp, RefreshCw } from "lucide-react";

export default function SalesDashboardIndex() {
  const [counts,    setCounts]    = useState<any>(null);
  const [financial, setFinancial] = useState<any>(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [c, f] = await Promise.all([
          fetch("/api/proxy/dashboard/counts",   { headers: { Accept: "application/json" } }).then(r => r.json()),
          fetch("/api/proxy/dashboard/financial", { headers: { Accept: "application/json" } }).then(r => r.json()),
        ]);
        setCounts(c.data);
        setFinancial(f.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const stats = counts ? [
    { label: "Total Users",      value: counts.total_users,                                        icon: Users,     color: "text-blue-600",   bg: "bg-blue-100"   },
    { label: "Total Fleets",     value: counts.fleets?.total ?? 0,                                 icon: Building2, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Motorcycles",      value: counts.infrastructure?.motorcycles?.total ?? 0,            icon: Bike,      color: "text-green-600",  bg: "bg-green-100"  },
    { label: "Batteries",        value: counts.infrastructure?.batteries?.total ?? 0,              icon: Battery,   color: "text-orange-500", bg: "bg-orange-100" },
    { label: "Total Revenue",    value: `${parseFloat(financial?.total_revenue ?? 0).toLocaleString()} SAR`, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-100" },
  ] : [];

  if (loading) return (
    <div className="flex items-center justify-center gap-2 text-gray-400 text-sm py-20">
      <RefreshCw className="h-4 w-4 animate-spin" /> Loading…
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Sales Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of platform performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
              <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
              <div className="p-4 flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
                  <p className={`text-xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${s.bg}`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Infrastructure + Financial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {counts && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
            <div className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Infrastructure</h3>
              <div className="space-y-3">
                {[
                  { label: "Battery Swap Cabinets",  active: counts.infrastructure?.battery_swap_cabinets?.active,  total: counts.infrastructure?.battery_swap_cabinets?.total  },
                  { label: "Fast Charging Stations", active: counts.infrastructure?.fast_charging_cabinets?.active, total: counts.infrastructure?.fast_charging_cabinets?.total },
                  { label: "Active Motorcycles",     active: counts.infrastructure?.motorcycles?.active,            total: counts.infrastructure?.motorcycles?.total            },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{item.label}</span>
                      <span>{item.active}/{item.total}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${item.total ? (item.active! / item.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {financial && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
            <div className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Financial Summary</h3>
              <div className="space-y-3">
                {[
                  { label: "Total Revenue",      value: `${financial.total_revenue?.toLocaleString()} SAR` },
                  { label: "Total Transactions", value: financial.total_transactions                        },
                  { label: "Avg. Transaction",   value: `${parseFloat(financial.avg_transaction ?? 0).toFixed(2)} SAR` },
                  { label: "Pending Holds",      value: `${financial.pending_holds} SAR`                   },
                  { label: "Refunds",            value: `${financial.refunds} SAR`                         },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-semibold text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}