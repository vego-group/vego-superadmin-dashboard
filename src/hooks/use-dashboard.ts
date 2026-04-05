// src/hooks/use-dashboard.ts
"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DashboardCounts {
  total_users: number;
  total_admins: number;
  total_battery_swap_active: number;
  total_battery_swap_inactive: number;
  total_fast_charging_active: number;
  total_fast_charging_inactive: number;
}

export interface Alarm {
  id: number;
  iot_device_id: number;
  alarm_code: number;
  alarm_type: string;
  status: "unresolved" | "resolved";
  recorded_at: string;
  iot_device?: {
    id: number;
    serial: string;
    device_id: string;
    status: string;
    software_version: string;
  };
}

const authHeaders = () => ({
  "Content-Type": "application/json",
  "Accept": "application/json",
});

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useDashboard() {
  // الحفاظ على حالات الإحصائيات (Counts) للأجزاء الأخرى من الموقع
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // حالات التنبيهات (Alarms) الجديدة
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isLoadingAlarms, setIsLoadingAlarms] = useState(true);

  // 1. جلب الإحصائيات (Counts) - كما هي دون تغيير لضمان عمل باقي الموقع
  const fetchCounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/proxy/dashboard/counts', {
        method: "GET",
        headers: authHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch counts (${res.status})`);
      const data = await res.json();
      setCounts(data.data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch counts";
      setError(msg);
      console.error("❌ fetchCounts:", msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. جلب التنبيهات غير المحلولة (Unresolved Alarms)
  const fetchAlarms = useCallback(async () => {
    setIsLoadingAlarms(true);
    try {
      const res = await fetch('/api/proxy/super-admin/alarms?status=unresolved', {
        method: "GET",
        headers: authHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch alarms (${res.status})`);
      const result = await res.json();
      
      // التعديل هنا: الوصول إلى result.data.data لأن الـ API يستخدم Pagination
      if (result.success && result.data) {
        setAlarms(result.data.data || []);
      }
    } catch (err) {
      console.error("❌ fetchAlarms:", err);
    } finally {
      setIsLoadingAlarms(false);
    }
  }, []);

  // 3. دالة لحل التنبيه (Resolve Alarm)
  const resolveAlarm = async (id: number) => {
    try {
      const res = await fetch(`/api/proxy/super-admin/alarms/${id}/resolve`, {
        method: "POST", // تم التأكيد أنها POST بناءً على مواصفات الـ Backend
        headers: authHeaders(),
        credentials: "include",
      });
      
      if (res.ok) {
        // تحديث القائمة محلياً فوراً لتحسين تجربة المستخدم (Optimistic Update)
        setAlarms(prev => prev.filter(alarm => alarm.id !== id));
      } else {
        throw new Error("Failed to resolve alarm");
      }
    } catch (err) {
      console.error("❌ resolveAlarm:", err);
    }
  };

  // التأكد من جلب كل البيانات عند تحميل الصفحة أو استدعاء الهوك
  useEffect(() => {
    fetchCounts();
    fetchAlarms();
  }, [fetchCounts, fetchAlarms]);

  // إرجاع كل القيم القديمة والجديدة معاً
  return { 
    counts, 
    alarms, 
    isLoading, 
    isLoadingAlarms, 
    error, 
    fetchCounts, 
    fetchAlarms,
    resolveAlarm 
  };
}