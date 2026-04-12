import { useLang } from "@/lib/language-context";
import { Building2, CheckCircle2, Clock, XCircle, PauseCircle } from "lucide-react";
import { FleetCounts } from "./types";

interface Props { counts: FleetCounts | null; isLoading: boolean; }

const Skeleton = () => <div className="h-7 w-12 bg-gray-200 rounded-md animate-pulse mt-1" />;

export default function CompaniesStats({ counts, isLoading }: Props) {
    const { t } = useLang();
  const stats = [
    { label: t("Total",     "الإجمالي"),     value: counts?.total,    icon: Building2,    bg: "bg-blue-100",   color: "text-blue-600"   },
    { label: t("Approved",  "موافق"),  value: counts?.approved,  icon: CheckCircle2, bg: "bg-green-100",  color: "text-green-600"  },
    { label: t("Pending",   "معلق"),   value: counts?.pending,   icon: Clock,        bg: "bg-yellow-100", color: "text-yellow-600" },
    { label: t("Rejected",  "مرفوض"),  value: counts?.rejected,  icon: XCircle,      bg: "bg-red-100",    color: "text-red-500"    },
    { label: t("Suspended", "موقوف"), value: counts?.suspended, icon: PauseCircle,  bg: "bg-gray-100",   color: "text-gray-500"   },
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
                {isLoading ? <Skeleton /> : <p className={`text-2xl font-semibold mt-1 ${s.color}`}>{s.value ?? 0}</p>}
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