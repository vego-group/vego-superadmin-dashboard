import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="md:ml-64 pt-16 md:pt-0 p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}