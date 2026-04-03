"use client";

import { useState } from "react";

type TxStatus =
  | "Settled"
  | "Charging"
  | "Adjusted+Fine"
  | "Refunded"
  | "Hold Pending"
  | "Pending";

type TxType = "Swap" | "Charge" | "Adjustment" | "Refund" | "Pending";

interface Transaction {
  id: string;
  type: TxType;
  user: string;
  reserved: string;
  deducted: string;
  status: TxStatus;
  time: string;
}

const statusCfg: Record<TxStatus, string> = {
  Settled: "bg-green-100 text-green-700",
  Charging: "bg-blue-100 text-blue-700",
  "Adjusted+Fine": "bg-orange-100 text-orange-700",
  Refunded: "bg-red-100 text-red-600",
  "Hold Pending": "bg-yellow-100 text-yellow-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

const typeCfg: Record<TxType, string> = {
  Swap: "bg-indigo-100 text-indigo-700",
  Charge: "bg-blue-100 text-blue-700",
  Adjustment: "bg-orange-100 text-orange-700",
  Refund: "bg-red-100 text-red-600",
  Pending: "bg-gray-100 text-gray-600",
};

const transactions: Transaction[] = [
  { id: "TXN-042", type: "Swap", user: "Salmoud Al-Harbi", reserved: "6.00", deducted: "1.00", status: "Settled", time: "11:30 AM" },
  { id: "TXN-041", type: "Charge", user: "Majed Al-Hamdi", reserved: "10.00", deducted: "2.80", status: "Charging", time: "11:15 AM" },
  { id: "TXN-040", type: "Adjustment", user: "Khaled Al-Mutairi", reserved: "6.00", deducted: "0.00", status: "Adjusted+Fine", time: "10:20 AM" },
  { id: "RF-1023", type: "Refund", user: "Ahmed Al-Khalidi", reserved: "6.00", deducted: "15.00", status: "Refunded", time: "9:45 AM" },
  { id: "TXN-039", type: "Swap", user: "Fahad Al-Salmi", reserved: "6.00", deducted: "1.00", status: "Settled", time: "9:20 AM" },
  { id: "TXN-038", type: "Pending", user: "Abdulrahman Al-Najjar", reserved: "—", deducted: "—", status: "Hold Pending", time: "9:10 AM" },
];

const filters: (TxType | "All")[] = ["All", "Swap", "Charge", "Refund", "Adjustment"];

export default function TransactionLogs() {
  const [active, setActive] = useState<TxType | "All">("All");
  const [page, setPage] = useState(1);

  const pageSize = 4;

  // Filter
  const filtered = active === "All" ? transactions : transactions.filter((t) => t.type === active);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function getPages(current: number, total: number) {
    const pages: (number | string)[] = [];
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    pages.push(1);
    if (current > 3) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
    return pages;
  }

  const pages = getPages(page, totalPages);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

      {/* Header + Tabs */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => {
                setActive(f);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition ${
                active === f
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <h2 className="text-sm sm:text-base font-semibold text-gray-900 mt-2 sm:mt-0">Recent Transaction Logs</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {["Ref", "Type", "User", "Reserved", "Deducted", "Status", "Time"].map((h) => (
                <th
                  key={h}
                  className="text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-500 uppercase whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {paginated.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50/50">
                <td className="px-3 sm:px-4 py-2 sm:py-3 font-mono text-sm text-gray-500 whitespace-nowrap">{tx.id}</td>

                <td className="px-3 sm:px-4 py-2 sm:py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs sm:text-sm ${typeCfg[tx.type]}`}>
                    {tx.type}
                  </span>
                </td>

                <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm text-gray-700">{tx.user}</td>

                <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm tabular-nums" dir="ltr">
                  {tx.reserved}
                </td>

                <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm text-orange-500 tabular-nums" dir="ltr">
                  {tx.deducted}
                </td>

                <td className="px-3 sm:px-4 py-2 sm:py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs sm:text-sm ${statusCfg[tx.status]}`}>
                    {tx.status}
                  </span>
                </td>

                <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-400 whitespace-nowrap">{tx.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-4 py-3 border-t border-gray-100 gap-2 sm:gap-0">
        {/* Prev */}
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className={`text-xs sm:text-sm px-3 py-1 rounded ${
            page === 1
              ? "bg-gray-50 text-gray-300 cursor-not-allowed"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Prev
        </button>

        {/* Numbers */}
        <div className="flex flex-wrap items-center gap-1 justify-center">
          {pages.map((p, i) =>
            p === "..." ? (
              <span key={i} className="px-2 text-xs sm:text-sm text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={i}
                onClick={() => setPage(p as number)}
                className={`text-xs sm:text-sm px-3 py-1 rounded ${
                  page === p
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          className={`text-xs sm:text-sm px-3 py-1 rounded ${
            page === totalPages
              ? "bg-gray-50 text-gray-300 cursor-not-allowed"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}