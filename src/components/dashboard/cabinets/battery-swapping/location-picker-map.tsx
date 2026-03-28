"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Crosshair } from "lucide-react";

// أيقونة مخصصة للمؤشر
const customIcon = L.divIcon({
  className: "custom-marker-drag",
  html: `
    <div style="
      background-color: #1C1FC1;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      cursor: grab;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// مكون للتعامل مع أحداث الخريطة
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

export default function LocationPickerMap({ 
  lat, 
  lng, 
  onLocationChange, 
  readOnly = false 
}: LocationPickerMapProps) {
  const [position, setPosition] = useState<[number, number]>([lat, lng]);
  const [mapHeight, setMapHeight] = useState(320);
  const [isClient, setIsClient] = useState(false);

  // تحديد ارتفاع الخريطة حسب الشاشة
  useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setMapHeight(250);
      } else {
        setMapHeight(320);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // تحديث الموقع عندما تتغير الإحداثيات من الخارج
  useEffect(() => {
    if (lat && lng && !isNaN(lat) && !isNaN(lng) && (lat !== position[0] || lng !== position[1])) {
      setPosition([lat, lng]);
    }
  }, [lat, lng]);

  const handleLocationSelect = (newLat: number, newLng: number) => {
    if (readOnly) return;
    setPosition([newLat, newLng]);
    onLocationChange(newLat, newLng);
  };

  const handleGetCurrentLocation = () => {
    if (readOnly) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleLocationSelect(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.error("Geolocation error:", err);
          alert("Unable to get your location. Please check your browser permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  if (!isClient) {
    return (
      <div className="bg-gray-100 rounded-lg h-[250px] sm:h-[320px] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div style={{ height: `${mapHeight}px`, width: "100%", borderRadius: "12px", overflow: "hidden" }}>
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: "100%", width: "100%", zIndex: 1  }}
          zoomControl={window.innerWidth >= 768}
          scrollWheelZoom={!readOnly}
          dragging={!readOnly}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <Marker position={position} icon={customIcon} draggable={!readOnly}>
            {/* No popup needed */}
          </Marker>
          
          {!readOnly && <MapClickHandler onLocationSelect={handleLocationSelect} />}
        </MapContainer>
      </div>
      
      {/* Buttons - Responsive */}
      <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3">
        <button
          onClick={handleGetCurrentLocation}
          className="bg-white shadow-lg rounded-lg p-1.5 sm:p-2 hover:bg-gray-50 transition-colors"
          title="Use my current location"
        >
          <Crosshair className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
        </button>
      </div>
      
      {/* Coordinates display - Responsive */}
      <div className="mt-2 sm:mt-3 grid grid-cols-2 gap-2 sm:gap-3 text-sm">
        <div className="bg-gray-50 rounded-lg p-1.5 sm:p-2">
          <p className="text-[8px] sm:text-[10px] text-gray-400 uppercase">Latitude</p>
          <p className="text-xs sm:text-sm font-mono text-gray-800">{position[0].toFixed(6)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-1.5 sm:p-2">
          <p className="text-[8px] sm:text-[10px] text-gray-400 uppercase">Longitude</p>
          <p className="text-xs sm:text-sm font-mono text-gray-800">{position[1].toFixed(6)}</p>
        </div>
      </div>
      
      {!readOnly && (
        <p className="text-[8px] sm:text-[10px] text-gray-400 mt-1.5 sm:mt-2 text-center">
          Click anywhere on the map or drag the marker to adjust location
        </p>
      )}
    </div>
  );
}