// Shared presentation config for the complaints module (CR-6).

import { ComplaintCategory, ComplaintStatus } from "@/types/dashboard/complaint";

type T = (en: string, ar: string) => string;

export interface BadgeCfg {
  label: string;
  cls: string;
}

// Legacy `replied` never reaches these maps — it is normalised to
// awaiting_customer at parse time.
export const statusConfig = (t: T): Record<ComplaintStatus, BadgeCfg> => ({
  new: { label: t("New", "جديدة"), cls: "bg-blue-100 text-blue-700" },
  in_review: { label: t("In Review", "قيد المراجعة"), cls: "bg-yellow-100 text-yellow-700" },
  awaiting_agent: {
    label: t("Awaiting Agent", "بانتظار رد الموظف"),
    cls: "bg-red-100 text-red-700",
  },
  awaiting_customer: {
    label: t("Awaiting Customer", "بانتظار العميل"),
    cls: "bg-teal-100 text-teal-700",
  },
  resolved: { label: t("Resolved", "تم الحل"), cls: "bg-green-100 text-green-700" },
  closed: { label: t("Closed", "مغلقة"), cls: "bg-gray-200 text-gray-600" },
});

export const categoryConfig = (t: T): Record<ComplaintCategory, BadgeCfg> => ({
  charging: { label: t("Charging", "الشحن"), cls: "bg-blue-50 text-blue-600" },
  swap: { label: t("Battery Swap", "تبديل البطارية"), cls: "bg-green-50 text-green-600" },
  // CR-6 §7: `payment` is "Payments/المدفوعات", not "Financial/مالية".
  payment: { label: t("Payments", "المدفوعات"), cls: "bg-orange-50 text-orange-600" },
  platform: { label: t("Platform", "المنصة"), cls: "bg-purple-50 text-purple-600" },
});

/** Rows the inbox highlights: waiting on an agent reply (or never touched). */
export const needsAgentAttention = (s: ComplaintStatus): boolean =>
  s === "awaiting_agent" || s === "new";

export const formatHours = (h: number | null): string => {
  if (h === null) return "—";
  if (h < 1) return "<1h";
  if (h < 24) return `${Math.round(h)}h`;
  const days = Math.floor(h / 24);
  const rest = Math.round(h % 24);
  return rest > 0 ? `${days}d ${rest}h` : `${days}d`;
};

export const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/** Logged-in staff member (written to localStorage by the login flow). */
export const getCurrentStaff = (): { id: number; name: string } | null => {
  try {
    const raw = localStorage.getItem("user_data");
    if (!raw) return null;
    const user = JSON.parse(raw);
    const id = Number(user?.id);
    if (!Number.isFinite(id)) return null;
    return { id, name: typeof user?.name === "string" ? user.name : "" };
  } catch {
    return null;
  }
};
