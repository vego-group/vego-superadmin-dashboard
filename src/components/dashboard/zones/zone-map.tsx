"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { LatLngBoundsExpression } from "leaflet";
import { Sparkles } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { Zone, ZonePoint, ZoneType } from "@/types/dashboard/zone";
import { ZONE_TYPE_COLORS } from "@/lib/zone-utils";

// Fit map to all zone polygons (only when not actively drawing).
function FitBounds({
  zones,
  enabled,
}: {
  zones: Zone[];
  enabled: boolean;
}) {
  const map = useMap();
  const last = useRef<string>("");
  useEffect(() => {
    if (!enabled) return;
    const pts = zones.flatMap((z) =>
      z.polygon.map((p) => [p.lat, p.lng] as [number, number])
    );
    if (pts.length === 0) return;
    const key = pts.flat().join(",");
    if (key === last.current) return;
    last.current = key;
    map.fitBounds(pts as LatLngBoundsExpression, { padding: [50, 50] });
  }, [zones, enabled, map]);
  return null;
}

function ClickHandler({ onAdd }: { onAdd: (p: ZonePoint) => void }) {
  useMapEvents({
    click(e) {
      onAdd({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

interface ZoneMapProps {
  zones: Zone[];
  activePoints: ZonePoint[]; // polygon being created/edited (highlighted)
  activeType: ZoneType; // color for the active polygon
  isDrawing: boolean; // enable click-to-add + drawing overlay
  onAddPoint: (p: ZonePoint) => void;
  onZoneClick?: (zone: Zone) => void;
}

export default function ZoneMap({
  zones,
  activePoints,
  activeType,
  isDrawing,
  onAddPoint,
  onZoneClick,
}: ZoneMapProps) {
  const { t } = useLang();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="bg-gray-100 rounded-2xl h-[520px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-[#1C1FC1] rounded-full animate-spin" />
          <p className="text-sm text-gray-500">
            {t("Loading map…", "جارٍ تحميل الخريطة…")}
          </p>
        </div>
      </div>
    );
  }

  const drawable = zones.filter((z) => z.polygon.length >= 3);
  const activeColor = ZONE_TYPE_COLORS[activeType];
  const activeLatLngs = activePoints.map(
    (p) => [p.lat, p.lng] as [number, number]
  );

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border transition ${
        isDrawing
          ? "border-[#1C1FC1] ring-2 ring-[#1C1FC1]/40"
          : "border-gray-200"
      }`}
    >
      {/* Live updates badge */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 rounded-lg bg-white/90 backdrop-blur px-2.5 py-1 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-medium text-gray-600">
          {t("Live Updates", "تحديثات مباشرة")}
        </span>
      </div>

      {/* Drawing mode overlay card */}
      {isDrawing && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lg border border-[#1C1FC1]/20">
          <div className="h-9 w-9 rounded-xl bg-[#1C1FC1]/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-[#1C1FC1]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {t("Drawing Mode Active", "وضع الرسم مفعّل")}
            </p>
            <p className="text-xs text-gray-500">
              {activePoints.length === 0
                ? t(
                    "Click on the map to draw your zone boundaries",
                    "اضغط على الخريطة لرسم حدود المنطقة"
                  )
                : `${activePoints.length} ${t("points placed", "نقطة مرسومة")}`}
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] rounded-xl bg-white/95 backdrop-blur px-3 py-2.5 shadow-sm">
        <p className="text-xs font-semibold text-gray-700 mb-1.5">
          {t("Zone Types", "أنواع المناطق")}
        </p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <span className="text-[11px] text-gray-500">
              {t("Normal Zone", "منطقة عادية")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-[11px] text-gray-500">
              {t("Slow Zone", "منطقة بطيئة")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="text-[11px] text-gray-500">
              {t("Restricted Zone", "منطقة مقيدة")}
            </span>
          </div>
        </div>
      </div>

      <div style={{ height: 520, width: "100%" }}>
        <MapContainer
          center={[24.7136, 46.6753]}
          zoom={12}
          style={{ height: "100%", width: "100%", zIndex: 1 }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {isDrawing && <ClickHandler onAdd={onAddPoint} />}

          {/* Existing zones */}
          {drawable.map((zone) => {
            const color = ZONE_TYPE_COLORS[zone.type];
            return (
              <Polygon
                key={zone.id}
                positions={zone.polygon.map((p) => [p.lat, p.lng])}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: zone.active ? 0.25 : 0.08,
                  weight: 2,
                  dashArray: zone.active ? undefined : "6 6",
                }}
                eventHandlers={{ click: () => onZoneClick?.(zone) }}
              >
                <Tooltip
                  permanent
                  direction="center"
                  className="zone-map-label"
                >
                  <span
                    className="zone-label-badge"
                    style={{ backgroundColor: color }}
                  >
                    {zone.name_en || zone.name}
                  </span>
                </Tooltip>
              </Polygon>
            );
          })}

          {/* Active (being drawn / edited) polygon */}
          {activeLatLngs.length >= 3 && (
            <Polygon
              positions={activeLatLngs}
              pathOptions={{
                color: activeColor,
                fillColor: activeColor,
                fillOpacity: 0.3,
                weight: 2,
                dashArray: "6 6",
              }}
            />
          )}
          {activeLatLngs.length === 2 && (
            <Polyline
              positions={activeLatLngs}
              pathOptions={{ color: activeColor, weight: 2, dashArray: "6 6" }}
            />
          )}
          {activeLatLngs.map((pos, i) => (
            <CircleMarker
              key={i}
              center={pos}
              radius={5}
              pathOptions={{
                color: "#fff",
                fillColor: activeColor,
                fillOpacity: 1,
                weight: 2,
              }}
            />
          ))}

          <FitBounds
            zones={drawable}
            enabled={!isDrawing && activePoints.length === 0}
          />
        </MapContainer>
      </div>
    </div>
  );
}
