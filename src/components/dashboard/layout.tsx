// src/app/dashboard/layout.tsx
import Sidebar from "@/components/dashboard/layout/Sidebar";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="md:ml-64">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}