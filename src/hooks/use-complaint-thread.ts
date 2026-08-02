"use client";

import { logger } from "@/lib/logger";
import { useState, useEffect, useCallback, useRef } from "react";
import { ComplaintThread, parseComplaintThread } from "@/types/dashboard/complaint";

// GET /super-admin/complaints/{id} — the full thread including internal notes.
// Also fires POST /{id}/read once per opened complaint so the agent's unread
// badge clears; `onRead` lets the caller patch the inbox row without a refetch.
export function useComplaintThread(
  complaintId: number | null,
  onRead?: (id: number) => void
) {
  const [thread, setThread] = useState<ComplaintThread | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readSentFor = useRef<number | null>(null);

  const fetchThread = useCallback(async (): Promise<ComplaintThread | null> => {
    if (complaintId === null) return null;
    setError(null);
    try {
      const res = await fetch(`/api/proxy/complaints/${complaintId}`, {
        headers: { Accept: "application/json" },
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || `Failed to load complaint (${res.status})`);
      }
      const parsed = parseComplaintThread(
        (json.data ?? json) as Record<string, unknown>
      );
      setThread(parsed);
      return parsed;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load complaint";
      setError(msg);
      logger.error("❌ fetchComplaintThread:", msg);
      return null;
    }
  }, [complaintId]);

  useEffect(() => {
    if (complaintId === null) {
      setThread(null);
      setError(null);
      return;
    }
    setThread(null);
    setIsLoading(true);
    fetchThread().finally(() => setIsLoading(false));

    if (readSentFor.current !== complaintId) {
      readSentFor.current = complaintId;
      // Best-effort — a failed read receipt must not block the thread.
      fetch(`/api/proxy/complaints/${complaintId}/read`, {
        method: "POST",
        headers: { Accept: "application/json" },
      })
        .then((res) => {
          if (res.ok) onRead?.(complaintId);
        })
        .catch(() => {});
    }
    // `onRead` intentionally omitted — it's an event callback, and re-running
    // this effect on its identity would re-fetch the thread.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaintId, fetchThread]);

  return { thread, isLoading, error, refetchThread: fetchThread };
}
