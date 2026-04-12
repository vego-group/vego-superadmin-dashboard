"use client";

import { useState } from "react";
import { X, FileText, CheckCircle, XCircle, Bike, Users, Mail, Phone, Building2, PauseCircle, PlayCircle, Loader2, MapPin, Home } from "lucide-react";
import { Company, CompanyStatus } from "./types";
import { useLang } from "@/lib/language-context";

interface Props {
  company: Company;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onSuspend: (reason: string) => void;
  onReactivate: () => void;
}

export default function CompanyDetailModal({ company, onClose, onApprove, onReject, onSuspend, onReactivate }: Props) {
  const { t } = useLang();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reason, setReason]               = useState("");
  const [showReasonFor, setShowReasonFor] = useState<"reject" | "suspend" | null>(null);

  const statusCfg: Record<CompanyStatus, { label: string; badge: string }> = {
    approved:  { label: t("Approved", "موافق"),  badge: "bg-green-50 text-green-700 border border-green-200"    },
    pending:   { label: t("Pending", "معلق"),   badge: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
    rejected:  { label: t("Rejected", "مرفوض"),  badge: "bg-red-50 text-red-600 border border-red-200"          },
    suspended: { label: t("Suspended", "موقوف"), badge: "bg-gray-50 text-gray-500 border border-gray-200"       },
  };

  const cfg = statusCfg[company.status];

  const handleAction = async (action: "approve" | "reject" | "suspend" | "reactivate") => {
    setActionLoading(action);
    try {
      if (action === "approve")    await onApprove();
      if (action === "reject")     await onReject(reason || t("Rejected by admin", "تم الرفض بواسطة المسؤول"));
      if (action === "suspend")    await onSuspend(reason || t("Suspended by admin", "تم الإيقاف بواسطة المسؤول"));
      if (action === "reactivate") await onReactivate();
    } finally {
      setActionLoading(null);
      setShowReasonFor(null);
      setReason("");
    }
  };

  const infoRows = [
    { icon: Building2, label: t("Company Name", "اسم الشركة"),    value: company.company_name       },
    { icon: Phone,     label: t("Phone", "الهاتف"),           value: company.contact_phone      },
    { icon: Mail,      label: t("Email", "البريد الإلكتروني"),      value: company.contact_email      },
    { icon: FileText,  label: t("CR Number", "رقم السجل التجاري"),       value: company.commercial_reg_no  },
  ];

  const locationRows = [
    { icon: MapPin, label: t("City", "المدينة"),    value: company.city    || "—" },
    { icon: Home,   label: t("Region", "المنطقة"),  value: company.region  || "—" },
    { icon: Building2, label: t("Address", "العنوان"), value: company.address || "—" },
  ];

  const files = [
    { label: t("Commercial Registration", "السجل التجاري"), file: company.commercial_reg_file      },
    { label: t("Commercial License", "الترخيص التجاري"),      file: company.commercial_license_file  },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{company.company_name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">#{company.id} · {company.city ?? "—"} · {company.billing_type}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}>{cfg.label}</span>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Contact */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t("Contact Person", "جهة الاتصال")}</p>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0">
                {company.contact_person_name?.charAt(0) || "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{company.contact_person_name}</p>
                <p className="text-xs text-gray-500">{company.contact_phone}</p>
                <p className="text-xs text-gray-500">{company.contact_email}</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t("Basic Information", "المعلومات الأساسية")}</p>
            <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden">
              {infoRows.map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.label} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Icon className="h-3.5 w-3.5" />
                      {row.label}
                    </div>
                    <p className="text-xs font-semibold text-gray-700">{row.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t("Location", "الموقع")}</p>
            <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden">
              {locationRows.map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.label} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Icon className="h-3.5 w-3.5" />
                      {row.label}
                    </div>
                    <p className="text-xs font-semibold text-gray-700">{row.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fleet Capacity */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t("Fleet Capacity", "سعة الأسطول")}</p>
            <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Bike className="h-3.5 w-3.5" />
                  {t("Motorcycles", "الدراجات النارية")}
                </div>
                <p className="text-xs font-semibold text-gray-700">
                  <span>{company.motorcycles_count}</span>
                  <span className="text-gray-400">/{company.max_motorcycles}</span>
                </p>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Users className="h-3.5 w-3.5" />
                  {t("Drivers", "السائقون")}
                </div>
                <p className="text-xs font-semibold text-gray-700">
                  <span>{company.drivers_count}</span>
                  <span className="text-gray-400">/{company.max_drivers}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Review Note (if exists) */}
          {company.review_note && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t("Review Note", "ملاحظة المراجعة")}</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-xs text-gray-700">{company.review_note}</p>
                {company.reviewed_at && (
                  <p className="text-xs text-gray-400 mt-2">
                    {t("Reviewed", "تمت المراجعة")}: {new Date(company.reviewed_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Files */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t("Documents", "المستندات")}</p>
            <div className="space-y-2">
              {files.map((f) => (
                <div key={f.label} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <p className="text-xs text-gray-600">{f.label}</p>
                  </div>
                  {f.file ? (
                    <a href={f.file} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-indigo-600 font-medium hover:underline">{t("View", "عرض")}</a>
                  ) : (
                    <span className="text-xs text-gray-300">{t("Not uploaded", "لم يُرفع")}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Reason Input */}
          {showReasonFor && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                {showReasonFor === "reject" ? t("Rejection Reason", "سبب الرفض") : t("Suspension Reason", "سبب الإيقاف")}
              </label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder={t("Enter reason…", "أدخل السبب…")} rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-indigo-300 transition resize-none" />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 pb-6 flex flex-wrap gap-2">
          {company.status === "pending" && !showReasonFor && <>
            <button onClick={() => setShowReasonFor("reject")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition">
              <XCircle className="h-4 w-4" /> {t("Reject", "رفض")}
            </button>
            <button onClick={() => handleAction("approve")} disabled={actionLoading === "approve"}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
              style={{ backgroundColor: "#1C1FC1" }}>
              {actionLoading === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              {t("Approve", "موافقة")}
            </button>
          </>}

          {company.status === "approved" && !showReasonFor &&
            <button onClick={() => setShowReasonFor("suspend")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-orange-600 border border-orange-200 hover:bg-orange-50 transition">
              <PauseCircle className="h-4 w-4" /> {t("Suspend", "إيقاف")}
            </button>
          }

          {company.status === "suspended" && !showReasonFor &&
            <button onClick={() => handleAction("reactivate")} disabled={actionLoading === "reactivate"}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
              style={{ backgroundColor: "#1C1FC1" }}>
              {actionLoading === "reactivate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              {t("Reactivate", "إعادة تفعيل")}
            </button>
          }

          {showReasonFor && <>
            <button onClick={() => { setShowReasonFor(null); setReason(""); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
              {t("Cancel", "إلغاء")}
            </button>
            <button onClick={() => handleAction(showReasonFor)} disabled={!!actionLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50 bg-red-500 hover:bg-red-600">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {showReasonFor === "reject" ? t("Confirm Rejection", "تأكيد الرفض") : t("Confirm Suspension", "تأكيد الإيقاف")}
            </button>
          </>}

          {!showReasonFor &&
            <button onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition mt-1">
              {t("Close", "إغلاق")}
            </button>
          }
        </div>
      </div>
    </div>
  );
}