"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, Shield, CheckCircle, XCircle } from "lucide-react";
import { useLang } from "@/lib/language-context";

// Shared "… Details" modal, styled like the Admins detail view, used across the
// staff tables (Admins / SuperAdmins / Sales / Operators) so every View looks
// identical. Accepts any staff-like record.
export interface StaffLike {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at?: string;
  language?: string;
  phone_verified?: boolean;
  account_type?: string | null;
  email_verified_at?: string | null;
}

interface Props {
  member: StaffLike | null;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function StaffDetailModal({ member, title, isOpen, onClose }: Props) {
  const { t } = useLang();
  if (!member) return null;

  const statusConfig = {
    active:    { color: "bg-green-100 text-green-700",   icon: CheckCircle, label: t("Active",    "نشط")     },
    inactive:  { color: "bg-yellow-100 text-yellow-700", icon: XCircle,     label: t("Inactive",  "غير نشط") },
    suspended: { color: "bg-red-100 text-red-600",       icon: XCircle,     label: t("Suspended", "موقوف")   },
  };

  const StatusIcon = statusConfig[member.status].icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {getInitials(member.name)}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
              <p className="text-sm text-gray-500">ID: #{member.id}</p>
              <div className="flex gap-2 mt-2">
                <Badge className={statusConfig[member.status].color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig[member.status].label}
                </Badge>
                {member.account_type && <Badge variant="outline">{member.account_type}</Badge>}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {t("Contact Information", "معلومات التواصل")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">{t("Email", "البريد الإلكتروني")}</p>
                  <p className="text-sm font-medium">{member.email || t("Not provided", "غير متوفر")}</p>
                  {member.email_verified_at && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      {t("Verified", "موثق")} {formatDate(member.email_verified_at)}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">{t("Phone", "الهاتف")}</p>
                  <p className="text-sm font-medium">{member.phone || t("Not provided", "غير متوفر")}</p>
                  {member.phone_verified && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      {t("Verified", "موثق")}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t("Account Information", "معلومات الحساب")}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">{t("Created", "تاريخ الإنشاء")}</p>
                <p className="text-sm font-medium">{formatDate(member.created_at)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">{t("Last Updated", "آخر تحديث")}</p>
                <p className="text-sm font-medium">{formatDate(member.updated_at)}</p>
              </div>
              {member.language && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">{t("Language", "اللغة")}</p>
                  <p className="text-sm font-medium">{member.language.toUpperCase()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
