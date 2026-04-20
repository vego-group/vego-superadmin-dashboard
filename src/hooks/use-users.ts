// src/hooks/use-users.ts
"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  status: "active" | "inactive" | "blocked" | "pending";
  created_at: string;
  account_type?: string;
  fleet_id?: number | null;
}

interface UsersApiResponse {
  status: boolean;
  message: string;
  data: {
    current_page: number;
    data: Array<Record<string, unknown>>;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normaliseUser = (raw: Record<string, unknown>): User => {
  // Map status - normalize to expected values
  let status: User["status"] = "active";
  const rawStatus = String(raw.status ?? "active").toLowerCase();
  if (["active", "inactive", "blocked", "pending"].includes(rawStatus)) {
    status = rawStatus as User["status"];
  }

  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? "Unknown"),
    email: raw.email ? String(raw.email) : null,
    phone: raw.phone ? String(raw.phone) : null,
    address: raw.address ? String(raw.address) : null,
    city: raw.city ? String(raw.city) : null,
    status,
    created_at: String(raw.created_at ?? ""),
    account_type: raw.account_type ? String(raw.account_type) : undefined,
    fleet_id: raw.fleet_id ? Number(raw.fleet_id) : null,
  };
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 15,
  });

  const fetchUsers = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/users?page=${page}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch users (${res.status})`);

      const json: UsersApiResponse = await res.json();

      if (!json.status) {
        throw new Error(json.message || "Failed to fetch users");
      }

      const rawUsers = json.data?.data ?? [];
      setUsers(rawUsers.map(normaliseUser));
      setPagination({
        currentPage: json.data.current_page,
        lastPage: json.data.last_page,
        total: json.data.total,
        perPage: json.data.per_page,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch users";
      setError(msg);
      console.error("❌ fetchUsers:", msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPage = useCallback((page: number) => {
    fetchUsers(page);
  }, [fetchUsers]);

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

  return { 
    users, 
    isLoading, 
    error, 
    fetchUsers, 
    fetchPage,
    toggleBlockUser,
    pagination,
  };
}