// src/components/dashboard/settings/pricing/pricing-form.tsx
"use client";

import { useState } from "react";

interface PricingFormData {
  pricePerHour: string;
  dailyPackagePrice: string;
  weeklyPackagePrice: string;
  commissionRate: string;
}

const INITIAL: PricingFormData = {
  pricePerHour: "",
  dailyPackagePrice: "",
  weeklyPackagePrice: "",
  commissionRate: "",
};

export default function PricingForm() {
  const [form, setForm] = useState<PricingFormData>(INITIAL);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // TODO: PATCH /api/settings/pricing
    console.log("[Pricing] Save:", form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">

      {/* Section Title */}
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-6">
        Base Pricing
      </h2>

      {/* Row 1 — 3 price fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        {/* Price per Hour */}
        <div>
          <label className="block text-sm text-gray-700 mb-1.5">
            Price per Hour ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.pricePerHour}
            onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
            placeholder="25.00"
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-colors"
          />
        </div>

        {/* Daily Package Price */}
        <div>
          <label className="block text-sm text-gray-700 mb-1.5">
            Daily Package Price ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.dailyPackagePrice}
            onChange={(e) => setForm({ ...form, dailyPackagePrice: e.target.value })}
            placeholder="180.00"
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-colors"
          />
        </div>

        {/* Weekly Package Price */}
        <div>
          <label className="block text-sm text-gray-700 mb-1.5">
            Weekly Package Price ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.weeklyPackagePrice}
            onChange={(e) => setForm({ ...form, weeklyPackagePrice: e.target.value })}
            placeholder="1200.00"
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-colors"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mb-6" />

      {/* Row 2 — Commission Rate (half width) */}
      <div className="mb-8">
        <label className="block text-sm text-gray-700 mb-1.5">
          Commission Rate (%)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={form.commissionRate}
          onChange={(e) => setForm({ ...form, commissionRate: e.target.value })}
          placeholder="15"
          className="w-full sm:w-1/2 border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-colors"
        />
        <p className="text-xs text-gray-400 mt-1.5">
          Super Admin commission from each Sub-Admin
        </p>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90 active:scale-[0.98]"
        style={{ backgroundColor: saved ? "#10b981" : "#1C1FC1" }}
      >
        {saved ? "Saved ✓" : "Save Changes"}
      </button>
    </div>
  );
}