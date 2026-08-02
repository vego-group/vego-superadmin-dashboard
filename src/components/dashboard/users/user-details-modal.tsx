// src/components/dashboard/users/user-details-modal.tsx

import { useState, useEffect } from "react";
import { useLang } from "@/lib/language-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Phone, MapPin, Calendar, Hash, IdCard, FileText, Bike, Wallet, Loader2, UserRound } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { logger } from "@/lib/logger";
import { User, UserDetail, LicenseStatus, normaliseUserDetail } from "@/hooks/use-users";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/format-date";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

// ─── Module-scope presentational helpers (not recreated each render) ────────────
function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="h-3.5 w-3.5 text-gray-400" />
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
      </div>
      <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">{children}</div>
    </div>
  );
}

function DocBadge({ cfg }: { cfg: { label: string; cls: string } | null }) {
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg?.cls ?? "bg-gray-100 text-gray-400"}`}>{cfg?.label ?? "—"}</span>;
}

function PhotoLink({ label, url }: { label: string; url: string | null | undefined }) {
  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 text-[11px] font-medium hover:bg-indigo-50 transition">
      <FileText className="h-3.5 w-3.5" /> {label}
    </a>
  ) : (
    <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-100 text-gray-300 text-[11px]">
      <FileText className="h-3.5 w-3.5" /> {label}
    </span>
  );
}

const rowJsx = (label: string, value: string | null | undefined) => (
  <div className="flex items-start justify-between gap-4 py-1.5">
    <span className="text-xs text-gray-400">{label}</span>
    <span className="text-xs font-medium text-gray-700 text-end break-all">{value ?? "—"}</span>
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("Individual Driver", "سائق فردي")}</DialogTitle>
        </DialogHeader>
        {/* Keyed by id → fresh fetch state per user without resetting in an effect. */}
        {user && <UserDetailBody key={user.id} user={user} />}
      </DialogContent>
    </Dialog>
  );
}

function UserDetailBody({ user }: { user: User }) {
  const { t, lang } = useLang();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the full individual profile (license, plate, vehicle, wallet) on open.
  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<Record<string, unknown>>(`users/${user.id}`)
      .then((raw) => { if (!cancelled) setDetail(normaliseUserDetail(raw ?? {})); })
      .catch((err) => logger.error("❌ fetchUserDetail:", err))
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [user.id]);

  const d = detail;

  const docCfg: Record<LicenseStatus, { label: string; cls: string }> = {
    approved:     { label: t("Verified", "موثّقة"),       cls: "bg-green-50 text-green-600 border border-green-200" },
    pending:      { label: t("Pending", "قيد المراجعة"),  cls: "bg-yellow-50 text-yellow-600 border border-yellow-200" },
    rejected:     { label: t("Rejected", "مرفوضة"),       cls: "bg-red-50 text-red-600 border border-red-200" },
    not_uploaded: { label: t("Missing", "غير مرفوعة"),    cls: "bg-gray-100 text-gray-500 border border-gray-200" },
  };
  const docCfgOf = (s: LicenseStatus | null | undefined) => (s ? docCfg[s] : null);
  const row = rowJsx;

  const isActive = user.status === "active";

  return (
    <>
      {/* Avatar + Name */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
          {getInitials(user.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">#{user.id}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
          {isActive ? t("Active", "نشط") : t("Blocked", "محظور")}
        </span>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("Loading full details…", "جارٍ تحميل التفاصيل الكاملة…")}
        </div>
      )}

      <div className="space-y-4 mt-1">
        <Section icon={UserRound} title={t("Personal", "البيانات الشخصية")}>
            <DetailRow icon={Hash}     label={t("User ID", "معرف المستخدم")} value={user.id} />
            <DetailRow icon={Mail}     label={t("Email", "البريد الإلكتروني")} value={user.email} />
            <DetailRow icon={Phone}    label={t("Phone", "الهاتف")}          value={user.phone} />
            <DetailRow icon={MapPin}   label={t("City", "المدينة")}           value={user.city} />
            <DetailRow icon={MapPin}   label={t("Address", "العنوان")}        value={user.address} />
            <DetailRow icon={Calendar} label={t("Joined", "تاريخ الانضمام")}  value={formatDate(user.created_at, lang)} />
          </Section>

          <Section icon={Wallet} title={t("Wallet", "المحفظة")}>
            {row(t("Balance", "الرصيد"), d?.wallet_balance != null ? formatMoney(d.wallet_balance) : null)}
          </Section>

          <Section icon={IdCard} title={t("Driving License", "رخصة القيادة")}>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-gray-400">{t("Status", "الحالة")}</span>
              <DocBadge cfg={docCfgOf(d?.license_status)} />
            </div>
            {row(t("Has License", "لديه رخصة"), d ? (d.has_license ? t("Yes", "نعم") : t("No", "لا")) : null)}
            {row(t("License Number", "رقم الرخصة"), d?.license_number)}
            {row(t("Expiry Date", "تاريخ الانتهاء"), d ? formatDate(d.license_expiry, lang) : null)}
            <div className="flex flex-wrap gap-2 mt-2">
              <PhotoLink label={t("Front", "الأمامية")} url={d?.license_photo_front_url} />
              <PhotoLink label={t("Back", "الخلفية")} url={d?.license_photo_back_url} />
            </div>
          </Section>

          <Section icon={FileText} title={t("License Plate", "لوحة المركبة")}>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-gray-400">{t("Status", "الحالة")}</span>
              <DocBadge cfg={docCfgOf(d?.plate_status)} />
            </div>
            {row(t("Plate Number", "رقم اللوحة"), d?.plate_number)}
            <div className="flex flex-wrap gap-2 mt-2">
              <PhotoLink label={t("Plate Photo", "صورة اللوحة")} url={d?.plate_photo_url} />
            </div>
          </Section>

          <Section icon={Bike} title={t("Assigned Motorcycle", "الدراجة المعيّنة")}>
            {d?.assigned_motorcycle ? (
              <>
                {row(t("Device ID", "معرف الجهاز"), d.assigned_motorcycle.device_id)}
                {row(t("Plate", "اللوحة"), d.assigned_motorcycle.plate_number)}
              </>
            ) : (
              <p className="text-xs text-gray-400 italic">{t("No motorcycle assigned", "لا توجد دراجة معيّنة")}</p>
            )}
          </Section>
      </div>
    </>
  );
}

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
  <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
    <div className="p-1.5 bg-white rounded-lg flex-shrink-0 border border-gray-100">
      <Icon className="h-3.5 w-3.5 text-gray-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 font-medium mt-0.5 break-all">{value ?? "—"}</p>
    </div>
  </div>
);
