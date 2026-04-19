// src/app/dashboard/admins/[id]/page.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAdmins } from "@/hooks/use-admins";

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

export default function AdminDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { admins, isLoading } = useAdmins();
  const admin = admins.find(a => a.id === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Admin not found</div>
      </div>
    );
  }

  const statusConfig = {
    active: { color: "bg-green-100 text-green-700", label: "Active" },
    inactive: { color: "bg-yellow-100 text-yellow-700", label: "Inactive" },
    suspended: { color: "bg-red-100 text-red-600", label: "Suspended" },
  };

  return (
    <div className="-m-4 md:-m-6 lg:-m-8 min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="py-4 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Admin Details</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">View admin information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-100">
            <div className="flex items-start gap-6">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {getInitials(admin.name)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{admin.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">ID: #{admin.id}</p>
                  </div>
                  <Badge className={statusConfig[admin.status].color}>
                    {statusConfig[admin.status].label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#1C1FC1]" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{admin.email || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{admin.phone || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#1C1FC1]" />
                Account Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Account Type</p>
                  <p className="font-medium capitalize">{admin.account_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium">{formatDate(admin.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Language</p>
                  <p className="font-medium">{admin.language.toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Location Info */}
            {(admin.address || admin.city || admin.country) && (
              <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl p-6 border border-gray-100 md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#1C1FC1]" />
                  Location
                </h3>
                <p className="text-gray-700">
                  {[admin.address, admin.city, admin.state, admin.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}