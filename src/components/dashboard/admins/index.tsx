// src/components/dashboard/admins/index.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, ChevronDown, RefreshCw, AlertCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminStats from "./admin-stats";
import AdminsTable from "./admins-table";
import AdminDetailModal from "./admin-detail-modal";
import { useAdmins } from "@/hooks/use-admins";
import { useAdminMutations } from "@/hooks/use-admin-mutations";
import { Admin } from "@/types/dashboard/admin";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

export default function AdminsManagement() {
  const router = useRouter();
  const { admins, isLoading, error, fetchAdmins } = useAdmins();
  const { deleteAdmin, bulkDeleteAdmins } = useAdminMutations();

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const [viewingAdmin, setViewingAdmin] = useState<Admin | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<Admin | null>(null);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const filtered = admins.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      a.name.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q) ||
      (a.email ?? "").toLowerCase().includes(q) ||
      (a.phone ?? "").toLowerCase().includes(q) ||
      (a.city ?? "").toLowerCase().includes(q);

    const matchStatus = selectedStatus === "all" || a.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const getLabel = (opts: typeof statusOptions, val: string) =>
    opts.find((o) => o.value === val)?.label ?? opts[0].label;

  const handleSelectAdmin = (id: string, checked: boolean) => {
    setSelectedAdmins(prev =>
      checked ? [...prev, id] : prev.filter(adminId => adminId !== id)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedAdmins(checked ? filtered.map(a => a.id) : []);
  };

  const handleDelete = async (admin: Admin) => {
    try {
      await deleteAdmin(admin.id);
      setDeletingAdmin(null);
      setSelectedAdmins(prev => prev.filter(id => id !== admin.id));
    } catch (err) {
      console.error("Failed to delete admin:", err);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteAdmins(selectedAdmins);
      setSelectedAdmins([]);
      setShowBulkDeleteDialog(false);
    } catch (err) {
      console.error("Failed to delete admins:", err);
    }
  };

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
      <AdminStats admins={admins} isLoading={isLoading} />

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

        {/* Bulk Actions */}
        {selectedAdmins.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-sm font-medium text-blue-800">
              {selectedAdmins.length} admin{selectedAdmins.length !== 1 ? "s" : ""} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkDeleteDialog(true)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedAdmins([])}>
              Clear
            </Button>
          </div>
        )}

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
        <AdminsTable
          admins={filtered}
          onView={setViewingAdmin}
          onDelete={setDeletingAdmin}
          selectedAdmins={selectedAdmins}
          onSelectAdmin={handleSelectAdmin}
          onSelectAll={handleSelectAll}
        />
      )}

      {/* View Modal */}
      <AdminDetailModal
        admin={viewingAdmin}
        isOpen={!!viewingAdmin}
        onClose={() => setViewingAdmin(null)}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deletingAdmin} onOpenChange={() => setDeletingAdmin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deletingAdmin?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingAdmin(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deletingAdmin && handleDelete(deletingAdmin)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Multiple Admins</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedAdmins.length} admin{selectedAdmins.length !== 1 ? "s" : ""}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBulkDelete}>Delete All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}