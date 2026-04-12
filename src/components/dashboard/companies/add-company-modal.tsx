"use client";

import { useLang } from "@/lib/language-context";
import { useState, useRef } from "react";
import { X, User, Phone, Mail, Building2, FileText, Upload, Loader2, AlertCircle, MapPin, Home } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

interface CompanyFormData {
  contact_person_name: string;
  contact_phone: string;
  contact_email: string;
  company_name: string;
  commercial_reg_no: string;
  city: string;
  region: string;
  address: string;
  max_motorcycles: string;
  max_drivers: string;
  billing_type: "prepaid" | "postpaid" | "corporate";
}

const EMPTY: CompanyFormData = {
  contact_person_name: "", 
  contact_phone: "", 
  contact_email: "",
  company_name: "", 
  commercial_reg_no: "",
  city: "",
  region: "",
  address: "",
  max_motorcycles: "100",
  max_drivers: "100",
  billing_type: "prepaid",
};

export default function AddCompanyModal({ open, onClose, onSubmit }: Props) {
  const { t } = useLang();
  const [form, setForm] = useState<CompanyFormData>(EMPTY);
  const [crFile, setCrFile] = useState<File | null>(null);
  const [licFile, setLicFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const crFileRef = useRef<HTMLInputElement>(null);
  const licFileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleClose = () => {
    if (isLoading) return;
    setForm(EMPTY);
    setCrFile(null);
    setLicFile(null);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.contact_person_name || !form.contact_phone || !form.contact_email || 
        !form.company_name || !form.commercial_reg_no || !crFile) {
      setError(t("Please fill in all required fields and upload the commercial registration file.",
        "يرجى ملء جميع الحقول المطلوبة ورفع ملف السجل التجاري."));
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.contact_email)) {
      setError(t("Please enter a valid email address.", "يرجى إدخال بريد إلكتروني صالح."));
      return;
    }

    // Phone validation (basic Saudi format)
    const phoneRegex = /^9665\d{8}$/;
    if (!phoneRegex.test(form.contact_phone.replace(/\s+/g, ''))) {
      setError(t("Please enter a valid Saudi phone number (9665xxxxxxxx).", 
        "يرجى إدخال رقم هاتف سعودي صالح (9665xxxxxxxx)."));
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      formData.append("contact_person_name", form.contact_person_name);
      formData.append("contact_phone", form.contact_phone);
      formData.append("contact_email", form.contact_email);
      formData.append("company_name", form.company_name);
      formData.append("commercial_reg_no", form.commercial_reg_no);
      formData.append("city", form.city);
      formData.append("region", form.region);
      formData.append("address", form.address);
      formData.append("max_motorcycles", form.max_motorcycles);
      formData.append("max_drivers", form.max_drivers);
      formData.append("billing_type", form.billing_type);
      formData.append("commercial_reg_file", crFile);
      
      if (licFile) {
        formData.append("commercial_license_file", licFile);
      }

      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        "Accept": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(API_ENDPOINTS.FLEETS_CREATE, {
        method: "POST",
        body: formData,
        headers,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(", ");
          throw new Error(errorMessages);
        }
        throw new Error(data.message || "Failed to create company");
      }
      
      onSubmit();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create company");
      console.error("Submit error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const basicFields = [
    { key: "contact_person_name", label: t("Contact Person Name", "اسم جهة الاتصال"), placeholder: "e.g. Abdullah Al-Otaibi", icon: User, type: "text", required: true },
    { key: "contact_phone", label: t("Phone Number", "رقم الهاتف"), placeholder: "966501234567", icon: Phone, type: "tel", required: true },
    { key: "contact_email", label: t("Email Address", "البريد الإلكتروني"), placeholder: "company@example.sa", icon: Mail, type: "email", required: true },
    { key: "company_name", label: t("Company Name", "اسم الشركة"), placeholder: "e.g. Fast Logistics Co.", icon: Building2, type: "text", required: true },
    { key: "commercial_reg_no", label: t("Commercial Reg. No.", "رقم السجل التجاري"), placeholder: "e.g. 1010123456", icon: FileText, type: "text", required: true },
  ] as const;

  const locationFields = [
    { key: "city", label: t("City", "المدينة"), placeholder: "e.g. Riyadh", icon: MapPin, type: "text" },
    { key: "region", label: t("Region", "المنطقة"), placeholder: "e.g. Riyadh Province", icon: Home, type: "text" },
    { key: "address", label: t("Address", "العنوان"), placeholder: "e.g. King Fahd Road, Al Olaya", icon: Building2, type: "text" },
  ] as const;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-2xl overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{t("Add New Company", "إضافة شركة جديدة")}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{t("Register a new fleet company", "تسجيل شركة أسطول جديدة")}</p>
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

        <div className="px-6 py-5 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("Basic Information", "المعلومات الأساسية")}</h4>
            {basicFields.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    {f.label} {f.required && <span className="text-red-400">*</span>}
                  </label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      type={f.type} 
                      value={form[f.key]}
                      onChange={(e) => { 
                        setForm({ ...form, [f.key]: e.target.value }); 
                        setError(null); 
                      }}
                      placeholder={f.placeholder} 
                      disabled={isLoading}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 transition disabled:opacity-60"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("Location", "الموقع")}</h4>
            <div className="grid grid-cols-2 gap-3">
              {locationFields.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.key} className={f.key === "address" ? "col-span-2" : ""}>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">{f.label}</label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input 
                        type={f.type} 
                        value={form[f.key]}
                        onChange={(e) => { 
                          setForm({ ...form, [f.key]: e.target.value }); 
                          setError(null); 
                        }}
                        placeholder={f.placeholder} 
                        disabled={isLoading}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 transition disabled:opacity-60"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fleet Capacity */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("Fleet Capacity", "سعة الأسطول")}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("Max Motorcycles", "الحد الأقصى للدراجات")}</label>
                <input 
                  type="number" 
                  value={form.max_motorcycles}
                  onChange={(e) => { 
                    setForm({ ...form, max_motorcycles: e.target.value }); 
                    setError(null); 
                  }}
                  placeholder="100" 
                  disabled={isLoading}
                  min="1"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 transition disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("Max Drivers", "الحد الأقصى للسائقين")}</label>
                <input 
                  type="number" 
                  value={form.max_drivers}
                  onChange={(e) => { 
                    setForm({ ...form, max_drivers: e.target.value }); 
                    setError(null); 
                  }}
                  placeholder="100" 
                  disabled={isLoading}
                  min="1"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 transition disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Billing Type */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("Billing Type", "نوع الفوترة")}</label>
            <select
              value={form.billing_type}
              onChange={(e) => setForm({ ...form, billing_type: e.target.value as CompanyFormData['billing_type'] })}
              disabled={isLoading}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 transition disabled:opacity-60"
            >
              <option value="prepaid">{t("Prepaid", "مدفوع مسبقاً")}</option>
              <option value="postpaid">{t("Postpaid", "مدفوع لاحقاً")}</option>
              <option value="corporate">{t("Corporate", "شركات")}</option>
            </select>
          </div>

          {/* Files */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("Documents", "المستندات")}</h4>
            
            {/* CR File - Required */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                {t("Commercial Registration File", "ملف السجل التجاري")} <span className="text-red-400">*</span>
              </label>
              <div 
                onClick={() => crFileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 flex items-center gap-3 cursor-pointer transition
                  ${crFile ? 'border-green-300 bg-green-50/30' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'}`}
              >
                <Upload className={`h-5 w-5 ${crFile ? 'text-green-500' : 'text-gray-400'}`} />
                <p className={`text-sm ${crFile ? 'text-green-600' : 'text-gray-500'}`}>
                  {crFile?.name || t("Click to upload PDF or image (required)", "انقر لرفع PDF أو صورة (مطلوب)")}
                </p>
              </div>
              <input 
                ref={crFileRef} 
                type="file" 
                accept=".pdf,image/*" 
                className="hidden"
                onChange={(e) => {
                  setCrFile(e.target.files?.[0] ?? null);
                  setError(null);
                }} 
              />
            </div>

            {/* License File - Optional */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                {t("Commercial License File", "ملف الترخيص التجاري")} <span className="text-gray-400 text-xs font-normal">{t("(Optional)", "(اختياري)")}</span>
              </label>
              <div 
                onClick={() => licFileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 flex items-center gap-3 cursor-pointer transition
                  ${licFile ? 'border-green-300 bg-green-50/30' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'}`}
              >
                <Upload className={`h-5 w-5 ${licFile ? 'text-green-500' : 'text-gray-400'}`} />
                <p className={`text-sm ${licFile ? 'text-green-600' : 'text-gray-500'}`}>
                  {licFile?.name || t("Click to upload PDF or image (optional)", "انقر لرفع PDF أو صورة (اختياري)")}
                </p>
              </div>
              <input 
                ref={licFileRef} 
                type="file" 
                accept=".pdf,image/*" 
                className="hidden"
                onChange={(e) => {
                  setLicFile(e.target.files?.[0] ?? null);
                  setError(null);
                }} 
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button 
            onClick={handleClose} 
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
          >
            {t("Cancel", "إلغاء")}
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: "#1C1FC1" }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("Creating...", "جارٍ الإنشاء…")}
              </>
            ) : (
              t("Submit Application", "تقديم الطلب")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}