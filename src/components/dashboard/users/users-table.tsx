"use client";

import { useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserMobileCard from "./user-mobile-card";
import UserActionsMenu from "./user-actions-menu";
import UserDetailsModal from "./user-details-modal";
import { User } from "@/hooks/use-users";
import { useLang } from "@/lib/language-context";

const USERS_PER_PAGE = 10;

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const formatDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const Avatar = ({ name }: { name: string }) => (
  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
    {getInitials(name)}
  </div>
);

interface UsersTableProps {
  users: User[];
  onToggleBlock: (id: string) => void;
}

function RowActions({
  user, openMenuId, setOpenMenuId, onView, onToggleBlock,
}: {
  user: User;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onView: () => void;
  onToggleBlock: (id: string) => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  return (
    <div className="relative flex justify-end">
      <button ref={btnRef}
        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
        className="p-1.5 hover:bg-gray-100 rounded-lg transition">
        <MoreVertical className="h-4 w-4 text-gray-400" />
      </button>
      {openMenuId === user.id && (
        <UserActionsMenu
          userId={user.id}
          status={user.status}
          triggerRef={btnRef}
          onView={onView}
          onToggleBlock={(id) => { onToggleBlock(id); setOpenMenuId(null); }}
        />
      )}
    </div>
  );
}

export default function UsersTable({ users, onToggleBlock }: UsersTableProps) {
  const { t, lang } = useLang();
  const isRtl = lang === "ar";

  const [currentPage,  setCurrentPage]  = useState(1);
  const [openMenuId,   setOpenMenuId]   = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen,  setIsModalOpen]  = useState(false);

  const StatusBadge = ({ status }: { status: User["status"] }) => {
    const statusConfig: Record<User["status"], { label: [string, string]; className: string }> = {
      active:   { label: ["Active",   "نشط"],              className: "bg-green-100 text-green-700"  },
      inactive: { label: ["Inactive", "غير نشط"],          className: "bg-gray-100 text-gray-600"   },
      blocked:  { label: ["Blocked",  "محظور"],             className: "bg-red-100 text-red-600"     },
      pending:  { label: ["Pending",  "قيد الانتظار"],     className: "bg-yellow-100 text-yellow-700"},
    };
    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {t(config.label[0], config.label[1])}
      </span>
    );
  };

  const totalPages = Math.max(1, Math.ceil(users.length / USERS_PER_PAGE));
  const paginated  = users.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const safePage = Math.min(currentPage, totalPages);
  if (safePage !== currentPage) setCurrentPage(safePage);

  const tableHeaders = [
    t("User",    "المستخدم"),
    t("Contact", "التواصل"),
    t("City",    "المدينة"),
    t("Joined",  "تاريخ الانضمام"),
    t("Status",  "الحالة"),
    "",
  ];

  const thClass = `px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide ${isRtl ? "text-right" : "text-left"}`;

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

        {/* Card Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{t("All Users", "جميع المستخدمين")}</h2>
          <span className="text-sm text-gray-400">
            {users.length.toLocaleString()} {t("total", "إجمالي")}
          </span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full" dir={isRtl ? "rtl" : "ltr"}>
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {tableHeaders.map((h, i) => (
                  <th key={i} className={thClass}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                        <p className="text-xs text-gray-400">#{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700">{user.email ?? "—"}</p>
                    <p className="text-xs text-gray-400">{user.phone ?? "—"}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.city ?? "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(user.created_at)}</td>
                  <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                  <td className="px-6 py-4">
                    <RowActions
                      user={user}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                      onView={() => handleView(user)}
                      onToggleBlock={onToggleBlock}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {paginated.map((user) => (
            <UserMobileCard
              key={user.id}
              user={user}
              onToggleBlock={onToggleBlock}
              onView={() => handleView(user)}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-gray-100">
            <p className="text-xs sm:text-sm text-gray-500">
              {(currentPage - 1) * USERS_PER_PAGE + 1}–
              {Math.min(currentPage * USERS_PER_PAGE, users.length)} {t("of", "من")} {users.length}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1} className="h-8 px-3 text-xs rounded-lg">
                {t("Prev", "السابق")}
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button key={page}
                  variant={currentPage === page ? "default" : "outline"} size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 text-xs rounded-lg p-0 ${currentPage === page ? "bg-[#1C1FC1] hover:bg-[#1C1FC1]/90 text-white border-0" : ""}`}>
                  {page}
                </Button>
              ))}
              <Button variant="outline" size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages} className="h-8 px-3 text-xs rounded-lg">
                {t("Next", "التالي")}
              </Button>
            </div>
          </div>
        )}
      </div>

      <UserDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
      />
    </>
  );
}