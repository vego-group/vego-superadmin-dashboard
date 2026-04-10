"use client";

import { useLang } from "@/lib/language-context"; // ← ADD THIS IMPORT
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Cabinet } from "../types";

// إصلاح مشكلة أيقونات Leaflet في Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// أيقونات مخصصة حسب الحالة - مع لون مختلف للـ Fast Charging
const getCustomIcon = (status: Cabinet["status"]) => {
  const color =
    status === "active"      ? "#10b981" :
    status === "offline"     ? "#f59e0b" :
    status === "inactive"    ? "#6b7280" :
    status === "maintenance" ? "#f59e0b" :
    "#ef4444";
  
  return L.divIcon({
    className: "custom-marker-fast",
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        cursor: pointer;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// مكون لتحديث الخريطة تلقائياً
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

// مكون النافذة المنبثقة للخزان
const CabinetPopup = ({ cabinet, onView }: { cabinet: Cabinet; onView: () => void }) => {
  const { t } = useLang(); // ← ADD THIS
  
  const statusColors: Record<Cabinet["status"], string> = {
    active:      "text-green-600 bg-green-50",
    offline:     "text-orange-600 bg-orange-50",
    faulty:      "text-red-600 bg-red-50",
    inactive:    "text-gray-600 bg-gray-50",
    maintenance: "text-yellow-600 bg-yellow-50",
  };

  // statusLabels
  const statusLabels: Record<Cabinet["status"], string> = {
    active:      "Active",
    offline:     "Offline",
    faulty:      "Faulty",
    inactive:    "Inactive",
    maintenance: "Maintenance",
  };

  return (
    <div className="min-w-[180px] sm:min-w-[200px] p-1">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">{cabinet.cabinet_id}</h4>
        <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${statusColors[cabinet.status]}`}>
          {t(statusLabels[cabinet.status], statusLabels[cabinet.status])}
        </span>
      </div>
      <p className="text-[10px] sm:text-xs text-gray-600 mb-1 line-clamp-2">{cabinet.address}</p>
      <p className="text-[10px] sm:text-xs text-gray-500">{cabinet.city}, {cabinet.province}</p>
      {(cabinet.slots_count ?? cabinet.slots_total) && (
        <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
          {t("Ports", "المنافذ")}: {cabinet.slots_count ?? cabinet.slots_total}
        </p>
      )}
      <button
        onClick={onView}
        className="mt-2 sm:mt-3 w-full text-[10px] sm:text-xs text-white bg-[#1C1FC1] hover:opacity-90 py-1 sm:py-1.5 rounded-lg transition"
      >
        {t("View Details", "عرض التفاصيل")}
      </button>
    </div>
  );
};

interface CabinetMapProps {
  cabinets: Cabinet[];
  onCabinetSelect?: (cabinet: Cabinet) => void;
}

export default function CabinetMap({ cabinets, onCabinetSelect }: CabinetMapProps) {
  const { t } = useLang(); // ← ADD THIS
  const [mapCenter, setMapCenter] = useState<[number, number]>([30.0444, 31.2357]);
  const [mapZoom, setMapZoom] = useState(10);
  const [mapHeight, setMapHeight] = useState(450);
  const [isClient, setIsClient] = useState(false);

  // تحديد ارتفاع الخريطة حسب حجم الشاشة
  useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setMapHeight(300);
        setMapZoom(11);
      } else if (window.innerWidth < 768) {
        setMapHeight(350);
        setMapZoom(11);
      } else {
        setMapHeight(450);
        setMapZoom(12);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // حساب مركز الخريطة بناءً على الخزانات
  useEffect(() => {
    if (cabinets.length > 0) {
      const validCabinets = cabinets.filter(c => c.lat && c.lng && !isNaN(c.lat) && !isNaN(c.lng));
      if (validCabinets.length > 0) {
        const avgLat = validCabinets.reduce((sum, c) => sum + c.lat, 0) / validCabinets.length;
        const avgLng = validCabinets.reduce((sum, c) => sum + c.lng, 0) / validCabinets.length;
        setMapCenter([avgLat, avgLng]);
      }
    }
  }, [cabinets]);

  const validCabinets = cabinets.filter(c => 
    c.lat && c.lng && !isNaN(c.lat) && !isNaN(c.lng) && c.lat !== 0 && c.lng !== 0
  );

  if (!isClient) {
    return (
      <div className="bg-gray-100 rounded-xl h-[300px] sm:h-[450px] flex items-center justify-center">
        <p className="text-gray-500 text-sm">{t("Loading map...", "جارٍ تحميل الخريطة…")}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header - Responsive */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">
            {t("Fast Charging Piles Map", "خريطة محطات الشحن السريع")}
          </h3>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
            {validCabinets.length} {t("piles displayed on map", "محطات معروضة على الخريطة")}
          </p>
        </div>
        
        {/* Legend - Responsive */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500" />
            <span className="text-[10px] sm:text-xs text-gray-500">{t("Active", "نشط")}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-orange-500" />
            <span className="text-[10px] sm:text-xs text-gray-500">{t("Offline", "غير متصل")}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500" />
            <span className="text-[10px] sm:text-xs text-gray-500">{t("Faulty", "معطل")}</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div style={{ height: `${mapHeight}px`, width: "100%" }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "100%", width: "100%", zIndex: 1 }}
          zoomControl={typeof window !== 'undefined' && window.innerWidth >= 768}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {validCabinets.map((cabinet) => (
            <Marker
              key={cabinet.id}
              position={[cabinet.lat, cabinet.lng]}
              icon={getCustomIcon(cabinet.status)}
              eventHandlers={{
                click: () => onCabinetSelect?.(cabinet),
              }}
            >
              <Popup>
                <CabinetPopup 
                  cabinet={cabinet} 
                  onView={() => onCabinetSelect?.(cabinet)} 
                />
              </Popup>
            </Marker>
          ))}

          <MapUpdater center={mapCenter} />
        </MapContainer>
      </div>

      {/* Empty State */}
      {validCabinets.length === 0 && cabinets.length > 0 && (
        <div className="p-4 sm:p-6 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            ⚠️ {t("No piles with valid coordinates found. Please add coordinates to display them on map.",
              "لا توجد محطات بإحداثيات صحيحة. يرجى إضافة إحداثيات لعرضها على الخريطة.")}
          </p>
        </div>
      )}

      {cabinets.length === 0 && (
        <div className="p-4 sm:p-6 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            {t("No piles to display on map.", "لا توجد محطات لعرضها على الخريطة.")}
          </p>
        </div>
      )}
    </div>
  );
}