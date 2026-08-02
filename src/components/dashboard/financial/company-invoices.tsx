"use client";

import { Building2 } from "lucide-react";
import { formatMoney } from "@/lib/money";

// Demo data (no invoices endpoint yet) — amounts as fixed-precision strings
// per the money contract, formatted with formatMoney at render.
const CURRENCY = "SAR";
const invoices = [
  {
    name: "Riyadh Delivery Co.",
    date: "2024-02-10",
    vehicles: "12 Vehicles · 12 Drivers",
    total: "18450.00",
    discount: "1845.00",
    net: "16605.00",
  },
  {
    name: "Fast Transport Est.",
    date: "2024-02-18",
    vehicles: "28 Vehicles · 8 Drivers",
    total: "12300.00",
    discount: "1230.00",
    net: "11070.00",
  },
  {
    name: "Jeddah Logistics Services",
    date: "2024-02-25",
    vehicles: "6 Vehicles · 5 Drivers",
    total: "8750.00",
    discount: "875.00",
    net: "7875.00",
  },
];

export default function CompanyInvoices({ fromDate, toDate }: any) {

  // 🔥 Filter logic
  const filteredInvoices = invoices.filter((inv) => {
    if (!fromDate || !toDate) return true;
    return inv.date >= fromDate && inv.date <= toDate;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      
      {/* Top gradient */}
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">
          Company Invoices
        </h2>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4">
        {filteredInvoices.length === 0 ? (
          <p className="text-sm text-gray-400">No invoices in selected range</p>
        ) : (
          filteredInvoices.map((inv) => (
            <div
              key={inv.name}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4 space-y-3">
                
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {inv.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5" dir="ltr">
                      {inv.vehicles}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {inv.date}
                    </p>
                  </div>

                  <div className="p-2 rounded-lg bg-indigo-100">
                    <Building2 className="h-4 w-4 text-indigo-600" />
                  </div>
                </div>

                {/* Values */}
                <div className="space-y-1.5">

                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Total Invoice</span>
                    <span className="font-semibold text-gray-900 tabular-nums" dir="ltr">
                      {formatMoney(inv.total, CURRENCY)}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Discount (10%)</span>
                    <span className="text-green-600 tabular-nums" dir="ltr">
                      -{formatMoney(inv.discount, CURRENCY)}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Net Amount</span>
                    <span className="font-bold text-purple-600 tabular-nums" dir="ltr">
                      {formatMoney(inv.net, CURRENCY)}
                    </span>
                  </div>

                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}