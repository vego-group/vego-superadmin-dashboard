"use client";

import { useState, useEffect } from "react";
import { X, Zap, Hash, Map, Building2, Loader2, AlertCircle, Layers } from "lucide-react";
import { AddCabinetForm } from "../types";
import dynamic from "next/dynamic";

const LocationPickerMap = dynamic(
  () => import("./location-picker-map"),
  { ssr: false }
);

const ACCENT = "#F59E0B";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit?: (form: AddCabinetForm) => void;
}

const EMPTY: AddCabinetForm = {
  cabinet_id: "",
  name: "",
  lat: "",
  lng: "",
  address: "",
  city: "",
  province: "",
  dev_id: "",
  slots_count: "",
};

export default function CabinetAddModal({ open, onClose, onSubmit }: Props) {
  const [form, setForm]           = useState<AddCabinetForm>(EMPTY);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [tempLat, setTempLat]     = useState<number>(30.0444);
  const [tempLng, setTempLng]     = useState<number>(31.2357);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!open) return null;

  const handleLocationChange = (lat: number, lng: number) => {
    setTempLat(lat);
    setTempLng(lng);
    setForm((prev) => ({ ...prev, lat: String(lat), lng: String(lng) }));
    setError(null);
  };

  // ─── Fields ───────────────────────────────────────────────────────────────
  const topFields: {
    key: keyof Omit<AddCabinetForm, "lat" | "lng">;
    label: string;
    placeholder: string;
    icon: React.ReactNode;
    required?: boolean;
  }[] = [
    {
      key: "dev_id",
      label: "Device ID",
      placeholder: "e.g. ST20251124001A",
      icon: <Hash className="h-3.5 w-3.5" />,
      required: true,
    },
    {
      key: "name",
      label: "Name",
      placeholder: "e.g. Pile — Olaya",
      icon: <Hash className="h-3.5 w-3.5" />,
      required: false,
    },
  ];

  const bottomFields: {
    key: keyof Omit<AddCabinetForm, "lat" | "lng">;
    label: string;
    placeholder: string;
    icon: React.ReactNode;
    half?: boolean;
    type?: string;
    required?: boolean;
  }[] = [
    {
      key: "address",
      label: "Address",
      placeholder: "Full street address",
      icon: <Map className="h-3.5 w-3.5" />,
      required: true,
    },
    {
      key: "city",
      label: "City",
      placeholder: "City name",
      icon: <Building2 className="h-3.5 w-3.5" />,
      half: true,
      required: true,
    },
    {
      key: "province",
      label: "Province",
      placeholder: "Province",
      icon: <Building2 className="h-3.5 w-3.5" />,
      half: true,
      required: true,
    },
    {
      key: "slots_count",
      label: "Ports Count",
      placeholder: "e.g. 4",
      icon: <Layers className="h-3.5 w-3.5" />,
      half: true,
      type: "number",
      required: false,
    },
  ];

  const handleClose = () => {
    if (isLoading) return;
    setForm(EMPTY);
    setTempLat(30.0444);
    setTempLng(31.2357);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        dev_id:      (form.dev_id ?? "").trim(),
        name:        form.name?.trim() || null,
        address:     form.address.trim(),
        lat:         parseFloat(form.lat),
        lng:         parseFloat(form.lng),
        city:        form.city.trim(),
        province:    form.province.trim(),
        ports_count: form.slots_count ? parseInt(form.slots_count, 10) : 0,
      };

      const res = await fetch("/api/proxy/pile/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to add pile");

      onSubmit?.(form);
      handleClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add pile";
      setError(msg);
      console.error("❌ Add pile failed:", msg);
    } finally {
      setIsLoading(false);
    }
  };

  // dev_id, address, city, province + إحداثيات = required
  const isFormValid =
    (form.dev_id ?? "").trim() !== "" &&
    form.address.trim()        !== "" &&
    form.city.trim()           !== "" &&
    form.province.trim()       !== "" &&
    form.lat.trim()            !== "" &&
    form.lng.trim()            !== "";

  const hasValidCoordinates =
    tempLat && tempLng && !isNaN(tempLat) && !isNaN(tempLng);

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
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold text-xs sm:text-sm">Add Fast Charging Pile</h3>
              <p className="text-gray-400 text-[10px] sm:text-xs">Fill in the details below</p>
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

        <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-6">

          {/* Device ID + Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topFields.map((f) => (
              <div key={f.key}>
                <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-400 mb-1.5">
                  {f.icon}
                  {f.label}
                  {f.required && <span className="text-red-400">*</span>}
                </label>
                <input
                  value={(form[f.key] as string) ?? ""}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, [f.key]: e.target.value }));
                    setError(null);
                  }}
                  placeholder={f.placeholder}
                  disabled={isLoading}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 sm:py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-300 transition-colors disabled:opacity-60"
                />
              </div>
            ))}
          </div>

          {/* Map */}
          <div>
            <label className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Select Location on Map <span className="text-red-400">*</span>
            </label>

            {!hasValidCoordinates && (
              <div className="mb-3 flex items-start gap-2 rounded-xl bg-yellow-50 border border-yellow-200 p-2.5 sm:p-3 text-xs sm:text-sm text-yellow-700">
                <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                <span>Please select a location on the map</span>
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

          {/* Address, City, Province, Ports Count */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {bottomFields.map((f) => (
              <div key={f.key} className={f.half ? "" : "col-span-2"}>
                <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-400 mb-1.5">
                  {f.icon}
                  {f.label}
                  {f.required && <span className="text-red-400">*</span>}
                </label>
                <input
                  type={f.type ?? "text"}
                  min={f.type === "number" ? "0" : undefined}
                  value={(form[f.key] as string) ?? ""}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, [f.key]: e.target.value }));
                    setError(null);
                  }}
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
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading || !hasValidCoordinates}
            className="flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: "#1C1FC1" }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                <span className="text-xs sm:text-sm">Adding...</span>
              </>
            ) : (
              "Add Pile"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}