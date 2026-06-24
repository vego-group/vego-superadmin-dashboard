"use client";

import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { Zone, ZoneType } from "@/types/dashboard/zone";
import { ZONE_TYPE_COLORS } from "@/lib/zone-utils";

interface Props {
  zone: Zone;
  hidden: boolean;
  onToggleVisible: (zone: Zone) => void;
  onEdit: (zone: Zone) => void;
  onDelete: (zone: Zone) => void;
  onToggleActive: (zone: Zone) => void;
}

export default function ZoneCard({
  zone,
  hidden,
  onToggleVisible,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  const { t } = useLang();
  const isFleet = zone.source === "fleet";
  const color = ZONE_TYPE_COLORS[zone.type];

  const typeLabel: Record<ZoneType, string> = {
    normal: t("Normal", "عادية"),
    slow: t("Slow Zone", "منطقة بطيئة"),
    restricted: t("Restricted", "مقيدة"),
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
      {/* Title + visibility */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {zone.name_en || zone.name}
          </h3>
          {zone.name_ar && (
            <p className="text-xs text-gray-400 truncate" dir="rtl">
              {zone.name_ar}
            </p>
          )}
        </div>
        <button
          onClick={() => onToggleVisible(zone)}
          className="p-1 text-gray-400 hover:text-gray-600 transition shrink-0"
          title={hidden ? t("Show on map", "إظهار على الخريطة") : t("Hide on map", "إخفاء من الخريطة")}
        >
          {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {/* Type badge */}
      <span
        className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium"
        style={{ backgroundColor: `${color}1a`, color }}
      >
        {typeLabel[zone.type]}
      </span>

      {/* Active toggle + actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => !isFleet && onToggleActive(zone)}
          disabled={isFleet}
          className="flex items-center gap-2 disabled:cursor-not-allowed"
        >
          <span
            className={`relative h-6 w-11 rounded-full transition ${
              zone.active ? "bg-[#1C1FC1]" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                zone.active ? "left-[22px]" : "left-0.5"
              }`}
            />
          </span>
          <span className="text-sm text-gray-600">
            {zone.active ? t("Active", "نشطة") : t("Inactive", "غير نشطة")}
          </span>
        </button>

        {isFleet ? (
          <span className="text-[11px] text-gray-300">
            {t("Read only", "للقراءة فقط")}
          </span>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(zone)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition"
              title={t("Edit", "تعديل")}
            >
              <Pencil className="h-4 w-4 text-[#1C1FC1]" />
            </button>
            <button
              onClick={() => onDelete(zone)}
              className="p-1.5 rounded-lg hover:bg-red-50 transition"
              title={t("Delete", "حذف")}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          </div>
        )}
      </div>

      {/* Speed limit row */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-sm text-gray-500">
          {t("Speed Limit", "حد السرعة")}
        </span>
        {zone.type === "restricted" ? (
          <span className="text-sm font-bold text-red-600">
            {t("NO RIDING", "ممنوع القيادة")}
          </span>
        ) : (
          <span className="text-sm font-bold text-green-600">
            {zone.speedLimitKmh} km/h
          </span>
        )}
      </div>
    </div>
  );
}
