// src/components/dashboard/settings/pricing/index.tsx

import PricingHeader from "./pricing-header";
import PricingForm from "./pricing-form";

export default function PricingIndex() {
  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <PricingHeader />
      <PricingForm />
    </div>
  );
}