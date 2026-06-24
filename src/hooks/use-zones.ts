"use client";

import { logger } from '@/lib/logger';
import { useState, useEffect, useCallback } from "react";
import { Zone, ApiZone } from "@/types/dashboard/zone";
import { mapApiZone } from "@/lib/zone-utils";

const extractList = (json: { data?: unknown }): ApiZone[] => {
  if (Array.isArray(json.data)) return json.data as ApiZone[];
  const nested = (json.data as { data?: unknown } | undefined)?.data;
  return Array.isArray(nested) ? (nested as ApiZone[]) : [];
};

export function useZones() {
  // Zones the super-admin created (enforced on individual users) → CRUD-able
  const [ownZones, setOwnZones] = useState<Zone[]>([]);
  // Zones owned by fleets → read-only
  const [fleetZones, setFleetZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchZones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Run both in parallel: own zones + the full (super-admin + fleet) list
      const [ownRes, allRes] = await Promise.all([
        fetch(`/api/proxy/zones?limit=100`),
        fetch(`/api/proxy/fleet-zones`),
      ]);

      if (!allRes.ok) throw new Error(`Failed to fetch zones (${allRes.status})`);

      const allJson = await allRes.json();
      if (allJson.success === false) {
        throw new Error(allJson.message || "Failed to fetch zones");
      }
      const allZones = extractList(allJson).map(mapApiZone);

      // Own zones (best-effort — fall back to source flag if this call fails)
      let own: Zone[] = [];
      if (ownRes.ok) {
        const ownJson = await ownRes.json();
        own = extractList(ownJson).map(mapApiZone);
      } else {
        own = allZones.filter((z) => z.source === "super-admin");
      }

      const ownIds = new Set(own.map((z) => z.id));

      setOwnZones(own.map((z) => ({ ...z, source: "super-admin" })));
      setFleetZones(
        allZones
          .filter((z) => !ownIds.has(z.id))
          .map((z) => ({ ...z, source: "fleet" }))
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch zones";
      setError(msg);
      logger.error("❌ fetchZones:", msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  // Combined list (used by the map)
  const zones = [...ownZones, ...fleetZones];

  return { zones, ownZones, fleetZones, isLoading, error, fetchZones };
}
