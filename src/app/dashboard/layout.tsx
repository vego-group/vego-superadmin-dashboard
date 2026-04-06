// src/app/dashboard/layout.tsx
import Sidebar from "@/components/dashboard/layout/Sidebar";
import DashboardMain from "@/components/dashboard/layout/DashboardLayout";
import { LanguageProvider } from "@/lib/language-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <DashboardMain>{children}</DashboardMain>
      </div>
    </LanguageProvider>
  );
}