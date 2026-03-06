// revenue-trends.tsx
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

// ثوابت
const CHART_GRADIENT = {
  id: 'revenueGradient',
  from: '#3E1596',
  to: '#1C1FC1',
} as const;

interface RevenueData {
  date: string;
  revenue: number;
}

const data: RevenueData[] = [
  { date: 'Oct 1', revenue: 3000 },
  { date: 'Oct 5', revenue: 4000 },
  { date: 'Oct 10', revenue: 3500 },
  { date: 'Oct 15', revenue: 5000 },
  { date: 'Oct 20', revenue: 4500 },
  { date: 'Oct 25', revenue: 6000 },
  { date: 'Oct 30', revenue: 5500 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// تايب مخصص للـ Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 sm:p-3 shadow-lg rounded-lg border border-gray-100">
        <p className="text-xs sm:text-sm text-gray-600">Date: {label}</p>
        <p className="text-xs sm:text-sm font-semibold text-gray-900">
          Revenue: {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueTrends() {
  const [chartHeight, setChartHeight] = useState(300);

  // Adjust chart height based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setChartHeight(220);
      } else if (window.innerWidth < 1024) {
        setChartHeight(260);
      } else {
        setChartHeight(300);
      }
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-100">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Daily Revenue Trends (30 days)
      </h3>
      
      <div style={{ height: chartHeight }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#9ca3af' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#9ca3af" 
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#9ca3af' }}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke={`url(#${CHART_GRADIENT.id})`} 
              strokeWidth={2.5}
              dot={{ fill: CHART_GRADIENT.from, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, fill: CHART_GRADIENT.from }}
            />
            <defs>
              <linearGradient id={CHART_GRADIENT.id} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={CHART_GRADIENT.from} />
                <stop offset="100%" stopColor={CHART_GRADIENT.to} />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}