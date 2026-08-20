"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useLang } from "@/lib/language-context";
import { hasMapCoords } from "./group-vehicles";
import type { SuperadminVehicle } from "./types";

const statusColor = (status: SuperadminVehicle["status"]) =>
  status === "active"
    ? "#10b981"
    : status === "charging"
    ? "#6366f1"
    : status === "maintenance"
    ? "#f59e0b"
    : "#6b7280";

const getIcon = (status: SuperadminVehicle["status"], selected: boolean) =>
  L.divIcon({
    className: "vehicle-marker",
    html: `
      <div style="
        background-color: ${statusColor(status)};
        width: ${selected ? 36 : 30}px; height: ${selected ? 36 : 30}px; border-radius: 50%;
        display:flex; align-items:center; justify-content:center;
        border: ${selected ? 3 : 2}px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      ">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="5.5" cy="17.5" r="3.5"></circle>
          <circle cx="18.5" cy="17.5" r="3.5"></circle>
          <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"></path>
        </svg>
      </div>`,
    iconSize: selected ? [36, 36] : [30, 30],
    iconAnchor: selected ? [18, 36] : [15, 30],
    popupAnchor: [0, -30],
  });

function MapUpdater({ pins, selected }: { pins: SuperadminVehicle[]; selected?: SuperadminVehicle | null }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length === 0) return;
    if (pins.length === 1) {
      map.setView([pins[0].coordinates.lat, pins[0].coordinates.lng], 14);
      return;
    }
    const bounds = L.latLngBounds(pins.map((p) => [p.coordinates.lat, p.coordinates.lng] as [number, number]));
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    if (Math.abs(ne.lat - sw.lat) > 4 || Math.abs(ne.lng - sw.lng) > 4) {
      const focus = selected && hasMapCoords(selected) ? selected : pins[0];
      map.setView([focus.coordinates.lat, focus.coordinates.lng], 12);
      return;
    }
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, pins, selected]);
  return null;
}

export default function VehicleMap({
  vehicle,
  vehicles,
  onPick,
}: {
  vehicle: SuperadminVehicle;
  vehicles?: SuperadminVehicle[];
  onPick?: (id: string) => void;
}) {
  const { t } = useLang();
  const pins = (vehicles && vehicles.length > 0 ? vehicles : [vehicle]).filter(hasMapCoords);

  if (pins.length === 0) {
    return (
      <div className="h-[220px] rounded-xl bg-gray-100 flex items-center justify-center text-sm text-gray-400">
        {t("No location available", "لا يوجد موقع متاح")}
      </div>
    );
  }

  const center: [number, number] = hasMapCoords(vehicle)
    ? [vehicle.coordinates.lat, vehicle.coordinates.lng]
    : [pins[0].coordinates.lat, pins[0].coordinates.lng];

  return (
    <div className="h-[220px] rounded-xl overflow-hidden border border-gray-200">
      <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%", zIndex: 1 }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.coordinates.lat, pin.coordinates.lng]}
            icon={getIcon(pin.status, pin.id === vehicle.id)}
            eventHandlers={onPick ? { click: () => onPick(pin.id) } : undefined}
          >
            <Popup>
              <div className="min-w-[140px]">
                <p className="font-semibold text-gray-900 text-xs">{pin.plateNumber}</p>
                <p className="text-[11px] text-gray-500">{pin.location || pin.deviceImei}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        <MapUpdater pins={pins} selected={vehicle} />
      </MapContainer>
    </div>
  );
}
