import { Metadata } from "next";
import AlarmsPage from "@/components/dashboard/alarms/index";

export const metadata: Metadata = {
  title: "Alarms Management - Vego Superadmin",
};

export default function Page() {
  return <AlarmsPage />;
}