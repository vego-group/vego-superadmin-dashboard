// src/hooks/use-users.ts
"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  trips: number;
  rating: number;
  spending: number;
  status: "active" | "blocked";
}

// ─── API config ───────────────────────────────────────────────────────────────
const API_BASE = "https://mobility-live.com/api/super-admin";
const BEARER_TOKEN = "6KIXErvurpTlQAmHeR8Xt55maYsONekFbBahUhgk3802e709";

const authHeaders = () => {
  // Prefer the logged-in user's token; fall back to the hardcoded token
  const stored =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${stored ?? BEARER_TOKEN}`,
  };
};

// Normalise whatever shape the API returns into our User interface
const normaliseUser = (raw: Record<string, unknown>): User => ({
  id:       String(raw.id ?? raw._id ?? ""),
  name:     String(raw.name ?? raw.full_name ?? "Unknown"),
  email:    raw.email ? String(raw.email) : undefined,
  phone:    raw.phone ? String(raw.phone) : undefined,
  trips:    Number(raw.trips ?? raw.total_trips ?? 0),
  rating:   Number(raw.rating ?? raw.average_rating ?? 0),
  spending: Number(raw.spending ?? raw.total_spending ?? 0),
  status:   raw.status === "blocked" ? "blocked" : "active",
});

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useUsers() {
  const [users, setUsers]         = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  // ── GET all regular users (non-admin, non-superadmin) ──────────────────────
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/users/list`, {
        method: "GET",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to fetch users (${res.status})`);
      const data = await res.json();

      // Support { data: [...] }, { users: [...] }, or plain [...]
      const raw: Record<string, unknown>[] =
        Array.isArray(data)         ? data :
        Array.isArray(data.data)    ? data.data :
        Array.isArray(data.users)   ? data.users :
        [];

      setUsers(raw.map(normaliseUser));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch users";
      setError(msg);
      console.error("❌ fetchUsers:", msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Toggle block / unblock a user ─────────────────────────────────────────
  // Optimistically updates local state; server sync can be added later
  const toggleBlockUser = useCallback((id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "blocked" : "active" }
          : u
      )
    );
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    fetchUsers,       // manual refresh
    toggleBlockUser,  // block / unblock
  };
}