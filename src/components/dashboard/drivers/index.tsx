"use client";

import { useState } from "react";
import { Search, RefreshCw, AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DriversTable from "./drivers-table";
import DriverDetailModal from "./driver-detail-modal";
import { useDrivers, useFleetOptions } from "@/hooks/use-drivers";
import { useLang } from "@/lib/language-context";
import { Driver } from "@/types/dashboard/driver";

export default function DriversOversight() {
  const { t } = useLang();

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [fleetFilter, setFleetFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [viewingDriver, setViewingDriver] = useState<Driver | null>(null);

  const fleets = useFleetOptions();
  const { drivers, pagination, isLoading, error, fetchDrivers } = useDrivers({
    fleetId: fleetFilter,
    status: statusFilter,
    search: appliedSearch,
    page: currentPage,
    perPage: itemsPerPage,
  });

  const statusOptions = [
    { value: "all", label: t("All Statuses", "كل الحالات") },
    { value: "active", label: t("Active", "نشط") },
    { value: "inactive", label: t("Inactive", "غير نشط") },
    { value: "blocked", label: t("Blocked", "محظور") },
  ];

  const fleetLabel =
    fleetFilter === "all"
      ? t("All Fleets", "كل الشركات")
      : fleets.find((f) => String(f.id) === fleetFilter)?.company_name ?? fleetFilter;

  const statusLabel = statusOptions.find((o) => o.value === statusFilter)?.label ?? statusOptions[0].label;

  const applySearch = () => {
    setAppliedSearch(searchInput);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            {t("Drivers", "السائقون")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("Cross-fleet driver oversight — read only", "متابعة سائقي جميع الشركات — للقراءة فقط")}
          </p>
        </div>
        <button
          onClick={fetchDrivers}
          disabled={isLoading}
          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
          title={t("Refresh", "تحديث")}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t("Search by name, email or phone…", "ابحث بالاسم أو البريد أو الهاتف…")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            className="pl-10 h-12 rounded-xl border-gray-300 w-full"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Fleet filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 px-4 rounded-xl border-gray-300 gap-2 justify-between min-w-[180px]">
                <span className="truncate">{fleetLabel}</span>
                <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[220px] max-h-72 overflow-y-auto">
              <DropdownMenuItem
                onClick={() => { setFleetFilter("all"); setCurrentPage(1); }}
                className={fleetFilter === "all" ? "bg-gray-100" : ""}
              >
                {t("All Fleets", "كل الشركات")}
              </DropdownMenuItem>
              {fleets.map((f) => (
                <DropdownMenuItem
                  key={f.id}
                  onClick={() => { setFleetFilter(String(f.id)); setCurrentPage(1); }}
                  className={fleetFilter === String(f.id) ? "bg-gray-100" : ""}
                >
                  {f.company_name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 px-4 rounded-xl border-gray-300 gap-2 justify-between min-w-[150px]">
                {statusLabel}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[180px]">
              {statusOptions.map((o) => (
                <DropdownMenuItem
                  key={o.value}
                  onClick={() => { setStatusFilter(o.value); setCurrentPage(1); }}
                  className={statusFilter === o.value ? "bg-gray-100" : ""}
                >
                  {o.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={applySearch} className="h-12 px-5 rounded-xl text-white" style={{ backgroundColor: "#1C1FC1" }}>
            {t("Search", "بحث")}
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <DriversTable
          drivers={drivers}
          pagination={pagination}
          onView={setViewingDriver}
          onPageChange={(p) => {
            setCurrentPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onPerPageChange={(pp) => {
            setItemsPerPage(pp);
            setCurrentPage(1);
          }}
        />
      )}

      <DriverDetailModal driver={viewingDriver} onClose={() => setViewingDriver(null)} />
    </div>
  );
}
