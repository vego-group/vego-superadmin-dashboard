import { Metadata } from "next";
import DriversOversight from "@/components/dashboard/drivers";

export const metadata: Metadata = {
  title: "Fleet Drivers - Vego Superadmin",
  description: "Cross-fleet driver oversight",
};

export default function DriversPage() {
  return <DriversOversight />;
}
