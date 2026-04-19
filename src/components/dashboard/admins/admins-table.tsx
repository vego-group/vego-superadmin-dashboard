// src/components/dashboard/admins/admins-table.tsx
"use client";

import { useState, useEffect } from "react";
import { MoreVertical, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Admin } from "@/types/dashboard/admin";

const ADMINS_PER_PAGE = 10;

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const formatDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const Avatar = ({ name, src }: { name: string; src?: string | null }) => (
  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 overflow-hidden">
    {src ? (
      <img src={src} alt={name} className="h-full w-full object-cover" />
    ) : (
      getInitials(name)
    )}
  </div>
);

const StatusBadge = ({ status }: { status: Admin["status"] }) => {
  const cfg = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-yellow-100 text-yellow-700",
    suspended: "bg-red-100 text-red-600",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

interface AdminsTableProps {
  admins: Admin[];
  onView: (admin: Admin) => void;
  onDelete: (admin: Admin) => void;
  selectedAdmins: string[];
  onSelectAdmin: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}

export default function AdminsTable({
  admins,
  onView,
  onDelete,
  selectedAdmins,
  onSelectAdmin,
  onSelectAll,
}: AdminsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(admins.length / ADMINS_PER_PAGE));
  const paginated = admins.slice(
    (currentPage - 1) * ADMINS_PER_PAGE,
    currentPage * ADMINS_PER_PAGE
  );

  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openMenuId]);

  const allSelected = paginated.length > 0 && paginated.every(a => selectedAdmins.includes(a.id));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">All Admins</h2>
        <span className="text-sm text-gray-400">{admins.length.toLocaleString()} total</span>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block min-h-[600px]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-6 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-gray-300"
                />
              </th>
              {["Admin", "Contact", "Joined", "Status", ""].map((h) => (
                <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedAdmins.includes(admin.id)}
                    onChange={(e) => onSelectAdmin(admin.id, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </td>

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

                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(admin.created_at)}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={admin.status} />
                </td>

                <td className="px-6 py-4">
                  <div className="relative flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === admin.id ? null : admin.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                    {openMenuId === admin.id && (
                      <div className="absolute right-0 top-8 z-50 bg-white border border-gray-100 rounded-xl shadow-lg w-40 overflow-hidden">
                        <button
                          onClick={() => { onView(admin); setOpenMenuId(null); }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                        >
                          <Eye className="h-4 w-4" /> View
                        </button>
                        <button
                          onClick={() => { onDelete(admin); setOpenMenuId(null); }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 className="h-4 w-4" /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-100">
        {paginated.map((admin) => (
          <div key={admin.id} className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedAdmins.includes(admin.id)}
                onChange={(e) => onSelectAdmin(admin.id, e.target.checked)}
                className="rounded border-gray-300"
              />
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
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Email</p>
                <p className="text-gray-700 text-xs font-medium truncate">{admin.email ?? "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Phone</p>
                <p className="text-gray-700 text-xs font-medium">{admin.phone ?? "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Joined</p>
                <p className="text-gray-700 text-xs font-medium">{formatDate(admin.created_at)}</p>
              </div>
            </div>

            <div className="flex gap-2 ml-10">
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={() => onView(admin)}>
                <Eye className="h-3.5 w-3.5" /> View
              </Button>
              <Button
                variant="outline" size="sm"
                className="flex-1 gap-1.5 text-xs text-red-600 hover:bg-red-50 border-red-200"
                onClick={() => onDelete(admin)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">
            {(currentPage - 1) * ADMINS_PER_PAGE + 1}–
            {Math.min(currentPage * ADMINS_PER_PAGE, admins.length)} of {admins.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 px-3 text-xs rounded-lg"
            >
              Prev
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 text-xs rounded-lg p-0 ${
                  currentPage === page ? "bg-[#1C1FC1] hover:bg-[#1C1FC1]/90 text-white border-0" : ""
                }`}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline" size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-3 text-xs rounded-lg"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}