// src/components/dashboard/settings/warranty-policy/index.tsx

import WarrantyForm from "./warranty-form";

export default function WarrantyPolicyIndex() {
  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Warranty Policy
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your assigned smart locker cabinets
        </p>
      </div>

      <WarrantyForm />
    </div>
  );
}