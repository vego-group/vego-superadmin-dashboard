// src/components/dashboard/overview/recent-alarms.tsx
"use client";

import { AlertCircle, AlertTriangle, BatteryWarning, RefreshCw, Bell, ChevronRight, Check } from "lucide-react";
import { useDashboard, Alarm } from "@/hooks/use-dashboard";
// 1. استيراد مكون Link
import Link from "next/link";
import { useLang } from "@/lib/language-context";

const ALARM_CONFIG: Record<string, { color: string; bgColor: string; icon: any }> = {
  overvoltage: { color: "text-red-600", bgColor: "bg-red-50", icon: AlertCircle },
  vehicle_fault: { color: "text-orange-600", bgColor: "bg-orange-50", icon: AlertTriangle },
  low_battery: { color: "text-amber-600", bgColor: "bg-amber-50", icon: BatteryWarning },
  firmware_update: { color: "text-purple-600", bgColor: "bg-purple-50", icon: RefreshCw },
};

export default function RecentAlarms() {
  const { alarms, isLoadingAlarms, resolveAlarm } = useDashboard();
  const { t } = useLang();

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          {t("Recent Alarms", "التنبيهات الأخيرة")} <Bell className="h-4 w-4 text-orange-500" />
        </h3>
        
        {/* 2. تحويل الـ button إلى Link وتوجيهه للمسار المطلوب */}
        <Link 
  href="/dashboard/alarms" 
  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-indigo-50 text-indigo-600 rounded-lg text-[11px] font-bold transition-all border border-gray-100 hover:border-indigo-100 shadow-sm"
>
  {t("View All", "عرض الكل")} 
  <ChevronRight className="h-3.5 w-3.5" />
</Link>
      </div>

      {/* Alarms List */}
      <div className="space-y-3">
        {isLoadingAlarms ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-full bg-gray-50 animate-pulse rounded-xl" />
          ))
        ) : alarms.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm border-2 border-dashed border-gray-50 rounded-xl">
            {t("No active alarms found", "لا توجد تنبيهات نشطة")}
          </div>
        ) : (
          alarms.slice(0, 5).map((alarm: Alarm) => {
            const config = ALARM_CONFIG[alarm.alarm_type] || ALARM_CONFIG.overvoltage;
            const Icon = config.icon;

            return (
              <div
                key={alarm.id}
                className={`group flex items-center gap-3 p-3 rounded-xl border border-transparent transition-all hover:shadow-md hover:border-gray-100 ${config.bgColor}`}
              >
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Icon className={`h-5 w-5 ${config.color}`} strokeWidth={2.5} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-[13px] font-bold text-gray-900 uppercase tracking-tight truncate">
                      {alarm.alarm_type.replace(/_/g, ' ')}
                    </p>
                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                      {new Date(alarm.recorded_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                    {alarm.iot_device?.serial || t("Unknown Device", "جهاز غير معروف")} • {alarm.iot_device?.device_id || 'N/A'}
                  </p>
                </div>

                <button 
                  onClick={() => resolveAlarm(alarm.id)}
                  className="h-7 w-7 rounded-full bg-white/50 flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-white transition-colors shadow-sm"
                  title={t("Mark as resolved", "تحديد كمحلول")}
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}