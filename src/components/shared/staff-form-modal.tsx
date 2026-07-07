"use client";

import { useState } from "react";
import { ShieldCheck, UserCog, Loader2, X, AlertCircle } from "lucide-react";
import { useLang } from "@/lib/language-context";
import PhoneInput, { toApiPhone, toNationalDigits } from "@/components/shared/phone-input";

// One modal for all staff create/edit flows (Admins + SuperAdmins pages), so
// the forms stay identical. Login is phone-OTP based — no password fields.

export interface StaffFormValues {
  name: string;
  phone: string;
  email?: string;
}

interface Props {
  open: boolean;
  role: "Admin" | "SuperAdmin";
  mode?: "add" | "edit";
  initial?: { name: string; phone: string; email: string };
  onSubmit: (values: StaffFormValues) => Promise<unknown>;
  onClose: () => void;
}

export default function StaffFormModal({ open, role, mode = "add", initial, onSubmit, onClose }: Props) {
  if (!open) return null;
  // Keyed remount gives each open a fresh form state (important for edit).
  return <StaffFormContent key={`${mode}-${initial?.phone ?? "new"}`} {...{ role, mode, initial, onSubmit, onClose }} />;
}

function StaffFormContent({ role, mode, initial, onSubmit, onClose }: Omit<Props, "open">) {
  const { t } = useLang();

  const [name, setName] = useState(initial?.name ?? "");
  const [phoneDigits, setPhoneDigits] = useState(toNationalDigits(initial?.phone ?? ""));
  const [email, setEmail] = useState(initial?.email ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSuper = role === "SuperAdmin";
  const isEdit = mode === "edit";

  const title = isEdit
    ? t("Edit Admin", "تعديل المشرف")
    : isSuper
      ? t("Add SuperAdmin", "إضافة مشرف عام")
      : t("Add Admin", "إضافة مشرف");

  const Icon = isSuper ? ShieldCheck : UserCog;

  // If an edit leaves a legacy (non-Saudi) phone untouched, keep it as-is
  // instead of forcing the +966 format on an unchanged value.
  const initialDigits = toNationalDigits(initial?.phone ?? "");
  const phoneUntouched = isEdit && phoneDigits === initialDigits;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError(t("Name is required.", "الاسم مطلوب."));
      return;
    }
    if (!phoneUntouched && (phoneDigits.length !== 9 || !phoneDigits.startsWith("5"))) {
      setError(t("Enter a valid Saudi mobile number (5X XXX XXXX).", "أدخل رقم جوال سعودي صحيح (5X XXX XXXX)."));
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        phone: phoneUntouched ? initial!.phone : toApiPhone(phoneDigits),
        ...(email.trim() ? { email: email.trim() } : {}),
      });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      // Some endpoints report success inside an error-shaped payload.
      if (message.toLowerCase().includes("success")) {
        onClose();
        return;
      }
      setError(message || t("Something went wrong", "حدث خطأ ما"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 w-full bg-gradient-to-r from-[#1C1FC1] to-[#3E1596]" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50">
              <Icon className="h-4 w-4 text-indigo-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {isSuper && !isEdit && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              {t(
                "SuperAdmins have full system access, including Vehicle Control and this page.",
                "المشرف العام لديه كامل الصلاحيات على النظام، بما في ذلك التحكم بالمركبات وهذه الصفحة."
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              {t("Full Name", "الاسم الكامل")} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("Enter full name", "أدخل الاسم الكامل")}
              disabled={isSubmitting}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              {t("Phone Number", "رقم الجوال")} *
            </label>
            <PhoneInput value={phoneDigits} onChange={setPhoneDigits} disabled={isSubmitting} />
            <p className="text-[11px] text-gray-400 mt-1.5">
              {t(
                "Login is via OTP sent to this number — no password needed.",
                "تسجيل الدخول برمز OTP يُرسل إلى هذا الرقم — لا حاجة لكلمة مرور."
              )}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              {t("Email (Optional)", "البريد الإلكتروني (اختياري)")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              disabled={isSubmitting}
              className={inputCls}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
          >
            {t("Cancel", "إلغاء")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isEdit ? t("Saving…", "جارٍ الحفظ…") : t("Adding…", "جارٍ الإضافة…")}
              </>
            ) : isEdit ? (
              t("Save Changes", "حفظ التغييرات")
            ) : (
              title
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
