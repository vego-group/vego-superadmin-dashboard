// src/components/dashboard/settings/privacy-policy/index.tsx

"use client";

import PrivacyForm from "./privacy-form";
import { useLang } from "@/lib/language-context";

export default function PrivacyPolicyIndex() {
  const { t } = useLang();

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          {t("Privacy Policy", "سياسة الخصوصية")}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {t("Manage your privacy policy content", "إدارة محتوى سياسة الخصوصية")}
        </p>
      </div>
      <PrivacyForm />
    </div>
  );
}