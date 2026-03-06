// src/components/dashboard/settings/terms-of-use/index.tsx

import TermsForm from "./terms-form";

export default function TermsOfUseIndex() {
  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Terms of Use</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your assigned smart locker cabinets
        </p>
      </div>
      <TermsForm />
    </div>
  );
}