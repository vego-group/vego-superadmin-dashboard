// src/components/dashboard/settings/about-us/index.tsx

import AboutForm from "./about-form";

export default function AboutUsIndex() {
  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">About Us Settings</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your assigned smart locker cabinets
        </p>
      </div>
      <AboutForm />
    </div>
  );
}