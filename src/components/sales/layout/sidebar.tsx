"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Building2, Bike,
  DollarSign, LogOut, Menu, X, Info,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard",   path: "/sales/dashboard",   icon: LayoutDashboard },
  { name: "Users",       path: "/sales/users",       icon: Users           },
  { name: "Companies",   path: "/sales/companies",   icon: Building2       },
  { name: "Motorcycles", path: "/sales/motorcycles", icon: Bike            },
  { name: "Pricing",     path: "/sales/pricing",     icon: DollarSign      },
  { name: "About Us",    path: "/sales/about",       icon: Info            },
];

export default function SalesSidebar() {
  const pathname   = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    window.location.href = "/login";
  };

  const navContent = (
    <>
      <div className="flex items-center justify-center py-6 px-4">
        <img src="/myvego_logo.png" alt="MyVego" className="h-10 w-auto object-contain" />
      </div>

      <div className="px-4 pb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
          Sales Team
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon   = item.icon;
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                active
                  ? "bg-white/20 text-white font-medium"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm text-white/75 hover:text-white hover:bg-white/10 transition-all"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col text-white z-40"
        style={{ background: "linear-gradient(180deg, #1C1FC1 0%, #3E1596 100%)" }}
      >
        {navContent}
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 flex h-16 items-center justify-between bg-white border-b px-4">
        <button onClick={() => setOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
        <img src="/myvego_logo_blue.png" alt="MyVego" className="h-8 w-auto" />
        <div className="w-10" />
      </header>

      {/* Mobile Overlay */}
      {open && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />
          <aside
            className="md:hidden fixed left-0 top-0 h-screen w-64 flex flex-col text-white z-50"
            style={{ background: "linear-gradient(180deg, #1C1FC1 0%, #3E1596 100%)" }}
          >
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10">
              <X className="h-5 w-5 text-white" />
            </button>
            {navContent}
          </aside>
        </>
      )}
    </>
  );
}