import { Metadata } from "next";
import ZonesManagement from "@/components/dashboard/zones";

export const metadata: Metadata = {
  title: "Zones - Vego Superadmin",
  description: "Manage global zones enforced on the user side",
};

export default function ZonesPage() {
  return <ZonesManagement />;
}
