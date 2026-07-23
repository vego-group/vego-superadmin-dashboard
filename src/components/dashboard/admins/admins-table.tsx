"use client";

import { useState } from "react";
import { Trash2, Eye, Pencil, Ban, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Admin } from "@/types/dashboard/admin";
import { useLang } from "@/lib/language-context";
import RowActionsMenu, { RowAction } from "@/components/shared/row-actions-menu";

const ADMINS_PER_PAGE = 10;

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const formatDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const Avatar = ({ name, src }: { name: string; src?: string | null }) => (
  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 overflow-hidden">
    {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : getInitials(name)}
  </div>
);

interface AdminsTableProps {
  admins: Admin[];
  /** false hides write actions (edit/status/delete/bulk-select) — staff writes are superadmin-only. */
  canManage?: boolean;
  onView: (admin: Admin) => void;
  onEdit: (admin: Admin) => void;
  onDelete: (admin: Admin) => void;
  onToggleStatus: (admin: Admin) => void;
  selectedAdmins: string[];
  onSelectAdmin: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}

export default function AdminsTable({ admins, canManage = true, onView, onEdit, onDelete, onToggleStatus, selectedAdmins, onSelectAdmin, onSelectAll }: AdminsTableProps) {
  const { t, lang } = useLang();
  const isRtl = lang === "ar";
  const thCls = `px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide ${isRtl ? "text-right" : "text-left"}`;

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(admins.length / ADMINS_PER_PAGE));
  const paginated  = admins.slice((currentPage - 1) * ADMINS_PER_PAGE, currentPage * ADMINS_PER_PAGE);

  const allSelected = paginated.length > 0 && paginated.every(a => selectedAdmins.includes(a.id));

  // Row actions, shown via the shared 3-dot menu. View is always available;
  // write actions require canManage (superadmin-only).
  const buildActions = (admin: Admin): RowAction[] => {
    const actions: RowAction[] = [
      { label: t("View","عرض"), icon: <Eye className="h-4 w-4" />, onClick: () => onView(admin) },
    ];
    if (canManage) {
      actions.push(
        { label: t("Edit","تعديل"), icon: <Pencil className="h-4 w-4" />, onClick: () => onEdit(admin) },
        admin.status === "active"
          ? { label: t("Suspend","إيقاف"),  icon: <Ban className="h-4 w-4" />,          onClick: () => onToggleStatus(admin), tone: "warning" }
          : { label: t("Activate","تفعيل"), icon: <CheckCircle2 className="h-4 w-4" />,  onClick: () => onToggleStatus(admin) },
        { label: t("Remove","حذف"), icon: <Trash2 className="h-4 w-4" />, onClick: () => onDelete(admin), tone: "danger" },
      );
    }
    return actions;
  };

  const statusCfg = {
    active:    { label: t("Active","نشط"),     cls: "bg-green-100 text-green-700"   },
    inactive:  { label: t("Inactive","غير نشط"),cls: "bg-yellow-100 text-yellow-700" },
    suspended: { label: t("Suspended","موقوف"), cls: "bg-red-100 text-red-600"       },
  };

  const StatusBadge = ({ status }: { status: Admin["status"] }) => (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg[status].cls}`}>
      {statusCfg[status].label}
    </span>
  );

  const headers = [
    t("Admin","المشرف"),
    t("Contact","التواصل"),
    t("Joined","تاريخ الانضمام"),
    t("Status","الحالة"),
    "",
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">{t("All Admins","جميع المشرفين")}</h2>
        <span className="text-sm text-gray-400">{admins.length.toLocaleString()} {t("total","إجمالي")}</span>
      </div>

      {/* Desktop */}
      <div className="hidden md:block min-h-[600px] overflow-x-auto">
        <table className="w-full" dir={isRtl ? "rtl" : "ltr"}>
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {canManage && (
                <th className={`${thCls} w-10`}>
                  <input type="checkbox" checked={allSelected}
                    onChange={(e) => onSelectAll(e.target.checked)} className="rounded border-gray-300" />
                </th>
              )}
              {headers.map((h, i) => <th key={i} className={thCls}>{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                {canManage && (
                  <td className="px-6 py-4">
                    <input type="checkbox" checked={selectedAdmins.includes(admin.id)}
                      onChange={(e) => onSelectAdmin(admin.id, e.target.checked)} className="rounded border-gray-300" />
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={admin.name} src={admin.profile_picture} />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{admin.name}</p>
                      <p className="text-xs text-gray-400">#{admin.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-700">{admin.email ?? "—"}</p>
                  <p className="text-xs text-gray-400">{admin.phone ?? "—"}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(admin.created_at)}</td>
                <td className="px-6 py-4"><StatusBadge status={admin.status} /></td>
                <td className="px-6 py-4">
                  <RowActionsMenu actions={buildActions(admin)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-100">
        {paginated.map((admin) => (
          <div key={admin.id} className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              {canManage && (
                <input type="checkbox" checked={selectedAdmins.includes(admin.id)}
                  onChange={(e) => onSelectAdmin(admin.id, e.target.checked)} className="rounded border-gray-300" />
              )}
              <div className="flex items-center gap-3 flex-1">
                <Avatar name={admin.name} src={admin.profile_picture} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 text-sm">{admin.name}</p>
                    <StatusBadge status={admin.status} />
                  </div>
                  <p className="text-xs text-gray-400">#{admin.id}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 rounded-xl p-3 ml-10">
              <div><p className="text-gray-400 text-xs mb-0.5">{t("Email","البريد")}</p><p className="text-gray-700 text-xs font-medium truncate">{admin.email ?? "—"}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">{t("Phone","الهاتف")}</p><p className="text-gray-700 text-xs font-medium">{admin.phone ?? "—"}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">{t("Joined","تاريخ الانضمام")}</p><p className="text-gray-700 text-xs font-medium">{formatDate(admin.created_at)}</p></div>
            </div>
            <div className="flex flex-wrap gap-2 ml-10">
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={() => onView(admin)}>
                <Eye className="h-3.5 w-3.5" /> {t("View","عرض")}
              </Button>
              {canManage && (
                <>
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={() => onEdit(admin)}>
                    <Pencil className="h-3.5 w-3.5" /> {t("Edit","تعديل")}
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    className={`flex-1 gap-1.5 text-xs ${
                      admin.status === "active"
                        ? "text-orange-600 hover:bg-orange-50 border-orange-200"
                        : "text-green-600 hover:bg-green-50 border-green-200"
                    }`}
                    onClick={() => onToggleStatus(admin)}
                  >
                    {admin.status === "active"
                      ? <><Ban className="h-3.5 w-3.5" /> {t("Suspend","إيقاف")}</>
                      : <><CheckCircle2 className="h-3.5 w-3.5" /> {t("Activate","تفعيل")}</>}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs text-red-600 hover:bg-red-50 border-red-200" onClick={() => onDelete(admin)}>
                    <Trash2 className="h-3.5 w-3.5" /> {t("Remove","حذف")}
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">
            {(currentPage - 1) * ADMINS_PER_PAGE + 1}–{Math.min(currentPage * ADMINS_PER_PAGE, admins.length)} {t("of","من")} {admins.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 px-3 text-xs rounded-lg">
              {t("Prev","السابق")}
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 text-xs rounded-lg p-0 ${currentPage === page ? "bg-[#1C1FC1] hover:bg-[#1C1FC1]/90 text-white border-0" : ""}`}>
                {page}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 px-3 text-xs rounded-lg">
              {t("Next","التالي")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}