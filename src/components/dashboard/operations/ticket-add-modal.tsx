"use client";

import { useState, useEffect } from "react";
import { Wrench, Loader2, X, AlertCircle } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { apiClient } from "@/lib/api-client";
import { logger } from "@/lib/logger";
import { AddTicketPayload, MaintenancePriority } from "@/types/dashboard/maintenance";

interface MotorcycleOption {
  id: number;
  device_id: string;
  plate_number: string | null;
  brand: string | null;
  model: string | null;
}

interface Props {
  open: boolean;
  onSubmit: (payload: AddTicketPayload) => Promise<void>;
  onClose: () => void;
}

export default function TicketAddModal({ open, onSubmit, onClose }: Props) {
  const { t } = useLang();

  const [motorcycles, setMotorcycles] = useState<MotorcycleOption[]>([]);
  const [loadingMotorcycles, setLoadingMotorcycles] = useState(false);

  const [motorcycleId, setMotorcycleId] = useState("");
  const [issueType, setIssueType] = useState("mechanical");
  const [priority, setPriority] = useState<MaintenancePriority>("medium");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoadingMotorcycles(true);
    apiClient
      .get<MotorcycleOption[]>("motorcycles")
      .then((list) => setMotorcycles(Array.isArray(list) ? list : []))
      .catch((err) => logger.error("❌ fetch motorcycles for ticket:", err))
      .finally(() => setLoadingMotorcycles(false));
  }, [open]);

  if (!open) return null;

  const issueOptions = [
    { value: "mechanical", label: t("Mechanical", "ميكانيكي") },
    { value: "electrical", label: t("Electrical", "كهربائي") },
    { value: "battery", label: t("Battery", "البطارية") },
    { value: "brakes", label: t("Brakes", "الفرامل") },
    { value: "tires", label: t("Tires", "الإطارات") },
    { value: "body", label: t("Body / Frame", "الهيكل") },
    { value: "other", label: t("Other", "أخرى") },
  ];

  const priorityOptions: { value: MaintenancePriority; label: string }[] = [
    { value: "low", label: t("Low", "منخفضة") },
    { value: "medium", label: t("Medium", "متوسطة") },
    { value: "high", label: t("High", "عالية") },
    { value: "urgent", label: t("Urgent", "عاجلة") },
  ];

  const motorcycleLabel = (m: MotorcycleOption) =>
    [m.plate_number ?? m.device_id, [m.brand, m.model].filter(Boolean).join(" ")]
      .filter(Boolean)
      .join(" — ");

  const handleSubmit = async () => {
    if (!motorcycleId || !description.trim()) {
      setError(t("Please select a motorcycle and describe the issue.", "من فضلك اختر دراجة واكتب وصف العطل."));
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        motorcycle_id: Number(motorcycleId),
        issue_type: issueType,
        description: description.trim(),
        priority,
      });
      setMotorcycleId("");
      setIssueType("mechanical");
      setPriority("medium");
      setDescription("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Failed to create ticket", "فشل إنشاء التذكرة"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 w-full bg-gradient-to-r from-[#1C1FC1] to-[#3E1596]" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50">
              <Wrench className="h-4 w-4 text-indigo-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">
              {t("New Maintenance Ticket", "تذكرة صيانة جديدة")}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              {t("Motorcycle", "الدراجة")} *
            </label>
            <select
              value={motorcycleId}
              onChange={(e) => setMotorcycleId(e.target.value)}
              className={inputCls}
              disabled={loadingMotorcycles}
            >
              <option value="">
                {loadingMotorcycles
                  ? t("Loading motorcycles…", "جارٍ تحميل الدراجات…")
                  : t("Select a motorcycle", "اختر دراجة")}
              </option>
              {motorcycles.map((m) => (
                <option key={m.id} value={m.id}>
                  {motorcycleLabel(m)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                {t("Issue Type", "نوع العطل")}
              </label>
              <select value={issueType} onChange={(e) => setIssueType(e.target.value)} className={inputCls}>
                {issueOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                {t("Priority", "الأولوية")}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
                className={inputCls}
              >
                {priorityOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              {t("Description", "الوصف")} *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder={t("Describe the issue…", "اكتب وصف العطل…")}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
          >
            {t("Cancel", "إلغاء")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("Creating…", "جارٍ الإنشاء…")}
              </>
            ) : (
              t("Create Ticket", "إنشاء التذكرة")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
