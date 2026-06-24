import { Metadata } from "next";
import ComplaintsManagement from "@/components/dashboard/complaints";

export const metadata: Metadata = {
  title: "Complaints - Vego Superadmin",
  description: "View and manage driver complaints",
};

export default function ComplaintsPage() {
  return <ComplaintsManagement />;
}
