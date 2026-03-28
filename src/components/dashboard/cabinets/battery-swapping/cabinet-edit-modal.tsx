"use client";

import { useState, useEffect } from "react";
import { X, Battery, Map, Building2, Loader2, AlertCircle } from "lucide-react";
import { Cabinet, EditCabinetForm, CabinetStatus } from "../types";
import { STATUS_CFG } from "./cabinet-card";
import dynamic from "next/dynamic";

// ✅ استيراد الخريطة مع تعطيل SSR
const LocationPickerMap = dynamic(
  () => import("./location-picker-map-client"),
  { ssr: false }
);

const ACCENT = "#00E5BE";

interface Props {
  cabinet: Cabinet;
  onClose: () => void;
  onSave: (id: string, form: EditCabinetForm) => void;
}

export default function CabinetEditModal({ cabinet, onClose, onSave }: Props) {
  const [form, setForm] = useState<EditCabinetForm>({
    lat:      String(cabinet.lat),
    lng:      String(cabinet.lng),
    address:  cabinet.address,
    city:     cabinet.city,
    province: cabinet.province,
    status:   cabinet.status,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [tempLat, setTempLat]     = useState<number>(cabinet.lat);
  const [tempLng, setTempLng]     = useState<number>(cabinet.lng);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setTempLat(cabinet.lat);
    setTempLng(cabinet.lng);
    setForm({
      lat:      String(cabinet.lat),
      lng:      String(cabinet.lng),
      address:  cabinet.address,
      city:     cabinet.city,
      province: cabinet.province,
      status:   cabinet.status,
    });
  }, [cabinet]);

  const handleLocationChange = (lat: number, lng: number) => {
    setTempLat(lat);
    setTempLng(lng);
    setForm({ ...form, lat: String(lat), lng: String(lng) });
    setError(null);
  };

  const fields: {
    key: keyof Omit<EditCabinetForm, "status">;
    label: string;
    placeholder: string;
    icon: React.ReactNode;
    half?: boolean;
  }[] = [
    { key: "address",  label: "Address",   placeholder: "Full street address", icon: <Map className="h-3.5 w-3.5" /> },
    { key: "city",     label: "City",      placeholder: "City name",           icon: <Building2 className="h-3.5 w-3.5" />, half: true },
    { key: "province", label: "Province",  placeholder: "Province",            icon: <Building2 className="h-3.5 w-3.5" />, half: true },
  ];

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/cabinet/update/${cabinet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          cabinet_id: cabinet.cabinet_id,
          address:  form.address,
          lat:      parseFloat(form.lat),
          lng:      parseFloat(form.lng),
          city:     form.city,
          province: form.province,
          status:   form.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to update cabinet");
      }

      onSave(cabinet.id, form);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update cabinet";
      setError(msg);
      console.error("❌ Edit cabinet failed:", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setError(null);
    onClose();
  };

  const hasValidCoordinates = tempLat && tempLng && !isNaN(tempLat) && !isNaN(tempLng) && tempLat !== 0 && tempLng !== 0;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-2xl overflow-y-auto max-h-[85vh] sm:max-h-[90vh] relative z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${ACCENT}18`, color: ACCENT }}
            >
              <Battery className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold text-xs sm:text-sm">Edit Cabinet</h3>
              <p className="text-gray-400 text-[10px] sm:text-xs font-mono">{cabinet.cabinet_id}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-2.5 sm:p-3 text-xs sm:text-sm text-red-600">
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="px-4 sm:px-6 py-4 sm:py-5">
          {/* Status Selector */}
          <div className="mb-4 sm:mb-6">
            <label className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Status
            </label>
            <div className="flex gap-2">
              {(["active", "offline", "faulty"] as CabinetStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setForm({ ...form, status: s })}
                  disabled={isLoading}
                  className={`flex-1 py-1.5 sm:py-2 rounded-xl text-xs font-semibold border transition-all disabled:opacity-50 ${
                    form.status === s
                      ? STATUS_CFG[s].badge
                      : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {STATUS_CFG[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Picker Map - فقط على العميل */}
          <div className="mb-4 sm:mb-6">
            <label className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Location on Map
            </label>
            
            {!hasValidCoordinates && (
              <div className="mb-3 flex items-start gap-2 rounded-xl bg-yellow-50 border border-yellow-200 p-2.5 sm:p-3 text-xs sm:text-sm text-yellow-700">
                <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                <span>Invalid coordinates detected! Please select a valid location on the map.</span>
              </div>
            )}
            
            {isMounted ? (
              <LocationPickerMap
                lat={tempLat}
                lng={tempLng}
                onLocationChange={handleLocationChange}
              />
            ) : (
              <div className="bg-gray-100 rounded-lg h-[250px] sm:h-[320px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {fields.map((f) => (
              <div key={f.key} className={f.half ? "" : "col-span-2"}>
                <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-400 mb-1.5">
                  {f.icon}
                  {f.label}
                </label>
                <input
                  value={form[f.key] as string}
                  onChange={(e) => { setForm({ ...form, [f.key]: e.target.value }); setError(null); }}
                  placeholder={f.placeholder}
                  disabled={isLoading}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 sm:py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-300 transition-colors disabled:opacity-60"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 sm:gap-3 px-4 sm:px-6 pb-4 sm:pb-6 sticky bottom-0 bg-white pt-3 sm:pt-4 border-t border-gray-100">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !hasValidCoordinates}
            className="flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: "#1C1FC1" }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                <span className="text-xs sm:text-sm">Saving...</span>
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}