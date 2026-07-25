"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Building2, Loader2, AlertCircle, CheckCircle2, Bike, Search } from "lucide-react";
import { Motorcycle } from "./types";
import { apiClient, ApiError } from "@/lib/api-client";
import { useLang } from "@/lib/language-context";

// Minimal fleet shape needed for the capacity guard. The fleets list endpoint
// returns the full company object; we only read these four fields.
interface FleetOption {
  id: number;
  company_name: string;
  max_motorcycles: number;
  motorcycles_count: number;
}

interface Props {
  /** The unassigned pool the admin can choose from. */
  pool: Motorcycle[];
  /** Ids pre-checked from the table's bulk selection. */
  preselectedIds: number[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignToCompanyModal({ pool, preselectedIds, onClose, onSuccess }: Props) {
  const { t, lang } = useLang();
  const isRtl = lang === "ar";

  const [fleets, setFleets]       = useState<FleetOption[]>([]);
  const [fleetsLoading, setFleetsLoading] = useState(true);
  const [fleetId, setFleetId]     = useState<number | null>(null);
  const [selected, setSelected]   = useState<Set<number>>(new Set(preselectedIds));
  const [search, setSearch]       = useState("");
  const [isSaving, setIsSaving]   = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);

  // ── Load fleets (approved companies) for the dropdown ──────────────────────
  useEffect(() => {
    (async () => {
      setFleetsLoading(true);
      try {
        // Backend rejects assignment to non-approved companies, so only offer
        // approved fleets in the picker rather than letting the admin pick a
        // company that will 422 on submit.
        const list = await apiClient.get<Record<string, unknown>[]>("fleets?status=approved&per_page=100");
        const rows = Array.isArray(list) ? list : [];
        setFleets(rows
          .filter((r) => String(r.status ?? "").toLowerCase() === "approved")
          .map((r) => ({
            id: Number(r.id),
            company_name: String(r.company_name ?? `#${r.id}`),
            max_motorcycles: Number(r.max_motorcycles ?? 0),
            motorcycles_count: Number(r.motorcycles_count ?? 0),
          })));
      } catch { setFleets([]); }
      finally { setFleetsLoading(false); }
    })();
  }, []);

  const fleet = fleets.find((f) => f.id === fleetId) ?? null;
  const remainingCapacity = fleet ? Math.max(0, fleet.max_motorcycles - fleet.motorcycles_count) : null;
  const overCapacity = remainingCapacity != null && selected.size > remainingCapacity;

  const filteredPool = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return pool;
    return pool.filter((m) =>
      m.device_id.toLowerCase().includes(q) ||
      (m.plate_number ?? "").toLowerCase().includes(q) ||
      (m.city ?? "").toLowerCase().includes(q));
  }, [pool, search]);

  const toggle = (id: number) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  // Auto mode: take the first N motorcycles from the (unfiltered) pool.
  const applyQuantity = (raw: string) => {
    const n = Math.max(0, Math.min(pool.length, Number(raw) || 0));
    setSelected(new Set(pool.slice(0, n).map((m) => m.id)));
  };

  const handleAssign = async () => {
    if (!fleetId || selected.size === 0 || overCapacity) return;
    setIsSaving(true);
    setError(null);
    const ids = Array.from(selected);
    try {
      // Bulk form — the endpoint accepts an array and returns per-item results
      // (assigned / skipped-with-reason). One request instead of N.
      const res = await apiClient.post<{ assigned?: number[]; skipped?: { id: number; reason: string }[] }>(
        `fleets/${fleetId}/motorcycles`,
        { motorcycle_id: ids }
      );
      const assigned = res?.assigned?.length ?? 0;
      const skipped = res?.skipped ?? [];
      if (skipped.length === 0) {
        setSuccess(true);
        setTimeout(onSuccess, 1000);
      } else {
        // Partial — surface counts + why, then refresh so the grid matches reality.
        const reasons = Array.from(new Set(skipped.map((s) => reasonLabel(s.reason)))).join("، ");
        setError(t(`${assigned} assigned, ${skipped.length} skipped (${reasons}).`,
                   `تم تعيين ${assigned}، وتم تخطي ${skipped.length} (${reasons}).`));
        setTimeout(onSuccess, 1800);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("Failed to assign motorcycles", "فشل تعيين الدراجات"));
    } finally {
      setIsSaving(false);
    }
  };

  // Map backend skip reasons to friendly text.
  function reasonLabel(reason: string): string {
    switch (reason) {
      case "already_assigned": return t("already assigned", "مُعيّنة بالفعل");
      case "limit_reached":    return t("capacity full", "السعة ممتلئة");
      case "not_found":        return t("not found", "غير موجودة");
      default:                 return reason;
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div dir={isRtl ? "rtl" : "ltr"} className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center"><Building2 className="h-4 w-4 text-indigo-600" /></div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{t("Assign to Company", "تعيين لشركة")}</h3>
              <p className="text-xs text-gray-400">{t("Assign unassigned motorcycles to a fleet", "أسند دراجات غير مسندة لأسطول")}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"><X className="h-4 w-4" /></button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          {/* Company picker */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">{t("Company", "الشركة")}</label>
            <select value={fleetId ?? ""} onChange={(e) => setFleetId(e.target.value ? Number(e.target.value) : null)}
              disabled={fleetsLoading}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-indigo-300 cursor-pointer disabled:opacity-50">
              <option value="">{fleetsLoading ? t("Loading companies…", "جارٍ تحميل الشركات…") : t("Select a company…", "اختر شركة…")}</option>
              {fleets.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.company_name} — {f.motorcycles_count}/{f.max_motorcycles}
                </option>
              ))}
            </select>
            {!fleetsLoading && fleets.length === 0 && (
              <p className="text-xs mt-1.5 text-amber-600">
                {t("No approved companies. Approve a company first to assign motorcycles.", "لا توجد شركات معتمدة. اعتمد شركة أولاً لتتمكن من تعيين الدراجات.")}
              </p>
            )}
            {fleet && (
              <p className={`text-xs mt-1.5 ${overCapacity ? "text-red-500" : "text-gray-400"}`}>
                {t("Remaining capacity", "السعة المتبقية")}: <span className="font-semibold">{remainingCapacity}</span>
              </p>
            )}
          </div>

          {/* Quantity (auto) */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">{t("Quantity (auto-select first N)", "العدد (اختيار أول N تلقائياً)")}</label>
            <div className="flex items-center gap-2">
              <input type="number" min={0} max={pool.length} value={selected.size || ""}
                onChange={(e) => applyQuantity(e.target.value)}
                placeholder="50"
                className="w-28 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-indigo-300" />
              <span className="text-xs text-gray-400">
                {t("of", "من")} {pool.length} {t("available", "متاح")}
              </span>
            </div>
          </div>

          {/* Manual adjust list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-500">{t("Adjust selection", "تعديل الاختيار")}</label>
              <span className={`text-xs font-semibold ${overCapacity ? "text-red-500" : "text-indigo-600"}`}>
                {selected.size} {t("selected", "محدد")}
              </span>
            </div>
            <div className="relative mb-2">
              <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 ${isRtl ? "right-3" : "left-3"}`} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={t("Search device ID, plate, city…", "ابحث بالمعرف أو اللوحة أو المدينة…")}
                className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-indigo-300 ${isRtl ? "pr-9 pl-3" : "pl-9 pr-3"}`} />
            </div>
            {pool.length === 0 ? (
              <div className="py-6 text-center text-gray-400 text-sm">{t("No unassigned motorcycles.", "لا توجد دراجات غير مسندة.")}</div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto border border-gray-100 rounded-xl p-2">
                {filteredPool.map((m) => {
                  const isSel = selected.has(m.id);
                  return (
                    <button key={m.id} onClick={() => toggle(m.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition text-left ${isSel ? "border-indigo-400 bg-indigo-50" : "border-transparent hover:bg-gray-50"}`}>
                      <input type="checkbox" readOnly checked={isSel}
                        className="h-4 w-4 rounded border-gray-300 accent-indigo-600 pointer-events-none" />
                      <Bike className={`h-4 w-4 ${isSel ? "text-indigo-600" : "text-gray-400"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-mono font-semibold text-gray-800 truncate">{m.device_id}</p>
                        <p className="text-[11px] text-gray-400 truncate">{m.plate_number ?? "—"} · {m.city ?? "—"}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {overCapacity && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{t("Selection exceeds the company's remaining capacity.", "الاختيار يتجاوز السعة المتبقية للشركة.")}</span>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />{t("Motorcycles assigned successfully!", "تم تعيين الدراجات بنجاح!")}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
            {t("Cancel", "إلغاء")}
          </button>
          <button onClick={handleAssign} disabled={!fleetId || selected.size === 0 || overCapacity || isSaving || success}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
            style={{ backgroundColor: "#1C1FC1" }}>
            {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" />{t("Assigning…", "جارٍ التعيين…")}</>
              : `${t("Assign", "تعيين")} ${selected.size || ""}`.trim()}
          </button>
        </div>
      </div>
    </div>
  );
}
