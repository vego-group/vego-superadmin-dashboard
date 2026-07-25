"use client";

import { useState } from "react";
import { X, Unlink, Loader2, AlertCircle, CheckCircle2, Building2, User } from "lucide-react";
import { Motorcycle, getAssignment } from "./types";
import { apiClient, ApiError } from "@/lib/api-client";
import { useLang } from "@/lib/language-context";

interface Props {
  motorcycle: Motorcycle;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UnassignModal({ motorcycle, onClose, onSuccess }: Props) {
  const { t, lang } = useLang();
  const isRtl = lang === "ar";
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);

  const kind = getAssignment(motorcycle); // "company" | "individual" | "unassigned"
  const isCompany = kind === "company";
  const target = isCompany
    ? (motorcycle.fleet_name || `#${motorcycle.fleet_id}`)
    : (motorcycle.assigned_user?.name || t("driver", "السائق"));

  const handleUnassign = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Unified release — the backend only exposes POST on these routes (DELETE
      // on fleets/{id}/motorcycles is not supported). One endpoint releases the
      // motorcycle whether it was held by a fleet or an individual driver.
      await apiClient.post(`motorcycles/${motorcycle.id}/unassign`);
      setSuccess(true);
      setTimeout(onSuccess, 900);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("Failed to unassign motorcycle", "فشل إلغاء تعيين الدراجة"));
    } finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div dir={isRtl ? "rtl" : "ltr"} className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-red-500" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center"><Unlink className="h-4 w-4 text-orange-600" /></div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{t("Unassign Motorcycle", "إلغاء تعيين الدراجة")}</h3>
              <p className="text-xs text-gray-400 font-mono">{motorcycle.device_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"><X className="h-4 w-4" /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
            {isCompany ? <Building2 className="h-4 w-4 text-gray-400 shrink-0" /> : <User className="h-4 w-4 text-gray-400 shrink-0" />}
            <p className="text-sm text-gray-600">
              {t("Currently assigned to", "مسندة حالياً إلى")} <span className="font-semibold text-gray-800">{target}</span>
            </p>
          </div>
          <p className="text-sm text-gray-500">
            {t("This will release the motorcycle back to the unassigned pool. Its battery stays attached.",
               "هيتم إرجاع الدراجة إلى قائمة غير المسندة. البطارية هتفضل متصلة بيها.")}
          </p>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />{t("Motorcycle unassigned successfully!", "تم إلغاء التعيين بنجاح!")}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
            {t("Cancel", "إلغاء")}
          </button>
          <button onClick={handleUnassign} disabled={isSaving || success}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50">
            {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" />{t("Unassigning…", "جارٍ الإلغاء…")}</> : <><Unlink className="h-4 w-4" />{t("Unassign", "إلغاء التعيين")}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
