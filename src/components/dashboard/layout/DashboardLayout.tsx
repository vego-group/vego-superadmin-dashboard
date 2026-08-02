"use client";

import { useLang } from "@/lib/language-context";
import { useSidebar } from "@/lib/sidebar-context";
import CountrySwitcher from "./CountrySwitcher";

export default function DashboardMain({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  const { desktopOpen } = useSidebar();
  const margin = lang === "ar"
    ? (desktopOpen ? "md:mr-64" : "md:mr-0")
    : (desktopOpen ? "md:ml-64" : "md:ml-0");
  return (
    <main className={`pt-16 md:pt-0 transition-[margin] duration-300 ${margin}`}>
      {/* Topbar — hosts the country view switcher (CR-1 §3). */}
      <div className="flex justify-end px-4 md:px-6 lg:px-8 pt-4 md:pt-5">
        <CountrySwitcher />
      </div>
      <div className="p-4 md:p-6 lg:p-8 pt-4 md:pt-5">{children}</div>
    </main>
  );
}
