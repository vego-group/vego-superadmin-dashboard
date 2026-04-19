"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, Bike, Users } from "lucide-react";

interface Fleet {
  id: number; company_name: string; contact_person_name: string | null;
  contact_phone: string; status: string; city: string | null;
  max_motorcycles: number; max_drivers: number;
  motorcycles_count: number; drivers_count: number; billing_type: string;
}

const statusBadge: Record<string, string> = {
  approved:  "bg-green-50 text-green-700 border border-green-200",
  pending:   "bg-yellow-50 text-yellow-700 border border-yellow-200",
  rejected:  "bg-red-50 text-red-600 border border-red-200",
  suspended: "bg-gray-50 text-gray-500 border border-gray-200",
};

export default function SalesCompaniesIndex() {
  const [fleets,   setFleets]   = useState<Fleet[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`/api/proxy/fleets?per_page=15&page=${page}`, { headers: { Accept: "application/json" } });
        const json = await res.json();
        setFleets(json.data?.data ?? []);
        setLastPage(json.data?.last_page ?? 1);
      } finally { setLoading(false); }
    };
    fetch_();
  }, [page]);

  const filtered = fleets.filter((f) => {
    const q = search.toLowerCase();
    return f.company_name.toLowerCase().includes(q) ||
      (f.contact_person_name ?? "").toLowerCase().includes(q) ||
      f.contact_phone.includes(q);
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Companies</h1>
        <p className="text-sm text-gray-500 mt-1">View registered fleet companies — read only</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, contact or phone…"
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Company", "Contact", "City", "Motorcycles", "Drivers", "Billing", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-800">{f.company_name}</p>
                      <p className="text-xs text-gray-400">#{f.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">{f.contact_person_name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{f.contact_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{f.city ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Bike className="h-3.5 w-3.5 text-gray-400" />
                        {f.motorcycles_count}/{f.max_motorcycles}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        {f.drivers_count}/{f.max_drivers}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 capitalize">{f.billing_type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[f.status] ?? ""}`}>
                        {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {lastPage > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">Page {page} of {lastPage}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="h-8 px-3 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage}
                className="h-8 px-3 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}