// src/components/dashboard/admins/admin-form.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { AdminFormData } from "@/types/dashboard/admin";
import { 
  getPhoneErrorMessage, 
  getEmailErrorMessage, 
  getPasswordErrorMessage 
} from "@/lib/validators/admin";

interface AdminFormProps {
  initialData?: Partial<AdminFormData>;
  onSubmit: (data: AdminFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isEdit?: boolean;
}

export default function AdminForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = "Create Admin",
  isEdit = false,
}: AdminFormProps) {
  const [formData, setFormData] = useState<AdminFormData>({
    name: initialData.name || "",
    phone: initialData.phone || "",
    email: initialData.email || "",
    role: "Admin", // Always Admin
    status: initialData.status || "active",
    password: "",
    password_confirmation: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    const phoneError = getPhoneErrorMessage(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const emailError = getEmailErrorMessage(formData.email);
    if (emailError) newErrors.email = emailError;

    if (!isEdit || formData.password) {
      const passwordError = getPasswordErrorMessage(formData.password || "");
      if (passwordError) newErrors.password = passwordError;

      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setIsLoading(true);
  try {
    await onSubmit({
      ...formData,
      role: "Admin"
    });
    // لو وصلنا هنا من غير error = success، مش محتاجين نعمل حاجة
    // الـ redirect بيحصل في الـ parent (add/page.tsx)
  } catch (err) {
    const message = err instanceof Error ? err.message : "An error occurred";
    
    // لو الـ API رجع success message في الـ error (bug في الـ API response handling)
    if (message.toLowerCase().includes("successfully") || message.includes("success")) {
      // اعتبره success وسيب الـ parent يعمل redirect
      return;
    }
    
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
          Full Name *
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={isLoading}
          placeholder="Enter full name"
          className={`h-12 rounded-xl ${errors.name ? "border-red-500" : ""}`}
        />
        {errors.name && (
          <p className="text-xs text-red-500 mt-1">{errors.name}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <Label htmlFor="phone" className="text-sm text-gray-600 mb-1.5 block">
          Phone Number *
        </Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          disabled={isLoading}
          placeholder="966501112233"
          className={`h-12 rounded-xl ${errors.phone ? "border-red-500" : ""}`}
        />
        {errors.phone && (
          <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
        )}
        <p className="text-xs text-gray-500 mt-1.5">
          Must start with 966 (Saudi Arabia country code)
        </p>
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email" className="text-sm text-gray-600 mb-1.5 block">
          Email (Optional)
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
        {errors.email && (
          <p className="text-xs text-red-500 mt-1">{errors.email}</p>
        )}
      </div>

      {/* Hidden Role - Always "Admin" */}
      <input type="hidden" name="role" value="Admin" />

      {/* Status (Edit only) */}
      {isEdit && (
        <div>
          <Label htmlFor="status" className="text-sm text-gray-600 mb-1.5 block">
            Status
          </Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" | "suspended" })}
            disabled={isLoading}
            className="w-full h-12 rounded-xl border border-gray-300 px-3"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      )}

      {/* Password Fields */}
      <div>
        <Label htmlFor="password" className="text-sm text-gray-600 mb-1.5 block">
          Password {!isEdit && "(Optional)"}
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          disabled={isLoading}
          placeholder={isEdit ? "Leave blank to keep unchanged" : "Enter password"}
          className={`h-12 rounded-xl ${errors.password ? "border-red-500" : ""}`}
        />
        {errors.password && (
          <p className="text-xs text-red-500 mt-1">{errors.password}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password_confirmation" className="text-sm text-gray-600 mb-1.5 block">
          Confirm Password
        </Label>
        <Input
          id="password_confirmation"
          type="password"
          value={formData.password_confirmation}
          onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
          disabled={isLoading}
          placeholder="Confirm password"
          className={`h-12 rounded-xl ${errors.password_confirmation ? "border-red-500" : ""}`}
        />
        {errors.password_confirmation && (
          <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>
        )}
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
            <strong>Note:</strong> Email and password are optional. If not provided,
            the admin can set them up during first login.
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
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
          ) : (
            submitLabel
          )}
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={onCancel}
          className="flex-1 border-2 border-[#1C1FC1] text-[#1C1FC1] hover:bg-[#1C1FC1]/5 font-medium py-3 rounded-xl text-sm transition disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}