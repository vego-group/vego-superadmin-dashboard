// src/app/dashboard/cabinets/page.tsx

import { redirect } from "next/navigation";

export default function CabinetsPage() {
  redirect("/dashboard/cabinets/battery-swapping");
}