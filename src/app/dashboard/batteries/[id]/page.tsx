"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import BatteryDetail from "@/components/dashboard/batteries/detail";

// useSearchParams requires a Suspense boundary during prerender.
function BatteryDetailInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  // battery_id string passed by the list link — enables fetching the full row
  // in parallel with the history call (deep links without it fall back to
  // resolving the string from the history response first).
  const batteryIdHint = searchParams.get("bid");
  return <BatteryDetail batteryId={id} batteryIdHint={batteryIdHint} />;
}

export default function BatteryDetailPage() {
  return (
    <Suspense fallback={null}>
      <BatteryDetailInner />
    </Suspense>
  );
}
