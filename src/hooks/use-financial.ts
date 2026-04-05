"use client";

import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS, authHeaders } from "@/config/api"; // استيراد الإعدادات بتاعتك

const formatDateForApi = (dateStr: string) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${month}/${day}/${year}`;
};

export function useFinancial(fromDate: string, toDate: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialData = useCallback(async () => {
    if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
    setError("تاريخ النهاية يجب أن يكون بعد تاريخ البداية");
    setIsLoading(false);
    return; // وقف التنفيذ هنا ومش هيبعت للـ API
  }
    setIsLoading(true);
    setError(null);

    try {
      const fDate = formatDateForApi(fromDate);
      const tDate = formatDateForApi(toDate);

      // استخدام الـ Endpoint المعرف في ملف api.ts
      const endpoint = API_ENDPOINTS.DASHBOARD_FINANCIAL;

      // بناء الـ Query String
      const params = new URLSearchParams();
      if (fDate) params.append("date_from", fDate);
      if (tDate) params.append("date_to", tDate);

      const finalUrl = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;

      console.log("📡 Calling Financial API:", finalUrl);

      const response = await fetch(finalUrl, {
        method: "GET",
        headers: {
          ...authHeaders(), // استخدام الـ headers الجاهزة من ملفك (فيها الـ Token والـ Content-Type)
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Not Found or Server Error`);
      }

      const result = await response.json();
      
      // التأكد من جلب البيانات من result.data أو result مباشرة
      setData(result.data || result);

    } catch (err: any) {
      console.error("🔥 Financial Fetch Error:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  return { data, isLoading, error, refetch: fetchFinancialData };
}