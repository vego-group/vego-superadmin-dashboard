import { Bike, CheckCircle2, WifiOff, Wrench, Battery } from "lucide-react";
import { Motorcycle } from "./types";
import { useLang } from "@/lib/language-context";

interface Props { motorcycles: Motorcycle[]; isLoading: boolean; }

const Skeleton = () => <div className="h-7 w-12 bg-gray-200 rounded-md animate-pulse mt-1" />;

export default function MotorcyclesStats({ motorcycles, isLoading }: Props) {
  const { t } = useLang();

  const stats = [
    { label: t("Total",        "الإجمالي"),       value: motorcycles.length,                                            icon: Bike,         bg: "bg-blue-100",   color: "text-blue-600"   },
    { label: t("Active",       "نشط"),             value: motorcycles.filter(m => m.status === "active").length,        icon: CheckCircle2, bg: "bg-green-100",  color: "text-green-600"  },
    { label: t("Inactive",     "غير نشط"),         value: motorcycles.filter(m => m.status === "inactive").length,      icon: WifiOff,      bg: "bg-gray-100",   color: "text-gray-500"   },
    { label: t("Maintenance",  "صيانة"),           value: motorcycles.filter(m => m.status === "maintenance").length,   icon: Wrench,       bg: "bg-orange-100", color: "text-orange-500" },
    { label: t("With Battery", "بها بطارية"),      value: motorcycles.filter(m => m.battery !== null).length,           icon: Battery,      bg: "bg-purple-100", color: "text-purple-600" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
            <div className="p-4 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
                {isLoading ? <Skeleton /> : <p className={`text-2xl font-semibold mt-1 ${s.color}`}>{s.value}</p>}
              </div>
              <div className={`p-2 rounded-lg ${s.bg}`}><Icon className={`h-5 w-5 ${s.color}`} /></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}