"use client";

import { useState } from "react";
import FinancialStats from "./financial-stats";
import PricingSettings from "./pricing-settings";
import SettlementPolicies from "./settlement-policies";
import TransactionLogs from "./transaction-logs";
import CompanyInvoices from "./company-invoices";

export default function FinancialIndex() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Financial Management
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Payment gateway, pricing and financial settlements
        </p>
      </div>

      {/* 🔥 Date Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div>
            <label className="text-xs text-gray-500">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="block border rounded-lg px-3 py-1.5 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="block border rounded-lg px-3 py-1.5 text-sm"
            />
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            setFromDate("");
            setToDate("");
          }}
          className="text-xs text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50"
        >
          Reset Filter
        </button>
      </div>

      {/* Sections */}
      <FinancialStats fromDate={fromDate} toDate={toDate} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SettlementPolicies />
        <PricingSettings />
      </div>

      <TransactionLogs />

      <CompanyInvoices fromDate={fromDate} toDate={toDate} />

    </div>
  );
}