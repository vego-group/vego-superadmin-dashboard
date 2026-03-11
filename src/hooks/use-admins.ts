// src/hooks/use-admins.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/api"

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Admin {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  status: "active" | "inactive" | "suspended";
  created_at: string;
}

export interface AddAdminPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
});

const normaliseAdmin = (raw: Record<string, unknown>): Admin => ({
  id:         String(raw.id ?? ""),
  name:       String(raw.name ?? "Unknown"),
  email:      raw.email   ? String(raw.email)   : null,
  phone:      raw.phone   ? String(raw.phone)   : null,
  address:    raw.address ? String(raw.address) : null,
  city:       raw.city    ? String(raw.city)    : null,
  status:     (raw.status === "inactive" || raw.status === "suspended")
                ? raw.status
                : "active",
  created_at: String(raw.created_at ?? ""),
});

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAdmins() {
  const [admins,    setAdmins]    = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/proxy/admins/list', {
        method: "GET",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to fetch admins (${res.status})`);
      const json = await res.json();

      const raw: Record<string, unknown>[] =
        Array.isArray(json)       ? json       :
        Array.isArray(json.data)  ? json.data  :
        Array.isArray(json.admins)? json.admins:
        [];

      setAdmins(raw.map(normaliseAdmin));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch admins";
      setError(msg);
      console.error("❌ fetchAdmins:", msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Add ────────────────────────────────────────────────────────────────────
  const addAdmin = useCallback(async (payload: AddAdminPayload): Promise<boolean> => {
    try {
      const res = await fetch('/api/proxy/admins/add', {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to add admin");
      await fetchAdmins();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add admin";
      console.error("❌ addAdmin:", msg);
      throw new Error(msg);
    }
  }, [fetchAdmins]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteAdmin = useCallback(async (id: string): Promise<boolean> => {
  setAdmins((prev) => prev.filter((a) => a.id !== id));
  try {
    const res = await fetch(`/api/proxy/admins/delete/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!res.ok) {
      await fetchAdmins();
      throw new Error(`Failed to delete admin (${res.status})`);
    }
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete admin";
    console.error("❌ deleteAdmin:", msg);
    return false;
  }
}, [fetchAdmins]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  return { admins, isLoading, error, fetchAdmins, addAdmin, deleteAdmin };
}