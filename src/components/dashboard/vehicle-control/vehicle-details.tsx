"use client";

import {
  Bike, Battery, Gauge, MapPin, Building2, User, Route, Zap, AlertTriangle,
  Thermometer, Activity, Signal, Clock,
} from "lucide-react";
import { useLang } from "@/lib/language-context";
import VehicleMap from "./vehicle-map-client";
import type { SuperadminVehicle, VehicleBattery, VehicleStatistics } from "./types";

interface Props {
  vehicle: SuperadminVehicle | null;
  battery: VehicleBattery | null;
  statistics: VehicleStatistics | null;
  isLoading: boolean;
}

const statusCfg = (t: (en: string, ar: string) => string): Record<SuperadminVehicle["status"], { label: string; cls: string }> => ({
  active: { label: t("Active", "نشط"), cls: "bg-green-50 text-green-700 border-green-200" },
  charging: { label: t("Charging", "يشحن"), cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  idle: { label: t("Idle", "خامل"), cls: "bg-gray-50 text-gray-500 border-gray-200" },
  maintenance: { label: t("Maintenance", "صيانة"), cls: "bg-orange-50 text-orange-600 border-orange-200" },
});

const batteryColor = (lvl: number) => (lvl >= 60 ? "bg-green-500" : lvl >= 30 ? "bg-yellow-500" : "bg-red-500");

function Stat({ icon: Icon, label, value }: { icon: typeof Route; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
      <div className="flex items-center gap-1.5 text-gray-400">
        <Icon className="h-3.5 w-3.5" />
        <p className="text-[10px] uppercase tracking-wide font-medium">{label}</p>
      </div>
      <p className="text-lg font-semibold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

export default function VehicleDetails({ vehicle, battery, statistics, isLoading }: Props) {
  const { t } = useLang();

  if (!vehicle) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col items-center justify-center text-center p-12 text-gray-400">
        <Bike className="h-10 w-10 mb-3 text-gray-300" />
        <p className="text-sm">{t("Select a vehicle to view details", "اختر مركبة لعرض التفاصيل")}</p>
      </div>
    );
  }

  const sc = statusCfg(t)[vehicle.status];
  const level = battery?.level ?? vehicle.batteryLevel;
  const range = battery?.rangeKm ?? vehicle.estimatedRangeKm;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600 shrink-0" />

      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Bike className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{vehicle.plateNumber}</h2>
              <p className="text-xs text-gray-500">{vehicle.model || t("Electric Vehicle", "مركبة كهربائية")}</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sc.cls}`}>
            {sc.label}
          </span>
        </div>

        {/* Owner / source */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 flex items-center gap-3">
          {vehicle.ownerType === "corporate_driver" ? (
            <Building2 className="h-5 w-5 text-indigo-500 shrink-0" />
          ) : (
            <User className="h-5 w-5 text-indigo-500 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">{t("Owner", "المالك")}</p>
            <p className="text-sm font-medium text-gray-800 truncate">
              {vehicle.ownerName || (vehicle.ownerType === "individual" ? t("Individual User", "مستخدم فرد") : t("Unassigned", "غير معيّن"))}
              {vehicle.companyName && vehicle.companyName !== vehicle.ownerName ? (
                <span className="text-gray-400"> · {vehicle.companyName}</span>
              ) : null}
            </p>
          </div>
        </div>

        {/* Battery */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Battery className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">{t("Battery", "البطارية")}</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">{level}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${batteryColor(level)} transition-all`} style={{ width: `${level}%` }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            <Stat icon={Route} label={t("Range", "المدى")} value={`${range} km`} />
            <Stat icon={Activity} label={t("SoH", "الصحة")} value={battery ? `${battery.sohPct}%` : "—"} />
            <Stat icon={Zap} label={t("Voltage", "الجهد")} value={battery ? `${battery.voltage} V` : "—"} />
            <Stat icon={Thermometer} label={t("Temp", "الحرارة")} value={battery ? `${battery.temperature}°C` : "—"} />
          </div>
        </div>

        {/* Statistics */}
        <div>
          <div className="flex items-center gap-1.5 text-gray-500 mb-2">
            <Gauge className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">{t("Statistics", "الإحصائيات")}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat icon={Route} label={t("Trips", "الرحلات")} value={statistics?.trips ?? "—"} />
            <Stat icon={Battery} label={t("Swaps", "التبديلات")} value={statistics?.swaps ?? "—"} />
            <Stat icon={AlertTriangle} label={t("Alarms", "الإنذارات")} value={statistics?.alarms ?? "—"} />
            <Stat icon={Route} label={t("Distance", "المسافة")} value={`${statistics?.totalDistanceKm ?? vehicle.totalDistanceKm} km`} />
          </div>
          {isLoading && <p className="text-[11px] text-gray-400 mt-2">{t("Refreshing live data…", "جارٍ تحديث البيانات…")}</p>}
        </div>

        {/* Live info */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Stat icon={Gauge} label={t("Speed", "السرعة")} value={`${vehicle.currentSpeedKmh} km/h`} />
          <Stat icon={Signal} label={t("GPS", "الموقع")} value={t(vehicle.gpsSignal, vehicle.gpsSignal)} />
          <Stat icon={Clock} label={t("Last Trip", "آخر رحلة")} value={vehicle.lastTripAt ? new Date(vehicle.lastTripAt).toLocaleDateString() : "—"} />
        </div>

        {/* Location + map */}
        <div>
          <div className="flex items-center gap-1.5 text-gray-500 mb-2">
            <MapPin className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">{t("Location", "الموقع")}</span>
          </div>
          <p className="text-sm text-gray-700 mb-2">{vehicle.location}</p>
          <VehicleMap vehicle={vehicle} />
        </div>
      </div>
    </div>
  );
}
