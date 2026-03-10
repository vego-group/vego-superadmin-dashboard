// src/components/dashboard/users/user-mobile-card.tsx
import { Eye, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/hooks/use-users";

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

interface UserMobileCardProps {
  user: User;
  onToggleBlock: (id: string) => void;
  onView: () => void;
}

export default function UserMobileCard({ user, onToggleBlock, onView }: UserMobileCardProps) {
  return (
    <div className="p-4 space-y-3">

      {/* Top Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {getInitials(user.name)}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
            <p className="text-xs text-gray-400">#{user.id}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          user.status === "active"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-600"
        }`}>
          {user.status === "active" ? "Active" : "Blocked"}
        </span>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 rounded-xl p-3">
        <div>
          <p className="text-gray-400 text-xs mb-0.5">Email</p>
          <p className="text-gray-700 text-xs font-medium truncate">{user.email ?? "—"}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-0.5">Phone</p>
          <p className="text-gray-700 text-xs font-medium">{user.phone ?? "—"}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-0.5">City</p>
          <p className="text-gray-700 text-xs font-medium">{user.city ?? "—"}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={onView}>
          <Eye className="h-3.5 w-3.5" /> View
        </Button>
        <Button
          variant="outline" size="sm"
          onClick={() => onToggleBlock(user.id)}
          className={`flex-1 gap-1.5 text-xs ${
            user.status === "active"
              ? "text-red-600 hover:bg-red-50 border-red-200"
              : "text-green-600 hover:bg-green-50 border-green-200"
          }`}
        >
          <Ban className="h-3.5 w-3.5" />
          {user.status === "active" ? "Block" : "Unblock"}
        </Button>
      </div>
    </div>
  );
}