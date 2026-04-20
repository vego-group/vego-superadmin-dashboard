"use client";

import { useState } from "react";
import { X, User, Phone, Mail, Loader2, AlertCircle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY = { name: "", phone: "", email: "" };

export default function AddSalesModal({ open, onClose, onSuccess }: Props) {
  const [form, setForm]           = useState(EMPTY);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  if (!open) return null;

  const handleClose = () => {
    if (isLoading) return;
    setForm(EMPTY);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      setError("Name and phone are required.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/proxy/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...form, role: "sales" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || Object.values(data.errors ?? {}).flat().join(", ") || "Failed to add");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add sales member");
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { key: "name",  label: "Full Name",     placeholder: "e.g. Ahmed Al-Rashidi", icon: User,  type: "text" },
    { key: "phone", label: "Phone Number",  placeholder: "+966 5X XXX XXXX",       icon: Phone, type: "tel"  },
    { key: "email", label: "Email (optional)", placeholder: "email@example.com",   icon: Mail,  type: "email"},
  ] as const;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Add Sales Member</h3>
            <p className="text-xs text-gray-400 mt-0.5">New sales team member will receive OTP login access</p>
          </div>
          <button onClick={handleClose} disabled={isLoading} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition disabled:opacity-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="px-6 py-5 space-y-4">
          {fields.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.key}>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  {f.label} {f.key !== "email" && <span className="text-red-400">*</span>}
                </label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={f.type}
                    value={form[f.key]}
                    onChange={e => { setForm({ ...form, [f.key]: e.target.value }); setError(null); }}
                    placeholder={f.placeholder}
                    disabled={isLoading}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-300 transition disabled:opacity-60"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={handleClose} disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
            style={{ backgroundColor: "#1C1FC1" }}>
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Adding…</> : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}