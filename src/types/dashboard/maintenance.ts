// src/types/dashboard/maintenance.ts
// Operations page: maintenance tickets + operations summary.

export type MaintenanceStatus = "open" | "in_progress" | "resolved";
export type MaintenancePriority = "low" | "medium" | "high" | "urgent";

export interface TicketMotorcycle {
  id: number;
  device_id: string | null;
  plate_number: string | null;
  brand: string | null;
  model: string | null;
  status: string | null;
}

export interface TicketHistoryEntry {
  status: MaintenanceStatus;
  note: string | null;
  by: string | null;
  created_at: string;
}

export interface MaintenanceTicket {
  id: number;
  ticket_number: string;
  motorcycle_id: number;
  issue_type: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  motorcycle: TicketMotorcycle | null;
  fleet_name: string | null;
  driver_name: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  history: TicketHistoryEntry[];
  created_at: string;
}

export interface AddTicketPayload {
  motorcycle_id: number;
  issue_type: string;
  description: string;
  priority: MaintenancePriority;
}

export interface OperationsSummary {
  offline_cabinets: number;
  active_alarms: number;
  open_incidents: number;
  motorcycles_in_maintenance: number;
  open_maintenance_tickets: number;
  new_complaints: number;
}

export interface TicketsPagination {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
}
