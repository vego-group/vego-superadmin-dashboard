// src/components/dashboard/layout/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/language-context";
import { canAccess } from "@/lib/rbac";
import { useStaffRole } from "@/hooks/use-staff-role";
import {
  LayoutDashboard, Users, UserCog, Settings, LogOut,
  Menu, Battery, Zap, ChevronDown, DollarSign,
  Monitor, Languages, Building2, Bike, TrendingUp, Gauge, MessageSquareWarning, MapPin, Wrench,
  ShieldCheck, UserRound
} from "lucide-react";

export default function Sidebar() {
  const { lang, toggleLang, t } = useLang();
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
    const menuItems = [
      { name: t("Battery Swapping", "تبديل البطاريات"), path: "/dashboard/cabinets/battery-swapping", icon: Battery     },
      { name: t("Fast Charging",    "الشحن السريع"),    path: "/dashboard/cabinets/fast-charging",    icon: Zap         },
      { name: t("Motorcycles",      "الدراجات النارية"), path: "/dashboard/motorcycles",              icon: Bike        },
      { name: t("Vehicle Control",  "التحكم بالمركبات"), path: "/dashboard/vehicle-control",          icon: Gauge       },
      { name: t("Zones",            "المناطق"),         path: "/dashboard/zones",                     icon: MapPin      },
      { name: t("Companies",        "الشركات"),         path: "/dashboard/companies",                 icon: Building2   },
      { name: t("Drivers",          "السائقون"),        path: "/dashboard/drivers",                   icon: UserRound   },
      { name: t("SuperAdmins",      "المشرفون العامون"), path: "/dashboard/superadmins",              icon: ShieldCheck },
      { name: t("Admins",           "المشرفون"),        path: "/dashboard/admins",                    icon: UserCog     },
      { name: t("Users",            "المستخدمون"),      path: "/dashboard/users",                     icon: Users       },
      { name: t("Complaints",       "الشكاوى"),         path: "/dashboard/complaints",                icon: MessageSquareWarning },
      { name: t("Operations",       "العمليات"),        path: "/dashboard/operations",                icon: Wrench      },
      { name: t("Sales",            "المبيعات"),        path: "/dashboard/sales",                     icon: TrendingUp  },
      { name: t("Financial",        "المالية"),         path: "/dashboard/financial",                 icon: DollarSign  },
      { name: t("Devices",          "الأجهزة"),         path: "/dashboard/devices",                   icon: Monitor     },
    ].filter((item) => canAccess(role, item.path));

    const settingsSubItems = [
      { name: t("Pricing",         "الأسعار"),         path: "/dashboard/settings/pricing",         icon: DollarSign  },
      { name: t("My Account",      "حسابي"),           path: "/dashboard/settings/my-account",      icon: UserCog     },
    ];

    return (
      <>
        {/* Logo */}
        <div className="flex items-center justify-center py-2">
          <img src="/myvego_logo.png" alt="MyVego" className="h-12 w-auto object-contain" />
        </div>

        {/* Admin Label */}
        <div className="px-6 py-4">
          <p className="text-xs font-medium text-white/50">{t("ADMIN VEGO", "مشرف فيجو")}</p>
        </div>

        {/* Nav Items */}
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
            <span>{t("Overview", "الرئيسية")}</span>
          </Link>

          {/* Menu Items */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
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
          {canAccess(role, "/dashboard/settings") && (
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
              <span className="flex-1 text-left">{t("Settings", "الإعدادات")}</span>
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
  className="hidden md:flex fixed top-0 z-40 h-screen w-64 flex-col text-white"
  style={{ 
    background: "linear-gradient(180deg, #1C1FC1 0%, #3E1596 100%)",
    left: lang === "ar" ? "auto" : "0",
    right: lang === "ar" ? "0" : "auto",
  }}
>
        {renderNav()}
      </aside>

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