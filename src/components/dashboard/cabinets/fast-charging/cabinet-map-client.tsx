"use client";

import dynamic from "next/dynamic";

// استيراد الخريطة مع تعطيل SSR
const CabinetMap = dynamic(
  () => import("./cabinet-map"),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-48 bg-gray-100 rounded mt-1 animate-pulse" />
        </div>
        <div className="h-[300px] sm:h-[450px] bg-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-[#F59E0B] rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading map...</p>
          </div>
        </div>
      </div>
    )
  }
);

export default CabinetMap;