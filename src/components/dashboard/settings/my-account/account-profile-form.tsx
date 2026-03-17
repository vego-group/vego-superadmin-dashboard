"use client";

import { useState, useEffect } from "react";
import { User, Phone, Mail, Lock, Eye, EyeOff, Save, Loader2 } from "lucide-react";

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
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
      // update localStorage
      const userData = localStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData);
        localStorage.setItem("user_data", JSON.stringify({ ...user, ...profile }));
      }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Change Password ────────────────────────────────────────────────────────
  const handleSavePassword = async () => {
    setPasswordError("");
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    if (passwords.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
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
      if (!res.ok) throw new Error(data.message || "Failed to change password");
      setPasswordSaved(true);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordSaved(false), 2500);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">

      {/* ── Personal Info ── */}
      <Section title="Personal Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Field label="Full Name"     value={profile.name}  onChange={(v) => setProfile({ ...profile, name: v })}
            placeholder="e.g. Sarah Johnson" icon={<User className="h-4 w-4" />} />
          <Field label="Phone Number"  value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })}
            placeholder="e.g. +966512345678" icon={<Phone className="h-4 w-4" />} />
          <div className="sm:col-span-2">
            <Field label="Email Address" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })}
              placeholder="e.g. admin@vego.com" type="email" icon={<Mail className="h-4 w-4" />} />
          </div>
        </div>
        {profileError && <p className="text-xs text-red-500 mb-4">{profileError}</p>}
        <button onClick={handleSaveProfile} disabled={profileLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: profileSaved ? "#10b981" : "#1C1FC1" }}>
          {profileLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
                          : <><Save className="h-4 w-4" />{profileSaved ? "Saved ✓" : "Save Changes"}</>}
        </button>
      </Section>

      {/* ── Change Password ── */}
      <Section title="Change Password">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
          <div className="sm:col-span-2">
            <PasswordField label="Current Password" value={passwords.currentPassword}
              onChange={(v) => setPasswords({ ...passwords, currentPassword: v })}
              placeholder="Enter current password" />
          </div>
          <PasswordField label="New Password" value={passwords.newPassword}
            onChange={(v) => setPasswords({ ...passwords, newPassword: v })}
            placeholder="Min. 8 characters" />
          <PasswordField label="Confirm New Password" value={passwords.confirmPassword}
            onChange={(v) => setPasswords({ ...passwords, confirmPassword: v })}
            placeholder="Repeat new password" />
        </div>
        {passwordError && <p className="text-xs text-red-500 mb-4">{passwordError}</p>}
        {!passwordError && <div className="mb-6" />}
        <button onClick={handleSavePassword} disabled={passwordLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: passwordSaved ? "#10b981" : "#1C1FC1" }}>
          {passwordLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
                           : <><Save className="h-4 w-4" />{passwordSaved ? "Saved ✓" : "Save Changes"}</>}
        </button>
      </Section>
    </div>
  );
}