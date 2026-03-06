// src/components/dashboard/settings/privacy-policy/index.tsx

import PrivacyForm from "./privacy-form";

export default function PrivacyPolicyIndex() {
  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Privacy Policy</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your assigned smart locker cabinets
        </p>
      </div>
      <PrivacyForm />
    </div>
  );
}