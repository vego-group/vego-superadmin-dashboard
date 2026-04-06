"use client";

import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS, authHeaders } from "@/config/api";
import { Loader2 } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { useMemo } from "react";


// --- Types & Config ---
type TxStatus = "Settled" | "Charging" | "Adjusted+Fine" | "Refunded" | "Hold Pending" | "Pending";
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
const mapType = (type: string): TxType => {
  switch (type) {
    case "swap":
      return "Swap";
    case "topup":
      return "Charge";
    case "fastcharging":
      return "Charge";
    default:
      return "Pending";
  }
};

const mapStatus = (status: string): TxStatus => {
  switch (status) {
    case "completed":
      return "Settled";
    case "pending":
      return "Pending";
    default:
      return "Pending";
  }
};

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

const filters = ["All", "Swap", "Charge", "Refund", "Adjustment"] as const;
type FilterType = typeof filters[number];


// --- Component ---
interface TransactionLogsProps {
  fromDate?: string;
  toDate?: string;
}

export default function TransactionLogs({ fromDate, toDate }: TransactionLogsProps) {
  const { t } = useLang();

  const filterLabels = useMemo(() => ({
  All: t("All", "الكل"),
  Swap: t("Swap", "تبديل"),
  Charge: t("Charge", "شحن"),
  Refund: t("Refund", "استرجاع"),
  Adjustment: t("Adjustment", "تعديل"),
}), [t]);

const typeLabels = useMemo(() => ({
  Swap: t("Swap", "تبديل"),
  Charge: t("Charge", "شحن"),
  Adjustment: t("Adjustment", "تعديل"),
  Refund: t("Refund", "استرجاع"),
  Pending: t("Pending", "قيد الانتظار"),
}), [t]);

const statusLabels = useMemo(() => ({
  Settled: t("Settled", "مكتملة"),
  Charging: t("Charging", "قيد الشحن"),
  "Adjusted+Fine": t("Adjusted+Fine", "تعديل + غرامة"),
  Refunded: t("Refunded", "تم الاسترجاع"),
  "Hold Pending": t("Hold Pending", "حجز معلق"),
  Pending: t("Pending", "قيد الانتظار"),
}), [t]);

  const [activeTab, setActiveTab] = useState<TxType | "All">("All");
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const pageSize = 10;

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      // Constructing Query Params
      const query = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(activeTab !== "All" && { type: activeTab }),
        ...(fromDate && { start_date: fromDate }),
        ...(toDate && { end_date: toDate }),
      });

      const res = await fetch(`${API_ENDPOINTS.TRANSACTIONS_REPORT}?${query}`, {
        method: "GET",
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const result = await res.json();

      
      setTransactions(
  (result.data?.data || []).map((item: any) => ({
    id: item.transaction_ref,
    type: mapType(item.type_of_transaction),
    user: item.user_name,
    reserved: t(`${item.amount} SAR`, `${item.amount} ريال`),
    deducted: t(`${item.amount} SAR`, `${item.amount} ريال`),
    status: mapStatus(item.status),
    time: new Date(item.date_time).toLocaleString(),
  }))
);
      setTotalCount(result.data?.total || 0);
    } catch (error) {
      console.error("Transaction Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, fromDate, toDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Reset to page 1 if filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, fromDate, toDate]);

  // Pagination Logic
  const totalPages = Math.ceil(totalCount / pageSize);

  function getPages(current: number, total: number) {
    const pages: (number | string)[] = [];
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    pages.push(1);
    if (current > 3) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    if (total > 1) pages.push(total);
    return pages;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      )}

      {/* Header + Tabs */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveTab(f)}
              className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === f
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {filterLabels[f] || f}
            </button>
          ))}
        </div>
        <h2 className="text-sm sm:text-base font-semibold text-gray-900">
  {t("Transaction Logs", "سجلات المعاملات")}
</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {[t("Ref",      "المرجع"), t("Type",     "النوع")
, t("User",     "المستخدم")
, t("Reserved", "المحجوز")
, t("Deducted", "المخصوم")
, t("Status",   "الحالة")
, t("Time",     "الوقت")
].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{tx.id}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeCfg[tx.type]}`}>
                      {typeLabels[tx.type] || tx.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">{tx.user}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-gray-600">{tx.reserved}</td>
                  <td className="px-4 py-3 text-sm text-orange-600 font-semibold tabular-nums">{tx.deducted}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg[tx.status]}`}>
                      {statusLabels[tx.status] || tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{tx.time}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm italic">
                  {loading
  ? t("Fetching data...", "جاري تحميل البيانات...")
  : t("No transactions found for this period.", "لا توجد معاملات لهذه الفترة.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-100 gap-4">
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => p - 1)}
            className="text-xs font-bold text-gray-500 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
          >
            {t("PREVIOUS", "السابق")}
          </button>

          <div className="flex items-center gap-1">
            {getPages(page, totalPages).map((p, i) => (
              <button
                key={i}
                disabled={loading || p === "..."}
                onClick={() => typeof p === "number" && setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  page === p
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            disabled={page === totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
            className="text-xs font-bold text-gray-500 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
          >
            {t("NEXT", "التالي")}
          </button>
        </div>
      )}
    </div>
  );
}