// src/components/dashboard/admins/admin-card.tsx
"use client";

import { Admin } from "@/types/dashboard/admin";
import { Mail, Phone, Calendar, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminCardProps {
  admin: Admin;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const formatDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

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

export default function AdminCard({ admin, onView, onEdit, onDelete }: AdminCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white font-semibold flex-shrink-0">
            {getInitials(admin.name)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{admin.name}</h3>
            <p className="text-xs text-gray-500">#{admin.id}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition">
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">{admin.email || "No email"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">{admin.phone || "No phone"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">Joined {formatDate(admin.created_at)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <StatusBadge status={admin.status} />
      </div>
    </div>
  );
}