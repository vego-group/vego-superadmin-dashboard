"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, MapPin } from "lucide-react";

interface Motorcycle {
  id: number; device_id: string; status: string;
  battery_type: string; city: string | null; address: string | null;
  fleet_id: number | null;
  assigned_user: { name: string; phone: string } | null;
  battery: { battery_id: string; battery_percentage: number; soh: string } | null;
}

const statusBadge: Record<string, string> = {
  active:      "bg-green-50 text-green-700 border border-green-200",
  inactive:    "bg-gray-50 text-gray-500 border border-gray-200",
  maintenance: "bg-orange-50 text-orange-600 border border-orange-200",
};

export default function SalesMotorcyclesIndex() {
  const [moto,    setMoto]    = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    fetch("/api/proxy/motorcycles", { headers: { Accept: "application/json" } })
      .then(r => r.json())
      .then(json => setMoto(json.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = moto.filter((m) => {
    const q = search.toLowerCase();
    return m.device_id.toLowerCase().includes(q) ||
      (m.city ?? "").toLowerCase().includes(q) ||
      (m.assigned_user?.name ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Motorcycles</h1>
        <p className="text-sm text-gray-500 mt-1">View fleet motorcycles — read only</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by device ID, driver or city…"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-300 transition" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
        {loading ? (
          <div className="p-12 flex items-center justify-center gap-2 text-gray-400 text-sm">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {["Device ID", "Status", "Battery", "Driver", "Fleet", "Location"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3 font-mono text-sm font-semibold text-gray-800">{m.device_id}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[m.status] ?? ""}`}>
                          {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {m.battery ? (
                          <div>
                            <p className="text-xs font-semibold text-gray-700">{m.battery.battery_id}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${
                                  m.battery.battery_percentage >= 60 ? "bg-green-500" :
                                  m.battery.battery_percentage >= 30 ? "bg-yellow-500" : "bg-red-500"
                                }`} style={{ width: `${m.battery.battery_percentage}%` }} />
                              </div>
                              <span className="text-xs text-gray-500">{m.battery.battery_percentage}%</span>
                            </div>
                          </div>
                        ) : <span className="text-xs text-gray-300 italic">None</span>}
                      </td>
                      <td className="px-4 py-3">
                        {m.assigned_user ? (
                          <div>
                            <p className="text-xs font-medium text-gray-700">{m.assigned_user.name}</p>
                            <p className="text-[10px] text-gray-400">{m.assigned_user.phone}</p>
                          </div>
                        ) : <span className="text-xs text-gray-300 italic">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{m.fleet_id ? `Fleet #${m.fleet_id}` : "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-1">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                          <p className="text-xs text-gray-600">{m.city ?? "—"}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map((m) => (
                <div key={m.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm font-semibold text-gray-800">{m.device_id}</p>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[m.status] ?? ""}`}>
                      {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 rounded-lg p-3">
                    <div><p className="text-gray-400">Driver</p><p className="font-medium text-gray-700">{m.assigned_user?.name ?? "—"}</p></div>
                    <div><p className="text-gray-400">Fleet</p><p className="font-medium text-gray-700">{m.fleet_id ? `#${m.fleet_id}` : "—"}</p></div>
                    <div><p className="text-gray-400">Battery</p><p className="font-medium text-gray-700">{m.battery ? `${m.battery.battery_id} · ${m.battery.battery_percentage}%` : "None"}</p></div>
                    <div><p className="text-gray-400">City</p><p className="font-medium text-gray-700">{m.city ?? "—"}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}