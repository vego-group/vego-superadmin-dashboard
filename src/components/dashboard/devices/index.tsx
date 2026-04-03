"use client";

import DevicesStats from "./devices-stats";
import DevicesFilters from "./devices-filters";
import DevicesTable from "./devices-table";
import { useState } from "react";
import { Device } from "./types";
import { MOCK_DEVICES } from "./mock-data";

export default function DevicesIndex() {
  const [search, setSearch]           = useState("");
  const [typeFilter, setTypeFilter]   = useState<"all" | "cabinet" | "charging">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "connected" | "disconnected" | "maintenance">("all");
  const [cityFilter, setCityFilter]   = useState("all");

  const filtered = MOCK_DEVICES.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      d.id.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q) ||
      d.city.toLowerCase().includes(q);
    const matchType   = typeFilter === "all"   || d.type === typeFilter;
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const matchCity   = cityFilter === "all"   || d.city === cityFilter;
    return matchSearch && matchType && matchStatus && matchCity;
  });

  const cities = ["all", ...Array.from(new Set(MOCK_DEVICES.map((d) => d.city)))];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Device Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Battery swapping cabinets & fast charging stations</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
          style={{ backgroundColor: "#1C1FC1" }}
        >
          + Add Device
        </button>
      </div>

      <DevicesStats devices={MOCK_DEVICES} />

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