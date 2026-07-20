"use client";

import { useState } from "react";
import { z } from "zod";
import { Battery as BatteryIcon, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { CreateBatteryPayload } from "@/types/dashboard/battery";
import { apiErrorMessage } from "./battery-api";
import { useLang } from "@/lib/language-context";

const createSchema = z.object({
  battery_id: z.string().trim().min(1, "Battery ID is required"),
  battery_type: z.string().trim().min(1, "Battery type is required"),
  // Confirmed enum — `inactive` does not exist and 422s if sent.
  status: z.enum(["active", "charging", "maintenance"]),
  battery_percentage: z.coerce.number().min(0, "Must be 0–100").max(100, "Must be 0–100"),
  soh: z.coerce.number().min(0, "Must be 0–100").max(100, "Must be 0–100"),
  capacity_ah: z.coerce.number().positive("Must be a positive number"),
  cycle_count: z.coerce.number().int("Must be a whole number").min(0, "Cannot be negative"),
  physical_damage: z.boolean(),
  notes: z.string().trim().optional(),
});

interface Props {
  onSubmit: (payload: CreateBatteryPayload) => Promise<unknown>;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BatteryAddModal({ onSubmit, onClose, onSuccess }: Props) {
  const { t } = useLang();
  const [form, setForm] = useState({
    battery_id: "",
    battery_type: "72V",
    status: "active",
    battery_percentage: "100",
    soh: "100",
    capacity_ah: "",
    cycle_count: "0",
    physical_damage: false,
    notes: "",
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
    const parsed = createSchema.safeParse(form);
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
      await onSubmit({ ...rest, ...(notes ? { notes } : {}) });
      setSuccess(true);
      setTimeout(() => onSuccess(), 900);
    } catch (err) {
      setError(apiErrorMessage(err, t("Failed to create battery", "فشل إنشاء البطارية")));
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
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <BatteryIcon className="h-4 w-4 text-indigo-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{t("Add Battery", "إضافة بطارية")}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">{t("Battery ID", "معرف البطارية")} <span className="text-red-500">*</span></label>
              <input value={form.battery_id} onChange={(e) => set("battery_id", e.target.value)}
                placeholder="e.g. BAT-NEW-0001" className={inputCls("battery_id")} />
              <FieldError k="battery_id" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">{t("Battery Type", "نوع البطارية")} <span className="text-red-500">*</span></label>
              <input value={form.battery_type} onChange={(e) => set("battery_type", e.target.value)}
                placeholder="e.g. 72V" className={inputCls("battery_type")} />
              <FieldError k="battery_type" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">{t("Status", "الحالة")} <span className="text-red-500">*</span></label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls("status")}>
                <option value="active">{t("Active", "نشطة")}</option>
                <option value="charging">{t("Charging", "قيد الشحن")}</option>
                <option value="maintenance">{t("Maintenance", "صيانة")}</option>
              </select>
              <FieldError k="status" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">{t("Charge %", "نسبة الشحن")} <span className="text-red-500">*</span></label>
              <input type="number" min={0} max={100} value={form.battery_percentage}
                onChange={(e) => set("battery_percentage", e.target.value)} className={inputCls("battery_percentage")} />
              <FieldError k="battery_percentage" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">{t("SoH %", "الحالة الصحية %")} <span className="text-red-500">*</span></label>
              <input type="number" min={0} max={100} step="0.1" value={form.soh}
                onChange={(e) => set("soh", e.target.value)} className={inputCls("soh")} />
              <FieldError k="soh" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">{t("Capacity (Ah)", "السعة (أمبير)")} <span className="text-red-500">*</span></label>
              <input type="number" min={0} step="0.1" value={form.capacity_ah}
                onChange={(e) => set("capacity_ah", e.target.value)} placeholder="e.g. 60" className={inputCls("capacity_ah")} />
              <FieldError k="capacity_ah" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">{t("Cycle Count", "عدد الدورات")} <span className="text-red-500">*</span></label>
              <input type="number" min={0} value={form.cycle_count}
                onChange={(e) => set("cycle_count", e.target.value)} className={inputCls("cycle_count")} />
              <FieldError k="cycle_count" />
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
              placeholder={t("e.g. New unit received from supplier", "مثال: وحدة جديدة من المورد")}
              className={`${inputCls("notes")} resize-none`} />
          </div>

          <p className="text-[11px] text-gray-400">
            {t("New batteries start as lifecycle-active. Cabinet/slot assignment happens elsewhere.",
               "تبدأ البطاريات الجديدة بدورة حياة نشطة. يتم تعيين الكابينة/الفتحة في مكان آخر.")}
          </p>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />{t("Battery created successfully!", "تم إنشاء البطارية بنجاح!")}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6 pt-2 shrink-0">
          <button onClick={onClose} disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50">
            {t("Cancel", "إلغاء")}
          </button>
          <button onClick={handleSubmit} disabled={isLoading || success}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
            style={{ backgroundColor: "#1C1FC1" }}>
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />{t("Creating…", "جارٍ الإنشاء…")}</> : t("Add Battery", "إضافة بطارية")}
          </button>
        </div>
      </div>
    </div>
  );
}
