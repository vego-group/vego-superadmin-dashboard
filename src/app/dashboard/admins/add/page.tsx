"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AdminForm from "@/components/dashboard/admins/admin-form";
import { useAdminMutations } from "@/hooks/use-admin-mutations";
import { AdminFormData } from "@/types/dashboard/admin";
import { useLang } from "@/lib/language-context";

export default function AddAdminPage() {
  const router = useRouter();
  const { t }  = useLang();
  const { addAdmin } = useAdminMutations();

  const handleSubmit = async (data: AdminFormData) => {
    try {
      await addAdmin({
        name:                  data.name,
        phone:                 data.phone,
        email:                 data.email || undefined,
        role:                  "Admin",
        password:              data.password,
        password_confirmation: data.password_confirmation,
      });
      router.push("/dashboard/admins");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.toLowerCase().includes("successfully") || message.includes("success")) {
        router.push("/dashboard/admins");
        return;
      }
      throw error;
    }
  };

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
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
                {t("Add Admin", "إضافة مشرف")}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {t("Create a new admin account", "إنشاء حساب مشرف جديد")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6">
        <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-gray-100">
          <AdminForm
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/admins")}
          />
        </div>
      </div>

    </div>
  );
}