import { Metadata } from "next";
import OperationsManagement from "@/components/dashboard/operations";

export const metadata: Metadata = {
  title: "Operations - Vego Superadmin",
  description: "Monitor stations and manage motorcycle maintenance",
};

export default function OperationsPage() {
  return <OperationsManagement />;
}
