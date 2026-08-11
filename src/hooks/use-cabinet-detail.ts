"use client";

import { useState, useEffect } from "react";
import { API_ENDPOINTS, authHeaders } from "@/config/api";

export interface Battery {
  id: number;
  battery_id: string;
  battery_type: string | null;
  physical_damage: boolean;
  status: string;
  battery_percentage: number | null;
  soh: string | number | null;
  cycle_count: number | null;
  motorcycle_id: number | null;
  battery_swap_cabinet_id: number;
  cabinet_box_no: number;
  bms_status?: string | null;
  bms_protection_faulted?: boolean | null;
  bms_max_temperature_c?: string | number | null;
  bms_cell_delta_mv?: number | null;
}

export interface StationSlot {
  id: number;
  station_id: number;
  slot_number: number;
  battery_id: number | null;
  status: "reserved" | "occupied" | "empty" | "available" | "maintenance" | "faulty" | "charging";
  door_open: boolean;
  battery: Battery | null;
}

export interface CabinetDetail {
  id: number;
  cabinet_id: string;
  name: string;
  address: string;
  lat: string;
  lng: string;
  city: string;
  province: string;
  status: string;
  slots_count: number;
  batteries: Battery[];
  station_slots: StationSlot[];
  batteries_count: number;
  available_batteries: number;
  empty_slots: number;
}

export function useCabinetDetail(id: string) {
  const [data, setData]       = useState<CabinetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    fetch(API_ENDPOINTS.CABINET_DETAIL(id), { headers: authHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (json.success) setData(json.data);
        else throw new Error(json.message || "Failed to load cabinet");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, reloadKey]);

  const refetch = () => setReloadKey((key) => key + 1);

  return { data, loading, error, refetch };
}