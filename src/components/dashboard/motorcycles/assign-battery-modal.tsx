"use client";

import { useState, useEffect } from "react";
import { X, Battery, Zap, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Motorcycle, Battery as BatteryType } from "./types";
import { useLang } from "@/lib/language-context";

interface Props { motorcycle: Motorcycle; onClose: () => void; onSuccess: () => void; }

export default function AssignBatteryModal({ motorcycle, onClose, onSuccess }: Props) {
  const { t } = useLang();
  const [batteries, setBatteries] = useState<BatteryType[]>([]);
  const [selected,  setSelected]  = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching,setIsFetching]= useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);

  useEffect(() => {
    const fetchBatteries = async () => {
      setIsFetching(true);
      try {
        const res  = await fetch("/api/proxy/batteries", { headers: { Accept: "application/json" } });
        const json = await res.json();
        const list: BatteryType[] = json.data ?? json ?? [];
        setBatteries(list.filter(b => b.motorcycle_id === null || b.motorcycle_id === motorcycle.id));
      } catch { setBatteries([]); }
      finally { setIsFetching(false); }
    };
    fetchBatteries();
  }, [motorcycle.id]);

  const handleAssign = async () => {
    if (!selected) return;
    setIsLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/proxy/motorcycles/${motorcycle.id}/assign-battery`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ battery_id: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("Failed to assign battery", "فشل تعيين البطارية"));
      setSuccess(true);
      setTimeout(() => onSuccess(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Failed to assign battery", "فشل تعيين البطارية"));
    } finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center"><Zap className="h-4 w-4 text-indigo-600" /></div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{t("Assign Battery", "تعيين بطارية")}</h3>
              <p className="text-xs text-gray-400 font-mono">{motorcycle.device_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"><X className="h-4 w-4" /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {motorcycle.battery && (
            <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200">
              <p className="text-xs font-medium text-yellow-700 mb-1">{t("Current Battery", "البطارية الحالية")}</p>
              <p className="text-sm font-semibold text-gray-800">{motorcycle.battery.battery_id}</p>
              <p className="text-xs text-gray-500">{motorcycle.battery.battery_percentage}% · SOH {motorcycle.battery.soh}% · {motorcycle.battery.cycle_count} {t("cycles","دورة")}</p>
              <p className="text-[10px] text-yellow-600 mt-1">⚠️ {t("Assigning a new battery will auto-detach the current one", "تعيين بطارية جديدة سيفصل البطارية الحالية تلقائياً")}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">{t("Select Battery", "اختر البطارية")}</p>
            {isFetching ? (
              <div className="flex items-center justify-center py-8 text-gray-400 gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> {t("Loading batteries…", "جارٍ تحميل البطاريات…")}
              </div>
            ) : batteries.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">{t("No available batteries found.", "لا توجد بطاريات متاحة.")}</div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {batteries.map((b) => {
                  const isCurrent = b.motorcycle_id === motorcycle.id;
                  return (
                    <button key={b.id} onClick={() => setSelected(b.battery_id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition text-left ${selected === b.battery_id ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-indigo-200 hover:bg-gray-50"}`}>
                      <div className="flex items-center gap-3">
                        <Battery className={`h-5 w-5 ${selected === b.battery_id ? "text-indigo-600" : "text-gray-400"}`} />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {b.battery_id}
                            {isCurrent && <span className="ml-2 text-[10px] text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded-full">{t("Current","الحالية")}</span>}
                          </p>
                          <p className="text-xs text-gray-400">{b.battery_type} · SOH {b.soh}% · {b.cycle_count} {t("cycles","دورة")}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${b.battery_percentage >= 60 ? "text-green-600" : b.battery_percentage >= 30 ? "text-yellow-600" : "text-red-500"}`}>{b.battery_percentage}%</p>
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                          <div className={`h-full rounded-full ${b.battery_percentage >= 60 ? "bg-green-500" : b.battery_percentage >= 30 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ width: `${b.battery_percentage}%` }} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />{t("Battery assigned successfully!", "تم تعيين البطارية بنجاح!")}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
            {t("Cancel", "إلغاء")}
          </button>
          <button onClick={handleAssign} disabled={!selected || isLoading || success}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
            style={{ backgroundColor: "#1C1FC1" }}>
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />{t("Assigning…","جارٍ التعيين…")}</> : t("Assign Battery","تعيين البطارية")}
          </button>
        </div>
      </div>
    </div>
  );
}