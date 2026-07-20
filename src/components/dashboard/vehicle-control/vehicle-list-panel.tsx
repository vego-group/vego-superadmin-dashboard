"use client";

import { useState } from "react";
import { Search, Building2, Users, Bike, ChevronDown, Wifi, WifiOff } from "lucide-react";
import { useLang } from "@/lib/language-context";
import type { SuperadminVehicle, VehicleGroup, OwnerFilter } from "./types";

interface Props {
  groups: VehicleGroup[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  ownerFilter: OwnerFilter;
  onOwnerFilterChange: (f: OwnerFilter) => void;
  query: string;
  onQueryChange: (q: string) => void;
  isLoading: boolean;
}

const batteryColor = (lvl: number) =>
  lvl >= 60 ? "bg-green-500" : lvl >= 30 ? "bg-yellow-500" : "bg-red-500";

const statusDot: Record<SuperadminVehicle["status"], string> = {
  active: "bg-green-400",
  charging: "bg-indigo-400",
  idle: "bg-gray-400",
  maintenance: "bg-orange-400",
};

export default function VehicleListPanel({
  groups,
  selectedId,
  onSelect,
  ownerFilter,
  onOwnerFilterChange,
  query,
  onQueryChange,
  isLoading,
}: Props) {
  const { t } = useLang();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filters: { key: OwnerFilter; label: string }[] = [
    { key: "all", label: t("All", "الكل") },
    { key: "individual", label: t("Individual", "أفراد") },
    { key: "corporate_driver", label: t("Corporate", "شركات") },
  ];

  const toggle = (id: string) => setCollapsed((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600 shrink-0" />

      <div className="p-3 space-y-3 shrink-0 border-b border-gray-100">
        {/* Owner filter tabs */}
        <div className="flex gap-1 bg-gray-50 p-1 rounded-xl">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => onOwnerFilterChange(f.key)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
                ownerFilter === f.key
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={t("Search vehicle, owner, company…", "ابحث عن مركبة أو مالك أو شركة…")}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-indigo-300 transition"
          />
        </div>
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 min-h-0">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">{t("No vehicles found.", "لا توجد مركبات.")}</div>
        ) : (
          groups.map((g) => {
            const isCollapsed = collapsed[g.groupId];
            const count = g.subGroups.reduce((s, sg) => s + sg.vehicles.length, 0);
            return (
              <section key={g.groupId}>
                <button
                  onClick={() => toggle(g.groupId)}
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {g.groupType === "company" ? <Building2 className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                  <span className="flex-1 text-left truncate">
                    {g.groupType === "user" ? t("Individual Users", "مستخدمون أفراد") : g.groupName}
                  </span>
                  <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">{count}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                </button>

                {!isCollapsed &&
                  g.subGroups.map((sub) => (
                    <div key={sub.subId} className="mt-1">
                      {sub.subName && sub.subName !== g.groupName && (
                        <p className="px-2 py-1 text-[11px] font-semibold text-gray-600 truncate">{sub.subName}</p>
                      )}
                      <ul className="space-y-2">
                        {sub.vehicles.map((v) => {
                          const active = v.id === selectedId;
                          return (
                            <li key={v.id}>
                              <button
                                onClick={() => onSelect(v.id)}
                                className={`w-full flex items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                                  active
                                    ? "border-indigo-300 bg-indigo-50"
                                    : "border-gray-100 hover:border-indigo-200 hover:bg-gray-50"
                                }`}
                              >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${active ? "bg-indigo-100" : "bg-gray-100"}`}>
                                  <Bike className={`h-4 w-4 ${active ? "text-indigo-600" : "text-gray-400"}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot[v.status] ?? "bg-gray-400"}`} />
                                    <p className="text-sm font-semibold text-gray-800 truncate">{v.plateNumber}</p>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[80px]">
                                      <div className={`h-full rounded-full ${batteryColor(v.batteryLevel)}`} style={{ width: `${v.batteryLevel}%` }} />
                                    </div>
                                    <span className="text-[10px] text-gray-500">{v.batteryLevel}%</span>
                                  </div>
                                </div>
                                {v.isOnline ? (
                                  <Wifi className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                ) : (
                                  <WifiOff className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
