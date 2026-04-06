"use client";

import { 
  TrendingUp, 
  CreditCard, 
  BarChart2, 
  ShoppingCart, 
  ArrowLeftRight, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
import { useFinancial } from "@/hooks/use-financial";
import { useLang } from "@/lib/language-context";


interface FinancialStatsProps {
  fromDate: string;
  toDate: string;
}

export default function FinancialStats({ fromDate, toDate }: FinancialStatsProps) {
  const { t, lang } = useLang();
  // جلب البيانات الحقيقية بناءً على التواريخ المختارة
  const { data, isLoading, error } = useFinancial(fromDate, toDate);

  // 1. حالة التحميل (Skeleton Loading) لتعزيز تجربة المستخدم
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-white border border-gray-100 rounded-xl animate-pulse flex flex-col p-4 space-y-3">
            <div className="h-8 w-8 bg-gray-100 rounded-lg" />
            <div className="h-6 w-20 bg-gray-100 rounded" />
            <div className="h-4 w-12 bg-gray-50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // 2. حالة الخطأ في حال فشل الـ API
  // داخل financial-stats.tsx
if (error) {
  return (
    <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl flex items-center gap-2 text-sm">
      <AlertCircle className="h-4 w-4" />
      <span>
  {error === "Error 422: Not Found or Server Error"
    ? t("Please select a valid date range", "يرجى اختيار نطاق تاريخ صحيح")
    : t(error, error)}
</span>
    </div>
  );
}
const unitMap: Record<string, string> = {
  SAR: t("SAR", "ريال"),
  txn: t("Transactions", "معاملة"),
};
  // 3. خريطة ربط بيانات الـ API بالتصميم
  // ملاحظة: تم استخدام Optional Chaining للتأكد من عدم حدوث crash إذا كانت البيانات ناقصة
  const statsConfig = [
    { 
      label: t("Total Revenue",       "إجمالي الإيرادات"), 
      value: data?.total_revenue ?? 0, 
      unit: "SAR", 
      icon: TrendingUp, 
      color: "text-green-600", 
      bg: "bg-green-100" 
    },
    { 
      label: t("Total Transactions",  "إجمالي المعاملات"), 
      value: data?.total_transactions ?? 0, 
      unit: "txn", 
      icon: CreditCard, 
      color: "text-blue-600", 
      bg: "bg-blue-100" 
    },
    { 
      label: t("Avg. Transaction",    "متوسط المعاملة"), 
      value: data?.avg_transaction ?? 0, 
      unit: "SAR", 
      icon: BarChart2, 
      color: "text-purple-600", 
      bg: "bg-purple-100" 
    },
    { 
      label: t("Pending Holds",       "الحجوزات المعلقة"), 
      value: data?.pending_holds ?? 0, 
      unit: "SAR", 
      icon: ShoppingCart, 
      color: "text-orange-500", 
      bg: "bg-orange-100" 
    },
    { 
      label: t("Refunds",             "المبالغ المستردة"), 
      value: data?.refunds ?? 0, 
      unit: "SAR", 
      icon: ArrowLeftRight, 
      color: "text-red-500", 
      bg: "bg-red-100" 
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {statsConfig.map((s) => {
        const Icon = s.icon;
        return (
          <div 
            key={s.label} 
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all hover:-translate-y-1 group"
          >
            {/* خط جمالي علوي */}
            <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600 opacity-80 group-hover:opacity-100 transition-opacity" />
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg transition-colors ${s.bg}`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
              </div>

              <p className={`text-xl font-bold tracking-tight ${s.color}`}>
                {/* تنسيق الأرقام بفاصلة آلاف وعلامتين عشريتين */}
                {Number(s.value).toLocaleString(
  lang === "ar" ? "ar-EG" : "en-US",
  {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }
)}
              </p>

              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {s.label}
                </p>
                <p className="text-[10px] text-gray-300 font-medium italic">
                  {unitMap[s.unit] || s.unit}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}