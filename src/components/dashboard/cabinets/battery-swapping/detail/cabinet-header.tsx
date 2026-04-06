import { Wifi, WifiOff, Clock, Cpu } from "lucide-react";

interface Props {
  cabinet: {
    id: string; name: string; location: string;
    city: string; status: string; uptime: number;
    lastHeartbeat: string; firmware: string;
  };
}

export default function CabinetHeader({ cabinet }: Props) {
  const isConnected = cabinet.status === "connected";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        {/* Left: ID + Location */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <span className="text-indigo-600 font-bold text-xs">CAB</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm sm:text-base">{cabinet.id}</p>
            <p className="text-xs text-gray-500">{cabinet.location} – {cabinet.city}</p>
          </div>
        </div>

        {/* Right: Status + Meta */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{cabinet.uptime}%</p>
            <p className="text-[10px] text-gray-400 uppercase">Uptime</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">{cabinet.lastHeartbeat}</p>
            </div>
            <p className="text-[10px] text-gray-400 uppercase">Last Heartbeat</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">{cabinet.firmware}</p>
            </div>
            <p className="text-[10px] text-gray-400 uppercase">Firmware</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            isConnected ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
          }`}>
            {isConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>
    </div>
  );
}