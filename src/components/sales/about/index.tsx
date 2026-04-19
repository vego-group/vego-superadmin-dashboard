"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Info } from "lucide-react";

export default function SalesAboutIndex() {
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/proxy/about-us", { headers: { Accept: "application/json" } })
      .then(r => r.json())
      .then(json => setData(json.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">About Us</h1>
        <p className="text-sm text-gray-500 mt-1">Platform information — read only</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
        <div className="p-6">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm justify-center py-8">
              <RefreshCw className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : !data ? (
            <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
              <Info className="h-10 w-10" />
              <p className="text-sm">No about us content available yet.</p>
            </div>
          ) : (
            <div className="prose max-w-none text-sm text-gray-700">
              {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}