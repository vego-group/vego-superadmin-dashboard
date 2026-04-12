// src/components/dashboard/settings/terms-of-use/index.tsx

"use client";

import TermsForm from "./terms-form";
import { useLang } from "@/lib/language-context";

export default function TermsOfUseIndex() {
  const { t } = useLang();

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          {t("Terms of Use", "شروط الاستخدام")}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {t("Manage your terms of use content", "إدارة محتوى شروط الاستخدام")}
        </p>
      </div>
      <TermsForm />
    </div>
  );
}