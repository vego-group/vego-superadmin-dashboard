"use client";

import { useLang } from "@/lib/language-context";

export default function DashboardMain({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  return (
    <main className={`pt-16 md:pt-0 p-4 md:p-6 lg:p-8 ${
      lang === "ar" ? "md:mr-64" : "md:ml-64"
    }`}>
      {children}
    </main>
  );
}