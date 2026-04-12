// src/components/dashboard/settings/pricing/index.tsx

"use client";

import PricingHeader from "./pricing-header";
import PricingForm from "./pricing-form";
import { useLang } from "@/lib/language-context";

export default function PricingIndex() {
  const { t } = useLang();

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          {t("Pricing Settings", "إعدادات التسعير")}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {t("Configure pricing plans and rates for your services", "تكوين خطط التسعير والأسعار لخدماتك")}
        </p>
      </div>
      <PricingForm />
    </div>
  );
}