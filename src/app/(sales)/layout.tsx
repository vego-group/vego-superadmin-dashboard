import SalesSidebar from "@/components/sales/layout/sidebar";

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SalesSidebar />
      <div className="md:ml-64">
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}