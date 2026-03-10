// src/hooks/use-users.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "@/config/api";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  status: "active" | "blocked";
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const normaliseUser = (raw: Record<string, unknown>): User => ({
  id:         String(raw.id ?? ""),
  name:       String(raw.name ?? "Unknown"),
  email:      raw.email  ? String(raw.email)  : null,
  phone:      raw.phone  ? String(raw.phone)  : null,
  address:    raw.address ? String(raw.address) : null,
  city:       raw.city   ? String(raw.city)   : null,
  status:     raw.status === "blocked" ? "blocked" : "active",
  created_at: String(raw.created_at ?? ""),
});

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useUsers() {
  const [users,     setUsers]     = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.USERS_LIST, {
        method: "GET",
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error(`Failed to fetch users (${res.status})`);

      const json = await res.json();

      // Support: { data: [...] } | { users: [...] } | [...]
      const raw: Record<string, unknown>[] =
        Array.isArray(json)          ? json        :
        Array.isArray(json.data)     ? json.data   :
        Array.isArray(json.users)    ? json.users  :
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

  const toggleBlockUser = useCallback((id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "blocked" : "active" }
          : u
      )
    );
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, error, fetchUsers, toggleBlockUser };
}