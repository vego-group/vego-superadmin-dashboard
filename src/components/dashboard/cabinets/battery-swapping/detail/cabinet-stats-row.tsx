import { Slot } from "./mock-data";

interface Props { slots: Slot[]; }

export default function CabinetStatsRow({ slots }: Props) {
  const stats = [
    { label: "Available Batteries", value: slots.filter((s) => s.status === "available").length, color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200"  },
    { label: "Charging",            value: slots.filter((s) => s.status === "charging").length,   color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200"   },
    { label: "Faulty",              value: slots.filter((s) => s.status === "faulty").length,     color: "text-red-500",    bg: "bg-red-50",    border: "border-red-200"    },
    { label: "Blocked / Reserved",  value: slots.filter((s) => s.status === "blocked").length,    color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
    { label: "Empty Slots",         value: slots.filter((s) => s.status === "empty").length,      color: "text-gray-500",   bg: "bg-gray-50",   border: "border-gray-200"   },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((s) => (
        <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-4 text-center`}>
          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          <p className="text-xs text-gray-500 mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}