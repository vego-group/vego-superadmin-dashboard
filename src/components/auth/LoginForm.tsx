"use client";

import { useState, useMemo, useCallback } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Cookies from "js-cookie";

// ── Constants ────────────────────────────────────────────────────────────────

const COOKIE_CONFIG = {
  expires: 1,
  path: "/",
  sameSite: "strict" as const,
};

const REDIRECT_DELAY = 100;

// ── Types ─────────────────────────────────────────────────────────────────────

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthUser {
  id: number | string;
  name: string;
  email: string;
  role?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isFormValid = useMemo(
    () => formData.email.trim() !== "" && formData.password.trim() !== "",
    [formData]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setError(null);
    },
    []
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleLoginSuccess = useCallback(
    (token: string, user: AuthUser) => {
      localStorage.setItem("auth_token", token);
      Cookies.set("auth-token", token, COOKIE_CONFIG);
      localStorage.setItem("user_data", JSON.stringify(user));

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, REDIRECT_DELAY);
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const { API_ENDPOINTS } = await import("@/config/api");

      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Invalid email or password"
        );
      }

      const token = data.token || data.data?.token;
      const user = data.user || data.data?.user;

      if (!token) {
        throw new Error("No token received from server");
      }

      handleLoginSuccess(token, user);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Invalid email or password";
      setError(errorMessage);
      console.error("❌ Login failed:", errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl p-6 sm:p-8 space-y-6 border border-gray-100">

          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-800">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-500">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 animate-in fade-in"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                name="email"
                placeholder="Email address"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
                aria-label="Email address"
                className="pl-10 h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-myvego-dark focus:border-myvego-dark transition"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
                aria-label="Password"
                className="pl-10 pr-10 h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-myvego-dark focus:border-myvego-dark transition"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full h-12 rounded-xl text-white font-medium bg-myvego-gradient hover:opacity-90 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}