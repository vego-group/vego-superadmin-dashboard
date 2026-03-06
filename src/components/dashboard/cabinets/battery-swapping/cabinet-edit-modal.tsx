// src/components/dashboard/cabinates/battery-swapping/cabinet-edit-modal.tsx
"use client";

import { useState } from "react";
import { X, Battery, Map, Building2, MapPin } from "lucide-react";
import { Cabinet, EditCabinetForm, CabinetStatus } from "../types";
import { STATUS_CFG } from "./cabinet-card";

const ACCENT = "#00E5BE";

interface Props {
  cabinet: Cabinet;
  onClose: () => void;
  onSave: (id: string, form: EditCabinetForm) => void;
}

export default function CabinetEditModal({ cabinet, onClose, onSave }: Props) {
  const [form, setForm] = useState<EditCabinetForm>({
    lat: String(cabinet.lat),
    lng: String(cabinet.lng),
    address: cabinet.address,
    city: cabinet.city,
    province: cabinet.province,
    status: cabinet.status,
  });

  const fields: {
    key: keyof Omit<EditCabinetForm, "status">;
    label: string;
    placeholder: string;
    icon: React.ReactNode;
    half?: boolean;
  }[] = [
    { key: "address",  label: "Address",   placeholder: "Full street address", icon: <Map className="h-3.5 w-3.5" />       },
    { key: "city",     label: "City",      placeholder: "City name",           icon: <Building2 className="h-3.5 w-3.5" />, half: true },
    { key: "province", label: "Province",  placeholder: "Province",            icon: <Building2 className="h-3.5 w-3.5" />, half: true },
    { key: "lat",      label: "Latitude",  placeholder: "e.g. 30.0444",        icon: <MapPin className="h-3.5 w-3.5" />,    half: true },
    { key: "lng",      label: "Longitude", placeholder: "e.g. 31.2357",        icon: <MapPin className="h-3.5 w-3.5" />,    half: true },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Purple Line */}
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${ACCENT}18`, color: ACCENT }}
            >
              <Battery className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold text-sm">Edit Cabinet</h3>
              <p className="text-gray-400 text-xs font-mono">{cabinet.cabinet_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Status Selector */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Status
            </label>
            <div className="flex gap-2">
              {(["active", "offline", "faulty"] as CabinetStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setForm({ ...form, status: s })}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
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

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-3">
            {fields.map((f) => (
              <div key={f.key} className={f.half ? "" : "col-span-2"}>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5">
                  {f.icon}
                  {f.label}
                </label>
                <input
                  value={form[f.key] as string}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-300 transition-colors"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(cabinet.id, form); onClose(); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
            style={{ backgroundColor: "#1C1FC1" }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}