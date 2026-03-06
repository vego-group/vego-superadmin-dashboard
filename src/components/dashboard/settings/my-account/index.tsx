// src/components/dashboard/settings/my-account/index.tsx

import AccountProfileForm from "./account-profile-form";

export default function MyAccountIndex() {
  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          My Account
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your personal information and password
        </p>
      </div>

      <AccountProfileForm />
    </div>
  );
}