"use client";

import { logger } from '@/lib/logger';
import { useState, useEffect, useCallback, useMemo } from "react";
import { API_ENDPOINTS, authHeaders } from "@/config/api";
import { formatMoney, parseMoney } from "@/lib/money";
import { Loader2 } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { appendDateRangeParams, formatDateTime } from "@/lib/format-date";
import { apiErrorMessage } from "@/lib/api-error";
import Pagination from "@/components/shared/pagination";


// --- Types & Config ---
// Tabs map 1:1 onto the backend `type_of_transaction` values so filtering can
// happen SERVER-side. (The old UI merged topup+fastcharging into one "Charge"
// tab, which forced a limit=1000 fetch plus client-side filtering — rows past
// 1000 were silently dropped. Real pagination replaced that; CR-1 defect fix.)
type TxTypeFilter = "all" | "swap" | "topup" | "fastcharging" | "refund" | "adjustment";
type TxStatus = "Settled" | "Pending";

interface Transaction {
  id: string;
  type: string;
  user: string;
  reserved: string;
  deducted: string;
  /**
   * §8: a debit arrives as a POSITIVE amount with type "debit" — never
   * negative. Credit/debit colouring and any ledger maths must switch on the
   * row's `direction` ("in" | "out"), never on the sign of `amount`.
   */
  direction: "in" | "out" | null;
  status: TxStatus;
  time: string;
}

const mapStatus = (status: string): TxStatus => {
  switch (status) {
    case "completed":
      return "Settled";
    default:
      return "Pending";
  }
};

const statusCfg: Record<TxStatus, string> = {
  Settled: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

const typeCfg: Record<string, string> = {
  swap: "bg-indigo-100 text-indigo-700",
  topup: "bg-blue-100 text-blue-700",
  fastcharging: "bg-cyan-100 text-cyan-700",
  adjustment: "bg-orange-100 text-orange-700",
  refund: "bg-red-100 text-red-600",
};

const filters: TxTypeFilter[] = ["all", "swap", "topup", "fastcharging", "refund", "adjustment"];

const DEFAULT_PER_PAGE = 10;


// --- Component ---
interface TransactionLogsProps {
  fromDate?: string;
  toDate?: string;
}

export default function TransactionLogs({ fromDate, toDate }: TransactionLogsProps) {
  const { t, lang } = useLang();

  const filterLabels: Record<TxTypeFilter, string> = useMemo(() => ({
    all: t("All", "الكل"),
    swap: t("Swap", "تبديل"),
    topup: t("Top-up", "شحن رصيد"),
    fastcharging: t("Fast Charging", "شحن سريع"),
    refund: t("Refund", "استرجاع"),
    adjustment: t("Adjustment", "تعديل"),
  }), [t]);

  const typeLabels: Record<string, string> = useMemo(() => ({
    swap: t("Swap", "تبديل"),
    topup: t("Top-up", "شحن رصيد"),
    fastcharging: t("Fast Charging", "شحن سريع"),
    adjustment: t("Adjustment", "تعديل"),
    refund: t("Refund", "استرجاع"),
  }), [t]);

  const statusLabels: Record<TxStatus, string> = useMemo(() => ({
    Settled: t("Settled", "مكتملة"),
    Pending: t("Pending", "قيد الانتظار"),
  }), [t]);

  const [activeTab, setActiveTab] = useState<TxTypeFilter>("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real server-side pagination — every page is fetched on demand; nothing is
  // silently dropped past an arbitrary limit.
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(perPage),
        per_page: String(perPage),
      });
      if (activeTab !== "all") query.set("type", activeTab);
      appendDateRangeParams(query, fromDate, toDate);

      const res = await fetch(`${API_ENDPOINTS.TRANSACTIONS_REPORT}?${query}`, {
        method: "GET",
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error(await apiErrorMessage(res, "Failed to fetch transactions"));

      const result = await res.json();
      const paged = result.data ?? {};
      const rows: Array<Record<string, unknown>> = Array.isArray(paged) ? paged : paged.data ?? [];

      setTransactions(
        rows.map((item) => {
          // Per-record currency (§0.1) — amount arrives as a money object or a
          // fixed-precision string with a sibling `currency` field. Without
          // either it renders unit-less, never assumed SAR.
          const money = parseMoney(item.amount, {
            currency: typeof item.currency === "string" ? item.currency : undefined,
            source: "GET /wallet/transactions/report amount",
          });
          const display = money ? formatMoney(money) : "—";
          return {
            id: String(item.transaction_ref ?? ""),
            type: String(item.type_of_transaction ?? ""),
            user: String(item.user_name ?? ""),
            reserved: display,
            deducted: display,
            direction:
              item.direction === "in" || item.direction === "out" ? item.direction : null,
            status: mapStatus(String(item.status ?? "")),
            time: formatDateTime(item.date_time == null ? null : String(item.date_time), lang),
          };
        })
      );
      setTotal(Number(paged.total ?? rows.length));
      setLastPage(Number(paged.last_page ?? 1));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch transactions";
      setError(msg);
      logger.error("Transaction Fetch Error:", msg);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, page, perPage, activeTab, lang]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Reset to page 1 when the active tab or date range changes.
  useEffect(() => {
    setPage(1);
  }, [activeTab, fromDate, toDate, perPage]);

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
              {filterLabels[f]}
            </button>
          ))}
        </div>
        <h2 className="text-sm sm:text-base font-semibold text-gray-900">
          {t("Transaction Logs", "سجلات المعاملات")}
        </h2>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 px-5 py-2">{error}</p>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {[
                t("Ref", "المرجع"),
                t("Type", "النوع"),
                t("User", "المستخدم"),
                t("Reserved", "المحجوز"),
                t("Deducted", "المخصوم"),
                t("Status", "الحالة"),
                t("Time", "الوقت")
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
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeCfg[tx.type] ?? "bg-gray-100 text-gray-600"}`}>
                      {typeLabels[tx.type] ?? tx.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">{tx.user}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-gray-600" dir="ltr">{tx.reserved}</td>
                  {/* Colour switches on `direction` — never the sign of amount (§8). */}
                  <td
                    className={`px-4 py-3 text-sm font-semibold tabular-nums ${
                      tx.direction === "in"
                        ? "text-green-600"
                        : tx.direction === "out"
                          ? "text-orange-600"
                          : "text-gray-600"
                    }`}
                    dir="ltr"
                  >
                    {tx.deducted}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg[tx.status]}`}>
                      {statusLabels[tx.status]}
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

      {/* Server-side pagination */}
      {total > perPage && (
        <Pagination
          currentPage={page}
          totalPages={lastPage}
          totalItems={total}
          itemsPerPage={perPage}
          onPageChange={setPage}
          onItemsPerPageChange={setPerPage}
          showItemsPerPageSelector
          itemsPerPageOptions={[10, 25, 50, 100]}
        />
      )}
    </div>
  );
}
