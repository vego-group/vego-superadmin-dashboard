// src/app/dashboard/layout.tsx
import Sidebar from "@/components/dashboard/layout/Sidebar";
import DashboardMain from "@/components/dashboard/layout/DashboardLayout";
import { LanguageProvider } from "@/lib/language-context";
import { SidebarProvider } from "@/lib/sidebar-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SidebarProvider>
        <div className="min-h-screen bg-gray-50">
          <Sidebar />
          <DashboardMain>{children}</DashboardMain>
        </div>
      </SidebarProvider>
    </LanguageProvider>
  );
}