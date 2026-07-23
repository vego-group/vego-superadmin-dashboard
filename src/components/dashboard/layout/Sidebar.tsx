// src/components/dashboard/layout/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/language-context";
import { useSidebar } from "@/lib/sidebar-context";
import { canAccess } from "@/lib/rbac";
import { useStaffRole } from "@/hooks/use-staff-role";
import {
  LayoutDashboard, Users, UserCog, Settings, LogOut,
  Menu, Battery, BatteryCharging, Zap, ChevronDown, DollarSign,
  Monitor, Languages, Building2, Bike, TrendingUp, Gauge, MessageSquareWarning, MapPin, Wrench,
  ShieldCheck, UserRound, Headset
} from "lucide-react";

export default function Sidebar() {
  const { lang, toggleLang, t } = useLang();
  const { desktopOpen, toggleDesktop } = useSidebar();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isSettingsActive = pathname.startsWith("/dashboard/settings");
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);
  const role = useStaffRole();

  useEffect(() => {
    if (isSettingsActive) setSettingsOpen(true);
  }, [isSettingsActive]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    window.location.href = "/login";
  };

  const renderNav = () => {
    const navGroups = [
      {
        label: t("Fleet & Charging", "الأسطول والشحن"),
        items: [
          { name: t("Battery Swapping", "تبديل البطاريات"), path: "/dashboard/cabinets/battery-swapping", icon: Battery },
          { name: t("Fast Charging",    "الشحن السريع"),    path: "/dashboard/cabinets/fast-charging",    icon: Zap },
          { name: t("Batteries",        "البطاريات"),       path: "/dashboard/batteries",                 icon: BatteryCharging },
          { name: t("Motorcycles",      "الدراجات النارية"), path: "/dashboard/motorcycles",              icon: Bike },
          { name: t("Vehicle Control",  "التحكم بالمركبات"), path: "/dashboard/vehicle-control",          icon: Gauge },
          { name: t("Devices",          "الأجهزة"),         path: "/dashboard/devices",                   icon: Monitor },
        ],
      },
      {
        label: t("Network", "الشبكة"),
        items: [
          { name: t("Zones",     "المناطق"),  path: "/dashboard/zones",     icon: MapPin },
          { name: t("Companies", "الشركات"),  path: "/dashboard/companies", icon: Building2 },
          { name: t("Drivers",   "السائقون"), path: "/dashboard/drivers",   icon: UserRound },
        ],
      },
      {
        label: t("Team & Access", "الفريق والصلاحيات"),
        items: [
          { name: t("SuperAdmins",      "المشرفون العامون"),  path: "/dashboard/superadmins", icon: ShieldCheck },
          { name: t("Admins",           "المشرفون"),         path: "/dashboard/admins",      icon: UserCog },
          { name: t("Sales",            "المبيعات"),         path: "/dashboard/sales",       icon: TrendingUp },
          { name: t("Operators",        "المشغّلون"),        path: "/dashboard/operators",   icon: Headset },
          { name: t("Individual Users", "المستخدمون الأفراد"), path: "/dashboard/users",     icon: Users },
        ],
      },
      {
        label: t("Support & Finance", "الدعم والمالية"),
        items: [
          { name: t("Complaints", "الشكاوى"),  path: "/dashboard/complaints", icon: MessageSquareWarning },
          { name: t("Operations", "العمليات"), path: "/dashboard/operations", icon: Wrench },
          { name: t("Financial",  "المالية"),  path: "/dashboard/financial",  icon: DollarSign },
        ],
      },
    ]
      .map((g) => ({ ...g, items: g.items.filter((it) => canAccess(role, it.path)) }))
      .filter((g) => g.items.length > 0);

    const settingsSubItems = [
      { name: t("Pricing",         "الأسعار"),         path: "/dashboard/settings/pricing",         icon: DollarSign  },
      { name: t("My Account",      "حسابي"),           path: "/dashboard/settings/my-account",      icon: UserCog     },
    ];

    const isRtl = lang === "ar";
    const renderItem = (href: string, Icon: React.ElementType, label: string) => {
      const active = isActive(href);
      return (
        <Link
          key={href}
          href={href}
          onClick={() => setMobileMenuOpen(false)}
          className={`relative flex items-center gap-3.5 px-4 py-2.5 text-sm rounded-xl transition-all mb-0.5 ${
            active ? "bg-white/15 text-white font-medium" : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          {active && (
            <span className={`absolute top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-white ${isRtl ? "right-1" : "left-1"}`} />
          )}
          <Icon className="h-[18px] w-[18px] shrink-0" />
          <span className="truncate">{label}</span>
        </Link>
      );
    };

    return (
      <>
        {/* Logo + desktop collapse toggle */}
        <div className="flex items-center justify-between px-4 py-2">
          <img src="/myvego_logo.png" alt="MyVego" className="h-12 w-auto object-contain" />
          <button
            onClick={toggleDesktop}
            className="hidden md:inline-flex p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition"
            aria-label={t("Collapse sidebar", "طيّ القائمة")}
            title={t("Collapse sidebar", "طيّ القائمة")}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Admin Label */}
        <div className="px-6 py-4">
          <p className="text-xs font-medium text-white/50">{t("ADMIN VEGO", "مشرف فيجو")}</p>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 overflow-y-auto sidebar-nav">

          {/* Overview */}
          {renderItem("/dashboard", LayoutDashboard, t("Overview", "الرئيسية"))}

          {/* Grouped menu items */}
          {navGroups.map((group) => (
            <div key={group.label} className="mt-4">
              <p className="px-4 mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                {group.label}
              </p>
              {group.items.map((item) => renderItem(item.path, item.icon, item.name))}
            </div>
          ))}

          {/* Settings Accordion */}
          {canAccess(role, "/dashboard/settings") && (
          <div className="mt-4">
            <p className="px-4 mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
              {t("System", "النظام")}
            </p>
            <button
              onClick={() => setSettingsOpen((p) => !p)}
              className={`flex items-center gap-3.5 px-4 py-2.5 text-sm rounded-xl transition-all w-full ${
                isSettingsActive
                  ? "bg-white/15 text-white font-medium"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Settings className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1 text-start">{t("Settings", "الإعدادات")}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${settingsOpen ? "rotate-180" : ""}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-200 ${settingsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
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
          )}
        </nav>

        {/* Footer — Language + Logout, fixed together below a single divider */}
        <div className="px-3 pt-3 pb-4 border-t border-white/10 space-y-1">
          <button
            onClick={toggleLang}
            className="flex items-center gap-4 w-full px-4 py-3.5 text-sm rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
          >
            <Languages className="h-5 w-5 shrink-0" />
            <span>{lang === "en" ? "عربي" : "English"}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-4 py-3.5 text-sm rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>{t("Logout", "تسجيل الخروج")}</span>
          </button>
        </div>
      </>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
  className={`hidden md:flex fixed top-0 z-40 h-screen w-64 flex-col text-white transition-transform duration-300 ${
    desktopOpen ? "translate-x-0" : lang === "ar" ? "translate-x-full" : "-translate-x-full"
  }`}
  style={{
    background: "linear-gradient(180deg, #1C1FC1 0%, #3E1596 100%)",
    left: lang === "ar" ? "auto" : "0",
    right: lang === "ar" ? "0" : "auto",
  }}
>
        {renderNav()}
      </aside>

      {/* Desktop floating opener — shown when the sidebar is collapsed */}
      {!desktopOpen && (
        <button
          onClick={toggleDesktop}
          className="hidden md:flex fixed top-4 z-50 items-center justify-center h-10 w-10 rounded-xl bg-white border border-gray-200 shadow-md text-gray-600 hover:bg-gray-50 transition"
          style={{ left: lang === "ar" ? "auto" : "1rem", right: lang === "ar" ? "1rem" : "auto" }}
          aria-label={t("Open sidebar", "فتح القائمة")}
          title={t("Open sidebar", "فتح القائمة")}
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 flex h-16 items-center justify-between bg-white border-b border-gray-200 px-4">
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
        <img src="/myvego_logo_blue.png" alt="MyVego" className="h-8 w-auto object-contain" />
        <div className="w-10" />
      </header>

      {/* Mobile Overlay Sidebar */}
      {mobileMenuOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)} />
          <aside
  className="md:hidden fixed top-0 z-50 h-screen w-64 flex flex-col text-white"
  style={{ 
    background: "linear-gradient(180deg, #1C1FC1 0%, #3E1596 100%)",
    left: lang === "ar" ? "auto" : "0",
    right: lang === "ar" ? "0" : "auto",
  }}
>
            {renderNav()}
          </aside>
        </>
      )}
    </>
  );
}