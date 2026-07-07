"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  Clock,
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
import { useComplaints } from "@/hooks/use-complaints";
import { useLang } from "@/lib/language-context";
import { Complaint } from "@/types/dashboard/complaint";

export default function ComplaintsManagement() {
  const { t } = useLang();

  // Filter UI state
  const [searchInput, setSearchInput] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Applied filter state (sent to API)
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("all");
  const [appliedCategory, setAppliedCategory] = useState("all");

  const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);

  const { complaints, pagination, isLoading, error, fetchComplaints } =
    useComplaints({
      status: appliedStatus,
      category: appliedCategory,
      search: appliedSearch,
      page: currentPage,
      perPage: itemsPerPage,
    });

  const handleApplyFilters = () => {
    setAppliedSearch(searchInput);
    setAppliedStatus(selectedStatus);
    setAppliedCategory(selectedCategory);
    setCurrentPage(1);
    setShowFilters(false);
  };

  const handleReset = () => {
    setSearchInput("");
    setSelectedStatus("all");
    setSelectedCategory("all");
    setAppliedSearch("");
    setAppliedStatus("all");
    setAppliedCategory("all");
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

  const statusOptions = [
    { value: "all", label: t("All Statuses", "كل الحالات") },
    { value: "new", label: t("New", "جديدة") },
    { value: "in_review", label: t("In Review", "قيد المراجعة") },
    { value: "replied", label: t("Replied", "تم الرد") },
  ];

  const categoryOptions = [
    { value: "all", label: t("All Categories", "كل الفئات") },
    { value: "charging", label: t("Charging", "الشحن") },
    { value: "swap", label: t("Battery Swap", "تبديل البطارية") },
    { value: "payment", label: t("Financial", "مالية") },
    { value: "platform", label: t("Platform", "المنصة") },
  ];

  const getLabel = (
    opts: { value: string; label: string }[],
    val: string
  ) => opts.find((o) => o.value === val)?.label ?? opts[0].label;

  const isFiltered =
    appliedStatus !== "all" ||
    appliedCategory !== "all" ||
    appliedSearch !== "";

  // Quick stats derived from the total
  const newCount = complaints.filter((c) => c.status === "new").length;
  const inReviewCount = complaints.filter((c) => c.status === "in_review").length;
  const repliedCount = complaints.filter((c) => c.status === "replied").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            {t("Complaints", "الشكاوى")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t(
              "View and respond to driver complaints",
              "عرض والرد على شكاوى السائقين"
            )}
          </p>
        </div>
        <button
          onClick={fetchComplaints}
          disabled={isLoading}
          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
          title={t("Refresh", "تحديث")}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats cards */}
      {!isLoading && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("New", "جديدة")}</p>
              <p className="text-xl font-bold text-gray-900">{newCount}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("In Review", "قيد المراجعة")}</p>
              <p className="text-xl font-bold text-gray-900">{inReviewCount}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("Replied", "تم الرد")}</p>
              <p className="text-xl font-bold text-gray-900">{repliedCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t(
                "Search by title or description…",
                "ابحث بالعنوان أو الوصف…"
              )}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
              className="pl-10 h-12 rounded-xl border-gray-300 w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters((v) => !v)}
              className={`h-12 px-4 rounded-xl gap-2 ${
                showFilters ? "border-[#1C1FC1] text-[#1C1FC1] bg-[#1C1FC1]/5" : "border-gray-300"
              }`}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">{t("Filters", "فلاتر")}</span>
              {isFiltered && (
                <span className="h-2 w-2 rounded-full bg-[#1C1FC1]" />
              )}
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
              {/* Status filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 w-full sm:w-[200px] justify-between h-11"
                  >
                    {getLabel(statusOptions, selectedStatus)}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[200px]">
                  {statusOptions.map((o) => (
                    <DropdownMenuItem
                      key={o.value}
                      onClick={() => setSelectedStatus(o.value)}
                      className={selectedStatus === o.value ? "bg-gray-100" : ""}
                    >
                      {o.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Category filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 w-full sm:w-[200px] justify-between h-11"
                  >
                    {getLabel(categoryOptions, selectedCategory)}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[200px]">
                  {categoryOptions.map((o) => (
                    <DropdownMenuItem
                      key={o.value}
                      onClick={() => setSelectedCategory(o.value)}
                      className={selectedCategory === o.value ? "bg-gray-100" : ""}
                    >
                      {o.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={handleApplyFilters}
                className="h-11 px-6 gap-2"
                style={{ backgroundColor: "#1C1FC1", color: "white" }}
              >
                <Filter className="h-4 w-4" />
                {t("Apply", "تطبيق")}
              </Button>

              {isFiltered && (
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  className="h-11 px-4 text-gray-500"
                >
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
        />
      )}

      {/* Detail / Reply Modal */}
      <ComplaintDetailModal
        complaint={viewingComplaint}
        isOpen={!!viewingComplaint}
        onClose={() => setViewingComplaint(null)}
        onUpdated={(updated) => setViewingComplaint(updated)}
        fetchComplaints={fetchComplaints}
      />
    </div>
  );
}
