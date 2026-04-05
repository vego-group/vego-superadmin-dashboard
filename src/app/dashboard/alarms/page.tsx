"use client";

import { useState } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { 
  AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, 
  Filter, Search, ArrowUpDown 
} from "lucide-react";

export default function AlarmsPage() {
  const { alarms, isLoadingAlarms, resolveAlarm } = useDashboard();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter logic (Client-side for now, can be moved to API later)
  const filteredAlarms = alarms.filter(alarm => {
    const matchesSearch = alarm.iot_device?.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          alarm.alarm_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || alarm.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alarms Management</h1>
          <p className="text-sm text-gray-500">Monitor and resolve system-wide IOT alerts</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search serial or type..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="unresolved">Unresolved</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Device Info</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Alarm Type</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Timestamp</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoadingAlarms ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse"><td colSpan={5} className="p-8 bg-gray-50/50"></td></tr>
                ))
              ) : filteredAlarms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400 italic">No alarms found matching your criteria.</td>
                </tr>
              ) : (
                filteredAlarms.map((alarm) => (
                  <tr key={alarm.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{alarm.iot_device?.serial}</div>
                      <div className="text-xs text-gray-500">{alarm.iot_device?.device_id}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 uppercase">
                        {alarm.alarm_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(alarm.recorded_at).toLocaleString('en-US')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {alarm.status === 'unresolved' ? (
                          <><AlertCircle className="h-4 w-4 text-red-500" /> <span className="text-xs font-medium text-red-600">Active</span></>
                        ) : (
                          <><CheckCircle2 className="h-4 w-4 text-green-500" /> <span className="text-xs font-medium text-green-600">Resolved</span></>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {alarm.status === 'unresolved' && (
                        <button 
                          onClick={() => resolveAlarm(alarm.id)}
                          className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-all"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-xs text-gray-500">Showing {filteredAlarms.length} alarms</p>
          <div className="flex gap-2">
            <button className="p-2 border border-gray-200 rounded hover:bg-white disabled:opacity-50" disabled>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="p-2 border border-gray-200 rounded hover:bg-white">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}