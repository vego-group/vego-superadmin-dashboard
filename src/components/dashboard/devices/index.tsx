"use client";

import { useState, useEffect, useCallback } from "react";
import DevicesStats from "./devices-stats";
import DevicesFilters from "./devices-filters";
import DevicesTable from "./devices-table";
import { Device, DeviceType, DeviceStatus } from "./types";
import { API_ENDPOINTS, authHeaders } from "@/config/api";
import { Loader2 } from "lucide-react";

export default function DevicesIndex() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | DeviceType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | DeviceStatus>("all");
  const [cityFilter, setCityFilter] = useState("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [cabRes, pileRes] = await Promise.all([
        fetch(API_ENDPOINTS.CABINET_LIST, { headers: authHeaders() }),
        fetch(API_ENDPOINTS.PILE_LIST, { headers: authHeaders() })
      ]);

      const cabData = await cabRes.json();
      const pileData = await pileRes.json();

      const formattedCabinets: Device[] = (cabData.data || []).map((c: any) => ({
        id: c.cabinet_id,
        internalId: c.id,
        type: "cabinet",
        name: c.name,
        location: c.address,
        city: c.city,
        status: c.status, // active, inactive...
        slots: c.slots_count,
        availableSlots: c.batteries?.length || 0,
        createdAt: c.created_at
      }));

      const formattedPiles: Device[] = (pileData.data || []).map((p: any) => ({
        id: p.dev_id,
        internalId: p.id,
        type: "charging",
        name: p.name,
        location: p.address,
        city: p.city,
        status: p.status,
        slots: p.ports_count,
        createdAt: p.created_at
      }));

      setDevices([...formattedCabinets, ...formattedPiles]);
    } catch (error) {
      console.error("Failed to fetch devices:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = devices.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      d.id.toLowerCase().includes(q) ||
      d.name.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q) ||
      d.city.toLowerCase().includes(q);
    
    const matchType = typeFilter === "all" || d.type === typeFilter;
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const matchCity = cityFilter === "all" || d.city === cityFilter;
    
    return matchSearch && matchType && matchStatus && matchCity;
  });

  const cities = ["all", ...Array.from(new Set(devices.map((d) => d.city)))];

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
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Device Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Real-time status of cabinets & charging piles</p>
        </div>
      </div>

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