"use client";

import { useCallback } from "react";

// Auth is handled by the proxy via the HttpOnly cookie — no token needed here.

const jsonHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
});

const throwHttpError = (json: Record<string, unknown>, res: Response, fallback: string) => {
  throw new Error(
    (json.message as string) || (json.error as string) || `${fallback} (${res.status})`
  );
};

export interface PostMessageInput {
  body: string;
  attachments?: File[];
  isInternalNote?: boolean;
}

export function useComplaintMutations() {
  /**
   * POST /super-admin/complaints/{id}/messages — { body, attachments[], is_internal_note }.
   * Falls back to the deprecated POST /{id}/reply alias only for a plain reply
   * (no attachments, not an internal note) if the new route isn't deployed yet.
   */
  const postMessage = useCallback(
    async (id: number, { body, attachments = [], isInternalNote = false }: PostMessageInput): Promise<void> => {
      const form = new FormData();
      form.append("body", body);
      form.append("is_internal_note", isInternalNote ? "1" : "0");
      attachments.forEach((file) => form.append("attachments[]", file, file.name));

      // No explicit Content-Type: the browser sets the multipart boundary.
      const res = await fetch(`/api/proxy/complaints/${id}/messages`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: form,
      });

      if (res.ok) return;

      // Route not deployed → legacy fallback (plain text replies only; internal
      // notes and attachments have no legacy equivalent and must not silently
      // degrade into a customer-visible plain reply).
      if (res.status === 404 || res.status === 405) {
        if (isInternalNote || attachments.length > 0) {
          throw new Error(
            "The messages endpoint is unavailable and the legacy reply route does not support internal notes or attachments."
          );
        }
        const legacy = await fetch(`/api/proxy/complaints/${id}/reply`, {
          method: "POST",
          headers: jsonHeaders(),
          body: JSON.stringify({ reply: body }),
        });
        const legacyJson = await legacy.json().catch(() => ({}));
        if (!legacy.ok) throwHttpError(legacyJson, legacy, "Failed to send reply");
        return;
      }

      const json = await res.json().catch(() => ({}));
      throwHttpError(json, res, "Failed to send message");
    },
    []
  );

  /**
   * POST /super-admin/complaints/{id}/assign — { staff_id }.
   * Side effect (CR-6 §4): assigning a `new` ticket moves it to in_review on
   * the backend; callers must refetch/patch and surface that transition.
   */
  const assignComplaint = useCallback(async (id: number, staffId: number): Promise<void> => {
    const res = await fetch(`/api/proxy/complaints/${id}/assign`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ staff_id: staffId }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throwHttpError(json, res, "Failed to assign complaint");
  }, []);

  /**
   * PATCH /super-admin/complaints/{id}/status. Only manual transitions
   * (in_review / resolved / closed) may be sent — awaiting_* are set
   * automatically by replies.
   */
  const updateComplaintStatus = useCallback(
    async (id: number, status: "in_review" | "resolved" | "closed"): Promise<void> => {
      const res = await fetch(`/api/proxy/complaints/${id}/status`, {
        method: "PATCH",
        headers: jsonHeaders(),
        body: JSON.stringify({ status }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throwHttpError(json, res, "Failed to update status");
    },
    []
  );

  return { postMessage, assignComplaint, updateComplaintStatus };
}
