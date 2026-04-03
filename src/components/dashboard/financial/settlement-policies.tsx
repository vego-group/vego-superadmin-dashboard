import { CheckCircle2, Clock, WifiOff, RefreshCw } from "lucide-react";

const holdRelease = [
  "Hold the amount at session start",
  "Capture actual charge on session end",
  "Auto-release the difference (Release)",
];

const timeoutPolicy = [
  { label: "Hold expiry timeout", value: "30 min" },
  { label: "Max capture limit",   value: "500 SAR" },
  { label: "Retry attempts",      value: "3 tries" },
];

const recoveryPolicy = [
  { label: "Active continuation", value: "<= 10 SAR" },
{ label: "Periodic continuation", value: "> 10 SAR" },
];

export default function SettlementPolicies() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">Settlement & Authorization Policies</h2>
      </div>

      <div className="p-5 space-y-5">

        {/* Hold → Capture → Release */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
            <p className="text-xs font-semibold text-gray-600">Hold → Capture → Release</p>
          </div>
          <div className="space-y-2">
            {holdRelease.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-600">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Timeout */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-orange-500" />
            <p className="text-xs font-semibold text-gray-600">Hold Timeout Policy</p>
          </div>
          <div className="space-y-2">
            {timeoutPolicy.map((item) => (
  <div key={item.label} className="flex items-center justify-between">
    <p className="text-sm text-gray-600">{item.label}</p>
    <p className="text-sm font-semibold text-indigo-600">{item.value}</p>
  </div>
))}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Offline/Fallback */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <WifiOff className="h-4 w-4 text-red-400" />
            <p className="text-xs font-semibold text-gray-600">Offline / Fallback Policy</p>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            On connection loss: transactions stored locally · On reconnect: retroactive charges applied · User notified
          </p>
        </div>

        <div className="border-t border-gray-100" />

        {/* Recovery */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="h-4 w-4 text-green-500" />
            <p className="text-xs font-semibold text-gray-600">Recovery Policy</p>
          </div>
          <div className="space-y-2">
            {recoveryPolicy.map((item) => (
  <div key={item.label} className="flex items-center justify-between">
    <p className="text-sm text-gray-600">{item.label}</p>
    <p className="text-sm font-semibold text-indigo-600">{item.value}</p>
  </div>
))}
          </div>
        </div>
      </div>
    </div>
  );
}