"use client";

import { X, Phone, Mail, CheckCircle2, XCircle } from "lucide-react";
import { SalesMember } from "./index";
import { useLang } from "@/lib/language-context";

interface Props { member: SalesMember | null; onClose: () => void; }

export default function SalesDetailModal({ member, onClose }: Props) {
  const { t } = useLang();
  if (!member) return null;

  const statusCfg = {
    active:    { label: t("Active",    "نشط"),     badge: "bg-green-50 text-green-700 border border-green-200"  },
    inactive:  { label: t("Inactive",  "غير نشط"), badge: "bg-gray-50 text-gray-500 border border-gray-200"    },
    suspended: { label: t("Suspended", "موقوف"),   badge: "bg-red-50 text-red-600 border border-red-200"       },
  };

  const cfg = statusCfg[member.status];

  const rows = [
    { label: t("Phone",          "الهاتف"),          value: member.phone ?? "—",   icon: <Phone className="h-3.5 w-3.5" /> },
    { label: t("Email",          "البريد"),           value: member.email ?? "—",   icon: <Mail className="h-3.5 w-3.5" />  },
    { label: t("Phone Verified", "الهاتف موثق"),      value: member.phone_verified ? t("Yes","نعم") : t("No","لا"),
      icon: member.phone_verified ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <XCircle className="h-3.5 w-3.5 text-gray-400" /> },
    { label: t("Language",       "اللغة"),            value: member.language.toUpperCase(), icon: null },
    { label: t("Joined",         "تاريخ الانضمام"),   value: new Date(member.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), icon: null },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
              {member.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{member.name}</h3>
              <p className="text-xs text-gray-400">{t("Sales Team", "فريق المبيعات")} · #{member.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}>{cfg.label}</span>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="px-6 py-5">
          <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-gray-400">{row.icon}{row.label}</div>
                <p className="text-xs font-semibold text-gray-700">{row.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 pb-6">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
            {t("Close", "إغلاق")}
          </button>
        </div>
      </div>
    </div>
  );
}