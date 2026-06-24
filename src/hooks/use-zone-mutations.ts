"use client";

import { useCallback } from "react";
import { ApiZone, Zone, ZoneFormValues } from "@/types/dashboard/zone";
import { mapApiZone, pointsToWkt } from "@/lib/zone-utils";

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

const authHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
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
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          json.message || json.error || `Failed to create zone (${res.status})`
        );
      }

      await fetchZones?.();
      return mapApiZone(json.data as ApiZone);
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
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          json.message || json.error || `Failed to update zone (${res.status})`
        );
      }

      await fetchZones?.();
      return mapApiZone(json.data as ApiZone);
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
