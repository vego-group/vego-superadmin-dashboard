"use client";

import { useCallback } from "react";

// Auth is handled by the proxy via the HttpOnly cookie — no token needed here.
const authHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
});

export function useComplaintMutations(fetchComplaints?: () => Promise<void>) {
  const replyToComplaint = useCallback(
    async (id: number, reply: string): Promise<void> => {
      const res = await fetch(`/api/proxy/complaints/${id}/reply`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ reply }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json.message || json.error || `Failed to send reply (${res.status})`
        );
      }

      await fetchComplaints?.();
    },
    [fetchComplaints]
  );

  const updateComplaintStatus = useCallback(
    async (id: number, status: string): Promise<void> => {
      const res = await fetch(`/api/proxy/complaints/${id}/status`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json.message || json.error || `Failed to update status (${res.status})`
        );
      }

      await fetchComplaints?.();
    },
    [fetchComplaints]
  );

  return { replyToComplaint, updateComplaintStatus };
}
