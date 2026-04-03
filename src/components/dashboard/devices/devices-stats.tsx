import { Monitor, Wifi, WifiOff, Wrench } from "lucide-react";
import { Device } from "./types";

interface Props { devices: Device[]; }

export default function DevicesStats({ devices }: Props) {
  const stats = [
    { label: "Total Devices",    value: devices.length,                                          icon: Monitor, bg: "bg-blue-100",   color: "text-blue-600"   },
    { label: "Connected",        value: devices.filter((d) => d.status === "connected").length,   icon: Wifi,    bg: "bg-green-100",  color: "text-green-600"  },
    { label: "Disconnected",     value: devices.filter((d) => d.status === "disconnected").length,icon: WifiOff, bg: "bg-red-100",    color: "text-red-500"    },
    { label: "Under Maintenance",value: devices.filter((d) => d.status === "maintenance").length, icon: Wrench,  bg: "bg-orange-100", color: "text-orange-500" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
            <div className="p-4 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
                <p className={`text-2xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}