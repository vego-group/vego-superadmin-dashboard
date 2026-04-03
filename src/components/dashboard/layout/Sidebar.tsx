// src/components/dashboard/layout/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Settings,
  LogOut,
  X,
  Menu,
  Battery,
  Zap,
  ChevronDown,
  DollarSign,
  ShieldCheck,
  FileText,
  Lock,
  Info,
  Monitor,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSettingsActive = pathname.startsWith("/dashboard/settings");
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);

  useEffect(() => {
    if (isSettingsActive) setSettingsOpen(true);
  }, [isSettingsActive]);

  const isActive = (path: string) => pathname === path;

  const menuItems = [
  { name: "Battery Swapping", path: "/dashboard/cabinets/battery-swapping", icon: Battery     },
  { name: "Fast Charging",    path: "/dashboard/cabinets/fast-charging",    icon: Zap         },
  { name: "Admins",           path: "/dashboard/admins",                    icon: UserCog     },
  { name: "Users",            path: "/dashboard/users",                     icon: Users       },
  { name: "Financial",        path: "/dashboard/financial",                 icon: DollarSign  },
  { name: "Devices",          path: "/dashboard/devices",                   icon: Monitor     },
];

  const settingsSubItems = [
    { name: "Pricing",         path: "/dashboard/settings/pricing",         icon: DollarSign  },
    { name: "My Account",      path: "/dashboard/settings/my-account",      icon: UserCog     },
    { name: "Warranty Policy", path: "/dashboard/settings/warranty-policy", icon: ShieldCheck },
    { name: "Terms of Use",    path: "/dashboard/settings/terms-of-use",    icon: FileText    },
    { name: "Privacy Policy",  path: "/dashboard/settings/privacy-policy",  icon: Lock        },
    { name: "About Us",        path: "/dashboard/settings/about-us",        icon: Info        },
  ];

  const handleLogout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  window.location.href = '/login';
};

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [mobileMenuOpen]);

  // ─── Settings Accordion ───────────────────────────────────────────────────
  const SettingsAccordion = () => (
    <div className="mb-1">
      <button
        onClick={() => setSettingsOpen((p) => !p)}
        className={`flex items-center gap-4 px-4 py-3.5 text-sm rounded-xl transition-all w-full ${
          isSettingsActive
            ? "bg-white/20 text-white font-medium"
            : "text-white/80 hover:bg-white/10 hover:text-white"
        }`}
      >
        <Settings className="h-5 w-5 shrink-0" />
        <span className="flex-1 text-left">Settings</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            settingsOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ${
          settingsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-white/20 pl-3">
          {settingsSubItems.map((sub) => {
            const SubIcon = sub.icon;
            const active = isActive(sub.path);
            return (
              <Link
                key={sub.path}
                href={sub.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all ${
                  active
                    ? "bg-white/20 text-white font-medium"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <SubIcon className="h-4 w-4 shrink-0" />
                <span>{sub.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ─── Nav Content ─────────────────────────────────────────────────────────
  const navContent = (
    <>
      {/* Logo */}
<div className="flex items-center justify-center py-2">
  <img
    src="/myvego_logo.png"
    alt="MyVego"
    className="h-12 w-auto object-contain"
  />
</div>

      {/* Admin Label */}
      <div className="px-6 py-4">
        <p className="text-xs font-medium text-white/50">ADMIN VEGO</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 overflow-y-auto sidebar-nav">

        {/* Overview */}
        <Link
          href="/dashboard"
          onClick={() => setMobileMenuOpen(false)}
          className={`flex items-center gap-4 px-4 py-3.5 text-sm rounded-xl transition-all mb-1 ${
            isActive("/dashboard")
              ? "bg-white/20 text-white font-medium"
              : "text-white/80 hover:bg-white/10 hover:text-white"
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Overview</span>
        </Link>

        {/* Battery Swapping, Fast Charging, Admins, Users */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-4 px-4 py-3.5 text-sm rounded-xl transition-all mb-1 ${
                active
                  ? "bg-white/20 text-white font-medium"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Settings Accordion */}
        <SettingsAccordion />
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => handleLogout()}
          className="flex items-center gap-4 px-4 py-3.5 text-sm text-white/80 hover:text-white w-full rounded-xl hover:bg-white/10 transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col text-white"
        style={{ background: "linear-gradient(180deg, #1C1FC1 0%, #3E1596 100%)" }}
      >
        {navContent}
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 flex h-16 items-center justify-between bg-white border-b border-gray-200 px-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
        <img
  src="/myvego_logo_blue.png"
  alt="MyVego"
  className="h-8 w-auto object-contain"
/>
        <div className="w-10" />
      </header>

      {/* Mobile Overlay Sidebar */}
      {mobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            className="md:hidden fixed left-0 top-0 z-50 h-screen w-64 flex flex-col text-white"
            style={{ background: "linear-gradient(180deg, #1C1FC1 0%, #3E1596 100%)" }}
          >
            {navContent}
          </aside>
        </>
      )}
    </>
  );
}