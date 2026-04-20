import { Users, CheckCircle2, WifiOff, ShieldAlert } from "lucide-react";
import { SalesMember } from "./index";

interface Props { members: SalesMember[]; isLoading: boolean; }

const Skeleton = () => <div className="h-7 w-12 bg-gray-200 rounded-md animate-pulse mt-1" />;

export default function SalesStatsCards({ members, isLoading }: Props) {
  const stats = [
    { label: "Total",    value: members.length,                                            icon: Users,       bg: "bg-blue-100",   color: "text-blue-600"   },
    { label: "Active",   value: members.filter(m => m.status === "active").length,         icon: CheckCircle2,bg: "bg-green-100",  color: "text-green-600"  },
    { label: "Inactive", value: members.filter(m => m.status === "inactive").length,       icon: WifiOff,     bg: "bg-gray-100",   color: "text-gray-500"   },
    { label: "Suspended",value: members.filter(m => m.status === "suspended").length,      icon: ShieldAlert, bg: "bg-red-100",    color: "text-red-500"    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
            <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
            <div className="p-4 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
                {isLoading ? <Skeleton /> : <p className={`text-2xl font-semibold mt-1 ${s.color}`}>{s.value}</p>}
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