"use client";

import { Settings } from "lucide-react";

interface Props {
  policy: {
    minSocForSwap: number; minSohThreshold: number;
    maxCycles: number; lowSohPenalty: string;
    rejectBelowSoh: number; policyVersion: string;
  };
  cabinetId: string;
}

export default function EligibilityPolicy({ policy, cabinetId }: Props) {
  const rows = [
    { label: "Min SOC for Swap",         value: `${policy.minSocForSwap}%`,      bar: policy.minSocForSwap, color: "bg-green-500"  },
    { label: "Min SOH Threshold",        value: `${policy.minSohThreshold}%`,    bar: policy.minSohThreshold, color: "bg-indigo-500" },
    { label: "Max Cycles Limit",         value: `${policy.maxCycles.toLocaleString()}`, bar: null, color: "" },
    { label: "Low SOH Penalty (80-70%)", value: policy.lowSohPenalty,            bar: null, color: "" },
    { label: "Reject Below SOH",         value: `< ${policy.rejectBelowSoh}%`,   bar: null, color: "" },
    { label: "Policy Version",           value: policy.policyVersion,            bar: null, color: "" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Eligibility Policy – {cabinetId}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Battery swap eligibility rules for this cabinet</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition">
          <Settings className="h-3.5 w-3.5" />
          Edit Policy
        </button>
      </div>

      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rows.map((row) => (
          <div key={row.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">{row.label}</p>
              <p className="text-sm font-bold text-gray-800">{row.value}</p>
            </div>
            {row.bar !== null && (
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${row.color} transition-all`}
                  style={{ width: `${row.bar}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}