"use client";

import { Building2 } from "lucide-react";

const invoices = [
  {
    name: "Riyadh Delivery Co.",
    date: "2024-02-10",
    vehicles: "12 Vehicles · 12 Drivers",
    total: "18,450",
    discount: "1,845",
    net: "16,605",
  },
  {
    name: "Fast Transport Est.",
    date: "2024-02-18",
    vehicles: "28 Vehicles · 8 Drivers",
    total: "12,300",
    discount: "1,230",
    net: "11,070",
  },
  {
    name: "Jeddah Logistics Services",
    date: "2024-02-25",
    vehicles: "6 Vehicles · 5 Drivers",
    total: "8,750",
    discount: "875",
    net: "7,875",
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
                      SAR {inv.total}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Discount (10%)</span>
                    <span className="text-green-600 tabular-nums" dir="ltr">
                      -SAR {inv.discount}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Net Amount</span>
                    <span className="font-bold text-purple-600 tabular-nums" dir="ltr">
                      SAR {inv.net}
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