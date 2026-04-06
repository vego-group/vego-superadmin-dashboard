// revenue-trends.tsx
"use client";
import { useLang } from "@/lib/language-context";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, authHeaders } from '@/config/api';
import { Loader2, TrendingUp, AlertCircle } from "lucide-react";

// --- التنسيقات ---
const CHART_COLORS = { stroke: '#4F46E5', grid: '#F3F4F6' };

interface RevenueData {
  date: string;
  revenue: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-xl rounded-xl border border-gray-100 ring-1 ring-black/5">
        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">{label}</p>
        <p className="text-sm font-bold text-indigo-600">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueTrends() {
  const { t } = useLang();
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/dashboard/daily-revenue`, {
        method: 'GET',
        headers: authHeaders(),
      });

      const result = await response.json();

      // التحقق من الهيكل بناءً على الـ Response اللي أرسلته
      if (result.success && result.data && Array.isArray(result.data.chart)) {
        const formattedData = result.data.chart.map((item: any) => ({
          // نحول التاريخ لشكل أبسط للعرض (اختياري)
          date: item.date, 
          // نستخدم مفتاح total كما هو في الـ API الخاص بك
          revenue: Number(item.total || 0),
        }));
        setData(formattedData);
      } else {
        throw new Error(result.message || "Invalid data format");
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Connection Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 relative min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-tight">
              {t("Daily Revenue Trends", "اتجاهات الإيرادات اليومية")}
            </h3>
          </div>
          <p className="text-xs text-gray-400 font-medium">{t("Visualizing total daily earnings", "عرض إجمالي الأرباح اليومية")}</p>
        </div>
        {loading && <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />}
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center h-[300px] bg-red-50/50 rounded-xl border border-dashed border-red-200">
          <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button onClick={fetchRevenueData} className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
            {t("Try Again", "حاول مجدداً")}
          </button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-200" />
        </div>
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.stroke} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={CHART_COLORS.stroke} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.grid} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#9CA3AF'}} 
                minTickGap={30} // لمنع تداخل التواريخ
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#9CA3AF'}} 
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke={CHART_COLORS.stroke} 
                fill="url(#colorRev)" 
                strokeWidth={3}
                activeDot={{ r: 6, fill: CHART_COLORS.stroke, strokeWidth: 4, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}