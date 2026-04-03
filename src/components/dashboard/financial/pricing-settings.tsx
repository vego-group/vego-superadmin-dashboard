"use client";

import { Settings, Battery, Zap, FileText } from "lucide-react";

const pricingData = [
  {
    label: "Battery Swap",
    icon: Battery,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
    price: "5.00 SAR",
    sub: "per session (Hold: 6.00 SAR · Penalty: 2.50+)",
  },
  {
    label: "Fast Charging – per KWh",
    icon: Zap,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    price: "0.75 SAR/KWh",
    sub: "Hold: 10.00 SAR",
  },
  {
    label: "Fast Charging – per Minute",
    icon: Zap,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-100",
    price: "0.25 SAR/min",
    sub: "Max: 15.00 SAR",
  },
  {
    label: "Fleet Invoice",
    icon: FileText,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
    price: "Monthly Deferred",
    sub: "Due on day 30 · 10% discount · Comprehensive invoice",
    badge: true,
  },
];

export default function PricingSettings() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Pricing Settings</h2>
        <button className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition">
          <Settings className="h-3.5 w-3.5" />
          Edit Prices
        </button>
      </div>
      <div className="divide-y divide-gray-50">
        {pricingData.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="px-5 py-4 flex items-center gap-4">
              <div className={`p-2 rounded-lg shrink-0 ${item.iconBg}`}>
                <Icon className={`h-4 w-4 ${item.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{item.sub}</p>
              </div>
              <div className="shrink-0 text-right">
                {item.badge ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                    {item.price}
                  </span>
                ) : (
                  <p className="text-sm font-bold text-indigo-600">{item.price}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}