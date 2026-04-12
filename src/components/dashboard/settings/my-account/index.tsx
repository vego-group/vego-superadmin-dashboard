// src/components/dashboard/settings/my-account/index.tsx

"use client";

import AccountProfileForm from "./account-profile-form";
import { useLang } from "@/lib/language-context";

export default function MyAccountIndex() {
  const { t } = useLang();

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          {t("My Account", "حسابي")}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {t("Manage your personal information and password", "إدارة معلوماتك الشخصية وكلمة المرور")}
        </p>
      </div>

      <AccountProfileForm />
    </div>
  );
}