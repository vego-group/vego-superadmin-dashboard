"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { AdminFormData } from "@/types/dashboard/admin";
import { getPhoneErrorMessage, getEmailErrorMessage, getPasswordErrorMessage } from "@/lib/validators/admin";
import { useLang } from "@/lib/language-context";

interface AdminFormProps {
  initialData?: Partial<AdminFormData>;
  onSubmit: (data: AdminFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isEdit?: boolean;
}

export default function AdminForm({ initialData = {}, onSubmit, onCancel, submitLabel, isEdit = false }: AdminFormProps) {
  const { t } = useLang();

  const [formData, setFormData] = useState<AdminFormData>({
    name:                  initialData.name  || "",
    phone:                 initialData.phone || "",
    email:                 initialData.email || "",
    role:                  "Admin",
    status:                initialData.status || "active",
    password:              "",
    password_confirmation: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  const defaultSubmitLabel = submitLabel ?? t("Create Admin", "إنشاء مشرف");

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = t("Name is required", "الاسم مطلوب");

    const phoneError = getPhoneErrorMessage(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const emailError = getEmailErrorMessage(formData.email);
    if (emailError) newErrors.email = emailError;

    if (!isEdit || formData.password) {
      const passwordError = getPasswordErrorMessage(formData.password || "");
      if (passwordError) newErrors.password = passwordError;
      if (formData.password !== formData.password_confirmation)
        newErrors.password_confirmation = t("Passwords do not match", "كلمتا المرور غير متطابقتين");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await onSubmit({ ...formData, role: "Admin" });
    } catch (err) {
      const message = err instanceof Error ? err.message : t("An error occurred", "حدث خطأ");
      if (message.toLowerCase().includes("successfully") || message.includes("success")) return;
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Name */}
      <div>
        <Label htmlFor="name" className="text-sm text-gray-600 mb-1.5 block">
          {t("Full Name", "الاسم الكامل")} *
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={isLoading}
          placeholder={t("Enter full name", "أدخل الاسم الكامل")}
          className={`h-12 rounded-xl ${errors.name ? "border-red-500" : ""}`}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      {/* Phone */}
      <div>
        <Label htmlFor="phone" className="text-sm text-gray-600 mb-1.5 block">
          {t("Phone Number", "رقم الجوال")} *
        </Label>
        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden h-12 focus-within:ring-2 focus-within:ring-indigo-300 transition">
          <div className="flex items-center gap-1.5 px-3 border-r border-gray-200 h-full bg-gray-50 shrink-0">
            <img src="/ksa-flag.png" alt="KSA" className="w-5 h-3.5 object-contain" />
            <span className="text-sm text-gray-600 font-medium">+966</span>
          </div>
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            placeholder="5X XXX XXXX"
            value={formData.phone.replace(/^966/, "")}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
              setFormData({ ...formData, phone: `966${digits}` });
              if (errors.phone) setErrors({ ...errors, phone: "" });
            }}
            disabled={isLoading}
            className={`flex-1 h-full px-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-white ${errors.phone ? "border-red-500" : ""}`}
          />
        </div>
        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email" className="text-sm text-gray-600 mb-1.5 block">
          {t("Email (Optional)", "البريد الإلكتروني (اختياري)")}
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={isLoading}
          placeholder="admin@example.com"
          className={`h-12 rounded-xl ${errors.email ? "border-red-500" : ""}`}
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
      </div>

      <input type="hidden" name="role" value="Admin" />

      {/* Status (Edit only) */}
      {isEdit && (
        <div>
          <Label htmlFor="status" className="text-sm text-gray-600 mb-1.5 block">
            {t("Status", "الحالة")}
          </Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" | "suspended" })}
            disabled={isLoading}
            className="w-full h-12 rounded-xl border border-gray-300 px-3"
          >
            <option value="active">{t("Active", "نشط")}</option>
            <option value="inactive">{t("Inactive", "غير نشط")}</option>
            <option value="suspended">{t("Suspended", "موقوف")}</option>
          </select>
        </div>
      )}

      {/* Password */}
      <div>
        <Label htmlFor="password" className="text-sm text-gray-600 mb-1.5 block">
          {t("Password", "كلمة المرور")} {!isEdit && `(${t("Optional", "اختياري")})`}
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          disabled={isLoading}
          placeholder={isEdit ? t("Leave blank to keep unchanged", "اتركه فارغاً للإبقاء على الحالي") : t("Enter password", "أدخل كلمة المرور")}
          className={`h-12 rounded-xl ${errors.password ? "border-red-500" : ""}`}
        />
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
      </div>

      <div>
        <Label htmlFor="password_confirmation" className="text-sm text-gray-600 mb-1.5 block">
          {t("Confirm Password", "تأكيد كلمة المرور")}
        </Label>
        <Input
          id="password_confirmation"
          type="password"
          value={formData.password_confirmation}
          onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
          disabled={isLoading}
          placeholder={t("Confirm password", "أعد إدخال كلمة المرور")}
          className={`h-12 rounded-xl ${errors.password_confirmation ? "border-red-500" : ""}`}
        />
        {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>}
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{errors.submit}</span>
        </div>
      )}

      {/* Info Note */}
      {!isEdit && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-800">
            <strong>{t("Note:", "ملاحظة:")}</strong>{" "}
            {t(
              "Email and password are optional. If not provided, the admin can set them up during first login.",
              "البريد الإلكتروني وكلمة المرور اختياريان. يمكن للمشرف إعدادهما عند تسجيل الدخول الأول."
            )}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 text-white font-medium py-3 rounded-xl text-sm transition disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #1C1FC1, #3E1596)" }}
        >
          {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("Processing…", "جارٍ المعالجة…")}</> : defaultSubmitLabel}
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={onCancel}
          className="flex-1 border-2 border-[#1C1FC1] text-[#1C1FC1] hover:bg-[#1C1FC1]/5 font-medium py-3 rounded-xl text-sm transition disabled:opacity-50"
        >
          {t("Cancel", "إلغاء")}
        </button>
      </div>
    </form>
  );
}