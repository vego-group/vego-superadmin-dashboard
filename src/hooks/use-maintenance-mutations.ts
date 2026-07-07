// src/hooks/use-maintenance-mutations.ts
"use client";

import { useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { AddTicketPayload, MaintenanceStatus } from "@/types/dashboard/maintenance";

export function useMaintenanceMutations(refetch?: () => void | Promise<void>) {
  const createTicket = useCallback(async (payload: AddTicketPayload): Promise<void> => {
    await apiClient.post("maintenance-tickets", payload);
    await refetch?.();
  }, [refetch]);

  const updateTicketStatus = useCallback(
    async (id: number, status: MaintenanceStatus, note?: string): Promise<void> => {
      await apiClient.patch(`maintenance-tickets/${id}/status`, {
        status,
        ...(note?.trim() ? { note: note.trim() } : {}),
      });
      await refetch?.();
    },
    [refetch]
  );

  return { createTicket, updateTicketStatus };
}
