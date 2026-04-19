// src/hooks/use-admin-mutations.ts
"use client";

import { useCallback } from "react";
import { useAdmins } from "./use-admins";
import { AddAdminPayload, UpdateAdminPayload, Admin } from "@/types/dashboard/admin";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

const authHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ─── Role mapping ─────────────────────────────────────────────────────────────
const mapRoleToApi = (uiRole: string): string => {
  const roleMap: Record<string, string> = {
    "SuperAdmin": "super_admin",
    "Admin": "admin",
    "SubAdmin": "sub_admin",
    "superadmin": "super_admin",
    "admin": "admin",
    "subadmin": "sub_admin",
  };
  return roleMap[uiRole] || "admin";
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAdminMutations() {
  const { fetchAdmins } = useAdmins();

  const addAdmin = useCallback(async (payload: AddAdminPayload): Promise<Admin> => {
    const apiPayload = {
      name: payload.name,
      phone: payload.phone,
      role: mapRoleToApi(payload.role),
      ...(payload.email && { email: payload.email }),
      ...(payload.password && {
        password: payload.password,
        password_confirmation: payload.password_confirmation || payload.password,
      }),
    };

    console.log("📤 Sending payload:", apiPayload);

    const res = await fetch("/api/proxy/staff", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(apiPayload),
    });

    const json = await res.json();
    console.log("📥 API Response:", json);

    // ✅ Only throw on actual HTTP errors (4xx / 5xx)
    if (!res.ok) {
      const errorMessage =
        json.message ||
        json.error ||
        (json.errors && Object.values(json.errors).flat().join(", ")) ||
        `Failed to add admin (${res.status})`;
      throw new Error(errorMessage);
    }

    await fetchAdmins();
    return json.data;
  }, [fetchAdmins]);

  const updateAdmin = useCallback(async (id: string, payload: UpdateAdminPayload): Promise<Admin> => {
    const apiPayload = {
      ...payload,
      ...(payload.role && { role: mapRoleToApi(payload.role) }),
    };

    const res = await fetch(`/api/proxy/admins/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(apiPayload),
    });

    const json = await res.json();

    // ✅ Only throw on actual HTTP errors
    if (!res.ok) {
      const errorMessage =
        json.message ||
        json.error ||
        (json.errors && Object.values(json.errors).flat().join(", ")) ||
        `Failed to update admin (${res.status})`;
      throw new Error(errorMessage);
    }

    await fetchAdmins();
    return json.data;
  }, [fetchAdmins]);

  const deleteAdmin = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`/api/proxy/admins/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    const json = await res.json();

    // ✅ Only throw on actual HTTP errors
    if (!res.ok) {
      const errorMessage =
        json.message ||
        json.error ||
        `Failed to delete admin (${res.status})`;
      throw new Error(errorMessage);
    }

    await fetchAdmins();
  }, [fetchAdmins]);

  const bulkDeleteAdmins = useCallback(async (ids: string[]): Promise<void> => {
    const results = await Promise.allSettled(
      ids.map((id) =>
        fetch(`/api/proxy/admins/${id}`, {
          method: "DELETE",
          headers: authHeaders(),
        })
      )
    );

    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      console.warn(`⚠️ ${failed} of ${ids.length} deletes failed`);
    }

    await fetchAdmins();
  }, [fetchAdmins]);

  return { addAdmin, updateAdmin, deleteAdmin, bulkDeleteAdmins };
}