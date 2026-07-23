"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Desktop sidebar open/collapsed state, shared between the Sidebar (which slides
// in/out) and the main content area (which widens when the sidebar is closed).
// Persisted so the choice survives navigation and reloads.

interface SidebarContextValue {
  desktopOpen: boolean;
  toggleDesktop: () => void;
  setDesktopOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [desktopOpen, setDesktopOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_open");
    if (saved !== null) setDesktopOpen(saved === "1");
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar_open", desktopOpen ? "1" : "0");
  }, [desktopOpen]);

  return (
    <SidebarContext.Provider
      value={{ desktopOpen, toggleDesktop: () => setDesktopOpen((o) => !o), setDesktopOpen }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider");
  return ctx;
}
