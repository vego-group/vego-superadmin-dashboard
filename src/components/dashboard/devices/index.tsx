"use client";

import { logger } from '@/lib/logger';
import { useState, useEffect, useCallback } from "react";
import DevicesStats from "./devices-stats";
import DevicesFilters from "./devices-filters";
import DevicesTable from "./devices-table";
import { Device, DeviceType, DeviceStatus } from "./types";
import { API_ENDPOINTS, authHeaders } from "@/config/api";
import { Loader2, AlertCircle } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { useCountryView } from "@/lib/country-view-context";
import { apiErrorMessage } from "@/lib/api-error";
import { toIsoCountryCodeOrNull } from "@/types/country";

export default function DevicesIndex() {
  const { t } = useLang();
  const { countryParam } = useCountryView();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters State
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | DeviceType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | DeviceStatus>("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [syncing, setSyncing] = useState<"stations" | "devices" | null>(null);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const countryQs = countryParam ? `?country=${countryParam}` : "";
      const [cabRes, pileRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.CABINET_LIST}${countryQs}`, { headers: authHeaders() }),
        fetch(`${API_ENDPOINTS.PILE_LIST}${countryQs}`, { headers: authHeaders() })
      ]);

      // §0.3: 422 country_not_supported must surface, never be swallowed.
      if (!cabRes.ok) throw new Error(await apiErrorMessage(cabRes, "Failed to fetch cabinets", countryParam));
      if (!pileRes.ok) throw new Error(await apiErrorMessage(pileRes, "Failed to fetch piles", countryParam));

      const cabData = await cabRes.json();
      const pileData = await pileRes.json();

      type Raw = Record<string, unknown>;
      const formattedCabinets: Device[] = ((cabData.data || []) as Raw[]).map((c) => ({
        id: String(c.cabinet_id ?? ""),
        internalId: Number(c.id ?? 0),
        type: "cabinet" as const,
        name: c.name ? String(c.name) : null,
        location: String(c.address ?? ""),
        city: String(c.city ?? ""),
        isoCountryCode: toIsoCountryCodeOrNull(c.iso_country_code),
        status: c.status as Device["status"], // active, inactive...
        slots: Number(c.slots_count ?? 0),
        availableSlots: Number(
          c.empty_slots
            ?? c.available_slots
            ?? Math.max(0, Number(c.slots_count ?? 0) - (Array.isArray(c.batteries) ? c.batteries.length : 0)),
        ),
        createdAt: String(c.created_at ?? "")
      }));

      const formattedPiles: Device[] = ((pileData.data || []) as Raw[]).map((p) => ({
        id: String(p.dev_id ?? ""),
        internalId: Number(p.id ?? 0),
        type: "charging" as const,
        name: p.name ? String(p.name) : null,
        location: String(p.address ?? ""),
        city: String(p.city ?? ""),
        isoCountryCode: toIsoCountryCodeOrNull(p.iso_country_code),
        status: p.status as Device["status"],
        slots: Number(p.ports_count ?? 0),
        createdAt: String(p.created_at ?? "")
      }));

      // Newest device first — otherwise a just-added device lands on the last
      // page. Sort by createdAt desc, tie-break on internalId desc.
      const merged = [...formattedCabinets, ...formattedPiles].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (tb !== ta) return tb - ta;
        return (b.internalId ?? 0) - (a.internalId ?? 0);
      });

      setDevices(merged);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch devices";
      setError(msg);
      logger.error("Failed to fetch devices:", msg);
    } finally {
      setLoading(false);
    }
  }, [countryParam]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = devices.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      d.id.toLowerCase().includes(q) ||
      (d.name ?? "").toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q) ||
      d.city.toLowerCase().includes(q);
    
    const matchType = typeFilter === "all" || d.type === typeFilter;
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const matchCity = cityFilter === "all" || d.city === cityFilter;
    
    return matchSearch && matchType && matchStatus && matchCity;
  });

  const cities = ["all", ...Array.from(new Set(devices.map((d) => d.city)))];

  const runSync = async (kind: "stations" | "devices") => {
    setSyncing(kind);
    setSyncMsg(null);
    try {
      const url =
        kind === "stations"
          ? API_ENDPOINTS.IOT_DEVICES_SYNC_STATIONS
          : API_ENDPOINTS.IOT_DEVICES_SYNC;
      const res = await fetch(url, { method: "POST", headers: authHeaders() });
      const json = await res.json().catch(() => ({}));
      setSyncMsg(
        json.message ||
          (res.ok
            ? t("Sync completed", "اكتملت المزامنة")
            : t("Sync failed", "فشلت المزامنة"))
      );
      if (res.ok) await fetchData();
    } catch (err) {
      setSyncMsg(err instanceof Error ? err.message : "Network error");
    } finally {
      setSyncing(null);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            {t("Device Management", "إدارة الأجهزة")}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {t("Real-time status of Battery Swap & Fast Charging devices", "الحالة الفورية لأجهزة تبديل البطاريات والشحن السريع")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => runSync("stations")}
            disabled={!!syncing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-50 disabled:opacity-50"
          >
            {syncing === "stations" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {t("Sync stations from Vego", "مزامنة المحطات من Vego")}
          </button>
          <button
            onClick={() => runSync("devices")}
            disabled={!!syncing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            {syncing === "devices" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {t("Sync vehicles from Vego", "مزامنة المركبات من Vego")}
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-800">
          {syncMsg}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <DevicesStats devices={devices} />

      <DevicesFilters
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        cityFilter={cityFilter}
        onCityChange={setCityFilter}
        cities={cities}
      />

      <DevicesTable devices={filtered} />
    </div>
  );
}