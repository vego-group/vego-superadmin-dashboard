"use client";

import { useState } from "react";
import { Eye, Battery, Zap } from "lucide-react";
import { Device, DeviceStatus } from "./types";

const statusCfg: Record<DeviceStatus, { label: string; dot: string; badge: string }> = {
  connected:    { label: "Connected",    dot: "bg-green-400",  badge: "bg-green-50 text-green-700 border border-green-200"  },
  disconnected: { label: "Disconnected", dot: "bg-red-400",    badge: "bg-red-50 text-red-600 border border-red-200"        },
  maintenance:  { label: "Maintenance",  dot: "bg-orange-400", badge: "bg-orange-50 text-orange-600 border border-orange-200" },
};

const ITEMS_PER_PAGE = 7;

interface Props { devices: Device[]; }

export default function DevicesTable({ devices }: Props) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(devices.length / ITEMS_PER_PAGE));
  const paginated  = devices.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {["Device ID", "Type", "Location", "City", "Status", "Slots", "Firmware", "Last Heartbeat", "Today Ops", "Uptime", "Action"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map((d) => {
              const cfg = statusCfg[d.status];
              return (
                <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-gray-700">{d.id}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${d.type === "cabinet" ? "text-indigo-600" : "text-amber-600"}`}>
                      {d.type === "cabinet" ? <Battery className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
                      {d.type === "cabinet" ? "Cabinet" : "Charging"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{d.location}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{d.city}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className="text-green-600 font-semibold">{d.availableSlots}</span>
                    <span className="text-gray-400">/{d.slots}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{d.firmware}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{d.lastHeartbeat}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">{d.todayOps}</td>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: d.uptime >= 99 ? "#16a34a" : d.uptime >= 95 ? "#d97706" : "#dc2626" }}>
                    {d.uptime}%
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 hover:bg-indigo-50 rounded-lg transition text-indigo-500">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-100">
        {paginated.map((d) => {
          const cfg = statusCfg[d.status];
          return (
            <div key={d.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-gray-700">{d.id}</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>
              <p className="text-sm text-gray-500">{d.location}</p>
              <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 rounded-lg p-2">
                <div><p className="text-gray-400">City</p><p className="font-medium text-gray-700">{d.city}</p></div>
                <div><p className="text-gray-400">Slots</p><p className="font-medium text-green-600">{d.availableSlots}/{d.slots}</p></div>
                <div><p className="text-gray-400">Uptime</p><p className="font-medium text-gray-700">{d.uptime}%</p></div>
                <div><p className="text-gray-400">Firmware</p><p className="font-mono text-gray-700">{d.firmware}</p></div>
                <div><p className="text-gray-400">Today Ops</p><p className="font-medium text-gray-700">{d.todayOps}</p></div>
                <div><p className="text-gray-400">Heartbeat</p><p className="text-gray-700">{d.lastHeartbeat}</p></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, devices.length)} of {devices.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="h-8 px-3 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`h-8 w-8 text-xs rounded-lg p-0 transition ${page === p ? "bg-indigo-600 text-white border-0" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="h-8 px-3 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}