// region-status.tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wifi, WifiOff } from "lucide-react";
import { useState, useEffect } from 'react';

// ثوابت
const CHART_COLORS = {
  online: '#10B981',
  offline: '#EF4444',
} as const;

const STATUS_CONFIG = [
  { 
    name: 'Online', 
    key: 'online',
    color: CHART_COLORS.online,
    bgColor: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    Icon: Wifi 
  },
  { 
    name: 'Offline', 
    key: 'offline',
    color: CHART_COLORS.offline,
    bgColor: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    Icon: WifiOff 
  },
] as const;

const data = [
  { name: 'Online', value: 115, color: CHART_COLORS.online },
  { name: 'Offline', value: 13, color: CHART_COLORS.offline },
];

const totalCabinets = data.reduce((sum, item) => sum + item.value, 0);
const onlineRate = ((data[0].value / totalCabinets) * 100).toFixed(1);

export default function RegionStatus() {
  const [chartHeight, setChartHeight] = useState(200);

  // Adjust chart height based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setChartHeight(150);
      } else {
        setChartHeight(200);
      }
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-100">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Active Cabinets by Region
      </h3>
      
      {/* Bar Chart */}
      <div style={{ height: chartHeight }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#9ca3af' }}
            />
            <YAxis 
              stroke="#9ca3af" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#9ca3af' }}
              width={30}
            />
            <Tooltip 
              formatter={(value) => [`${value} cabinets`, '']}
              cursor={{ fill: 'transparent' }}
              contentStyle={{ fontSize: '12px' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4">
        {STATUS_CONFIG.map((status, index) => {
          const Icon = status.Icon;
          const value = data[index].value;
          
          return (
            <div 
              key={status.key}
              className={`flex items-center justify-between p-2 sm:p-3 ${status.bgColor} rounded-lg`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0"> {/* Added min-w-0 */}
                <div className={`p-1 sm:p-1.5 ${status.iconBg} rounded-lg flex-shrink-0`}>
                  <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${status.iconColor}`} />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                  {status.name}
                </span>
              </div>
              <span className={`text-base sm:text-lg font-bold ${status.iconColor} flex-shrink-0 ml-1`}>
                {value}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Progress Bar */}
      <div className="mt-3 sm:mt-4">
        <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
          <span>Online Rate</span>
          <span className="font-medium">{onlineRate}%</span>
        </div>
        <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-300"
            style={{ width: `${onlineRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}