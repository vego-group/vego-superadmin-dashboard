// src/components/dashboard/users/user-details-modal.tsx

import { useLang } from "@/lib/language-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Phone, MapPin, Calendar, Hash } from "lucide-react";
import { User } from "@/hooks/use-users";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const formatDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  });
};

// ─── Row ──────────────────────────────────────────────────────────────────────
const DetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
    <div className="p-1.5 bg-gray-100 rounded-lg flex-shrink-0">
      <Icon className="h-3.5 w-3.5 text-gray-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 font-medium mt-0.5 break-all">
        {value ?? "—"}
      </p>
    </div>
  </div>
);

// ─── Props ────────────────────────────────────────────────────────────────────
interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  const { t } = useLang();
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>t("User Details", "تفاصيل المستخدم")</DialogTitle>
        </DialogHeader>

        {/* Avatar + Name */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {getInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">#{user.id}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
            user.status === t("Active",       "نشط")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}>
            {user.status === t("Active", "نشط") ? t("Active", "نشط") : t("Blocked", "محظور")}
          </span>
        </div>

        {/* Detail Rows */}
        <div className="mt-1">
          <DetailRow icon={Hash}      label={t("User ID", "معرف المستخدم")}   value={user.id} />
          <DetailRow icon={Mail}      label={t("Email", "البريد الإلكتروني")}     value={user.email} />
          <DetailRow icon={Phone}     label={t("Phone", "الهاتف")}     value={user.phone} />
          <DetailRow icon={MapPin}    label={t("City", "المدينة")}      value={user.city} />
          <DetailRow icon={MapPin}    label={t("Address", "العنوان")}   value={user.address} />
          <DetailRow icon={Calendar}  label={t("Joined", "تاريخ الانضمام")}    value={formatDate(user.created_at)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}