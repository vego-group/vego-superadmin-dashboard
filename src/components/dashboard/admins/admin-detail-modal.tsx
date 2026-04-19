// src/components/dashboard/admins/admin-detail-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Admin } from "@/types/dashboard/admin";
import { Mail, Phone, MapPin, Calendar, Shield, CheckCircle, XCircle } from "lucide-react";

interface AdminDetailModalProps {
  admin: Admin | null;
  isOpen: boolean;
  onClose: () => void;
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

export default function AdminDetailModal({ admin, isOpen, onClose }: AdminDetailModalProps) {
  if (!admin) return null;

  const statusConfig = {
    active: { color: "bg-green-100 text-green-700", icon: CheckCircle },
    inactive: { color: "bg-yellow-100 text-yellow-700", icon: XCircle },
    suspended: { color: "bg-red-100 text-red-600", icon: XCircle },
  };

  const StatusIcon = statusConfig[admin.status].icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Admin Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {getInitials(admin.name)}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{admin.name}</h3>
              <p className="text-sm text-gray-500">ID: #{admin.id}</p>
              <div className="flex gap-2 mt-2">
                <Badge className={statusConfig[admin.status].color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                </Badge>
                <Badge variant="outline">{admin.account_type}</Badge>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium">{admin.email || "Not provided"}</p>
                  {admin.email_verified_at && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      Verified {formatDate(admin.email_verified_at)}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium">{admin.phone || "Not provided"}</p>
                  {admin.phone_verified && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          {(admin.address || admin.city || admin.country) && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </h4>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">
                  {[admin.address, admin.city, admin.state, admin.country]
                    .filter(Boolean)
                    .join(", ") || "No location provided"}
                </p>
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Account Information
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm font-medium">{formatDate(admin.created_at)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="text-sm font-medium">{formatDate(admin.updated_at)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Language</p>
                <p className="text-sm font-medium">{admin.language.toUpperCase()}</p>
              </div>
              {admin.fleet_id && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Fleet ID</p>
                  <p className="text-sm font-medium">#{admin.fleet_id}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}