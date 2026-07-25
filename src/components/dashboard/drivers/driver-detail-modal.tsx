"use client";

import { useState, useEffect } from "react";
import { X, UserRound, Loader2, FileText, IdCard, Bike, Wallet } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { apiClient } from "@/lib/api-client";
import { logger } from "@/lib/logger";
import { Driver, DocumentStatus } from "@/types/dashboard/driver";
import { normaliseDriver } from "@/hooks/use-drivers";

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// Declared at module scope so they aren't recreated every render.
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

function PhotoLink({ label, url }: { label: string; url: string | null }) {
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

const rowJsx = (label: string, value: string | null) => (
  <div className="flex items-start justify-between gap-4 py-1.5">
    <span className="text-xs text-gray-400">{label}</span>
    <span className="text-xs font-medium text-gray-700 text-end break-all">{value ?? "—"}</span>
  </div>
);

interface Props {
  driver: Driver | null;
  onClose: () => void;
}

export default function DriverDetailModal({ driver, onClose }: Props) {
  if (!driver) return null;
  // Keyed by id so each driver gets fresh detail state on open.
  return <DriverDetailContent key={driver.id} driver={driver} onClose={onClose} />;
}

function DriverDetailContent({ driver, onClose }: { driver: Driver; onClose: () => void }) {
  const { t } = useLang();
  const [detail, setDetail] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Enrich the row with the full record (docs, plate, vehicle) on open.
  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<Record<string, unknown>>(`drivers/${driver.id}`)
      .then((raw) => {
        if (!cancelled) setDetail(normaliseDriver(raw ?? {}));
      })
      .catch((err) => logger.error("❌ fetchDriverDetail:", err))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [driver.id]);

  const d = detail ?? driver;

  const docCfg: Record<DocumentStatus, { label: string; cls: string }> = {
    approved:     { label: t("Verified", "موثّقة"),       cls: "bg-green-50 text-green-600 border border-green-200" },
    pending:      { label: t("Pending", "قيد المراجعة"),  cls: "bg-yellow-50 text-yellow-600 border border-yellow-200" },
    rejected:     { label: t("Rejected", "مرفوضة"),       cls: "bg-red-50 text-red-600 border border-red-200" },
    not_uploaded: { label: t("Missing", "غير مرفوعة"),    cls: "bg-gray-100 text-gray-500 border border-gray-200" },
  };
  const docCfgOf = (s: DocumentStatus | null) => (s ? docCfg[s] : null);
  const row = rowJsx;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 w-full bg-gradient-to-r from-[#1C1FC1] to-[#3E1596]" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50">
              <UserRound className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{d.name}</h3>
              <p className="text-xs text-gray-400">#{d.id}{d.fleet_name ? ` · ${d.fleet_name}` : ""}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4">
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t("Loading full details…", "جارٍ تحميل التفاصيل الكاملة…")}
            </div>
          )}

          <Section icon={UserRound} title={t("Personal", "البيانات الشخصية")}>
            {row(t("Phone", "الهاتف"), d.phone)}
            {row(t("Email", "البريد الإلكتروني"), d.email)}
            {row(t("City", "المدينة"), d.city)}
            {row(t("Address", "العنوان"), d.address)}
            {row(t("Fleet", "الشركة"), d.fleet_name)}
            {row(t("Status", "الحالة"), d.status)}
            {row(t("Joined", "تاريخ الانضمام"), formatDate(d.created_at))}
          </Section>

          <Section icon={Wallet} title={t("Wallet", "المحفظة")}>
            {row(t("Balance", "الرصيد"), d.wallet_balance != null ? `SAR ${d.wallet_balance.toLocaleString()}` : null)}
          </Section>

          <Section icon={IdCard} title={t("Driving License", "رخصة القيادة")}>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-gray-400">{t("Status", "الحالة")}</span>
              <DocBadge cfg={docCfgOf(d.license_status)} />
            </div>
            {row(t("Has License", "لديه رخصة"), d.has_license ? t("Yes", "نعم") : t("No", "لا"))}
            {row(t("License Number", "رقم الرخصة"), d.license_number)}
            {row(t("Expiry Date", "تاريخ الانتهاء"), formatDate(d.license_expiry))}
            <div className="flex flex-wrap gap-2 mt-2">
              <PhotoLink label={t("Front", "الأمامية")} url={d.license_photo_front_url} />
              <PhotoLink label={t("Back", "الخلفية")} url={d.license_photo_back_url} />
            </div>
          </Section>

          <Section icon={FileText} title={t("License Plate", "لوحة المركبة")}>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-gray-400">{t("Status", "الحالة")}</span>
              <DocBadge cfg={docCfgOf(d.plate_status)} />
            </div>
            {row(t("Plate Number", "رقم اللوحة"), d.plate_number)}
            <div className="flex flex-wrap gap-2 mt-2">
              <PhotoLink label={t("Plate Photo", "صورة اللوحة")} url={d.plate_photo_url} />
            </div>
          </Section>

          <Section icon={Bike} title={t("Assigned Vehicle", "المركبة المعيّنة")}>
            {d.assigned_vehicle ? (
              <>
                {row(t("Model", "الموديل"), d.assigned_vehicle.model)}
                {row(t("Device ID", "معرف الجهاز"), d.assigned_vehicle.device_id)}
                {row(t("Plate", "اللوحة"), d.assigned_vehicle.plate_number ?? d.motorcycle_plate)}
              </>
            ) : (
              <p className="text-xs text-gray-400 italic">{t("No vehicle assigned", "لا توجد مركبة معيّنة")}</p>
            )}
          </Section>

          <p className="text-[11px] text-gray-400">
            {t(
              "Read-only view. Drivers are managed from the Fleet Admin dashboard.",
              "عرض للقراءة فقط. إدارة السائقين تتم من لوحة تحكم الشركات."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
