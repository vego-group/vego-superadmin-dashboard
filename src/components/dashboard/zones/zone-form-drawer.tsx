"use client";

import {
  Map as MapIcon,
  X,
  ChevronDown,
  RefreshCw,
  Save,
  AlertTriangle,
  PenLine,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang } from "@/lib/language-context";
import { ZoneType } from "@/types/dashboard/zone";
import { ZONE_TYPE_COLORS } from "@/lib/zone-utils";

export interface ZoneFormState {
  name_en: string;
  name_ar: string;
  type: ZoneType;
  speedLimitKmh: number;
  active: boolean;
}

interface Props {
  isOpen: boolean;
  isEdit: boolean;
  form: ZoneFormState;
  onChange: (patch: Partial<ZoneFormState>) => void;
  pointsCount: number;
  onRedraw: () => void;
  onSave: () => void;
  onClose: () => void;
  isSaving: boolean;
  error: string | null;
}

export default function ZoneFormDrawer({
  isOpen,
  isEdit,
  form,
  onChange,
  pointsCount,
  onRedraw,
  onSave,
  onClose,
  isSaving,
  error,
}: Props) {
  const { t, lang } = useLang();
  const [typeOpen, setTypeOpen] = useState(false);
  const isRtl = lang === "ar";

  const typeMeta: Record<
    ZoneType,
    { label: string; info: string; infoCls: string }
  > = {
    normal: {
      label: t("Normal Zone", "منطقة عادية"),
      info: t(
        "Bike operates normally with no restrictions",
        "تعمل الدراجة بشكل طبيعي بدون قيود"
      ),
      infoCls: "bg-green-50 text-green-700 border-green-200",
    },
    slow: {
      label: t("Slow Zone", "منطقة بطيئة"),
      info: t(
        "Bike speed is limited within this zone",
        "سرعة الدراجة محدودة داخل هذه المنطقة"
      ),
      infoCls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    restricted: {
      label: t("Restricted Zone", "منطقة مقيدة"),
      info: t(
        "No riding is allowed within this zone",
        "ممنوع القيادة داخل هذه المنطقة"
      ),
      infoCls: "bg-red-50 text-red-700 border-red-200",
    },
  };

  const speedLabel =
    form.speedLimitKmh <= 15
      ? t("Slow Speed", "سرعة منخفضة")
      : form.speedLimitKmh <= 45
      ? t("Normal Speed", "سرعة عادية")
      : t("High Speed", "سرعة عالية");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div
        className={`absolute top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col ${
          isRtl ? "left-0" : "right-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#1C1FC1]/10 flex items-center justify-center">
              <MapIcon className="h-5 w-5 text-[#1C1FC1]" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                {isEdit ? t("Edit Zone", "تعديل المنطقة") : t("New Zone", "منطقة جديدة")}
              </h2>
              <p className="text-xs text-gray-500">
                {isEdit
                  ? t("Update this zone", "تحديث هذه المنطقة")
                  : t("Configure your new zone", "اضبط منطقتك الجديدة")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Name EN */}
          <div className="space-y-1.5">
            <Label>
              {t("Zone Name (English)", "اسم المنطقة (إنجليزي)")}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              value={form.name_en}
              onChange={(e) => onChange({ name_en: e.target.value })}
              placeholder="Downtown District"
            />
          </div>

          {/* Name AR */}
          <div className="space-y-1.5">
            <Label>{t("Zone Name (Arabic)", "اسم المنطقة (عربي)")}</Label>
            <Input
              value={form.name_ar}
              onChange={(e) => onChange({ name_ar: e.target.value })}
              placeholder="وسط البلد"
              dir="rtl"
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label>
              {t("Zone Type", "نوع المنطقة")}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setTypeOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: ZONE_TYPE_COLORS[form.type] }}
                  />
                  {typeMeta[form.type].label}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              {typeOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                  {(["normal", "slow", "restricted"] as ZoneType[]).map((tp) => (
                    <button
                      key={tp}
                      type="button"
                      onClick={() => {
                        onChange({ type: tp });
                        setTypeOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition ${
                        form.type === tp ? "bg-gray-50" : ""
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: ZONE_TYPE_COLORS[tp] }}
                      />
                      {typeMeta[tp].label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div
              className={`rounded-lg border px-3 py-2 text-xs ${typeMeta[form.type].infoCls}`}
            >
              {typeMeta[form.type].info}
            </div>
          </div>

          {/* Speed limit slider (not for restricted) */}
          {form.type !== "restricted" && (
            <div className="space-y-2">
              <Label>
                {t("Maximum Speed Limit (km/h)", "الحد الأقصى للسرعة (كم/س)")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={form.speedLimitKmh}
                    onChange={(e) =>
                      onChange({ speedLimitKmh: Number(e.target.value) })
                    }
                    className="flex-1 accent-[#1C1FC1]"
                  />
                  <span className="text-2xl font-bold text-gray-900 tabular-nums">
                    {form.speedLimitKmh}
                    <span className="text-sm font-medium text-gray-400 ml-1">
                      km/h
                    </span>
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">0 km/h</span>
                  <span className="font-medium text-[#1C1FC1]">{speedLabel}</span>
                  <span className="text-gray-400">100 km/h</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                {t(
                  "All vehicles in this zone will be automatically limited to this maximum speed",
                  "سيتم تحديد سرعة جميع المركبات في هذه المنطقة تلقائيًا بهذا الحد الأقصى"
                )}
              </p>
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">
              {t("Status", "الحالة")}
            </h3>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {t("Active", "نشطة")}
                </p>
                <p className="text-xs text-gray-500">
                  {t("Zone rules are enforced", "قواعد المنطقة مُفعّلة")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange({ active: !form.active })}
                className={`relative h-6 w-11 rounded-full transition ${
                  form.active ? "bg-[#1C1FC1]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                    form.active ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Boundary notice + redraw */}
          <div
            className={`rounded-xl border px-3 py-2.5 text-xs flex items-start gap-2 ${
              pointsCount >= 3
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              {pointsCount >= 3
                ? t(
                    "Notice: The zone boundaries drawn on the map will be saved. Make sure to draw accurately before saving.",
                    "ملاحظة: سيتم حفظ حدود المنطقة المرسومة على الخريطة. تأكد من الرسم بدقة قبل الحفظ."
                  )
                : t(
                    "Draw at least 3 points on the map to define this zone.",
                    "ارسم 3 نقاط على الأقل على الخريطة لتحديد هذه المنطقة."
                  )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {pointsCount} {t("points placed", "نقطة مرسومة")}
            </span>
            <button
              type="button"
              onClick={onRedraw}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1C1FC1] hover:underline"
            >
              <PenLine className="h-3.5 w-3.5" />
              {t("Redraw boundary", "إعادة رسم الحدود")}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            {t("Cancel", "إلغاء")}
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="gap-2 text-white"
            style={{ backgroundColor: "#1C1FC1" }}
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving
              ? t("Saving…", "جارٍ الحفظ…")
              : t("Save Zone", "حفظ المنطقة")}
          </Button>
        </div>
      </div>
    </div>
  );
}
