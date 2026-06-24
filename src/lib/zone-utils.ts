import { ApiZone, Zone, ZonePoint, ZoneType } from "@/types/dashboard/zone";

// ─── Colors per zone type ─────────────────────────────────────────────────────
export const ZONE_TYPE_COLORS: Record<ZoneType, string> = {
  normal: "#10b981", // green
  slow: "#f59e0b", // amber
  restricted: "#ef4444", // red
};

// ─── WKT helpers ──────────────────────────────────────────────────────────────
// Backend format: POLYGON((lng lat, lng lat, ...)) — lng comes FIRST.
export function wktToPoints(wkt: string): ZonePoint[] {
  if (!wkt) return [];
  const match = wkt.match(/POLYGON\s*\(\((.+)\)\)/i);
  if (!match) return [];
  return match[1]
    .split(",")
    .map((s) => s.trim().split(/\s+/))
    .filter((pair) => pair.length >= 2)
    .map(([lngStr, latStr]) => ({
      lat: parseFloat(latStr),
      lng: parseFloat(lngStr),
    }))
    .filter((p) => !isNaN(p.lat) && !isNaN(p.lng))
    .slice(0, -1); // drop the closing (duplicated) point
}

export function pointsToWkt(points: ZonePoint[]): string {
  if (points.length === 0) return "";
  const closed = [...points, points[0]];
  return `POLYGON((${closed.map((p) => `${p.lng} ${p.lat}`).join(", ")}))`;
}

// ─── Mapper: Backend → Frontend ───────────────────────────────────────────────
export function mapApiZone(api: ApiZone): Zone {
  const nameEn = api.name_en ?? "";
  const type = (api.type as ZoneType) || "normal";
  return {
    id: String(api.id),
    name: nameEn || api.name_ar || "Unnamed",
    name_en: nameEn,
    name_ar: api.name_ar ?? "",
    type: ["normal", "slow", "restricted"].includes(type) ? type : "normal",
    speedLimitKmh: api.speed_limit ?? 0,
    active: !!api.is_active,
    polygon: wktToPoints(api.coordinates ?? ""),
    createdAt: api.created_at ?? new Date().toISOString(),
    source: api.source,
  };
}

// ─── Centroid of a polygon (for centering the map) ────────────────────────────
export function polygonCentroid(points: ZonePoint[]): [number, number] | null {
  if (points.length === 0) return null;
  const lat = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const lng = points.reduce((s, p) => s + p.lng, 0) / points.length;
  return [lat, lng];
}
