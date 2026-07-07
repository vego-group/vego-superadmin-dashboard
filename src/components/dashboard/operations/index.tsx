"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Plus,
  AlertCircle,
  Battery,
  Bell,
  Siren,
  Bike,
  Wrench,
  MessageSquareWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import TicketsTable from "./tickets-table";
import TicketAddModal from "./ticket-add-modal";
import TicketDetailModal from "./ticket-detail-modal";
import { useOperationsSummary, useMaintenanceTickets } from "@/hooks/use-operations";
import { useMaintenanceMutations } from "@/hooks/use-maintenance-mutations";
import { useLang } from "@/lib/language-context";
import { MaintenanceTicket } from "@/types/dashboard/maintenance";

export default function OperationsManagement() {
  const { t } = useLang();

  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingTicket, setViewingTicket] = useState<MaintenanceTicket | null>(null);

  const { summary, fetchSummary } = useOperationsSummary();
  const { tickets, pagination, isLoading, error, fetchTickets } = useMaintenanceTickets({
    status: statusFilter,
    page: currentPage,
    perPage: itemsPerPage,
  });

  const refetchAll = async () => {
    await Promise.all([fetchTickets(), fetchSummary()]);
  };

  const { createTicket, updateTicketStatus } = useMaintenanceMutations(refetchAll);

  const statusTabs = [
    { value: "all", label: t("All", "الكل") },
    { value: "open", label: t("Open", "مفتوحة") },
    { value: "in_progress", label: t("In Progress", "قيد التنفيذ") },
    { value: "resolved", label: t("Resolved", "تم الحل") },
  ];

  const summaryCards = [
    {
      label: t("Offline Cabinets", "كبائن غير متصلة"),
      value: summary?.offline_cabinets,
      icon: Battery,
      accent: "from-red-500 to-orange-500",
      iconCls: "bg-red-50 text-red-600",
      href: "/dashboard/cabinets/battery-swapping",
    },
    {
      label: t("Active Alarms", "إنذارات نشطة"),
      value: summary?.active_alarms,
      icon: Bell,
      accent: "from-orange-500 to-amber-500",
      iconCls: "bg-orange-50 text-orange-600",
      href: "/dashboard/alarms",
    },
    {
      label: t("Open Incidents", "حوادث مفتوحة"),
      value: summary?.open_incidents,
      icon: Siren,
      accent: "from-purple-500 to-fuchsia-500",
      iconCls: "bg-purple-50 text-purple-600",
    },
    {
      label: t("In Maintenance", "قيد الصيانة"),
      value: summary?.motorcycles_in_maintenance,
      icon: Bike,
      accent: "from-blue-500 to-indigo-500",
      iconCls: "bg-blue-50 text-blue-600",
      href: "/dashboard/motorcycles",
    },
    {
      label: t("Open Tickets", "تذاكر مفتوحة"),
      value: summary?.open_maintenance_tickets,
      icon: Wrench,
      accent: "from-indigo-500 to-violet-500",
      iconCls: "bg-indigo-50 text-indigo-600",
    },
    {
      label: t("New Complaints", "شكاوى جديدة"),
      value: summary?.new_complaints,
      icon: MessageSquareWarning,
      accent: "from-emerald-500 to-teal-500",
      iconCls: "bg-emerald-50 text-emerald-600",
      href: "/dashboard/complaints",
    },
  ];

  const handleTabChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            {t("Operations", "العمليات")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("Monitor stations and manage motorcycle maintenance", "متابعة المحطات وإدارة صيانة الدراجات")}
          </p>
        </div>
        <button
          onClick={refetchAll}
          className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
          title={t("Refresh", "تحديث")}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const body = (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-full hover:shadow-md transition-shadow">
              <div className={`h-1 w-full bg-gradient-to-r ${card.accent}`} />
              <div className="p-4 flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                    {card.label}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {card.value ?? "—"}
                  </p>
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconCls}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          );
          return card.href ? (
            <Link key={card.label} href={card.href}>{body}</Link>
          ) : (
            <div key={card.label}>{body}</div>
          );
        })}
      </div>

      {/* Toolbar: status tabs + add ticket */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                statusFilter === tab.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 w-fit"
        >
          <Plus className="h-4 w-4" />
          {t("New Ticket", "تذكرة جديدة")}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <TicketsTable
          tickets={tickets}
          pagination={pagination}
          onView={setViewingTicket}
          onPageChange={(p) => {
            setCurrentPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onPerPageChange={(pp) => {
            setItemsPerPage(pp);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Modals */}
      <TicketAddModal
        open={showAddModal}
        onSubmit={createTicket}
        onClose={() => setShowAddModal(false)}
      />
      <TicketDetailModal
        ticket={viewingTicket}
        onUpdateStatus={updateTicketStatus}
        onClose={() => setViewingTicket(null)}
      />
    </div>
  );
}
