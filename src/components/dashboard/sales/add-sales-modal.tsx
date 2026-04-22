"use client";

import { useState } from "react";
import { X, User, Phone, Mail, Loader2, AlertCircle } from "lucide-react";
import { useLang } from "@/lib/language-context";

interface Props { open: boolean; onClose: () => void; onSuccess: () => void; }

const EMPTY = { name: "", phone: "", email: "" };

export default function AddSalesModal({ open, onClose, onSuccess }: Props) {
  const { t } = useLang();
  const [form,      setForm]      = useState(EMPTY);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  if (!open) return null;

  const handleClose = () => {
    if (isLoading) return;
    setForm(EMPTY);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      setError(t("Name and phone are required.", "الاسم ورقم الجوال مطلوبان."));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/proxy/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...form, role: "sales" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || Object.values(data.errors ?? {}).flat().join(", ") || "Failed to add");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Failed to add sales member", "فشل إضافة عضو المبيعات"));
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { key: "name",  label: t("Full Name",        "الاسم الكامل"),              placeholder: t("e.g. Ahmed Al-Rashidi", "مثال: أحمد الراشدي"), icon: User,  type: "text",  required: true  },
    { key: "phone", label: t("Phone Number",     "رقم الجوال"),                placeholder: "+966 5X XXX XXXX",                                  icon: Phone, type: "tel",   required: true  },
    { key: "email", label: t("Email (optional)", "البريد الإلكتروني (اختياري)"), placeholder: "email@example.com",                              icon: Mail,  type: "email", required: false },
  ] as const;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{t("Add Sales Member", "إضافة عضو مبيعات")}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{t("New sales team member will receive OTP login access", "سيحصل العضو الجديد على صلاحية الدخول عبر OTP")}</p>
          </div>
          <button onClick={handleClose} disabled={isLoading} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition disabled:opacity-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="px-6 py-5 space-y-4">
          {fields.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.key}>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  {f.label} {f.required && <span className="text-red-400">*</span>}
                </label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type={f.type} value={form[f.key]}
                    onChange={e => { setForm({ ...form, [f.key]: e.target.value }); setError(null); }}
                    placeholder={f.placeholder} disabled={isLoading}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-300 transition disabled:opacity-60" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={handleClose} disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50">
            {t("Cancel", "إلغاء")}
          </button>
          <button onClick={handleSubmit} disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
            style={{ backgroundColor: "#1C1FC1" }}>
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />{t("Adding…", "جارٍ الإضافة…")}</> : t("Add Member", "إضافة عضو")}
          </button>
        </div>
      </div>
    </div>
  );
}