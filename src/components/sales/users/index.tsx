"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw } from "lucide-react";

interface User {
  id: number; name: string; phone: string; email: string;
  status: string; account_type: string; fleet_id: number | null;
  roles: { name: string }[];
  fleet?: { company_name: string } | null;
}

export default function SalesUsersIndex() {
  const [users,    setUsers]    = useState<User[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`/api/proxy/users/list?per_page=15&page=${page}`, { headers: { Accept: "application/json" } });
        const json = await res.json();
        setUsers(json.data?.data ?? []);
        setLastPage(json.data?.last_page ?? 1);
      } finally { setLoading(false); }
    };
    fetch_();
  }, [page]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.phone.includes(q) || (u.email ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">View registered users — read only</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone or email…"
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
                  {["Name", "Phone", "Email", "Role", "Fleet", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{u.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {u.roles?.[0]?.name ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.fleet?.company_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.status === "active"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-gray-50 text-gray-500 border border-gray-200"
                      }`}>{u.status}</span>
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