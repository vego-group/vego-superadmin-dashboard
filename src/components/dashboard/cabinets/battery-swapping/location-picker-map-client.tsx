"use client";

import dynamic from "next/dynamic";

// استيراد الخريطة مع تعطيل SSR
const LocationPickerMap = dynamic(
  () => import("./location-picker-map"),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-gray-100 rounded-lg h-[250px] sm:h-[320px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-[#00E5BE] rounded-full animate-spin" />
          <p className="text-xs text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }
);

export default LocationPickerMap;
