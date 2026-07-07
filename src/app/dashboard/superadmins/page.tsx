import { Metadata } from "next";
import SuperAdminsManagement from "@/components/dashboard/superadmins";

export const metadata: Metadata = {
  title: "SuperAdmins - Vego Superadmin",
  description: "Manage users with full system access",
};

export default function SuperAdminsPage() {
  return <SuperAdminsManagement />;
}
