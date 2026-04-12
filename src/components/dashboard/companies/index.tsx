"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw } from "lucide-react";
import CompaniesStats     from "./companies-stats";
import CompaniesFilters   from "./companies-filters";
import CompaniesTable     from "./companies-table";
import AddCompanyModal    from "./add-company-modal";
import CompanyDetailModal from "./company-detail-modal";
import { Company, CompanyStatus, FleetCounts } from "./types";
import { API_ENDPOINTS, authHeaders } from "@/config/api";
import { useLang } from "@/lib/language-context";

export default function CompaniesIndex() {
  const { t } = useLang();
  const [companies, setCompanies]       = useState<Company[]>([]);
  const [counts, setCounts]             = useState<FleetCounts | null>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | "all">("all");
  const [showAdd, setShowAdd]           = useState(false);
  const [selected, setSelected]         = useState<Company | null>(null);
  const [page, setPage]                 = useState(1);
  const [lastPage, setLastPage]         = useState(1);

  // ── Fetch Counts ────────────────────────────────────────────────────────────
  const fetchCounts = useCallback(async () => {
    try {
      const res  = await fetch(API_ENDPOINTS.FLEETS_COUNTS, {
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.success) setCounts(json.data);
    } catch (err) {
      console.error("❌ fetchCounts:", err);
    }
  }, []);

  // ── Fetch Companies ─────────────────────────────────────────────────────────
  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status:   statusFilter === "all" ? "" : statusFilter,
        per_page: "15",
        page:     String(page),
      });
      const res  = await fetch(`${API_ENDPOINTS.FLEETS_LIST}?${params}`, {
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setCompanies(json.data.data);
        setLastPage(json.data.last_page);
      }
    } catch (err) {
      console.error("❌ fetchCompanies:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);
  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(API_ENDPOINTS.FLEETS_APPROVE(id), {
        method: "POST",
        headers: authHeaders(),
      });
      if (res.ok) { fetchCompanies(); fetchCounts(); setSelected(null); }
    } catch (err) { console.error("❌ approve:", err); }
  };

  const handleReject = async (id: number, reason?: string) => {
    try {
      const res = await fetch(API_ENDPOINTS.FLEETS_REJECT(id), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ reason: reason || t("Rejected by admin", "تم الرفض بواسطة المسؤول") }),
      });
      if (res.ok) { fetchCompanies(); fetchCounts(); setSelected(null); }
    } catch (err) { console.error("❌ reject:", err); }
  };

  const handleSuspend = async (id: number, reason?: string) => {
    try {
      const res = await fetch(API_ENDPOINTS.FLEETS_SUSPEND(id), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ reason: reason || t("Suspended by admin", "تم الإيقاف بواسطة المسؤول") }),
      });
      if (res.ok) { fetchCompanies(); fetchCounts(); setSelected(null); }
    } catch (err) { console.error("❌ suspend:", err); }
  };

  const handleReactivate = async (id: number) => {
    try {
      const res = await fetch(API_ENDPOINTS.FLEETS_REACTIVATE(id), {
        method: "POST",
        headers: authHeaders(),
      });
      if (res.ok) { fetchCompanies(); fetchCounts(); setSelected(null); }
    } catch (err) { console.error("❌ reactivate:", err); }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(API_ENDPOINTS.FLEETS_DELETE(id), {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) { fetchCompanies(); fetchCounts(); }
    } catch (err) { console.error("❌ delete:", err); }
  };

  const handleAdd = () => {
    fetchCompanies();
    fetchCounts();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{t("Companies", "الشركات")}</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">{t("Manage registered fleet companies and their accounts", "إدارة شركات الأسطول المسجلة وحساباتها")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { fetchCompanies(); fetchCounts(); }} disabled={isLoading}
            className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
            title={t("Refresh", "تحديث")}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
            style={{ backgroundColor: "#1C1FC1" }}>
            <Plus className="h-4 w-4" />
            {t("Add New Company", "إضافة شركة جديدة")}
          </button>
        </div>
      </div>

      <CompaniesStats counts={counts} isLoading={isLoading} />

      <CompaniesFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        statusFilter={statusFilter}
        onStatusChange={(v) => { setStatusFilter(v); setPage(1); }}
      />

      <CompaniesTable
        companies={companies}
        isLoading={isLoading}
        page={page}
        lastPage={lastPage}
        onPageChange={setPage}
        onView={setSelected}
        onApprove={handleApprove}
        onReject={handleReject}
        onSuspend={handleSuspend}
        onReactivate={handleReactivate}
        onDelete={handleDelete}
      />

      <AddCompanyModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAdd}
      />

      {selected && (
        <CompanyDetailModal
          company={selected}
          onClose={() => setSelected(null)}
          onApprove={() => handleApprove(selected.id)}
          onReject={(reason) => handleReject(selected.id, reason)}
          onSuspend={(reason) => handleSuspend(selected.id, reason)}
          onReactivate={() => handleReactivate(selected.id)}
        />
      )}
    </div>
  );
}