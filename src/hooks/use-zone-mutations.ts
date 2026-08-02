"use client";

import { useCallback } from "react";
import { logger } from "@/lib/logger";
import { ApiZone, Zone, ZoneFormValues } from "@/types/dashboard/zone";
import { mapApiZone, pointsToWkt } from "@/lib/zone-utils";

// Auth is handled by the proxy via the HttpOnly cookie — no token needed here.
const authHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
});

// A zone saved without a country lands as scope "global": it never matches a
// ?country= filtered list, so it silently vanishes from the country tabs. If
// the backend echoes back a different (or no) country than we sent, it ignored
// the field — surface that instead of letting zones disappear quietly.
const warnIfCountryIgnored = (sent: ZoneFormValues["country"], saved: Zone) => {
  if (sent && saved.isoCountryCode !== sent) {
    logger.warn(
      `[zones] Backend ignored country_code="${sent}" on save (answered ` +
        `"${saved.isoCountryCode ?? "null/global"}"). The zone will not appear ` +
        `under the ${sent} tab — POST/PUT /zones must accept country_code ` +
        `(docs/backend-endpoint-requests.md).`
    );
  }
};

// All CRUD happens on /super-admin/zones (NOT fleet-zones).
export function useZoneMutations(fetchZones?: () => Promise<void>) {
  const createZone = useCallback(
    async (values: ZoneFormValues): Promise<Zone> => {
      const res = await fetch(`/api/proxy/zones`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          name_en: values.name_en,
          name_ar: values.name_ar,
          type: values.type,
          speed_limit: values.speedLimitKmh || null,
          coordinates: pointsToWkt(values.polygon),
          is_active: values.active,
          // ISO market code ("JO" | "SA") — zones use ISO in `country_code`,
          // unlike users where that key is the dial code. Unknown code → 422
          // country_not_supported.
          ...(values.country ? { country_code: values.country } : {}),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          json.message || json.error || `Failed to create zone (${res.status})`
        );
      }

      const saved = mapApiZone(json.data as ApiZone);
      warnIfCountryIgnored(values.country, saved);
      await fetchZones?.();
      return saved;
    },
    [fetchZones]
  );

  const updateZone = useCallback(
    async (id: string, values: ZoneFormValues): Promise<Zone> => {
      const res = await fetch(`/api/proxy/zones/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          name_en: values.name_en,
          name_ar: values.name_ar,
          type: values.type,
          speed_limit: values.speedLimitKmh || null,
          coordinates: pointsToWkt(values.polygon),
          is_active: values.active,
          // Editing is also the migration path for legacy scope-global zones:
          // open the zone, pick its country, save.
          ...(values.country ? { country_code: values.country } : {}),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          json.message || json.error || `Failed to update zone (${res.status})`
        );
      }

      const saved = mapApiZone(json.data as ApiZone);
      warnIfCountryIgnored(values.country, saved);
      await fetchZones?.();
      return saved;
    },
    [fetchZones]
  );

  const deleteZone = useCallback(
    async (id: string): Promise<void> => {
      const res = await fetch(`/api/proxy/zones/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) {
        let message = `Failed to delete zone (${res.status})`;
        try {
          const json = await res.json();
          message = json.message || json.error || message;
        } catch {
          /* no body */
        }
        throw new Error(message);
      }

      await fetchZones?.();
    },
    [fetchZones]
  );

  return { createZone, updateZone, deleteZone };
}
