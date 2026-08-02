"use client";

// CR-6 inbox: last-message preview, last activity + sender, unread badge,
// assignee, SLA age / waiting time. Rows waiting on an agent (awaiting_agent,
// then new) are highlighted — the default order puts oldest unanswered first.

import { Eye, Headset, RefreshCw, User as UserIcon, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Complaint, ComplaintsPagination } from "@/types/dashboard/complaint";
import { useLang } from "@/lib/language-context";
import Pagination from "@/components/shared/pagination";
import CountryCell from "@/components/shared/country-cell";
import { dateLocale } from "@/lib/format-date";
import {
  categoryConfig,
  formatHours,
  getInitials,
  needsAgentAttention,
  statusConfig,
} from "./complaint-config";

// 20 is the API default page size — it must be an offered option (CR-6 §5).
const PER_PAGE_OPTIONS = [10, 20, 50, 100];

interface Props {
  complaints: Complaint[];
  pagination: ComplaintsPagination;
  onView: (complaint: Complaint) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onAssignToMe: (complaint: Complaint) => void;
  /** Complaint id with an assign request in flight. */
  assigningId: number | null;
  /** Row to visually flash after an in-place update (assignment transition). */
  flashId: number | null;
}

export default function ComplaintsTable({
  complaints,
  pagination,
  onView,
  onPageChange,
  onPerPageChange,
  onAssignToMe,
  assigningId,
  flashId,
}: Props) {
  const { t, lang } = useLang();
  const isRtl = lang === "ar";
  const thCls = `px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide ${
    isRtl ? "text-right" : "text-left"
  }`;

  const sCfg = statusConfig(t);
  const catCfgMap = categoryConfig(t);

  const { currentPage, lastPage, total, perPage } = pagination;

  const formatActivity = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(dateLocale(lang), {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const lastSenderChip = (c: Complaint) =>
    c.lastSenderType === null ? null : (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-medium ${
          c.lastSenderType === "agent" ? "text-gray-400" : "text-[#1C1FC1]"
        }`}
      >
        {c.lastSenderType === "agent" ? (
          <Headset className="h-3 w-3" />
        ) : (
          <UserIcon className="h-3 w-3" />
        )}
        {c.lastSenderType === "agent" ? t("Agent", "موظف") : t("Customer", "عميل")}
      </span>
    );

  const assignCell = (c: Complaint) =>
    c.assignedTo ? (
      <span className="text-sm text-gray-700">{c.assignedTo.name ?? `#${c.assignedTo.id}`}</span>
    ) : (
      <Button
        variant="outline"
        size="sm"
        disabled={assigningId !== null}
        onClick={(e) => {
          e.stopPropagation();
          onAssignToMe(c);
        }}
        className="h-7 gap-1 text-xs text-[#1C1FC1] border-[#1C1FC1]/30 hover:bg-[#1C1FC1]/5"
      >
        {assigningId === c.id ? (
          <RefreshCw className="h-3 w-3 animate-spin" />
        ) : (
          <UserPlus className="h-3 w-3" />
        )}
        {t("Assign to me", "إسناد إليّ")}
      </Button>
    );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">{t("Inbox", "صندوق الوارد")}</h2>
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
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full" dir={isRtl ? "rtl" : "ltr"}>
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className={thCls}>#</th>
                  <th className={thCls}>{t("User", "المستخدم")}</th>
                  <th className={thCls}>{t("Last Message", "آخر رسالة")}</th>
                  <th className={thCls}>{t("Category", "الفئة")}</th>
                  <th className={thCls}>{t("Country", "الدولة")}</th>
                  <th className={thCls}>{t("Status", "الحالة")}</th>
                  <th className={thCls}>{t("Assignee", "المسؤول")}</th>
                  <th className={thCls}>{t("SLA / Waiting", "العمر / الانتظار")}</th>
                  <th className={thCls}>{t("Last Activity", "آخر نشاط")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {complaints.map((c) => {
                  const statusCfg = sCfg[c.status];
                  const catCfg = catCfgMap[c.category] ?? catCfgMap.platform;
                  const attention = needsAgentAttention(c.status);
                  const unread = c.unreadForAgent > 0;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => onView(c)}
                      className={`transition-colors cursor-pointer ${
                        flashId === c.id
                          ? "bg-blue-50 ring-2 ring-inset ring-blue-300"
                          : attention
                            ? "bg-amber-50/50 hover:bg-amber-50"
                            : "hover:bg-gray-50/50"
                      }`}
                    >
                      <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">
                        {attention && (
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 me-1.5 align-middle"
                            title={t("Awaiting agent reply", "بانتظار رد الموظف")}
                          />
                        )}
                        #{c.id}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(c.user.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                              {c.user.name}
                            </p>
                            <p className="text-xs text-gray-400" dir="ltr">
                              {c.user.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 max-w-[260px]">
                        <div className="flex items-center gap-2">
                          {unread && (
                            <span
                              className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#1C1FC1] text-white text-[10px] font-bold flex items-center justify-center"
                              title={t("Unread messages", "رسائل غير مقروءة")}
                            >
                              {c.unreadForAgent}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p
                              className={`text-sm line-clamp-1 ${
                                unread ? "font-semibold text-gray-900" : "text-gray-600"
                              }`}
                            >
                              {c.lastMessagePreview ?? c.title}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-1">{c.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${catCfg.cls}`}>
                          {catCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                        <CountryCell iso={c.isoCountryCode} />
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusCfg.cls}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {assignCell(c)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <p className="text-xs text-gray-500">
                          {t("SLA", "العمر")}: <span className="font-medium">{formatHours(c.slaAgeHours)}</span>
                        </p>
                        <p
                          className={`text-xs ${
                            c.status === "awaiting_agent"
                              ? "text-red-600 font-semibold"
                              : "text-gray-500"
                          }`}
                        >
                          {t("Waiting", "انتظار")}: <span className="font-medium">{formatHours(c.waitingHours)}</span>
                        </p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <p className="text-xs text-gray-600">{formatActivity(c.lastMessageAt ?? c.created_at)}</p>
                        {lastSenderChip(c)}
                      </td>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
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

          {/* Mobile / tablet cards */}
          <div className="lg:hidden divide-y divide-gray-100">
            {complaints.map((c) => {
              const statusCfg = sCfg[c.status];
              const catCfg = catCfgMap[c.category] ?? catCfgMap.platform;
              const attention = needsAgentAttention(c.status);
              const unread = c.unreadForAgent > 0;
              return (
                <div
                  key={c.id}
                  className={`p-4 space-y-3 ${
                    flashId === c.id ? "bg-blue-50" : attention ? "bg-amber-50/50" : ""
                  }`}
                  onClick={() => onView(c)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getInitials(c.user.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{c.user.name}</p>
                        <p className="text-xs text-gray-400" dir="ltr">
                          {c.user.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {unread && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#1C1FC1] text-white text-[10px] font-bold flex items-center justify-center">
                          {c.unreadForAgent}
                        </span>
                      )}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusCfg.cls}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{c.title}</p>
                    <p className={`text-xs line-clamp-2 ${unread ? "font-semibold text-gray-700" : "text-gray-500"}`}>
                      {c.lastMessagePreview ?? c.description}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      {lastSenderChip(c)}
                      <span className="text-[10px] text-gray-400">
                        {formatActivity(c.lastMessageAt ?? c.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${catCfg.cls}`}>
                        {catCfg.label}
                      </span>
                      <span
                        className={`text-xs ${
                          c.status === "awaiting_agent" ? "text-red-600 font-semibold" : "text-gray-500"
                        }`}
                      >
                        {t("Waiting", "انتظار")}: {formatHours(c.waitingHours)}
                      </span>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>{assignCell(c)}</div>
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
              itemsPerPageOptions={PER_PAGE_OPTIONS}
            />
          )}
        </>
      )}
    </div>
  );
}
