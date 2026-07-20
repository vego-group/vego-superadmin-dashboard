"use client";

import { useState } from "react";
import {
  Power, Lock, Unlock, Gauge, OctagonAlert, UserPlus, UserMinus, Loader2,
  CheckCircle2, AlertCircle, SlidersHorizontal,
} from "lucide-react";
import { useLang } from "@/lib/language-context";
import type { SuperadminVehicle, SuperadminDriver } from "./types";

interface Props {
  vehicle: SuperadminVehicle | null;
  drivers: SuperadminDriver[];
  onPower: (next: boolean) => Promise<boolean>;
  onLock: () => Promise<boolean>;
  onSpeedLimit: (kmh: number) => Promise<boolean>;
  onEmergencyStop: () => Promise<boolean>;
  onAssignDriver: (driverId: string) => Promise<boolean>;
  onUnassignDriver: () => Promise<boolean>;
}

type Feedback = { type: "ok" | "err"; msg: string } | null;

export default function ControlPanel({
  vehicle, drivers, onPower, onLock, onSpeedLimit, onEmergencyStop, onAssignDriver, onUnassignDriver,
}: Props) {
  const { t } = useLang();
  const [selectedDriver, setSelectedDriver] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [speedDraft, setSpeedDraft] = useState(vehicle?.speedLimitKmh ?? 45);

  // Reset the panel when the vehicle (or its live speed limit) changes —
  // render-time state adjustment instead of an effect, per React guidance.
  const [syncKey, setSyncKey] = useState("");
  const nextSyncKey = `${vehicle?.id ?? ""}:${vehicle?.speedLimitKmh ?? 45}`;
  if (syncKey !== nextSyncKey) {
    setSyncKey(nextSyncKey);
    setSelectedDriver("");
    setFeedback(null);
    setSpeedDraft(vehicle?.speedLimitKmh ?? 45);
  }

  if (!vehicle) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col items-center justify-center text-center p-12 text-gray-400">
        <SlidersHorizontal className="h-10 w-10 mb-3 text-gray-300" />
        <p className="text-sm">{t("Vehicle controls appear here", "تظهر أدوات التحكم هنا")}</p>
      </div>
    );
  }

  /** Runs an async control action with shared busy + feedback handling. */
  const run = async (key: string, fn: () => Promise<boolean>, okMsg: string, errMsg: string) => {
    setBusy(key);
    setFeedback(null);
    const ok = await fn();
    setFeedback(ok ? { type: "ok", msg: okMsg } : { type: "err", msg: errMsg });
    setBusy(null);
    return ok;
  };

  const handleAssign = async () => {
    if (!selectedDriver) return;
    const ok = await run(
      "assign",
      () => onAssignDriver(selectedDriver),
      t("Driver assigned successfully", "تم تعيين السائق بنجاح"),
      t("Failed to assign driver", "فشل تعيين السائق")
    );
    if (ok) setSelectedDriver("");
  };

  const commitSpeed = async (kmh: number) => {
    if (kmh === vehicle.speedLimitKmh) return;
    const ok = await run(
      "speed",
      () => onSpeedLimit(kmh),
      t("Speed limit updated", "تم تحديث حد السرعة"),
      t("Failed to update speed limit", "فشل تحديث حد السرعة")
    );
    if (!ok) setSpeedDraft(vehicle.speedLimitKmh); // revert on failure
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600 shrink-0" />

      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{t("Control Panel", "لوحة التحكم")}</h3>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{vehicle.plateNumber}</p>
        </div>

        {/* Controls need a linked IoT device — actions target /iot-devices/{imei}/… */}
        {!vehicle.deviceImei && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            {t(
              "No IoT device linked to this vehicle — control actions won't work until one is assigned.",
              "لا يوجد جهاز IoT مرتبط بهذه المركبة — أوامر التحكم لن تعمل حتى يتم ربط جهاز."
            )}
          </div>
        )}

        {/* Power & Lock */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() =>
              run(
                "power",
                () => onPower(!vehicle.isEngineRunning),
                t("Engine state updated", "تم تحديث حالة المحرك"),
                t("Failed to update engine", "فشل تحديث المحرك")
              )
            }
            disabled={!vehicle.deviceImei || busy === "power"}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition disabled:opacity-60 ${
              vehicle.isEngineRunning
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
            }`}
          >
            {busy === "power" ? <Loader2 className="h-6 w-6 animate-spin" /> : <Power className="h-6 w-6" />}
            <span className="text-xs font-semibold">
              {vehicle.isEngineRunning ? t("Engine On", "المحرك يعمل") : t("Engine Off", "المحرك متوقف")}
            </span>
          </button>

          <button
            onClick={() =>
              run(
                "lock",
                onLock,
                t("Unlock command sent", "تم إرسال أمر فتح القفل"),
                t("Failed to send unlock command", "فشل إرسال أمر فتح القفل")
              )
            }
            disabled={!vehicle.deviceImei || busy === "lock"}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition disabled:opacity-60 ${
              vehicle.isLocked
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {busy === "lock" ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : vehicle.isLocked ? (
              <Lock className="h-6 w-6" />
            ) : (
              <Unlock className="h-6 w-6" />
            )}
            <span className="text-xs font-semibold">{vehicle.isLocked ? t("Locked", "مقفل") : t("Unlocked", "مفتوح")}</span>
          </button>
        </div>

        {/* Speed limit */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Gauge className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">{t("Speed Limit", "حد السرعة")}</span>
            </div>
            <span className="text-sm font-semibold text-indigo-600 flex items-center gap-1">
              {busy === "speed" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {speedDraft} km/h
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={80}
            step={5}
            value={speedDraft}
            disabled={!vehicle.deviceImei || busy === "speed"}
            onChange={(e) => setSpeedDraft(Number(e.target.value))}
            onMouseUp={(e) => commitSpeed(Number((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => commitSpeed(Number((e.target as HTMLInputElement).value))}
            onKeyUp={(e) => commitSpeed(Number((e.target as HTMLInputElement).value))}
            className="w-full accent-indigo-600 cursor-pointer disabled:opacity-60"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>10</span>
            <span>80</span>
          </div>
        </div>

        {/* Emergency stop */}
        <button
          onClick={() =>
            run(
              "emergency",
              onEmergencyStop,
              t("Emergency stop triggered", "تم تفعيل الإيقاف الطارئ"),
              t("Failed to trigger emergency stop", "فشل تفعيل الإيقاف الطارئ")
            )
          }
          disabled={!vehicle.deviceImei || busy === "emergency"}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-60"
        >
          {busy === "emergency" ? <Loader2 className="h-4 w-4 animate-spin" /> : <OctagonAlert className="h-4 w-4" />}
          {t("Emergency Stop", "إيقاف طارئ")}
        </button>

        {/* Driver assignment */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t("Driver Assignment", "تعيين السائق")}
          </span>

          {vehicle.assignedDriverName ? (
            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
                  {vehicle.assignedDriverName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{vehicle.assignedDriverName}</p>
                  <p className="text-[10px] text-gray-400">{t("Current driver", "السائق الحالي")}</p>
                </div>
              </div>
              <button
                onClick={() =>
                  run(
                    "unassign",
                    onUnassignDriver,
                    t("Driver unassigned", "تم إلغاء تعيين السائق"),
                    t("Failed to unassign driver", "فشل إلغاء التعيين")
                  )
                }
                disabled={busy === "unassign"}
                className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-50 shrink-0"
              >
                {busy === "unassign" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserMinus className="h-3.5 w-3.5" />}
                {t("Unassign", "إلغاء")}
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">{t("No driver assigned", "لا يوجد سائق معيّن")}</p>
          )}

          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:border-indigo-300 cursor-pointer"
          >
            <option value="">{t("Select a driver…", "اختر سائقاً…")}</option>
            {drivers
              .filter((d) => d.id !== vehicle.assignedDriverId)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                  {d.companyName ? ` · ${d.companyName}` : ""}
                </option>
              ))}
          </select>

          <button
            onClick={handleAssign}
            disabled={!selectedDriver || busy === "assign"}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
            style={{ backgroundColor: "#1C1FC1" }}
          >
            {busy === "assign" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {t("Assign Driver", "تعيين السائق")}
          </button>

          {feedback && (
            <div
              className={`flex items-start gap-2 rounded-xl border p-2.5 text-xs ${
                feedback.type === "ok"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-600"
              }`}
            >
              {feedback.type === "ok" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{feedback.msg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
