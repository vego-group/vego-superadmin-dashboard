import { TrendingUp, CreditCard, BarChart2, ShoppingCart, ArrowLeftRight } from "lucide-react";

const baseStats = [
  { label: "Total Revenue",       value: 145600, unit: "SAR", icon: TrendingUp,     color: "text-green-600",  bg: "bg-green-100"  },
  { label: "Total Transactions",  value: 17680,  unit: "txn", icon: CreditCard,      color: "text-blue-600",   bg: "bg-blue-100"   },
  { label: "Avg. Transaction",    value: 8.23,   unit: "SAR", icon: BarChart2,       color: "text-purple-600", bg: "bg-purple-100" },
  { label: "Pending Holds",       value: 3200,   unit: "SAR", icon: ShoppingCart,    color: "text-orange-500", bg: "bg-orange-100" },
  { label: "Refunds",             value: 450,    unit: "SAR", icon: ArrowLeftRight,  color: "text-red-500",    bg: "bg-red-100"    },
];

export default function FinancialStats({ fromDate, toDate }: any) {

  const isFiltered = fromDate && toDate;

  // 🔥 simulate filtering (لحد ما تربطه API)
  const stats = isFiltered
    ? baseStats.map((s) => ({
        ...s,
        value: typeof s.value === "number"
          ? Number((s.value * 0.6).toFixed(2))
          : s.value,
      }))
    : baseStats;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${s.bg}`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
              </div>

              <p className={`text-xl font-bold ${s.color}`}>
                {s.value.toLocaleString()}
              </p>

              <p className="text-xs text-gray-400 mt-0.5">{s.unit}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}