"use client";

import { logger } from '@/lib/logger';
import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw, AlertCircle, AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AdminStats       from "@/components/dashboard/admins/admin-stats";
import SalesTable       from "./sales-table";
import AddSalesModal    from "./add-sales-modal";
import StaffDetailModal from "@/components/shared/staff-detail-modal";
import StaffStatusModal from "@/components/shared/staff-status-modal";
import Pagination from "@/components/shared/pagination";
import { useAdminMutations } from "@/hooks/use-admin-mutations";
import { useLang } from "@/lib/language-context";
import { useCountryView } from "@/lib/country-view-context";
import { fetchStaffList } from "@/lib/staff-list";

export interface SalesMember {
  id: string; name: string; email: string | null; phone: string | null;
  status: "active" | "inactive" | "suspended";
  created_at: string; phone_verified: boolean; language: string;
}

const normaliseMember = (raw: Record<string, unknown>): SalesMember => ({
  id:             String(raw.id ?? ""),
  name:           String(raw.name ?? "Unknown"),
  email:          raw.email  ? String(raw.email)  : null,
  phone:          raw.phone  ? String(raw.phone)  : null,
  status:         (["inactive", "suspended"].includes(String(raw.status)) ? raw.status : "active") as SalesMember["status"],
  created_at:     String(raw.created_at ?? ""),
  phone_verified: Boolean(raw.phone_verified),
  language:       String(raw.language || "en"),
});

export default function SalesStaffIndex() {
  const { t } = useLang();
  const { countryParam } = useCountryView();
  const [members,    setMembers]    = useState<SalesMember[]>([]);
  const [countryFilterNotApplied, setCountryFilterNotApplied] = useState(false);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [search,     setSearch]     = useState("");
  const [showAdd,    setShowAdd]    = useState(false);
  const [viewing,    setViewing]    = useState<SalesMember | null>(null);
  const [statusTarget, setStatusTarget] = useState<SalesMember | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [deleting,   setDeleting]   = useState<SalesMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { rows, countryFilterNotApplied: notApplied } = await fetchStaffList(
        "staff?role=sales",
        countryParam,
        "Failed to fetch sales staff"
      );
      setMembers(rows.map(normaliseMember));
      setCountryFilterNotApplied(notApplied);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Failed to fetch sales staff", "فشل تحميل فريق المبيعات"));
    } finally {
      setIsLoading(false);
    }
  }, [countryParam]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const { updateAdminStatus } = useAdminMutations(fetchMembers);

  const handleConfirmStatus = async () => {
    if (!statusTarget) return;
    setIsUpdatingStatus(true);
    try {
      const next = statusTarget.status === "active" ? "suspended" : "active";
      await updateAdminStatus(statusTarget.id, next);
      setStatusTarget(null);
    } catch (err) {
      logger.error("❌ toggle sales status:", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/proxy/staff/${deleting.id}`, { method: "DELETE", headers: { Accept: "application/json" } });
      if (!res.ok) { const json = await res.json(); throw new Error(json.message || "Failed to delete"); }
      setDeleting(null);
      fetchMembers();
    } catch (err) {
      logger.error("❌ delete sales:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) || (m.phone ?? "").includes(q) || (m.email ?? "").toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  if (safePage !== currentPage) setCurrentPage(safePage);

  const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">{t("Sales Management", "إدارة المبيعات")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("Manage sales team members", "إدارة أعضاء فريق المبيعات")}</p>
        </div>
        <button onClick={fetchMembers} disabled={isLoading}
          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition disabled:opacity-40">
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <AdminStats admins={members} isLoading={isLoading} totalLabel={t("Total", "الإجمالي")} />

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Country filter not applied by the server (unsupported or ignored) */}
      {countryFilterNotApplied && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            {t(
              "The server did not apply the country filter — this list may include records from other countries.",
              "لم يطبّق الخادم فلتر الدولة — قد تتضمن هذه القائمة سجلات من دول أخرى."
            )}
          </span>
        </div>
      )}

      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder={t("Search by name, phone or email…", "ابحث بالاسم أو الهاتف أو البريد…")}
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 rounded-xl border-gray-300 w-full" />
        </div>
        <Button onClick={() => setShowAdd(true)} className="h-12 px-4 rounded-xl text-white gap-2 whitespace-nowrap" style={{ backgroundColor: "#1C1FC1" }}>
          <Plus className="h-4 w-4" />
          {t("Add Sales Member", "إضافة عضو مبيعات")}
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2 text-sm">
          <RefreshCw className="h-4 w-4 animate-spin" /> {t("Loading sales staff…", "جارٍ تحميل فريق المبيعات…")}
        </div>
      ) : (
        <>
          <SalesTable members={paginated} onView={setViewing} onToggleStatus={setStatusTarget} onDelete={setDeleting} />

          {filtered.length > itemsPerPage && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
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
        </>
      )}

      <AddSalesModal open={showAdd} onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); fetchMembers(); }} />

      <StaffDetailModal
        member={viewing}
        title={t("Sales Member Details", "تفاصيل عضو المبيعات")}
        isOpen={!!viewing}
        onClose={() => setViewing(null)}
      />

      <StaffStatusModal
        member={statusTarget}
        entityLabel={t("Sales member", "عضو المبيعات")}
        isUpdating={isUpdatingStatus}
        onConfirm={handleConfirmStatus}
        onCancel={() => setStatusTarget(null)}
      />

      {/* Delete Confirm */}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Delete Sales Member", "حذف عضو المبيعات")}</DialogTitle>
            <DialogDescription>
              {t("Are you sure you want to delete", "هل أنت متأكد من حذف")} <strong>{deleting?.name}</strong>؟{" "}
              {t("This action cannot be undone.", "لا يمكن التراجع عن هذا الإجراء.")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={isDeleting}>{t("Cancel", "إلغاء")}</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? t("Deleting…", "جارٍ الحذف…") : t("Delete", "حذف")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}