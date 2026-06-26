"use client";

import dynamic from "next/dynamic";

const VehicleMap = dynamic(() => import("./vehicle-map"), {
  ssr: false,
  loading: () => <div className="h-[220px] rounded-xl bg-gray-100 animate-pulse" />,
});

export default VehicleMap;
