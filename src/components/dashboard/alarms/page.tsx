"use client";

import { useState } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function AlarmsPage() {
  const { alarms, isLoadingAlarms, resolveAlarm } = useDashboard();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // تصفية البيانات برمجياً (Client-side filtering)
  const filteredAlarms = alarms.filter((alarm) => {
    const matchesSearch = 
      alarm.iot_device?.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alarm.alarm_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || alarm.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Breadcrumbs & Title */}
      <div className="mb-6">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Alarms Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          View and manage all IOT device alerts and system failures.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Serial or Type..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-gray-400 hidden md:block" />
          <select
            className="w-full md:w-40 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="unresolved">Active (Unresolved)</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Device Info</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Alarm Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingAlarms ? (
                // Skeleton loading rows
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8 bg-white/50"></td>
                  </tr>
                ))
              ) : filteredAlarms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400">
                    <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">No alarms found matching your search.</p>
                  </td>
                </tr>
              ) : (
                filteredAlarms.map((alarm) => (
                  <tr key={alarm.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">{alarm.iot_device?.serial}</span>
                        <span className="text-[11px] text-gray-500 font-mono tracking-tighter uppercase">{alarm.iot_device?.device_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-tight ${
                        alarm.alarm_type === 'overvoltage' ? 'bg-red-50 text-red-700' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {alarm.alarm_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 font-medium">
                        {new Date(alarm.recorded_at).toLocaleDateString('en-GB')}
                      </span>
                      <span className="text-[11px] text-gray-400 block">
                        {new Date(alarm.recorded_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {alarm.status === 'unresolved' ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                          <span className="h-1.5 w-1.5 bg-red-600 rounded-full animate-pulse" />
                          ACTIVE
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          RESOLVED
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {alarm.status === 'unresolved' && (
                        <button
                          onClick={() => resolveAlarm(alarm.id)}
                          className="bg-white border border-indigo-200 text-indigo-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">
            Showing {filteredAlarms.length} of {alarms.length} entries
          </span>
          <div className="flex gap-2">
             <button className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-30" disabled>
                <ChevronLeft className="h-4 w-4" />
             </button>
             <button className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-30" disabled>
                <ChevronRight className="h-4 w-4" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}