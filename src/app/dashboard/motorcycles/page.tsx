// src/app/dashboard/motorcycles/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/lib/language-context";
import {
  Bike,
  Battery,
  User,
  MapPin,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronDown,
} from "lucide-react";

interface Battery {
  id: number;
  battery_id: string;
  battery_type: string;
  physical_damage: boolean;
  status: string;
  battery_percentage: number;
  soh: string;
  cycle_count: number;
  motorcycle_id: number | null;
  battery_swap_cabinet_id: number | null;
  cabinet_box_no: number | null;
  created_at: string;
  updated_at: string;
}

interface AssignedUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  fleet_id: number | null;
}

interface Motorcycle {
  id: number;
  device_id: string;
  brand: string | null;
  model: string | null;
  plate_number: string | null;
  assigned_user_id: number | null;
  fleet_id: number | null;
  battery_type: string;
  status: string;
  current_lat: string;
  current_lng: string;
  address: string;
  city: string;
  province: string;
  created_at: string;
  updated_at: string;
  assigned_user: AssignedUser | null;
  battery: Battery | null;
}

export default function MotorcyclesPage() {
  const { t, lang } = useLang();
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [batteryFilter, setBatteryFilter] = useState<string>("all");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMotorcycle, setSelectedMotorcycle] = useState<Motorcycle | null>(null);
  const [availableBatteries, setAvailableBatteries] = useState<Battery[]>([]);
  const [selectedBatteryId, setSelectedBatteryId] = useState<number | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://mobility-live.com/api/super-admin";

  const getToken = (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const authHeaders = (): Record<string, string> => ({
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  });

  const fetchMotorcycles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/motorcycles`, {
        headers: authHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setMotorcycles(data.data);
      }
    } catch (error) {
      console.error("Error fetching motorcycles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableBatteries = async () => {
    try {
      // هنا نفترض endpoint للبطاريات المتاحة
      // لو مفيش، هنفلتر من الـ motorcycles
      const availableBats = motorcycles
        .filter((m) => m.battery && m.battery.status !== "in_motorcycle")
        .map((m) => m.battery)
        .filter((b): b is Battery => b !== null);
      
      setAvailableBatteries(availableBats);
    } catch (error) {
      console.error("Error fetching batteries:", error);
    }
  };

  const handleAssignBattery = async () => {
    if (!selectedMotorcycle || !selectedBatteryId) return;

    setAssignLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/motorcycles/${selectedMotorcycle.id}/assign-battery`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ battery_id: selectedBatteryId }),
        }
      );
      const data = await response.json();
      
      if (data.success) {
        await fetchMotorcycles();
        setShowAssignModal(false);
        setSelectedMotorcycle(null);
        setSelectedBatteryId(null);
      }
    } catch (error) {
      console.error("Error assigning battery:", error);
    } finally {
      setAssignLoading(false);
    }
  };

  useEffect(() => {
    fetchMotorcycles();
  }, []);

  const filteredMotorcycles = motorcycles.filter((moto) => {
    const matchesSearch =
      moto.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moto.plate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moto.assigned_user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moto.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || moto.status === statusFilter;
    
    const matchesBattery =
      batteryFilter === "all" ||
      (batteryFilter === "with_battery" && moto.battery) ||
      (batteryFilter === "without_battery" && !moto.battery);

    return matchesSearch && matchesStatus && matchesBattery;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; arLabel: string; className: string; icon: any }> = {
      active: {
        label: "Active",
        arLabel: "نشط",
        className: "bg-green-100 text-green-700",
        icon: CheckCircle,
      },
      inactive: {
        label: "Inactive",
        arLabel: "غير نشط",
        className: "bg-gray-100 text-gray-700",
        icon: XCircle,
      },
      maintenance: {
        label: "Maintenance",
        arLabel: "صيانة",
        className: "bg-yellow-100 text-yellow-700",
        icon: AlertCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="h-3.5 w-3.5" />
        {lang === "en" ? config.label : config.arLabel}
      </span>
    );
  };

  const getBatteryStatusBadge = (battery: Battery | null) => {
    if (!battery) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <XCircle className="h-3.5 w-3.5" />
          {t("No Battery", "لا توجد بطارية")}
        </span>
      );
    }

    const percentage = battery.battery_percentage;
    let className = "bg-gray-100 text-gray-700";
    if (percentage >= 80) className = "bg-green-100 text-green-700";
    else if (percentage >= 50) className = "bg-yellow-100 text-yellow-700";
    else if (percentage >= 20) className = "bg-orange-100 text-orange-700";
    else className = "bg-red-100 text-red-700";

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>
        <Battery className="h-3.5 w-3.5" />
        {percentage}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("Motorcycles", "الدراجات النارية")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("Manage all motorcycles and their batteries", "إدارة جميع الدراجات النارية والبطاريات")}
          </p>
        </div>
        <button
          onClick={fetchMotorcycles}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <RefreshCw className="h-4 w-4" />
          {t("Refresh", "تحديث")}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t("Total Motorcycles", "إجمالي الدراجات")}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{motorcycles.length}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Bike className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t("Active", "نشط")}</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {motorcycles.filter((m) => m.status === "active").length}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t("With Battery", "مع بطارية")}</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {motorcycles.filter((m) => m.battery).length}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Battery className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t("Assigned Users", "المستخدمون المعينون")}</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                {motorcycles.filter((m) => m.assigned_user).length}
              </p>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t("Search by device ID, plate, user, city...", "ابحث برقم الجهاز، اللوحة، المستخدم، المدينة...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">{t("All Statuses", "جميع الحالات")}</option>
            <option value="active">{t("Active", "نشط")}</option>
            <option value="inactive">{t("Inactive", "غير نشط")}</option>
            <option value="maintenance">{t("Maintenance", "صيانة")}</option>
          </select>

          {/* Battery Filter */}
          <select
            value={batteryFilter}
            onChange={(e) => setBatteryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">{t("All Batteries", "جميع البطاريات")}</option>
            <option value="with_battery">{t("With Battery", "مع بطارية")}</option>
            <option value="without_battery">{t("Without Battery", "بدون بطارية")}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("Device ID", "رقم الجهاز")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("Details", "التفاصيل")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("Battery", "البطارية")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("Assigned User", "المستخدم المعين")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("Location", "الموقع")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("Status", "الحالة")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("Actions", "الإجراءات")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMotorcycles.map((moto) => (
                <tr key={moto.id} className="hover:bg-gray-50 transition">
                  {/* Device ID */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Bike className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{moto.device_id}</p>
                        {moto.plate_number && (
                          <p className="text-xs text-gray-500">{moto.plate_number}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Details */}
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {moto.brand && <p className="text-gray-900">{moto.brand} {moto.model}</p>}
                      <p className="text-gray-500 text-xs">{t("Type:", "النوع:")} {moto.battery_type}</p>
                    </div>
                  </td>

                  {/* Battery */}
                  <td className="px-6 py-4">
                    {moto.battery ? (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">{moto.battery.battery_id}</p>
                        {getBatteryStatusBadge(moto.battery)}
                        <p className="text-xs text-gray-500">
                          {t("SOH:", "الصحة:")} {moto.battery.soh}% | {t("Cycles:", "الدورات:")} {moto.battery.cycle_count}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        {getBatteryStatusBadge(null)}
                      </div>
                    )}
                  </td>

                  {/* Assigned User */}
                  <td className="px-6 py-4">
                    {moto.assigned_user ? (
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{moto.assigned_user.name}</p>
                          <p className="text-xs text-gray-500">{moto.assigned_user.phone}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">{t("Not assigned", "غير معين")}</span>
                    )}
                  </td>

                  {/* Location */}
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="text-gray-900">{moto.city}, {moto.province}</p>
                        <p className="text-gray-500 text-xs truncate max-w-[200px]">{moto.address}</p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(moto.status)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedMotorcycle(moto);
                        fetchAvailableBatteries();
                        setShowAssignModal(true);
                      }}
                      className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition"
                    >
                      {t("Assign Battery", "تعيين بطارية")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMotorcycles.length === 0 && (
          <div className="text-center py-12">
            <Bike className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t("No motorcycles found", "لا توجد دراجات")}</p>
          </div>
        )}
      </div>

      {/* Assign Battery Modal */}
      {showAssignModal && selectedMotorcycle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {t("Assign Battery to", "تعيين بطارية لـ")} {selectedMotorcycle.device_id}
            </h3>

            {selectedMotorcycle.battery && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  {t("Current battery:", "البطارية الحالية:")} <strong>{selectedMotorcycle.battery.battery_id}</strong>
                  <br />
                  {t("It will be automatically detached.", "سيتم فصلها تلقائياً.")}
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("Select Battery", "اختر البطارية")}
              </label>
              <select
                value={selectedBatteryId || ""}
                onChange={(e) => setSelectedBatteryId(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">{t("Choose a battery...", "اختر بطارية...")}</option>
                {availableBatteries.map((bat) => (
                  <option key={bat.id} value={bat.id}>
                    {bat.battery_id} - {bat.battery_percentage}% ({bat.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedMotorcycle(null);
                  setSelectedBatteryId(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                {t("Cancel", "إلغاء")}
              </button>
              <button
                onClick={handleAssignBattery}
                disabled={!selectedBatteryId || assignLoading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assignLoading ? t("Assigning...", "جاري التعيين...") : t("Assign", "تعيين")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}