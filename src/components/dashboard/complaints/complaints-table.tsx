"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Complaint, ComplaintsPagination } from "@/types/dashboard/complaint";
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

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

interface Props {
  complaints: Complaint[];
  pagination: ComplaintsPagination;
  onView: (complaint: Complaint) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export default function ComplaintsTable({
  complaints,
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
    new: { label: t("New", "جديدة"), cls: "bg-blue-100 text-blue-700" },
    in_review: {
      label: t("In Review", "قيد المراجعة"),
      cls: "bg-yellow-100 text-yellow-700",
    },
    replied: { label: t("Replied", "تم الرد"), cls: "bg-green-100 text-green-700" },
  };

  const categoryConfig = {
    charging: { label: t("Charging", "الشحن"), cls: "bg-blue-50 text-blue-600" },
    swap: {
      label: t("Battery Swap", "تبديل البطارية"),
      cls: "bg-green-50 text-green-600",
    },
    payment: { label: t("Financial", "مالية"), cls: "bg-orange-50 text-orange-600" },
    platform: { label: t("Platform", "المنصة"), cls: "bg-purple-50 text-purple-600" },
  };

  const { currentPage, lastPage, total, perPage } = pagination;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">
          {t("All Complaints", "جميع الشكاوى")}
        </h2>
        <span className="text-sm text-gray-400">
          {total.toLocaleString()} {t("total", "إجمالي")}
        </span>
      </div>

      {complaints.length === 0 ? (
        <div className="py-20 text-center text-gray-400 text-sm">
          {t("No complaints found", "لا توجد شكاوى")}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full" dir={isRtl ? "rtl" : "ltr"}>
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className={thCls}>#</th>
                  <th className={thCls}>{t("User", "المستخدم")}</th>
                  <th className={thCls}>{t("Subject", "الموضوع")}</th>
                  <th className={thCls}>{t("Category", "الفئة")}</th>
                  <th className={thCls}>{t("Status", "الحالة")}</th>
                  <th className={thCls}>{t("Date", "التاريخ")}</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {complaints.map((c) => {
                  const sCfg = statusConfig[c.status] ?? statusConfig.new;
                  const catCfg =
                    categoryConfig[c.category] ?? categoryConfig.platform;
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => onView(c)}
                    >
                      <td className="px-5 py-4 text-xs text-gray-400">#{c.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(c.user.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {c.user.name}
                            </p>
                            <p className="text-xs text-gray-400">{c.user.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-800 font-medium line-clamp-1 max-w-[200px]">
                          {c.title}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium ${catCfg.cls}`}
                        >
                          {catCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${sCfg.cls}`}
                        >
                          {sCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(c.created_at)}
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onView(c)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                          title={t("View", "عرض")}
                        >
                          <Eye className="h-4 w-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {complaints.map((c) => {
              const sCfg = statusConfig[c.status] ?? statusConfig.new;
              const catCfg =
                categoryConfig[c.category] ?? categoryConfig.platform;
              return (
                <div key={c.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getInitials(c.user.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {c.user.name}
                        </p>
                        <p className="text-xs text-gray-400">{c.user.phone}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${sCfg.cls}`}
                    >
                      {sCfg.label}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                    <p className="text-sm font-medium text-gray-800">{c.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {c.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium ${catCfg.cls}`}
                    >
                      {catCfg.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {formatDate(c.created_at)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs h-7"
                        onClick={() => onView(c)}
                      >
                        <Eye className="h-3 w-3" />
                        {t("View", "عرض")}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={lastPage}
              totalItems={total}
              itemsPerPage={perPage}
              onPageChange={onPageChange}
              onItemsPerPageChange={onPerPageChange}
              showItemsPerPageSelector
            />
          )}
        </>
      )}
    </div>
  );
}
