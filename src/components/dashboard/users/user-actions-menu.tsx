'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Ban } from 'lucide-react';

interface UserActionsMenuProps {
  userId: string;
  status: string;
  onView: () => void;
  onToggleBlock: (id: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export default function UserActionsMenu({
  userId,
  status,
  onView,
  onToggleBlock,
  triggerRef,
}: UserActionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  // ── Position the menu relative to the trigger button ──────────────────────
  useEffect(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top:  rect.bottom + window.scrollY + 4,   // 4 px gap
      left: rect.right  + window.scrollX - 144, // 144 = menu width
    });
  }, [triggerRef]);

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        // bubble up — parent controls open state
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [triggerRef]);

  const menu = (
    <div
      ref={menuRef}
      style={{ position: 'absolute', top: coords.top, left: coords.left }}
      className="z-[9999] bg-white border border-gray-100 rounded-xl shadow-lg w-36 overflow-hidden"
    >
      <button
        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
        onClick={onView}
      >
        <Eye className="h-4 w-4" /> View
      </button>
      <button
        className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition ${
          status === 'active'
            ? 'text-red-600 hover:bg-red-50'
            : 'text-green-600 hover:bg-green-50'
        }`}
        onClick={() => onToggleBlock(userId)}
      >
        <Ban className="h-4 w-4" />
        {status === 'active' ? 'Block' : 'Unblock'}
      </button>
    </div>
  );

  // Render via portal so the menu is never clipped by any parent overflow
  return typeof document !== 'undefined'
    ? createPortal(menu, document.body)
    : null;
}