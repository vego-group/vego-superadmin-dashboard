// src/components/dashboard/settings/warranty-policy/index.tsx

"use client";

import WarrantyForm from "./warranty-form";
import { useLang } from "@/lib/language-context";

export default function WarrantyPolicyIndex() {
  const { t } = useLang();

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          {t("Warranty Policy", "سياسة الضمان")}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {t("Manage your warranty policy content", "إدارة محتوى سياسة الضمان")}
        </p>
      </div>

      <WarrantyForm />
    </div>
  );
}