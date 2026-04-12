// src/components/dashboard/settings/about-us/index.tsx

"use client";

import AboutForm from "./about-form";
import { useLang } from "@/lib/language-context";

export default function AboutUsIndex() {
  const { t } = useLang();

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          {t("About Us Settings", "إعدادات من نحن")}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {t("Manage your company information, description, logo and social media links", "إدارة معلومات الشركة والوصف والشعار وروابط التواصل الاجتماعي")}
        </p>
      </div>
      <AboutForm />
    </div>
  );
}