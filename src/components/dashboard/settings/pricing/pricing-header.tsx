// src/components/dashboard/settings/pricing/pricing-header.tsx

"use client";

import { useLang } from "@/lib/language-context";

export default function PricingHeader() {
  const { t } = useLang();

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
        {t("Pricing", "التسعير")}
      </h1>
      <p className="text-xs sm:text-sm text-gray-500 mt-1">
        {t("Manage service pricing and rates", "إدارة أسعار الخدمات والتعريفات")}
      </p>
    </div>
  );
}