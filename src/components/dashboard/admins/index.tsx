// src/components/dashboard/admins/index.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, ChevronDown, RefreshCw, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AdminStatsCards from "./admin-stats-cards";
import AdminsTable from "./admins-table";
import { useAdmins } from "@/hooks/use-admins";

// ─── Filter options ───────────────────────────────────────────────────────────
const statusOptions = [
  { value: "all",       label: "All Status" },
  { value: "active",    label: "Active"     },
  { value: "inactive",  label: "Inactive"   },
  { value: "suspended", label: "Suspended"  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminsManagement() {
  const router = useRouter();
  const { admins, isLoading, error, fetchAdmins, deleteAdmin } = useAdmins();

  const [searchQuery,    setSearchQuery]    = useState("");
  const [showFilters,    setShowFilters]    = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filtered = admins.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      a.name.toLowerCase().includes(q)          ||
      a.id.toLowerCase().includes(q)            ||
      (a.email   ?? "").toLowerCase().includes(q) ||
      (a.phone   ?? "").toLowerCase().includes(q) ||
      (a.city    ?? "").toLowerCase().includes(q);

    const matchStatus =
      selectedStatus === "all" || a.status === selectedStatus;

    return matchSearch && matchStatus;
  });

  const getLabel = (opts: typeof statusOptions, val: string) =>
    opts.find((o) => o.value === val)?.label ?? opts[0].label;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Admins Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all registered admins
          </p>
        </div>
        <button
          onClick={fetchAdmins}
          disabled={isLoading}
          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats */}
      <AdminStatsCards admins={admins} isLoading={isLoading} />

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
              placeholder="Search by name, email, phone, city or ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl border-gray-300 w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters((v) => !v)}
              className="h-12 px-4 rounded-xl border-gray-300 gap-2"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
            <Button
              onClick={() => router.push("/dashboard/admins/add")}
              className="h-12 px-4 rounded-xl text-white gap-2 whitespace-nowrap"
              style={{ backgroundColor: "#1C1FC1" }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Admin</span>
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-gray-100 shadow-sm animate-in fade-in">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 w-full sm:w-[180px] justify-between h-11">
                    {getLabel(statusOptions, selectedStatus)}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[180px]">
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

              <Button onClick={() => setShowFilters(false)} className="h-11 px-6 gap-2">
                <Filter className="h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2 text-sm">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading admins…
        </div>
      ) : (
        <AdminsTable admins={filtered} onDelete={deleteAdmin} />
      )}
    </div>
  );
}