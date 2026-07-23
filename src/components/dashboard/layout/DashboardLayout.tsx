"use client";

import { useLang } from "@/lib/language-context";
import { useSidebar } from "@/lib/sidebar-context";

export default function DashboardMain({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  const { desktopOpen } = useSidebar();
  const margin = lang === "ar"
    ? (desktopOpen ? "md:mr-64" : "md:mr-0")
    : (desktopOpen ? "md:ml-64" : "md:ml-0");
  return (
    <main className={`pt-16 md:pt-0 p-4 md:p-6 lg:p-8 transition-[margin] duration-300 ${margin}`}>
      {children}
    </main>
  );
}