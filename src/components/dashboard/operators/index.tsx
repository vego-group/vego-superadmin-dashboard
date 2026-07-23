"use client";

import { logger } from '@/lib/logger';
import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import OperatorsStatsCards  from "./operators-stats-cards";
import OperatorsTable       from "./operators-table";
import AddOperatorModal     from "./add-operator-modal";
import OperatorDetailModal  from "./operator-detail-modal";
import Pagination from "@/components/shared/pagination";
import { useLang } from "@/lib/language-context";

// Operators are staff with the backend role `ops_supervisor` (see rbac.ts).
export interface OperatorMember {
  id: string; name: string; email: string | null; phone: string | null;
  status: "active" | "inactive" | "suspended";
  created_at: string; phone_verified: boolean; language: string;
}

const OPERATOR_ROLE = "ops_supervisor";

const normaliseMember = (raw: Record<string, unknown>): OperatorMember => ({
  id:             String(raw.id ?? ""),
  name:           String(raw.name ?? "Unknown"),
  email:          raw.email  ? String(raw.email)  : null,
  phone:          raw.phone  ? String(raw.phone)  : null,
  status:         (["inactive", "suspended"].includes(String(raw.status)) ? raw.status : "active") as OperatorMember["status"],
  created_at:     String(raw.created_at ?? ""),
  phone_verified: Boolean(raw.phone_verified),
  language:       String(raw.language || "en"),
});

export default function OperatorsStaffIndex() {
  const { t } = useLang();
  const [members,    setMembers]    = useState<OperatorMember[]>([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [search,     setSearch]     = useState("");
  const [showAdd,    setShowAdd]    = useState(false);
  const [viewing,    setViewing]    = useState<OperatorMember | null>(null);
  const [deleting,   setDeleting]   = useState<OperatorMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/proxy/staff?role=${OPERATOR_ROLE}`, { headers: { Accept: "application/json" } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || `Error ${res.status}`);
      setMembers((json.data?.data ?? json.data ?? []).map(normaliseMember));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Failed to fetch operators", "فشل تحميل المشغّلين"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/proxy/staff/${deleting.id}`, { method: "DELETE", headers: { Accept: "application/json" } });
      if (!res.ok) { const json = await res.json(); throw new Error(json.message || "Failed to delete"); }
      setDeleting(null);
      fetchMembers();
    } catch (err) {
      logger.error("❌ delete operator:", err);
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
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">{t("Operators Management", "إدارة المشغّلين")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("Manage operations team members", "إدارة أعضاء فريق التشغيل")}</p>
        </div>
        <button onClick={fetchMembers} disabled={isLoading}
          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition disabled:opacity-40">
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <OperatorsStatsCards members={members} isLoading={isLoading} />

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
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
          {t("Add Operator", "إضافة مشغّل")}
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2 text-sm">
          <RefreshCw className="h-4 w-4 animate-spin" /> {t("Loading operators…", "جارٍ تحميل المشغّلين…")}
        </div>
      ) : (
        <>
          <OperatorsTable members={paginated} onView={setViewing} onDelete={setDeleting} />

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

      <AddOperatorModal open={showAdd} onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); fetchMembers(); }} />
      <OperatorDetailModal member={viewing} onClose={() => setViewing(null)} />

      {/* Delete Confirm */}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Delete Operator", "حذف المشغّل")}</DialogTitle>
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
