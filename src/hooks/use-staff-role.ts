// src/hooks/use-staff-role.ts
"use client";

import { useSyncExternalStore } from "react";
import { getClientRole, StaffRole } from "@/lib/rbac";

const noopSubscribe = () => () => {};
const serverSnapshot = () => undefined;

/**
 * The logged-in staff role from the `user-role` cookie set at login.
 * `undefined` during SSR or for pre-RBAC sessions — treat that as superadmin,
 * matching `canAccess`. The cookie only changes on login, so no subscription.
 */
export function useStaffRole(): StaffRole | undefined {
  return useSyncExternalStore(noopSubscribe, getClientRole, serverSnapshot);
}
