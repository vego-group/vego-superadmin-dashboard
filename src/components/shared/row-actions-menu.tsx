"use client";

import { useState, useEffect, useRef } from "react";
import { MoreVertical } from "lucide-react";

// Shared 3-dot actions menu used across the staff tables (Admins / SuperAdmins /
// Sales) so every row's Actions look and behave identically. Each page passes
// only the actions it actually supports.

export interface RowAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  /** default = neutral, warning = orange (suspend), danger = red (remove) */
  tone?: "default" | "warning" | "danger";
}

const toneCls: Record<NonNullable<RowAction["tone"]>, string> = {
  default: "text-gray-700 hover:bg-gray-50",
  warning: "text-orange-600 hover:bg-orange-50",
  danger:  "text-red-600 hover:bg-red-50",
};

export default function RowActionsMenu({
  actions,
  align = "end",
  ariaLabel = "Actions",
}: {
  actions: RowAction[];
  align?: "start" | "end";
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (actions.length === 0) return null;

  return (
    <div ref={ref} className="relative flex justify-end" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 hover:bg-gray-100 rounded-lg transition"
        aria-label={ariaLabel}
      >
        <MoreVertical className="h-4 w-4 text-gray-400" />
      </button>
      {open && (
        <div
          className={`absolute ${align === "end" ? "right-0" : "left-0"} top-8 z-50 bg-white border border-gray-100 rounded-xl shadow-lg w-44 overflow-hidden py-1`}
        >
          {actions.map((a, i) => (
            <button
              key={i}
              onClick={() => { a.onClick(); setOpen(false); }}
              className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition ${toneCls[a.tone ?? "default"]}`}
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
