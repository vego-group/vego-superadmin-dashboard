"use client";

import { Eye, Bike } from "lucide-react";
import { MaintenanceTicket, TicketsPagination } from "@/types/dashboard/maintenance";
import { useLang } from "@/lib/language-context";
import Pagination from "@/components/shared/pagination";

const formatDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

interface Props {
  tickets: MaintenanceTicket[];
  pagination: TicketsPagination;
  onView: (ticket: MaintenanceTicket) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export default function TicketsTable({
  tickets,
  pagination,
  onView,
  onPageChange,
  onPerPageChange,
}: Props) {
  const { t, lang } = useLang();
  const isRtl = lang === "ar";
  const thCls = `px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide ${
    isRtl ? "text-right" : "text-left"
  }`;

  const statusConfig = {
    open: { label: t("Open", "مفتوحة"), cls: "bg-blue-100 text-blue-700" },
    in_progress: { label: t("In Progress", "قيد التنفيذ"), cls: "bg-yellow-100 text-yellow-700" },
    resolved: { label: t("Resolved", "تم الحل"), cls: "bg-green-100 text-green-700" },
  };

  const priorityConfig = {
    low: { label: t("Low", "منخفضة"), cls: "bg-gray-100 text-gray-600" },
    medium: { label: t("Medium", "متوسطة"), cls: "bg-blue-50 text-blue-600" },
    high: { label: t("High", "عالية"), cls: "bg-orange-100 text-orange-700" },
    urgent: { label: t("Urgent", "عاجلة"), cls: "bg-red-100 text-red-700" },
  };

  const { currentPage, lastPage, total, perPage } = pagination;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">
          {t("Maintenance Tickets", "تذاكر الصيانة")}
        </h2>
        <span className="text-sm text-gray-400">
          {total.toLocaleString()} {t("total", "إجمالي")}
        </span>
      </div>

      {tickets.length === 0 ? (
        <div className="py-20 text-center text-gray-400 text-sm">
          {t("No maintenance tickets found", "لا توجد تذاكر صيانة")}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full" dir={isRtl ? "rtl" : "ltr"}>
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className={thCls}>{t("Ticket", "التذكرة")}</th>
                  <th className={thCls}>{t("Motorcycle", "الدراجة")}</th>
                  <th className={thCls}>{t("Issue", "العطل")}</th>
                  <th className={thCls}>{t("Priority", "الأولوية")}</th>
                  <th className={thCls}>{t("Status", "الحالة")}</th>
                  <th className={thCls}>{t("Date", "التاريخ")}</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tickets.map((tk) => {
                  const sCfg = statusConfig[tk.status] ?? statusConfig.open;
                  const pCfg = priorityConfig[tk.priority] ?? priorityConfig.medium;
                  return (
                    <tr
                      key={tk.id}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => onView(tk)}
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900">{tk.ticket_number}</p>
                        {tk.fleet_name && (
                          <p className="text-xs text-gray-400">{tk.fleet_name}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white flex-shrink-0">
                            <Bike className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {tk.motorcycle?.plate_number ?? tk.motorcycle?.device_id ?? `#${tk.motorcycle_id}`}
                            </p>
                            <p className="text-xs text-gray-400">
                              {[tk.motorcycle?.brand, tk.motorcycle?.model].filter(Boolean).join(" ") || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-800 font-medium capitalize">{tk.issue_type}</p>
                        <p className="text-xs text-gray-400 line-clamp-1 max-w-[220px]">{tk.description}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${pCfg.cls}`}>
                          {pCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sCfg.cls}`}>
                          {sCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(tk.created_at)}
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onView(tk)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                          title={t("View", "عرض")}
                        >
                          <Eye className="h-4 w-4 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-50">
            {tickets.map((tk) => {
              const sCfg = statusConfig[tk.status] ?? statusConfig.open;
              const pCfg = priorityConfig[tk.priority] ?? priorityConfig.medium;
              return (
                <button
                  key={tk.id}
                  onClick={() => onView(tk)}
                  className="w-full text-start px-4 py-4 hover:bg-gray-50/50 transition"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-gray-900">{tk.ticket_number}</p>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sCfg.cls}`}>
                      {sCfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1.5">
                    {tk.motorcycle?.plate_number ?? tk.motorcycle?.device_id ?? `#${tk.motorcycle_id}`}
                    {" · "}
                    <span className="capitalize">{tk.issue_type}</span>
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${pCfg.cls}`}>
                      {pCfg.label}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(tk.created_at)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={lastPage}
            totalItems={total}
            itemsPerPage={perPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onPerPageChange}
            showItemsPerPageSelector
          />
        </>
      )}
    </div>
  );
}
