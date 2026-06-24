"use client";

import dynamic from "next/dynamic";

const ZoneMap = dynamic(() => import("./zone-map"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
      <div className="h-[520px] bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-[#1C1FC1] rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading map...</p>
        </div>
      </div>
    </div>
  ),
});

export default ZoneMap;
