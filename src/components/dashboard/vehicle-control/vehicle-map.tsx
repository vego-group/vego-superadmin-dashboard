"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useLang } from "@/lib/language-context";
import type { SuperadminVehicle } from "./types";

const statusColor = (status: SuperadminVehicle["status"]) =>
  status === "active"
    ? "#10b981"
    : status === "charging"
    ? "#6366f1"
    : status === "maintenance"
    ? "#f59e0b"
    : "#6b7280";

const getIcon = (status: SuperadminVehicle["status"]) =>
  L.divIcon({
    className: "vehicle-marker",
    html: `
      <div style="
        background-color: ${statusColor(status)};
        width: 30px; height: 30px; border-radius: 50%;
        display:flex; align-items:center; justify-content:center;
        border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      ">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="5.5" cy="17.5" r="3.5"></circle>
          <circle cx="18.5" cy="17.5" r="3.5"></circle>
          <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"></path>
        </svg>
      </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function VehicleMap({ vehicle }: { vehicle: SuperadminVehicle }) {
  const { t } = useLang();
  const { lat, lng } = vehicle.coordinates;
  const valid = !!lat && !!lng && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

  if (!valid) {
    return (
      <div className="h-[220px] rounded-xl bg-gray-100 flex items-center justify-center text-sm text-gray-400">
        {t("No location available", "لا يوجد موقع متاح")}
      </div>
    );
  }

  const center: [number, number] = [lat, lng];

  return (
    <div className="h-[220px] rounded-xl overflow-hidden border border-gray-200">
      <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%", zIndex: 1 }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={getIcon(vehicle.status)}>
          <Popup>
            <div className="min-w-[140px]">
              <p className="font-semibold text-gray-900 text-xs">{vehicle.plateNumber}</p>
              <p className="text-[11px] text-gray-500">{vehicle.location}</p>
            </div>
          </Popup>
        </Marker>
        <MapUpdater center={center} />
      </MapContainer>
    </div>
  );
}
