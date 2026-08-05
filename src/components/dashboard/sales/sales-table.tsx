"use client";

import { Eye, Trash2, Ban, CheckCircle2 } from "lucide-react";
import { SalesMember } from "./index";
import { useLang } from "@/lib/language-context";
import { formatDate } from "@/lib/format-date";
import RowActionsMenu from "@/components/shared/row-actions-menu";
import CountryCell from "@/components/shared/country-cell";

interface Props {
  members: SalesMember[];
  onView: (m: SalesMember) => void;
  onToggleStatus: (m: SalesMember) => void;
  onDelete: (m: SalesMember) => void;
}

export default function SalesTable({ members, onView, onToggleStatus, onDelete }: Props) {
  const { t, lang } = useLang();
  const isRtl = lang === "ar";
  const thCls = `px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide ${isRtl ? "text-right" : "text-left"}`;

  const statusCfg = {
    active:    { label: t("Active","نشط"),      badge: "bg-green-100 text-green-700", dot: "bg-green-500" },
    inactive:  { label: t("Inactive","غير نشط"), badge: "bg-gray-100 text-gray-600",   dot: "bg-gray-500"  },
    suspended: { label: t("Suspended","موقوف"),  badge: "bg-red-100 text-red-600",     dot: "bg-red-500"   },
  };

  const headers = [
    t("Name","الاسم"),
    t("Phone","الهاتف"),
    t("Email","البريد"),
    t("Country","الدولة"),
    t("Status","الحالة"),
    t("Joined","تاريخ الانضمام"),
    t("Actions","الإجراءات"),
  ];

  if (members.length === 0) return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-400 text-sm">
      {t("No sales members found.","لا يوجد أعضاء مبيعات.")}
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

      {/* Desktop */}
      <div className="hidden md:block min-h-[600px] overflow-x-auto">
        <table className="w-full" dir={isRtl ? "rtl" : "ltr"}>
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {headers.map((h, i) => <th key={i} className={thCls}>{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {members.map((m) => {
              const cfg = statusCfg[m.status];
              return (
                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold shrink-0">
                        {m.name.charAt(0)}
                      </div>
                      <p className="text-sm font-medium text-gray-800">{m.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{m.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{m.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <CountryCell iso={m.iso_country_code} nullMeansGlobal />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}>
                      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {formatDate(m.created_at, lang)}
                  </td>
                  <td className="px-4 py-3">
                    <RowActionsMenu
                      actions={[
                        { label: t("View","عرض"), icon: <Eye className="h-4 w-4" />, onClick: () => onView(m) },
                        m.status === "active"
                          ? { label: t("Suspend","إيقاف"),  icon: <Ban className="h-4 w-4" />,          onClick: () => onToggleStatus(m), tone: "warning" }
                          : { label: t("Activate","تفعيل"), icon: <CheckCircle2 className="h-4 w-4" />, onClick: () => onToggleStatus(m) },
                        { label: t("Remove","حذف"), icon: <Trash2 className="h-4 w-4" />, onClick: () => onDelete(m), tone: "danger" },
                      ]}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-100">
        {members.map((m) => {
          const cfg = statusCfg[m.status];
          return (
            <div key={m.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">{m.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.phone ?? "—"}</p>
                    <div className="text-xs text-gray-400">
                      <CountryCell iso={m.iso_country_code} nullMeansGlobal />
                    </div>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}>
                  <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onView(m)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-indigo-200 text-indigo-600 text-xs font-medium hover:bg-indigo-50 transition">
                  <Eye className="h-3.5 w-3.5" /> {t("View","عرض")}
                </button>
                <button onClick={() => onToggleStatus(m)} className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition ${m.status === "active" ? "border-orange-200 text-orange-600 hover:bg-orange-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}>
                  {m.status === "active" ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => onDelete(m)} className="flex items-center justify-center px-3 py-2 rounded-lg border border-red-200 text-red-400 text-xs hover:bg-red-50 transition">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}