"use client";

import { Eye, Trash2 } from "lucide-react";
import { SalesMember } from "./index";

const statusCfg = {
  active:    { label: "Active",    badge: "bg-green-50 text-green-700 border border-green-200"   },
  inactive:  { label: "Inactive",  badge: "bg-gray-50 text-gray-500 border border-gray-200"      },
  suspended: { label: "Suspended", badge: "bg-red-50 text-red-600 border border-red-200"         },
};

interface Props {
  members: SalesMember[];
  onView: (m: SalesMember) => void;
  onDelete: (m: SalesMember) => void;
}

export default function SalesTable({ members, onView, onDelete }: Props) {
  if (members.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-400 text-sm">
        No sales members found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {["Name", "Phone", "Email", "Status", "Joined", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {members.map((m) => {
              const cfg = statusCfg[m.status];
              return (
                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold shrink-0">
                        {m.name.charAt(0)}
                      </div>
                      <p className="text-sm font-medium text-gray-800">{m.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{m.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{m.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}>{cfg.label}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(m.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => onView(m)} className="p-1.5 hover:bg-indigo-50 rounded-lg transition text-indigo-500" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDelete(m)} className="p-1.5 hover:bg-red-50 rounded-lg transition text-red-400" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-100">
        {members.map((m) => {
          const cfg = statusCfg[m.status];
          return (
            <div key={m.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.phone ?? "—"}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}>{cfg.label}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onView(m)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-indigo-200 text-indigo-600 text-xs font-medium hover:bg-indigo-50 transition">
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
                <button onClick={() => onDelete(m)} className="flex items-center justify-center px-3 py-2 rounded-lg border border-red-200 text-red-400 text-xs hover:bg-red-50 transition">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}