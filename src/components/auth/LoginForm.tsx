"use client";

import { useState, useMemo, useEffect } from "react";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhoneInput, { isValidPhone, toE164 } from "@/components/shared/phone-input";
import { useCountries } from "@/hooks/use-countries";
import { Country, IsoCountryCode } from "@/types/country";

const LOGIN_COUNTRY_KEY = "login-country";

export default function LoginForm() {
  const { countries, seededReason } = useCountries();
  const [step, setStep]       = useState<"phone" | "otp">("phone");
  const [phone, setPhone]     = useState("");
  const [otp, setOtp]         = useState("");
  const [error, setError]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [iso, setIso] = useState<IsoCountryCode | null>(null);

  // Restore the last-used country (persisted like the language toggle).
  useEffect(() => {
    const saved = localStorage.getItem(LOGIN_COUNTRY_KEY);
    if (saved && countries.some((c) => c.isoCountryCode === saved)) {
      setIso(saved as IsoCountryCode);
    }
  }, [countries]);

  const country: Country = countries.find((c) => c.isoCountryCode === iso) ?? countries[0];

  const handleCountryChange = (c: Country) => {
    setIso(c.isoCountryCode);
    localStorage.setItem(LOGIN_COUNTRY_KEY, c.isoCountryCode);
    setPhone("");
    setError(null);
  };

  const isPhoneValid = useMemo(() => isValidPhone(country, phone.trim()), [country, phone]);
  const isOtpValid   = useMemo(() => otp.trim().length === 6, [otp]);

  // ── Step 1: Send OTP ───────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ phone: toE164(country, phone) }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');

      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!isOtpValid || isLoading) return;

  setIsLoading(true);
  setError(null);

  try {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      // Full E.164 on verify-otp — settled auth contract (CR-1).
      body: JSON.stringify({ phone: toE164(country, phone), code: otp }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Invalid OTP');

    const token = data.token || data.data?.token;
    const user  = data.user  || data.data?.user;
    const role  = data.role;

    if (!token) throw new Error('No token received');

    localStorage.setItem('user_data', JSON.stringify(user));

    // redirect حسب الـ role
    setTimeout(() => {
      if (role === 'sales') {
        window.location.href = '/sales/dashboard';
      } else {
        window.location.href = '/dashboard';
      }
    }, 100);

  } catch (err) {
    setError(err instanceof Error ? err.message : 'Invalid OTP');
    setIsLoading(false);
  }
};

  return (
    <div className="w-full px-4 sm:px-6">
      <div className="mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl">
        <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl p-6 sm:p-8 space-y-6 border border-gray-100">

          {/* Header */}
          <div className="text-center space-y-1">
            {step === "otp" && (
              <button
                onClick={() => { setStep("phone"); setOtp(""); setError(null); }}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition mb-2 mx-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-800">
              {step === "phone" ? "Welcome Back" : "Enter OTP"}
            </h1>
            <p className="text-sm text-gray-500">
              {step === "phone"
                ? "Enter your phone number to receive an OTP"
                : `We sent a 6-digit code to ${toE164(country, phone)}`}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600" role="alert">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1 — Phone */}
{step === "phone" && (
  <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
    <div>
      <PhoneInput
        value={phone}
        onChange={(digits) => { setPhone(digits); setError(null); }}
        country={country}
        countries={countries}
        onCountryChange={handleCountryChange}
        disabled={isLoading}
      />
      {/* Dev-only: the country list is the LOCAL seeded fallback, not a server
          response. A healthy-looking picker over an empty/unreachable backend
          must never be silent — this badge is how the gap stays visible. */}
      {process.env.NODE_ENV !== "production" && seededReason && (
        <p className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-px" />
          <span>
            {seededReason === "empty-server"
              ? "Dev: country list is local (seeded) — the server returned zero countries. CountrySeeder likely not run on this environment."
              : "Dev: country list is local (seeded) — the countries endpoint is unreachable."}
          </span>
        </p>
      )}
    </div>
    <Button
      type="submit"
      disabled={!isPhoneValid || isLoading}
      className="w-full h-12 rounded-xl text-white font-medium bg-myvego-gradient hover:opacity-90 transition-all duration-200 disabled:opacity-50"
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Sending OTP...
        </span>
      ) : "Send OTP"}
    </Button>
  </form>
)}

          {/* Step 2 — OTP */}
{step === "otp" && (
  <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
    
    {/* OTP Boxes - كلها على نفس الخط */}
    <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[i] ?? ""}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            const newOtp = otp.split("");
            newOtp[i] = val;
            setOtp(newOtp.join(""));
            // auto focus next
            if (val && i < 5) {
              const next = document.getElementById(`otp-${i + 1}`);
              next?.focus();
            }
          }}
          onKeyDown={(e) => {
            // backspace → focus prev
            if (e.key === "Backspace" && !otp[i] && i > 0) {
              const prev = document.getElementById(`otp-${i - 1}`);
              prev?.focus();
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            setOtp(pasted);
            const lastIndex = Math.min(pasted.length, 5);
            document.getElementById(`otp-${lastIndex}`)?.focus();
          }}
          id={`otp-${i}`}
          autoFocus={i === 0}
          disabled={isLoading}
          className="
  w-full
  max-w-[40px] 
  sm:max-w-[48px] 
  md:max-w-[52px]
  aspect-square
  text-center 
  text-lg sm:text-xl 
  font-bold 
  border-2 
  rounded-xl 
  text-gray-800 
  focus:outline-none 
  focus:border-indigo-500 
  transition-colors 
  disabled:opacity-50
"
          style={{
            borderColor: otp[i] ? "#1C1FC1" : "#e5e7eb",
            backgroundColor: otp[i] ? "#f0f0ff" : "white",
          }}
        />
      ))}
    </div>

    <Button
      type="submit"
      disabled={otp.length !== 6 || isLoading}
      className="w-full h-12 rounded-xl text-white font-medium bg-myvego-gradient hover:opacity-90 transition-all duration-200 disabled:opacity-50"
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Verifying...
        </span>
      ) : "Verify & Login"}
    </Button>

    <p className="text-center text-xs text-gray-400">
      Didn&apos;t receive the code?{" "}
      <button
        type="button"
        onClick={() => { setOtp(""); setError(null); handleSendOtp({ preventDefault: () => {} } as React.FormEvent); }}
        className="text-indigo-500 hover:text-indigo-700 font-medium transition"
      >
        Resend
      </button>
    </p>
  </form>
)}

        </div>
      </div>
    </div>
  );
}