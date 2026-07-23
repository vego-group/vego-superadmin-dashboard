"use client";

import { useState } from "react";
import { Search, RefreshCw, AlertCircle, Plus, ShieldCheck, Ban, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import RowActionsMenu, { RowAction } from "@/components/shared/row-actions-menu";
import Pagination from "@/components/shared/pagination";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StaffFormModal, { StaffFormValues } from "@/components/shared/staff-form-modal";
import StatusConfirmModal from "@/components/dashboard/admins/status-confirm-modal";
import AdminStats from "@/components/dashboard/admins/admin-stats";
import { useSuperAdmins } from "@/hooks/use-superadmins";
import { useAdminMutations } from "@/hooks/use-admin-mutations";
import { useStaffRole } from "@/hooks/use-staff-role";
import { useLang } from "@/lib/language-context";
import { Admin } from "@/types/dashboard/admin";

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const formatDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function SuperAdminsManagement() {
  const { t, lang } = useLang();
  const isRtl = lang === "ar";
  const role = useStaffRole();

  const { superAdmins, isLoading, error, fetchSuperAdmins } = useSuperAdmins();
  const { addAdmin, updateAdminStatus, deleteAdmin } = useAdminMutations(fetchSuperAdmins);

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState<Admin | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [deletingTarget, setDeletingTarget] = useState<Admin | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Middleware already blocks non-superadmins; this is just belt-and-braces.
  if (role && role !== "superadmin") return null;

  const filtered = superAdmins.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q) ||
      (a.email ?? "").toLowerCase().includes(q) ||
      (a.phone ?? "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  if (safePage !== currentPage) setCurrentPage(safePage);
  const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const handleConfirmStatusChange = async () => {
    if (!statusTarget) return;
    setIsUpdatingStatus(true);
    setActionError(null);
    try {
      const nextStatus = statusTarget.status === "active" ? "suspended" : "active";
      await updateAdminStatus(statusTarget.id, nextStatus);
      setStatusTarget(null);
    } catch (err) {
      // Backend guards: can't deactivate yourself or the last active superadmin.
      setActionError(err instanceof Error ? err.message : t("Failed to update status", "فشل تحديث الحالة"));
      setStatusTarget(null);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTarget) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      await deleteAdmin(deletingTarget.id);
      setDeletingTarget(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("Failed to delete superadmin", "فشل حذف المشرف العام"));
      setDeletingTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const statusCfg = {
    active:    { label: t("Active", "نشط"),      cls: "bg-green-100 text-green-700" },
    inactive:  { label: t("Inactive", "غير نشط"), cls: "bg-yellow-100 text-yellow-700" },
    suspended: { label: t("Suspended", "موقوف"),  cls: "bg-red-100 text-red-600" },
  };

  const thCls = `px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide ${
    isRtl ? "text-right" : "text-left"
  }`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            {t("SuperAdmins", "المشرفون العامون")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("Manage users with full system access", "إدارة المستخدمين ذوي الصلاحيات الكاملة على النظام")}
          </p>
        </div>
        <button
          onClick={fetchSuperAdmins}
          disabled={isLoading}
          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
          title={t("Refresh", "تحديث")}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats */}
      <AdminStats
        admins={superAdmins}
        isLoading={isLoading}
        totalLabel={t("Total SuperAdmins", "إجمالي المشرفين العامين")}
      />

      {/* Errors */}
      {(error || actionError) && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error ?? actionError}</span>
        </div>
      )}

      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t("Search by name, email, phone or ID…", "ابحث بالاسم أو البريد أو الهاتف أو المعرف…")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl border-gray-300 w-full"
          />
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="h-12 px-4 rounded-xl text-white gap-2 whitespace-nowrap"
          style={{ backgroundColor: "#1C1FC1" }}
        >
          <Plus className="h-4 w-4" />
          {t("Add SuperAdmin", "إضافة مشرف عام")}
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2 text-sm">
          <RefreshCw className="h-4 w-4 animate-spin" />
          {t("Loading superadmins…", "جارٍ تحميل المشرفين العامين…")}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              {t("All SuperAdmins", "جميع المشرفين العامين")}
            </h2>
            <span className="text-sm text-gray-400">
              {filtered.length.toLocaleString()} {t("total", "إجمالي")}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center text-gray-400 text-sm">
              {t("No superadmins found", "لا يوجد مشرفون عامون")}
            </div>
          ) : (
            <div className="min-h-[600px] overflow-x-auto">
              <table className="w-full" dir={isRtl ? "rtl" : "ltr"}>
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className={thCls}>{t("SuperAdmin", "المشرف العام")}</th>
                    <th className={thCls}>{t("Contact", "التواصل")}</th>
                    <th className={thCls}>{t("Joined", "تاريخ الانضمام")}</th>
                    <th className={thCls}>{t("Status", "الحالة")}</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((sa) => {
                    const sCfg = statusCfg[sa.status];
                    return (
                      <tr key={sa.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                              {getInitials(sa.name)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{sa.name}</p>
                              <p className="text-xs text-gray-400">#{sa.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{sa.email ?? "—"}</p>
                          <p className="text-xs text-gray-400">{sa.phone ?? "—"}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(sa.created_at)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sCfg.cls}`}>
                            {sCfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <RowActionsMenu
                            actions={[
                              sa.status === "active"
                                ? { label: t("Suspend","إيقاف"),  icon: <Ban className="h-4 w-4" />,         onClick: () => setStatusTarget(sa), tone: "warning" }
                                : { label: t("Activate","تفعيل"), icon: <CheckCircle2 className="h-4 w-4" />, onClick: () => setStatusTarget(sa) },
                              { label: t("Remove","حذف"), icon: <Trash2 className="h-4 w-4" />, onClick: () => setDeletingTarget(sa), tone: "danger" },
                            ] as RowAction[]}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > itemsPerPage && (
            <div className="border-t border-gray-100">
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                showItemsPerPageSelector={true}
              />
            </div>
          )}
        </div>
      )}

      {/* Add modal */}
      <StaffFormModal
        open={showAddModal}
        role="SuperAdmin"
        onSubmit={(values: StaffFormValues) => addAdmin({ ...values, role: "SuperAdmin" })}
        onClose={() => setShowAddModal(false)}
      />

      {/* Status confirmation (reuses the Admins modal) */}
      <StatusConfirmModal
        admin={statusTarget}
        isUpdating={isUpdatingStatus}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setStatusTarget(null)}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deletingTarget} onOpenChange={() => setDeletingTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Delete SuperAdmin", "حذف المشرف العام")}</DialogTitle>
            <DialogDescription>
              {t("Are you sure you want to delete", "هل أنت متأكد من حذف")}{" "}
              <strong>{deletingTarget?.name}</strong>؟{" "}
              {t("This action cannot be undone.", "لا يمكن التراجع عن هذا الإجراء.")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingTarget(null)} disabled={isDeleting}>
              {t("Cancel", "إلغاء")}
            </Button>
            <Button variant="destructive" disabled={isDeleting} onClick={handleDelete}>
              {isDeleting ? t("Deleting…", "جارٍ الحذف…") : t("Delete", "حذف")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
