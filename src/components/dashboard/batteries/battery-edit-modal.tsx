"use client";

import { useState } from "react";
import { z } from "zod";
import { Pencil, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Battery, UpdateBatteryPayload } from "@/types/dashboard/battery";
import { apiErrorMessage } from "./battery-api";
import LifecycleBadge from "./lifecycle-badge";
import { useLang } from "@/lib/language-context";

// lifecycle_status is deliberately not editable here — it has its own endpoint + modal.
const editSchema = z.object({
  soh: z.coerce.number().min(0, "Must be 0–100").max(100, "Must be 0–100"),
  cycle_count: z.coerce.number().int("Must be a whole number").min(0, "Cannot be negative"),
  capacity_ah: z.coerce.number().positive("Must be a positive number"),
  physical_damage: z.boolean(),
  notes: z.string().trim().optional(),
});

interface Props {
  battery: Battery;
  onSubmit: (id: number, payload: UpdateBatteryPayload) => Promise<unknown>;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BatteryEditModal({ battery, onSubmit, onClose, onSuccess }: Props) {
  const { t } = useLang();
  const [form, setForm] = useState({
    // soh arrives as a decimal string ("98.50") — usable directly as input value.
    soh: battery.soh ?? "",
    cycle_count: String(battery.cycle_count),
    capacity_ah: battery.capacity_ah != null ? String(battery.capacity_ah) : "",
    physical_damage: battery.physical_damage,
    notes: battery.notes ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    setError(null);
  };

  const handleSubmit = async () => {
    const parsed = editSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { notes, ...rest } = parsed.data;
      await onSubmit(battery.id, { ...rest, notes: notes ?? "" });
      setSuccess(true);
      setTimeout(() => onSuccess(), 900);
    } catch (err) {
      setError(apiErrorMessage(err, t("Failed to update battery", "فشل تحديث البطارية")));
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (key: string) =>
    `w-full bg-gray-50 border rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none transition ${
      fieldErrors[key] ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-indigo-300"
    }`;

  const FieldError = ({ k }: { k: string }) =>
    fieldErrors[k] ? <p className="text-[11px] text-red-500 mt-1">{fieldErrors[k]}</p> : null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Pencil className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{t("Edit Battery", "تعديل البطارية")}</h3>
              <p className="text-xs text-gray-400 font-mono">{battery.battery_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {t("Lifecycle", "دورة الحياة")}: <LifecycleBadge status={battery.lifecycle_status} />
            <span className="text-[10px]">{t("(changed via the status actions)", "(تتغير عبر إجراءات الحالة)")}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">{t("SoH %", "الحالة الصحية %")}</label>
              <input type="number" min={0} max={100} step="0.1" value={form.soh}
                onChange={(e) => set("soh", e.target.value)} className={inputCls("soh")} />
              <FieldError k="soh" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">{t("Cycle Count", "عدد الدورات")}</label>
              <input type="number" min={0} value={form.cycle_count}
                onChange={(e) => set("cycle_count", e.target.value)} className={inputCls("cycle_count")} />
              <FieldError k="cycle_count" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">{t("Capacity (Ah)", "السعة (أمبير)")}</label>
              <input type="number" min={0} step="0.1" value={form.capacity_ah}
                onChange={(e) => set("capacity_ah", e.target.value)} className={inputCls("capacity_ah")} />
              <FieldError k="capacity_ah" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={form.physical_damage}
                  onChange={(e) => set("physical_damage", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm text-gray-600">{t("Physical damage", "تلف مادي")}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">{t("Notes", "ملاحظات")}</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2}
              placeholder={t("e.g. Capacity re-measured after 400 cycles", "مثال: أعيد قياس السعة بعد 400 دورة")}
              className={`${inputCls("notes")} resize-none`} />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />{t("Battery updated successfully!", "تم تحديث البطارية بنجاح!")}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50">
            {t("Cancel", "إلغاء")}
          </button>
          <button onClick={handleSubmit} disabled={isLoading || success}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
            style={{ backgroundColor: "#1C1FC1" }}>
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />{t("Saving…", "جارٍ الحفظ…")}</> : t("Save Changes", "حفظ التغييرات")}
          </button>
        </div>
      </div>
    </div>
  );
}
