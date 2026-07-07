"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { User } from "@/hooks/use-users";

interface Props {
  user: User | null;
  isBlocking: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function BlockConfirmModal({ user, isBlocking, onConfirm, onCancel }: Props) {
  const { t } = useLang();

  if (!user) return null;

  const isCurrentlyActive = user.status === "active";
  const actionLabel = isCurrentlyActive ? t("Block User", "حظر المستخدم") : t("Unblock User", "رفع حظر المستخدم");
  const warningText = isCurrentlyActive
    ? t("Are you sure you want to block this user? They will not be able to access the system.", "هل أنت متأكد من رغبتك في حظر هذا المستخدم؟ لن يتمكن من الوصول للنظام.")
    : t("Are you sure you want to unblock this user? They will be able to access the system again.", "هل أنت متأكد من رغبتك في رفع حظر هذا المستخدم؟ سيتمكن من الوصول للنظام مرة أخرى.");

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 w-full bg-gradient-to-r from-red-600 to-orange-600" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{actionLabel}</h3>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-gray-700 mb-2">{warningText}</p>
            <p className="text-xs text-gray-600">
              <span className="font-medium">{t("User", "المستخدم")}:</span> {user.name}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              <span className="font-medium">{t("Email", "البريد الإلكتروني")}:</span> {user.email}
            </p>
            <p className="text-[12px] text-red-600 mt-2 font-medium">
              ⚠️ {t("This action cannot be undone.", "لا يمكن التراجع عن هذا الإجراء.")}
            </p>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            disabled={isBlocking}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
          >
            {t("Cancel", "إلغاء")}
          </button>
          <button
            onClick={onConfirm}
            disabled={isBlocking}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50"
          >
            {isBlocking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t(isCurrentlyActive ? "Blocking…" : "Unblocking…", isCurrentlyActive ? "جارٍ الحظر…" : "جارٍ رفع الحظر…")}
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
