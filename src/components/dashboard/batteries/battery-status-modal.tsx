"use client";

import { useState } from "react";
import { AlertTriangle, Flag, RotateCcw, Loader2, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Battery, BatteryLifecycleStatus, UpdateBatteryStatusPayload } from "@/types/dashboard/battery";
import { apiErrorMessage } from "./battery-api";
import LifecycleBadge from "./lifecycle-badge";
import { useLang } from "@/lib/language-context";

export type LifecycleAction = "flag" | "retire" | "reinstate";

interface Props {
  // Minimal shape so both list rows (Battery) and the history snapshot work here.
  battery: Pick<Battery, "battery_id" | "lifecycle_status">;
  action: LifecycleAction;
  onSubmit: (payload: UpdateBatteryStatusPayload) => Promise<unknown>;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BatteryStatusModal({ battery, action, onSubmit, onClose, onSuccess }: Props) {
  const { t } = useLang();
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const cfg: Record<LifecycleAction, {
    target: BatteryLifecycleStatus;
    reasonRequired: boolean;
    title: string;
    warning: string;
    gradient: string;
    iconBg: string;
    iconColor: string;
    confirmCls: string;
    confirmLabel: string;
    busyLabel: string;
    Icon: typeof AlertTriangle;
  }> = {
    retire: {
      target: "retired",
      reasonRequired: true,
      title: t("Retire / Decommission Battery", "إخراج البطارية من الخدمة"),
      warning: t(
        "This battery will be permanently excluded from the swap pool. A reason is required and will be recorded in the audit log.",
        "سيتم استبعاد هذه البطارية نهائياً من مجموعة التبديل. السبب مطلوب وسيتم تسجيله في سجل التدقيق."
      ),
      gradient: "from-red-600 to-orange-600",
      iconBg: "bg-red-50", iconColor: "text-red-600",
      confirmCls: "bg-red-500 hover:bg-red-600",
      confirmLabel: t("Retire Battery", "إخراج من الخدمة"),
      busyLabel: t("Retiring…", "جارٍ الإخراج…"),
      Icon: AlertTriangle,
    },
    flag: {
      target: "under_review",
      reasonRequired: true,
      title: t("Flag Battery for Review", "وضع البطارية قيد المراجعة"),
      warning: t(
        "This battery will be pulled out of the swap pool while it is investigated. A reason is required.",
        "سيتم سحب هذه البطارية من مجموعة التبديل أثناء فحصها. السبب مطلوب."
      ),
      gradient: "from-yellow-500 to-orange-500",
      iconBg: "bg-yellow-50", iconColor: "text-yellow-600",
      confirmCls: "bg-yellow-500 hover:bg-yellow-600",
      confirmLabel: t("Flag for Review", "وضع قيد المراجعة"),
      busyLabel: t("Flagging…", "جارٍ التحديث…"),
      Icon: Flag,
    },
    reinstate: {
      target: "active",
      reasonRequired: false,
      title: t("Reinstate Battery", "إعادة البطارية للخدمة"),
      warning: t(
        "This battery will return to the swap-eligible pool. Adding a reason (e.g. passed inspection) is optional but recommended.",
        "ستعود هذه البطارية إلى مجموعة التبديل. إضافة سبب (مثل اجتياز الفحص) اختيارية لكنها موصى بها."
      ),
      gradient: "from-green-600 to-emerald-600",
      iconBg: "bg-green-50", iconColor: "text-green-600",
      confirmCls: "bg-green-600 hover:bg-green-700",
      confirmLabel: t("Reinstate", "إعادة للخدمة"),
      busyLabel: t("Reinstating…", "جارٍ الإعادة…"),
      Icon: RotateCcw,
    },
  };

  const c = cfg[action];
  const Icon = c.Icon;
  const reasonMissing = c.reasonRequired && !reason.trim();

  const handleConfirm = async () => {
    if (reasonMissing) {
      setError(t("A reason is required for this action.", "السبب مطلوب لهذا الإجراء."));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const trimmed = reason.trim();
      await onSubmit({ lifecycle_status: c.target, ...(trimmed ? { reason: trimmed } : {}) });
      setSuccess(true);
      setTimeout(() => onSuccess(), 900);
    } catch (err) {
      // Includes the backend's 422 no-op message ("already in this status").
      setError(apiErrorMessage(err, t("Failed to update battery status", "فشل تحديث حالة البطارية")));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className={`h-1 w-full bg-gradient-to-r ${c.gradient}`} />

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.iconBg}`}>
              <Icon className={`h-4 w-4 ${c.iconColor}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{c.title}</h3>
              <p className="text-xs text-gray-400 font-mono">{battery.battery_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <LifecycleBadge status={battery.lifecycle_status} />
            <span>→</span>
            <LifecycleBadge status={c.target} />
          </div>

          <p className="text-sm text-gray-700">{c.warning}</p>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              {t("Reason", "السبب")}
              {c.reasonRequired
                ? <span className="text-red-500 ml-1">*</span>
                : <span className="text-gray-400 ml-1">({t("optional", "اختياري")})</span>}
            </label>
            <textarea
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(null); }}
              rows={3}
              placeholder={t("e.g. Swollen cells detected on return", "مثال: تم اكتشاف انتفاخ في الخلايا عند الإرجاع")}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-indigo-300 transition resize-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />{t("Battery status updated!", "تم تحديث حالة البطارية!")}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50">
            {t("Cancel", "إلغاء")}
          </button>
          <button onClick={handleConfirm} disabled={isLoading || success || reasonMissing}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50 ${c.confirmCls}`}>
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />{c.busyLabel}</> : c.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
