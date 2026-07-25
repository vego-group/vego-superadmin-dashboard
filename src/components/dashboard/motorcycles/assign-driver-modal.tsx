"use client";

import { useState, useEffect, useMemo } from "react";
import { X, User, Loader2, AlertCircle, CheckCircle2, Search } from "lucide-react";
import { Motorcycle } from "./types";
import { apiClient, ApiError } from "@/lib/api-client";
import { useLang } from "@/lib/language-context";

// An individual driver is one motorcycle → one driver, so this modal handles a
// single motorcycle. The bulk bar only opens it when exactly one is selected.
interface DriverOption {
  id: number;
  name: string;
  phone: string | null;
  fleet_name: string | null;
}

interface Props {
  motorcycle: Motorcycle;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignToDriverModal({ motorcycle, onClose, onSuccess }: Props) {
  const { t, lang } = useLang();
  const isRtl = lang === "ar";

  const [drivers, setDrivers]   = useState<DriverOption[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [search, setSearch]     = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Individual assignment targets non-fleet customers. /drivers is now
        // fleet-only, so we pull the individual pool (fleet_id = null) instead.
        const res = await fetch("/api/proxy/users?type=individual&per_page=100", { headers: { Accept: "application/json" } });
        const json = await res.json();
        const paged = json.data ?? {};
        const rows: Record<string, unknown>[] = Array.isArray(paged) ? paged : paged.data ?? [];
        setDrivers(rows.map((r) => ({
          id: Number(r.id),
          name: String(r.name ?? "Unknown"),
          phone: r.phone ? String(r.phone) : null,
          fleet_name: null, // individuals have no fleet by definition
        })));
      } catch { setDrivers([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return drivers;
    return drivers.filter((d) => d.name.toLowerCase().includes(q) || (d.phone ?? "").includes(q));
  }, [drivers, search]);

  const handleAssign = async () => {
    if (!selected) return;
    setIsSaving(true);
    setError(null);
    try {
      await apiClient.post(`motorcycles/${motorcycle.id}/assign-driver`, { user_id: selected });
      setSuccess(true);
      setTimeout(onSuccess, 1000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("Failed to assign driver", "فشل تعيين السائق"));
    } finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div dir={isRtl ? "rtl" : "ltr"} className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center"><User className="h-4 w-4 text-indigo-600" /></div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{t("Assign to Driver", "تعيين لسائق")}</h3>
              <p className="text-xs text-gray-400 font-mono">{motorcycle.device_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"><X className="h-4 w-4" /></button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 ${isRtl ? "right-3" : "left-3"}`} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Search driver by name or phone…", "ابحث عن سائق بالاسم أو الهاتف…")}
              className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-indigo-300 ${isRtl ? "pr-9 pl-3" : "pl-9 pr-3"}`} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-400 gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> {t("Loading drivers…", "جارٍ تحميل السائقين…")}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">{t("No drivers found.", "لا يوجد سائقون.")}</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filtered.map((d) => {
                const isSel = selected === d.id;
                return (
                  <button key={d.id} onClick={() => setSelected(d.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${isSel ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-indigo-200 hover:bg-gray-50"}`}>
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
                      {d.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{d.name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {d.phone ?? "—"}{d.fleet_name ? ` · ${d.fleet_name}` : ` · ${t("Individual", "مستقل")}`}
                      </p>
                    </div>
                    {isSel && <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />{t("Driver assigned successfully!", "تم تعيين السائق بنجاح!")}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
            {t("Cancel", "إلغاء")}
          </button>
          <button onClick={handleAssign} disabled={!selected || isSaving || success}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
            style={{ backgroundColor: "#1C1FC1" }}>
            {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" />{t("Assigning…", "جارٍ التعيين…")}</> : t("Assign Driver", "تعيين السائق")}
          </button>
        </div>
      </div>
    </div>
  );
}
