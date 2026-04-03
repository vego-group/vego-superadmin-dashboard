"use client";

import { useState } from "react";
import { Settings, Battery, Zap, FileText, Save, X } from "lucide-react";

const initialData = [
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
  const [data, setData] = useState(initialData);
  const [editMode, setEditMode] = useState(false);

  const handleChange = (index: number, value: string) => {
    const updated = [...data];
    updated[index].price = value;
    setData(updated);
  };

  const handleSave = () => {
    setEditMode(false);
    console.log("Saved Data:", data);
    // هنا ممكن تبعت API
  };

  const handleCancel = () => {
    setData(initialData);
    setEditMode(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          Pricing Settings
        </h2>

        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition"
          >
            <Settings className="h-3.5 w-3.5" />
            Edit Prices
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1 text-xs text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50"
            >
              <Save className="h-3.5 w-3.5" />
              Save
            </button>

            <button
              onClick={handleCancel}
              className="flex items-center gap-1 text-xs text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="divide-y divide-gray-50">
        {data.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="px-5 py-4 flex items-center gap-4">
              <div className={`p-2 rounded-lg shrink-0 ${item.iconBg}`}>
                <Icon className={`h-4 w-4 ${item.iconColor}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">
                  {item.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {item.sub}
                </p>
              </div>

              <div className="shrink-0 text-right">
                {editMode ? (
                  <input
                    type="text"
                    value={item.price}
                    onChange={(e) => handleChange(index, e.target.value)}
                    className="w-28 text-sm font-bold text-indigo-600 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                ) : item.badge ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                    {item.price}
                  </span>
                ) : (
                  <p className="text-sm font-bold text-indigo-600">
                    {item.price}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}