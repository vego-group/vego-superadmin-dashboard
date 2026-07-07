"use client";

import { useState, useEffect } from "react";
import { X, UserRound, Loader2 } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { apiClient } from "@/lib/api-client";
import { logger } from "@/lib/logger";
import { Driver } from "@/types/dashboard/driver";
import { normaliseDriver } from "@/hooks/use-drivers";

const formatDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

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

  // Enrich the row with the full record (wallet, trips, motorcycle) on open.
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

  const docLabel: Record<string, string> = {
    verified: t("Verified", "موثّقة"),
    pending: t("Pending", "قيد المراجعة"),
    rejected: t("Rejected", "مرفوضة"),
    not_uploaded: t("Missing", "غير مرفوعة"),
  };

  const row = (label: string, value: string | null) => (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-xs font-medium text-gray-700 text-end">{value ?? "—"}</span>
    </div>
  );

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
              <p className="text-xs text-gray-400">#{d.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[65vh] overflow-y-auto">
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t("Loading full details…", "جارٍ تحميل التفاصيل الكاملة…")}
            </div>
          )}
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            {row(t("Phone", "الهاتف"), d.phone)}
            {row(t("Email", "البريد الإلكتروني"), d.email)}
            {row(t("Fleet", "الشركة"), d.fleet_name)}
            {row(t("Status", "الحالة"), d.status)}
            {row(
              t("Wallet Balance", "رصيد المحفظة"),
              d.wallet_balance != null ? `SAR ${d.wallet_balance.toLocaleString()}` : null
            )}
            {row(t("Trips", "الرحلات"), d.trips_count != null ? String(d.trips_count) : null)}
            {row(t("Motorcycle", "الدراجة"), d.motorcycle_plate)}
            {row(t("License", "الرخصة"), d.license_status ? docLabel[d.license_status] : null)}
            {row(t("Vehicle Plate", "لوحة المركبة"), d.plate_status ? docLabel[d.plate_status] : null)}
            {row(t("Joined", "تاريخ الانضمام"), formatDate(d.created_at))}
          </div>
          <p className="text-[11px] text-gray-400 mt-3">
            {t(
              "Read-only view. Drivers are managed from the Fleet Admin dashboard; documents are reviewed from Driving Licenses / Vehicle Plates.",
              "عرض للقراءة فقط. إدارة السائقين تتم من لوحة تحكم الشركات، ومراجعة المستندات من صفحات الرخص واللوحات."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
