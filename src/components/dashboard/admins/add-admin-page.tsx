// src/components/dashboard/admins/add-admin-page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useAdmins } from "@/hooks/use-admins";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

const EMPTY: FormData = {
  name: "", email: "", phone: "",
  password: "", password_confirmation: "",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function AddAdminPage() {
  const router = useRouter();
  const { addAdmin } = useAdmins();

  const [form,      setForm]      = useState<FormData>(EMPTY);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await addAdmin(form);
      router.push("/dashboard/admins");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add admin");
    } finally {
      setIsLoading(false);
    }
  };

  const fields: {
    id: keyof FormData;
    label: string;
    placeholder: string;
    type?: string;
    half?: boolean;
  }[] = [
    { id: "name",                  label: "Full Name",        placeholder: "Enter full name"    },
    { id: "email",                 label: "Email",            placeholder: "Enter email",        type: "email" },
    { id: "phone",                 label: "Phone Number",     placeholder: "Enter phone number" },
    { id: "password",              label: "Password",         placeholder: "Enter password",     type: "password", half: true },
    { id: "password_confirmation", label: "Confirm Password", placeholder: "Confirm password",   type: "password", half: true },
  ];

  return (
    <div className="-m-4 md:-m-6 lg:-m-8 min-h-screen bg-gray-50">

      {/* Sticky Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="py-4 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Add Admin</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Create a new admin account
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6">
        <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-gray-100">

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 mb-6">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {fields.map((f) => (
                <div
                  key={f.id}
                  className={f.half ? "" : "sm:col-span-2"}
                >
                  <Label htmlFor={f.id} className="text-sm text-gray-600 mb-1.5 block">
                    {f.label}
                  </Label>
                  <Input
                    id={f.id}
                    name={f.id}
                    type={f.type ?? "text"}
                    placeholder={f.placeholder}
                    value={form[f.id]}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                    className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#1C1FC1] transition"
                  />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 text-white font-medium py-3 rounded-xl text-sm transition disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #1C1FC1, #3E1596)" }}
              >
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
                ) : (
                  "+ Create Admin"
                )}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => router.push("/dashboard/admins")}
                className="flex-1 border-2 border-[#1C1FC1] text-[#1C1FC1] hover:bg-[#1C1FC1]/5 font-medium py-3 rounded-xl text-sm transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}