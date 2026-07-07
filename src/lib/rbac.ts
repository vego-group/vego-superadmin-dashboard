// src/lib/rbac.ts
// Single source of truth for which staff roles can open which dashboard pages.
// Used by middleware.ts (route enforcement) and the Sidebar (menu filtering),
// so both always agree. Real security is enforced by the backend (403s) —
// this only controls what the UI exposes.

export type StaffRole = "superadmin" | "admin" | "sales" | "ops_supervisor";

const STAFF_ROLES: StaffRole[] = ["superadmin", "admin", "sales", "ops_supervisor"];

export function isStaffRole(value: unknown): value is StaffRole {
  return typeof value === "string" && (STAFF_ROLES as string[]).includes(value);
}

// Longest matching prefix wins (e.g. /dashboard/vehicle-control beats /dashboard).
// sales never reaches /dashboard — the middleware sends them to the /sales portal.
const PAGE_ACCESS: Record<string, StaffRole[]> = {
  "/dashboard":                 ["superadmin", "admin", "ops_supervisor"],
  "/dashboard/cabinets":        ["superadmin", "admin", "ops_supervisor"],
  "/dashboard/motorcycles":     ["superadmin", "admin", "ops_supervisor"],
  "/dashboard/vehicle-control": ["superadmin"],
  "/dashboard/zones":           ["superadmin", "admin", "ops_supervisor"],
  "/dashboard/alarms":          ["superadmin", "admin", "ops_supervisor"],
  "/dashboard/operations":      ["superadmin", "admin", "ops_supervisor"],
  "/dashboard/devices":         ["superadmin", "admin", "ops_supervisor"],
  "/dashboard/complaints":      ["superadmin", "admin", "ops_supervisor"],
  "/dashboard/companies":       ["superadmin", "admin"],
  "/dashboard/drivers":         ["superadmin", "admin"],
  "/dashboard/superadmins":     ["superadmin"],
  "/dashboard/admins":          ["superadmin", "admin"],
  "/dashboard/users":           ["superadmin", "admin"],
  "/dashboard/sales":           ["superadmin", "admin"],
  "/dashboard/financial":       ["superadmin", "admin"],
  "/dashboard/settings":        ["superadmin", "admin"],
};

export function canAccess(role: string | undefined, path: string): boolean {
  // Missing/unknown role (session from before RBAC, or a non-staff realm) falls
  // back to the pre-RBAC behaviour: show everything and let the backend 403.
  const r: StaffRole = isStaffRole(role) ? role : "superadmin";
  if (r === "superadmin") return true;

  let rule: StaffRole[] | undefined;
  let ruleKey = "";
  for (const key of Object.keys(PAGE_ACCESS)) {
    if ((path === key || path.startsWith(key + "/")) && key.length > ruleKey.length) {
      rule = PAGE_ACCESS[key];
      ruleKey = key;
    }
  }

  // Unmapped dashboard pages stay superadmin+admin until given an explicit rule.
  return rule ? rule.includes(r) : r === "admin";
}

// Reads the non-HttpOnly `user-role` cookie set at login (verify-otp route).
export function getClientRole(): StaffRole | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/(?:^|;\s*)user-role=([^;]+)/);
  const value = match ? decodeURIComponent(match[1]) : undefined;
  return isStaffRole(value) ? value : undefined;
}
