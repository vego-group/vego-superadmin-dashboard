"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";
import { useLang } from "@/lib/language-context";
import type { StaffLike } from "./staff-detail-modal";

// Shared suspend/activate confirmation for the staff tables. `entityLabel`
// customises the copy (e.g. "Operator", "Sales member").
interface Props {
  member: StaffLike | null;
  entityLabel: string;
  isUpdating: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function StaffStatusModal({ member, entityLabel, isUpdating, onConfirm, onCancel }: Props) {
  const { t } = useLang();
  if (!member) return null;

  const isActive = member.status === "active";
  const actionLabel = isActive
    ? t(`Suspend ${entityLabel}`, "إيقاف")
    : t(`Activate ${entityLabel}`, "تفعيل");
  const warningText = isActive
    ? t("Are you sure you want to suspend this account? They will lose access.", "هل أنت متأكد من إيقاف هذا الحساب؟ سيفقد صلاحية الوصول.")
    : t("Are you sure you want to activate this account? They will regain access.", "هل أنت متأكد من تفعيل هذا الحساب؟ سيستعيد صلاحية الوصول.");

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className={`h-1 w-full bg-gradient-to-r ${isActive ? "from-red-600 to-orange-600" : "from-green-600 to-emerald-600"}`} />

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? "bg-red-50" : "bg-green-50"}`}>
              <AlertTriangle className={`h-4 w-4 ${isActive ? "text-red-600" : "text-green-600"}`} />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{actionLabel}</h3>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className={`p-3.5 rounded-xl border ${isActive ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
            <p className="text-sm text-gray-700 mb-2">{warningText}</p>
            <p className="text-xs text-gray-600">
              <span className="font-medium">{entityLabel}:</span> {member.name}
            </p>
            {member.email && (
              <p className="text-xs text-gray-600 mt-1">
                <span className="font-medium">{t("Email", "البريد الإلكتروني")}:</span> {member.email}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            disabled={isUpdating}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
          >
            {t("Cancel", "إلغاء")}
          </button>
          <button
            onClick={onConfirm}
            disabled={isUpdating}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50 ${
              isActive ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t(isActive ? "Suspending…" : "Activating…", isActive ? "جارٍ الإيقاف…" : "جارٍ التفعيل…")}
              </>
            ) : (
              actionLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
