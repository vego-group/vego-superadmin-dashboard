// src/components/dashboard/overview/region-status.tsx
"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Battery, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useDashboard } from "@/hooks/use-dashboard";

const CHART_COLORS = {
  battery: "#00E5BE",
  fastCharge: "#F59E0B",
} as const;

export default function RegionStatus() {
  const { counts, isLoading } = useDashboard();
  const [chartHeight, setChartHeight] = useState(200);

  useEffect(() => {
    const handleResize = () => {
      setChartHeight(window.innerWidth < 640 ? 150 : 200);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const chartData = [
    {
      name: "Battery Swap",
      active:   counts?.total_battery_swap_active   ?? 0,
      inactive: counts?.total_battery_swap_inactive ?? 0,
      color: CHART_COLORS.battery,
    },
    {
      name: "Fast Charging",
      active:   counts?.total_fast_charging_active   ?? 0,
      inactive: counts?.total_fast_charging_inactive ?? 0,
      color: CHART_COLORS.fastCharge,
    },
  ];

  const statusCards = [
    {
      label:    "Battery Swap",
      active:   counts?.total_battery_swap_active   ?? 0,
      inactive: counts?.total_battery_swap_inactive ?? 0,
      Icon:     Battery,
      color:    CHART_COLORS.battery,
    },
    {
      label:    "Fast Charging",
      active:   counts?.total_fast_charging_active   ?? 0,
      inactive: counts?.total_fast_charging_inactive ?? 0,
      Icon:     Zap,
      color:    CHART_COLORS.fastCharge,
    },
  ];

  const totalActive =
    (counts?.total_battery_swap_active  ?? 0) +
    (counts?.total_fast_charging_active ?? 0);

  const totalAll =
    totalActive +
    (counts?.total_battery_swap_inactive  ?? 0) +
    (counts?.total_fast_charging_inactive ?? 0);

  const onlineRate = totalAll > 0
    ? ((totalActive / totalAll) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-100">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Cabinet Status Overview
      </h3>

      {/* Bar Chart */}
      {isLoading ? (
        <div
          style={{ height: chartHeight }}
          className="w-full bg-gray-100 animate-pulse rounded-lg"
        />
      ) : (
        <div style={{ height: chartHeight }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                tick={{ fontSize: 11 }}
                tickLine={{ stroke: "#9ca3af" }}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: "#9ca3af" }}
                width={30}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value, name) => [
                  `${value} cabinets`,
                  name === "active" ? "Active" : "Inactive",
                ]}
                cursor={{ fill: "transparent" }}
                contentStyle={{ fontSize: "12px" }}
              />
              <Bar dataKey="active" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 gap-2 sm:gap-3 mt-3 sm:mt-4">
        {statusCards.map((s) => {
          const Icon = s.Icon;
          return (
            <div
              key={s.label}
              className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="p-1.5 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${s.color}20`, color: s.color }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                  {s.label}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className="text-[10px] text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full font-medium">
                  {s.active} active
                </span>
                <span className="text-[10px] text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full font-medium">
                  {s.inactive} inactive
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-3 sm:mt-4">
        <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
          <span>Active Rate</span>
          <span className="font-medium">{onlineRate}%</span>
        </div>
        <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
            style={{ width: `${onlineRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}