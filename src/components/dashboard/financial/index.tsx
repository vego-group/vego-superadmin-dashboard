"use client";

import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import FinancialStats from "./financial-stats";
import PricingSettings from "./pricing-settings";
import SettlementPolicies from "./settlement-policies";
import TransactionLogs from "./transaction-logs";

export default function FinancialIndex() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Financial Management</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Payment gateway, pricing and financial settlements</p>
      </div>

      {/* Date Filter */}
      {/* ─── Modern Date Filter Section ─── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-end gap-4 transition-all hover:shadow-md">
        
        {/* From Date Input Group */}
        <div className="flex-1 w-full group">
          <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-indigo-600 transition-colors">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            From Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* To Date Input Group */}
        <div className="flex-1 w-full group">
          <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-indigo-600 transition-colors">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            To Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={toDate}
              min={fromDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetFilters}
          className="h-[42px] px-5 flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95 whitespace-nowrap"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      {/* Stats Section - ستتحدث تلقائياً عند تغيير التواريخ */}
      <FinancialStats fromDate={fromDate} toDate={toDate} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SettlementPolicies />
        <PricingSettings />
      </div>

      <TransactionLogs fromDate={fromDate} toDate={toDate} />

    </div>
  );
}