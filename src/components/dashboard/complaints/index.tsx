"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  Clock,
  Headset,
  User as UserIcon,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ComplaintsTable from "./complaints-table";
import ComplaintDetailModal from "./complaint-detail-modal";
import { useComplaints, DEFAULT_COMPLAINTS_SORT } from "@/hooks/use-complaints";
import { useComplaintStats } from "@/hooks/use-complaint-stats";
import { useComplaintMutations } from "@/hooks/use-complaint-mutations";
import { useSuperAdmins } from "@/hooks/use-superadmins";
import { useCountryView } from "@/lib/country-view-context";
import { useLang } from "@/lib/language-context";
import { Complaint, ComplaintStatus } from "@/types/dashboard/complaint";
import { categoryConfig, getCurrentStaff, statusConfig } from "./complaint-config";

export default function ComplaintsManagement() {
  const { t } = useLang();

  // Country comes from the global topbar switcher (CR-1 §3) — one mechanism
  // for every list module, and it already enforces staff country scoping.
  const { countryParam } = useCountryView();

  // Filter UI state
  const [searchInput, setSearchInput] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAssignee, setSelectedAssignee] = useState("all"); // "all" | "me" | staff id
  // Server-side sort (applied immediately, not part of the filter panel).
  const [sort, setSort] = useState(DEFAULT_COMPLAINTS_SORT);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Applied filter state (sent to API)
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("all");
  const [appliedCategory, setAppliedCategory] = useState("all");
  const [appliedAssignee, setAppliedAssignee] = useState("all");

  // A country switch changes the result set — restart from page 1.
  useEffect(() => {
    setCurrentPage(1);
  }, [countryParam]);

  const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [flashId, setFlashId] = useState<number | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Read after mount — localStorage isn't available during SSR.
  const [currentStaff, setCurrentStaff] = useState<{ id: number; name: string } | null>(null);
  useEffect(() => {
    setCurrentStaff(getCurrentStaff());
  }, []);

  const { superAdmins } = useSuperAdmins();
  const { stats, error: statsError, fetchStats } = useComplaintStats(countryParam);
  const { assignComplaint } = useComplaintMutations();

  // "me" needs the logged-in staff id at request time.
  const resolvedAssignee =
    appliedAssignee === "me" ? (currentStaff ? String(currentStaff.id) : "all") : appliedAssignee;

  const { complaints, pagination, sortMeta, isLoading, error, fetchComplaints, patchComplaint } =
    useComplaints({
      status: appliedStatus,
      category: appliedCategory,
      search: appliedSearch,
      country: countryParam ?? "all",
      assignedTo: resolvedAssignee,
      sort,
      page: currentPage,
      perPage: itemsPerPage,
    });

  const handleApplyFilters = () => {
    setAppliedSearch(searchInput);
    setAppliedStatus(selectedStatus);
    setAppliedCategory(selectedCategory);
    setAppliedAssignee(selectedAssignee);
    setCurrentPage(1);
    setShowFilters(false);
  };

  const handleReset = () => {
    setSearchInput("");
    setSelectedStatus("all");
    setSelectedCategory("all");
    setSelectedAssignee("all");
    setAppliedSearch("");
    setAppliedStatus("all");
    setAppliedCategory("all");
    setAppliedAssignee("all");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePerPageChange = (perPage: number) => {
    setItemsPerPage(perPage);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchComplaints();
    fetchStats();
  };

  // Quick-assign from the inbox row. The row is patched in place (assignee +
  // the backend's automatic new → in_review transition) and flashed — the list
  // must NOT silently reorder under the agent's cursor (CR-6 §4).
  const handleAssignToMe = async (c: Complaint) => {
    const me = getCurrentStaff();
    if (!me) {
      setAssignError(t("Could not identify the logged-in staff member", "تعذّر تحديد الموظف المسجّل"));
      return;
    }
    setAssigningId(c.id);
    setAssignError(null);
    try {
      await assignComplaint(c.id, me.id);
      patchComplaint(c.id, {
        assignedTo: { id: me.id, name: me.name },
        status: c.status === "new" ? "in_review" : c.status,
      });
      setFlashId(c.id);
      setTimeout(() => setFlashId(null), 2500);
      fetchStats();
    } catch (err) {
      setAssignError(
        err instanceof Error ? err.message : t("Failed to assign complaint", "فشل إسناد الشكوى")
      );
    } finally {
      setAssigningId(null);
    }
  };

  const sCfg = statusConfig(t);
  const catCfgMap = categoryConfig(t);

  const statusOptions = [
    { value: "all", label: t("All Statuses", "كل الحالات") },
    ...Object.entries(sCfg).map(([value, cfg]) => ({ value, label: cfg.label })),
  ];

  const categoryOptions = [
    { value: "all", label: t("All Categories", "كل الفئات") },
    ...Object.entries(catCfgMap).map(([value, cfg]) => ({ value, label: cfg.label })),
  ];

  const assigneeOptions = [
    { value: "all", label: t("All Assignees", "كل المسؤولين") },
    { value: "me", label: t("Assigned to me", "المسندة إليّ") },
    ...superAdmins.map((s) => ({ value: String(s.id), label: s.name })),
  ];

  // Labels for the sort keys we know today; anything new the server advertises
  // still shows up (humanised) because the option list comes from
  // meta.sort_available, never a hardcoded list.
  const sortLabelMap: Record<string, string> = {
    oldest_unanswered: t("Oldest unanswered first", "الأقدم بلا رد أولاً"),
    latest_activity: t("Latest activity", "أحدث نشاط"),
    oldest_activity: t("Oldest activity", "أقدم نشاط"),
    newest: t("Newest", "الأحدث إنشاءً"),
    oldest: t("Oldest", "الأقدم إنشاءً"),
  };
  const sortKeys =
    sortMeta.sortAvailable.length > 0
      ? sortMeta.sortAvailable
      : [DEFAULT_COMPLAINTS_SORT]; // until the first response echoes the list
  const sortOptions = (sortKeys.includes(sort) ? sortKeys : [sort, ...sortKeys]).map((k) => ({
    value: k,
    label: sortLabelMap[k] ?? k.replace(/_/g, " "),
  }));

  const handleSortChange = (value: string) => {
    setSort(value);
    setCurrentPage(1);
  };

  const getLabel = (opts: { value: string; label: string }[], val: string) =>
    opts.find((o) => o.value === val)?.label ?? opts[0].label;

  const isFiltered =
    appliedStatus !== "all" ||
    appliedCategory !== "all" ||
    appliedAssignee !== "all" ||
    appliedSearch !== "";

  // Stat cards use TRUE totals from GET /complaints/stats — never counts of
  // the loaded page (wrong past page 1). Clicking a card filters the inbox.
  const statCards: {
    status: ComplaintStatus;
    icon: React.ReactNode;
    iconBg: string;
  }[] = [
    { status: "new", icon: <MessageSquare className="h-4 w-4 text-blue-600" />, iconBg: "bg-blue-100" },
    { status: "in_review", icon: <Clock className="h-4 w-4 text-yellow-600" />, iconBg: "bg-yellow-100" },
    { status: "awaiting_agent", icon: <Headset className="h-4 w-4 text-red-600" />, iconBg: "bg-red-100" },
    { status: "awaiting_customer", icon: <UserIcon className="h-4 w-4 text-teal-600" />, iconBg: "bg-teal-100" },
    { status: "resolved", icon: <CheckCircle2 className="h-4 w-4 text-green-600" />, iconBg: "bg-green-100" },
    { status: "closed", icon: <XCircle className="h-4 w-4 text-gray-500" />, iconBg: "bg-gray-100" },
  ];

  const handleStatCardClick = (status: ComplaintStatus) => {
    const next = appliedStatus === status ? "all" : status;
    setSelectedStatus(next);
    setAppliedStatus(next);
    setCurrentPage(1);
  };

  const filterDropdown = (
    opts: { value: string; label: string }[],
    selected: string,
    onSelect: (v: string) => void
  ) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 w-full sm:w-[190px] justify-between h-11">
          <span className="truncate">{getLabel(opts, selected)}</span>
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[190px] max-h-[300px] overflow-y-auto">
        {opts.map((o) => (
          <DropdownMenuItem
            key={o.value}
            onClick={() => onSelect(o.value)}
            className={selected === o.value ? "bg-gray-100" : ""}
          >
            {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            {t("Complaints", "الشكاوى")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("Support inbox — respond to customer complaints", "صندوق الدعم — الرد على شكاوى العملاء")}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
          title={t("Refresh", "تحديث")}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats cards — true totals from GET /complaints/stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map(({ status, icon, iconBg }) => (
            <button
              key={status}
              onClick={() => handleStatCardClick(status)}
              className={`bg-white rounded-xl border p-3.5 flex items-center gap-2.5 text-left transition hover:shadow-sm ${
                appliedStatus === status
                  ? "border-[#1C1FC1] ring-1 ring-[#1C1FC1]/30"
                  : "border-gray-100"
              }`}
            >
              <div className={`h-8 w-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-500 truncate">{sCfg[status].label}</p>
                <p className="text-lg font-bold text-gray-900 leading-tight">
                  {stats.byStatus[status].toLocaleString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Errors */}
      {(error || statsError || assignError) && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error || statsError || assignError}</span>
        </div>
      )}

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t("Search by title or description…", "ابحث بالعنوان أو الوصف…")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
              className="pl-10 h-12 rounded-xl border-gray-300 w-full"
            />
          </div>
          <div className="flex gap-2">
            {/* Sort — options come from the server's meta.sort_available */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 px-4 rounded-xl gap-2 border-gray-300">
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="hidden md:inline truncate max-w-[160px]">
                    {getLabel(sortOptions, sort)}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[210px]">
                {sortOptions.map((o) => (
                  <DropdownMenuItem
                    key={o.value}
                    onClick={() => handleSortChange(o.value)}
                    className={sort === o.value ? "bg-gray-100" : ""}
                  >
                    {o.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              onClick={() => setShowFilters((v) => !v)}
              className={`h-12 px-4 rounded-xl gap-2 ${
                showFilters ? "border-[#1C1FC1] text-[#1C1FC1] bg-[#1C1FC1]/5" : "border-gray-300"
              }`}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">{t("Filters", "فلاتر")}</span>
              {isFiltered && <span className="h-2 w-2 rounded-full bg-[#1C1FC1]" />}
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="h-12 px-4 rounded-xl text-white gap-2 whitespace-nowrap"
              style={{ backgroundColor: "#1C1FC1" }}
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">{t("Search", "بحث")}</span>
            </Button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-gray-100 shadow-sm animate-in fade-in">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              {filterDropdown(statusOptions, selectedStatus, setSelectedStatus)}
              {filterDropdown(categoryOptions, selectedCategory, setSelectedCategory)}
              {filterDropdown(assigneeOptions, selectedAssignee, setSelectedAssignee)}

              <Button
                onClick={handleApplyFilters}
                className="h-11 px-6 gap-2"
                style={{ backgroundColor: "#1C1FC1", color: "white" }}
              >
                <Filter className="h-4 w-4" />
                {t("Apply", "تطبيق")}
              </Button>

              {isFiltered && (
                <Button variant="ghost" onClick={handleReset} className="h-11 px-4 text-gray-500">
                  {t("Reset", "إعادة ضبط")}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Table / Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2 text-sm">
          <RefreshCw className="h-4 w-4 animate-spin" />
          {t("Loading complaints…", "جارٍ تحميل الشكاوى…")}
        </div>
      ) : (
        <ComplaintsTable
          complaints={complaints}
          pagination={pagination}
          onView={setViewingComplaint}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          onAssignToMe={handleAssignToMe}
          assigningId={assigningId}
          flashId={flashId}
        />
      )}

      {/* Thread modal */}
      <ComplaintDetailModal
        complaint={viewingComplaint}
        isOpen={!!viewingComplaint}
        onClose={() => setViewingComplaint(null)}
        staffList={superAdmins}
        onRowPatch={patchComplaint}
        onStatsChanged={fetchStats}
      />
    </div>
  );
}
