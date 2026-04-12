"use client";

import { useState, useEffect } from "react";
import { User, Phone, Mail, Lock, Eye, EyeOff, Save, Loader2 } from "lucide-react";
import { useLang } from "@/lib/language-context";

interface ProfileForm { name: string; phone: string; email: string; }
interface PasswordForm { currentPassword: string; newPassword: string; confirmPassword: string; }

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Field = ({ label, value, onChange, placeholder, type = "text", icon, disabled = false }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; icon: React.ReactNode; disabled?: boolean;
}) => (
  <div>
    <label className="block text-sm text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        className={`w-full border rounded-md pl-9 pr-4 py-2.5 text-sm transition-colors focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 ${
          disabled ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                   : "bg-white border-gray-300 text-gray-800 placeholder-gray-400"}`}
      />
    </div>
  </div>
);

const PasswordField = ({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock className="h-4 w-4" /></span>
        <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-gray-300 rounded-md pl-9 pr-10 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-colors"
        />
        <button type="button" onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

export default function AccountProfileForm() {
  const { t } = useLang();
  const [profile, setProfile]   = useState<ProfileForm>({ name: "", phone: "", email: "" });
  const [passwords, setPasswords] = useState<PasswordForm>({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [profileSaved, setProfileSaved]   = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileError, setProfileError]   = useState("");
  const [passwordError, setPasswordError] = useState("");

  // ── Fetch current user data ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const userData = localStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData);
        setProfile({
          name:  user.name  ?? "",
          email: user.email ?? "",
          phone: user.phone ?? "",
        });
      }
    } catch {}
  }, []);

  // ── Save Profile ───────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setProfileLoading(true);
    setProfileError("");
    try {
      const res = await fetch("/api/proxy/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: profile.name, email: profile.email, phone: profile.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("Failed to update profile", "فشل تحديث الملف الشخصي"));
      // update localStorage
      const userData = localStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData);
        localStorage.setItem("user_data", JSON.stringify({ ...user, ...profile }));
      }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : t("Failed to update profile", "فشل تحديث الملف الشخصي"));
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Change Password ────────────────────────────────────────────────────────
  const handleSavePassword = async () => {
    setPasswordError("");
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setPasswordError(t("Please fill in all password fields.", "الرجاء ملء جميع حقول كلمة المرور."));
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError(t("New password and confirmation do not match.", "كلمة المرور الجديدة وتأكيدها غير متطابقين."));
      return;
    }
    if (passwords.newPassword.length < 8) {
      setPasswordError(t("New password must be at least 8 characters.", "يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل."));
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/proxy/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          current_password:      passwords.currentPassword,
          password:              passwords.newPassword,
          password_confirmation: passwords.confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("Failed to change password", "فشل تغيير كلمة المرور"));
      setPasswordSaved(true);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordSaved(false), 2500);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : t("Failed to change password", "فشل تغيير كلمة المرور"));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">

      {/* ── Personal Info ── */}
      <Section title={t("Personal Information", "المعلومات الشخصية")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Field label={t("Full Name", "الاسم الكامل")} value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })}
            placeholder={t("e.g. Sarah Johnson", "مثال: سارة جونسون")} icon={<User className="h-4 w-4" />} />
          <Field label={t("Phone Number", "رقم الهاتف")} value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })}
            placeholder={t("e.g. +966512345678", "مثال: +966512345678")} icon={<Phone className="h-4 w-4" />} />
          <div className="sm:col-span-2">
            <Field label={t("Email Address", "البريد الإلكتروني")} value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })}
              placeholder={t("e.g. admin@vego.com", "مثال: admin@vego.com")} type="email" icon={<Mail className="h-4 w-4" />} />
          </div>
        </div>
        {profileError && <p className="text-xs text-red-500 mb-4">{profileError}</p>}
        <button onClick={handleSaveProfile} disabled={profileLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: profileSaved ? "#10b981" : "#1C1FC1" }}>
          {profileLoading ? <><Loader2 className="h-4 w-4 animate-spin" />{t("Saving...", "جاري الحفظ...")}</>
                          : <><Save className="h-4 w-4" />{profileSaved ? t("Saved ✓", "تم الحفظ ✓") : t("Save Changes", "حفظ التغييرات")}</>}
        </button>
      </Section>

      {/* ── Change Password ── */}
      <Section title={t("Change Password", "تغيير كلمة المرور")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
          <div className="sm:col-span-2">
            <PasswordField label={t("Current Password", "كلمة المرور الحالية")} value={passwords.currentPassword}
              onChange={(v) => setPasswords({ ...passwords, currentPassword: v })}
              placeholder={t("Enter current password", "أدخل كلمة المرور الحالية")} />
          </div>
          <PasswordField label={t("New Password", "كلمة المرور الجديدة")} value={passwords.newPassword}
            onChange={(v) => setPasswords({ ...passwords, newPassword: v })}
            placeholder={t("Min. 8 characters", "8 أحرف على الأقل")} />
          <PasswordField label={t("Confirm New Password", "تأكيد كلمة المرور الجديدة")} value={passwords.confirmPassword}
            onChange={(v) => setPasswords({ ...passwords, confirmPassword: v })}
            placeholder={t("Repeat new password", "أعد كتابة كلمة المرور الجديدة")} />
        </div>
        {passwordError && <p className="text-xs text-red-500 mb-4">{passwordError}</p>}
        {!passwordError && <div className="mb-6" />}
        <button onClick={handleSavePassword} disabled={passwordLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: passwordSaved ? "#10b981" : "#1C1FC1" }}>
          {passwordLoading ? <><Loader2 className="h-4 w-4 animate-spin" />{t("Saving...", "جاري الحفظ...")}</>
                           : <><Save className="h-4 w-4" />{passwordSaved ? t("Saved ✓", "تم الحفظ ✓") : t("Save Changes", "حفظ التغييرات")}</>}
        </button>
      </Section>
    </div>
  );
}