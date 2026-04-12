"use client";

import { useState } from "react";
import { Eye, CheckCircle, XCircle, Bike, Users, Trash2, PauseCircle, PlayCircle, RefreshCw } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { Company, CompanyStatus } from "./types";

interface Props {
  companies: Company[];
  isLoading: boolean;
  page: number;
  lastPage: number;
  onPageChange: (p: number) => void;
  onView: (c: Company) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onSuspend: (id: number) => void;
  onReactivate: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function CompaniesTable({ companies, isLoading, page, lastPage, onPageChange, onView, onApprove, onReject, onSuspend, onReactivate, onDelete }: Props) {
  const { t } = useLang();
  const [confirmDelete, setConfirmDelete] = useState<Company | null>(null);

  const statusCfg: Record<CompanyStatus, { label: string; badge: string }> = {
    approved:  { label: t("Approved", "موافق"),  badge: "bg-green-50 text-green-700 border border-green-200"    },
    pending:   { label: t("Pending", "معلق"),   badge: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
    rejected:  { label: t("Rejected", "مرفوض"),  badge: "bg-red-50 text-red-600 border border-red-200"          },
    suspended: { label: t("Suspended", "موقوف"), badge: "bg-gray-50 text-gray-500 border border-gray-200"       },
  };

  const headers = [
    t("Company", "الشركة"),
    t("Contact", "جهة الاتصال"),
    t("City", "المدينة"),
    t("Motorcycles", "الدراجات"),
    t("Drivers", "السائقون"),
    t("Billing", "الفوترة"),
    t("Status", "الحالة"),
    t("Actions", "إجراءات"),
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex items-center justify-center gap-2 text-gray-400 text-sm">
        <RefreshCw className="h-4 w-4 animate-spin" /> {t("Loading companies…", "جارٍ تحميل الشركات…")}
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-400 text-sm">
        {t("No companies found.", "لا توجد شركات.")}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {headers.map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {companies.map((c) => {
                const cfg = statusCfg[c.status];
                return (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-800">{c.company_name}</p>
                      <p className="text-xs text-gray-400">#{c.id} {c.company_code ? `· ${c.company_code}` : ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">{c.contact_person_name}</p>
                      <p className="text-xs text-gray-400">{c.contact_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.city ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Bike className="h-3.5 w-3.5 text-gray-400" />
                        {c.motorcycles_count}/{c.max_motorcycles}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        {c.drivers_count}/{c.max_drivers}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 capitalize">{c.billing_type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}>{cfg.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => onView(c)} className="p-1.5 hover:bg-indigo-50 rounded-lg transition text-indigo-500" title={t("View", "عرض")}>
                          <Eye className="h-4 w-4" />
                        </button>
                        {c.status === "pending" && <>
                          <button onClick={() => onApprove(c.id)} className="p-1.5 hover:bg-green-50 rounded-lg transition text-green-600" title={t("Approve", "موافقة")}>
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button onClick={() => onReject(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition text-red-500" title={t("Reject", "رفض")}>
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>}
                        {c.status === "approved" &&
                          <button onClick={() => onSuspend(c.id)} className="p-1.5 hover:bg-orange-50 rounded-lg transition text-orange-500" title={t("Suspend", "إيقاف")}>
                            <PauseCircle className="h-4 w-4" />
                          </button>
                        }
                        {c.status === "suspended" &&
                          <button onClick={() => onReactivate(c.id)} className="p-1.5 hover:bg-green-50 rounded-lg transition text-green-600" title={t("Reactivate", "إعادة تفعيل")}>
                            <PlayCircle className="h-4 w-4" />
                          </button>
                        }
                        <button onClick={() => setConfirmDelete(c)} className="p-1.5 hover:bg-red-50 rounded-lg transition text-red-400" title={t("Delete", "حذف")}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-gray-100">
          {companies.map((c) => {
            const cfg = statusCfg[c.status];
            return (
              <div key={c.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{c.company_name}</p>
                    <p className="text-xs text-gray-400">#{c.id}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}>{cfg.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 rounded-lg p-3">
                  <div><p className="text-gray-400">{t("Contact", "جهة الاتصال")}</p><p className="font-medium text-gray-700">{c.contact_person_name}</p></div>
                  <div><p className="text-gray-400">{t("Phone", "الهاتف")}</p><p className="font-medium text-gray-700">{c.contact_phone}</p></div>
                  <div><p className="text-gray-400">{t("Motorcycles", "الدراجات")}</p><p className="font-medium text-gray-700">{c.motorcycles_count}/{c.max_motorcycles}</p></div>
                  <div><p className="text-gray-400">{t("Drivers", "السائقون")}</p><p className="font-medium text-gray-700">{c.drivers_count}/{c.max_drivers}</p></div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => onView(c)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-indigo-200 text-indigo-600 text-xs font-medium hover:bg-indigo-50 transition">
                    <Eye className="h-3.5 w-3.5" /> {t("View", "عرض")}
                  </button>
                  {c.status === "pending" && <>
                    <button onClick={() => onApprove(c.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-green-200 text-green-600 text-xs font-medium hover:bg-green-50 transition">
                      <CheckCircle className="h-3.5 w-3.5" /> {t("Approve", "موافقة")}
                    </button>
                    <button onClick={() => onReject(c.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 transition">
                      <XCircle className="h-3.5 w-3.5" /> {t("Reject", "رفض")}
                    </button>
                  </>}
                  {c.status === "approved" &&
                    <button onClick={() => onSuspend(c.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-orange-200 text-orange-500 text-xs font-medium hover:bg-orange-50 transition">
                      <PauseCircle className="h-3.5 w-3.5" /> {t("Suspend", "إيقاف")}
                    </button>
                  }
                  {c.status === "suspended" &&
                    <button onClick={() => onReactivate(c.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-green-200 text-green-600 text-xs font-medium hover:bg-green-50 transition">
                      <PlayCircle className="h-3.5 w-3.5" /> {t("Reactivate", "إعادة تفعيل")}
                    </button>
                  }
                  <button onClick={() => setConfirmDelete(c)} className="flex items-center justify-center px-3 py-2 rounded-lg border border-red-200 text-red-400 text-xs hover:bg-red-50 transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">{t("Page", "صفحة")} {page} {t("of", "من")} {lastPage}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
                className="h-8 px-3 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition">{t("Prev", "السابق")}</button>
              <button onClick={() => onPageChange(page + 1)} disabled={page === lastPage}
                className="h-8 px-3 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition">{t("Next", "التالي")}</button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="h-1 w-full bg-red-500" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Trash2 className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{t("Delete Company", "حذف الشركة")}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{t("This action cannot be undone", "لا يمكن التراجع عن هذا الإجراء")}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                {t("Are you sure you want to delete", "هل أنت متأكد من حذف")}{" "}
                <span className="font-semibold text-gray-900">{confirmDelete.company_name}</span>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
                  {t("Cancel", "إلغاء")}
                </button>
                <button onClick={() => { onDelete(confirmDelete.id); setConfirmDelete(null); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition">
                  {t("Yes, Delete", "نعم، احذف")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}