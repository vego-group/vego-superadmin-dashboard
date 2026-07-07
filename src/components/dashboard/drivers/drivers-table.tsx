"use client";

import { Eye } from "lucide-react";
import { Driver, DriversPagination, DocumentStatus } from "@/types/dashboard/driver";
import { useLang } from "@/lib/language-context";
import Pagination from "@/components/shared/pagination";

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const formatDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

interface Props {
  drivers: Driver[];
  pagination: DriversPagination;
  onView: (driver: Driver) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export default function DriversTable({ drivers, pagination, onView, onPageChange, onPerPageChange }: Props) {
  const { t, lang } = useLang();
  const isRtl = lang === "ar";
  const thCls = `px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide ${
    isRtl ? "text-right" : "text-left"
  }`;

  const statusCfg: Record<string, { label: string; cls: string }> = {
    active:   { label: t("Active", "نشط"),       cls: "bg-green-100 text-green-700" },
    inactive: { label: t("Inactive", "غير نشط"),  cls: "bg-yellow-100 text-yellow-700" },
    blocked:  { label: t("Blocked", "محظور"),     cls: "bg-red-100 text-red-600" },
    pending:  { label: t("Pending", "قيد المراجعة"), cls: "bg-blue-100 text-blue-700" },
  };

  const docCfg: Record<DocumentStatus, { label: string; cls: string }> = {
    verified:     { label: t("Verified", "موثّقة"),      cls: "bg-green-50 text-green-600" },
    pending:      { label: t("Pending", "قيد المراجعة"),  cls: "bg-yellow-50 text-yellow-600" },
    rejected:     { label: t("Rejected", "مرفوضة"),      cls: "bg-red-50 text-red-600" },
    not_uploaded: { label: t("Missing", "غير مرفوعة"),   cls: "bg-gray-100 text-gray-500" },
  };

  const DocBadge = ({ label, status }: { label: string; status: DocumentStatus | null }) => {
    const cfg = status ? docCfg[status] : null;
    return (
      <span className={`px-2 py-0.5 rounded-lg text-[11px] font-medium ${cfg?.cls ?? "bg-gray-100 text-gray-400"}`}>
        {label}: {cfg?.label ?? "—"}
      </span>
    );
  };

  const { currentPage, lastPage, total, perPage } = pagination;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">{t("All Drivers", "جميع السائقين")}</h2>
        <span className="text-sm text-gray-400">
          {total.toLocaleString()} {t("total", "إجمالي")}
        </span>
      </div>

      {drivers.length === 0 ? (
        <div className="py-20 text-center text-gray-400 text-sm">
          {t("No drivers found", "لا يوجد سائقون")}
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full" dir={isRtl ? "rtl" : "ltr"}>
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className={thCls}>{t("Driver", "السائق")}</th>
                  <th className={thCls}>{t("Fleet", "الشركة")}</th>
                  <th className={thCls}>{t("Documents", "المستندات")}</th>
                  <th className={thCls}>{t("Wallet", "المحفظة")}</th>
                  <th className={thCls}>{t("Status", "الحالة")}</th>
                  <th className={thCls}>{t("Joined", "تاريخ الانضمام")}</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {drivers.map((d) => {
                  const sCfg = statusCfg[d.status] ?? statusCfg.active;
                  return (
                    <tr
                      key={d.id}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => onView(d)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(d.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{d.name}</p>
                            <p className="text-xs text-gray-400">{d.phone ?? d.email ?? `#${d.id}`}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{d.fleet_name ?? "—"}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          <DocBadge label={t("License", "الرخصة")} status={d.license_status} />
                          <DocBadge label={t("Plate", "اللوحة")} status={d.plate_status} />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {d.wallet_balance != null ? `SAR ${d.wallet_balance.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sCfg.cls}`}>
                          {sCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(d.created_at)}
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onView(d)}
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

          {/* Mobile */}
          <div className="md:hidden divide-y divide-gray-50">
            {drivers.map((d) => {
              const sCfg = statusCfg[d.status] ?? statusCfg.active;
              return (
                <button
                  key={d.id}
                  onClick={() => onView(d)}
                  className="w-full text-start px-4 py-4 hover:bg-gray-50/50 transition"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-gray-900">{d.name}</p>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sCfg.cls}`}>
                      {sCfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1.5">
                    {[d.fleet_name, d.phone].filter(Boolean).join(" · ") || "—"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <DocBadge label={t("License", "الرخصة")} status={d.license_status} />
                    <DocBadge label={t("Plate", "اللوحة")} status={d.plate_status} />
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
