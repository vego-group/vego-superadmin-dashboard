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

// ─── Name script validation ───────────────────────────────────────────────────
// The English field takes Latin script, the Arabic field takes Arabic script.
// Digits, whitespace and common punctuation are fine in both.
const SHARED = "0-9\\s\\-_'’.,&()/";
const ARABIC = "\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF";

const EN_ALLOWED = new RegExp(`^[A-Za-z${SHARED}]+$`);
const AR_ALLOWED = new RegExp(`^[${ARABIC}${SHARED}]+$`);
// At least one real letter, so digits/punctuation alone don't pass either field.
const HAS_LATIN_LETTER = /[A-Za-z]/;
const HAS_ARABIC_LETTER = new RegExp(
  "[\\u0621-\\u064A\\u066E-\\u06D3\\u0750-\\u077F\\u08A0-\\u08FF]"
);

export function isEnglishName(value: string): boolean {
  const v = value.trim();
  return v.length > 0 && EN_ALLOWED.test(v) && HAS_LATIN_LETTER.test(v);
}

export function isArabicName(value: string): boolean {
  const v = value.trim();
  return v.length > 0 && AR_ALLOWED.test(v) && HAS_ARABIC_LETTER.test(v);
}

// ─── Overlap detection ────────────────────────────────────────────────────────
// Zones must not overlap, so a candidate polygon is rejected when it crosses,
// contains, or is contained by any existing zone.
const EPS = 1e-12;

// Sign of the cross product (a→b) × (a→c): 1 = left turn, -1 = right, 0 = collinear.
function orientation(a: ZonePoint, b: ZonePoint, c: ZonePoint): number {
  const v =
    (b.lng - a.lng) * (c.lat - a.lat) - (b.lat - a.lat) * (c.lng - a.lng);
  if (Math.abs(v) < EPS) return 0;
  return v > 0 ? 1 : -1;
}

// Is p inside the bounding box of segment a→b (used only for collinear points)?
function onSegment(a: ZonePoint, b: ZonePoint, p: ZonePoint): boolean {
  return (
    p.lat >= Math.min(a.lat, b.lat) - EPS &&
    p.lat <= Math.max(a.lat, b.lat) + EPS &&
    p.lng >= Math.min(a.lng, b.lng) - EPS &&
    p.lng <= Math.max(a.lng, b.lng) + EPS
  );
}

export function segmentsIntersect(
  a1: ZonePoint,
  a2: ZonePoint,
  b1: ZonePoint,
  b2: ZonePoint
): boolean {
  const o1 = orientation(a1, a2, b1);
  const o2 = orientation(a1, a2, b2);
  const o3 = orientation(b1, b2, a1);
  const o4 = orientation(b1, b2, a2);

  if (o1 !== o2 && o3 !== o4) return true;

  // Collinear touching cases.
  if (o1 === 0 && onSegment(a1, a2, b1)) return true;
  if (o2 === 0 && onSegment(a1, a2, b2)) return true;
  if (o3 === 0 && onSegment(b1, b2, a1)) return true;
  if (o4 === 0 && onSegment(b1, b2, a2)) return true;

  return false;
}

// Ray-casting point-in-polygon test.
export function pointInPolygon(p: ZonePoint, polygon: ZonePoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    const crosses =
      yi > p.lat !== yj > p.lat &&
      p.lng < ((xj - xi) * (p.lat - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

function boundsOf(points: ZonePoint[]) {
  return points.reduce(
    (b, p) => ({
      minLat: Math.min(b.minLat, p.lat),
      maxLat: Math.max(b.maxLat, p.lat),
      minLng: Math.min(b.minLng, p.lng),
      maxLng: Math.max(b.maxLng, p.lng),
    }),
    {
      minLat: Infinity,
      maxLat: -Infinity,
      minLng: Infinity,
      maxLng: -Infinity,
    }
  );
}

export function polygonsOverlap(a: ZonePoint[], b: ZonePoint[]): boolean {
  if (a.length < 3 || b.length < 3) return false;

  // Cheap bounding-box rejection before the O(n·m) edge scan.
  const ba = boundsOf(a);
  const bb = boundsOf(b);
  if (
    ba.maxLat < bb.minLat ||
    bb.maxLat < ba.minLat ||
    ba.maxLng < bb.minLng ||
    bb.maxLng < ba.minLng
  ) {
    return false;
  }

  // Any pair of edges crossing → the outlines intersect.
  for (let i = 0; i < a.length; i++) {
    const a1 = a[i];
    const a2 = a[(i + 1) % a.length];
    for (let j = 0; j < b.length; j++) {
      const b1 = b[j];
      const b2 = b[(j + 1) % b.length];
      if (segmentsIntersect(a1, a2, b1, b2)) return true;
    }
  }

  // No crossing edges → one polygon may still sit fully inside the other.
  return pointInPolygon(a[0], b) || pointInPolygon(b[0], a);
}

// Zones (other than `excludeId`) that the candidate polygon collides with.
export function findOverlappingZones(
  polygon: ZonePoint[],
  zones: Zone[],
  excludeId?: string
): Zone[] {
  if (polygon.length < 3) return [];
  return zones.filter(
    (z) =>
      z.id !== excludeId &&
      z.polygon.length >= 3 &&
      polygonsOverlap(polygon, z.polygon)
  );
}
