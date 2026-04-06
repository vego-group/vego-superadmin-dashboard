import { CheckCircle2, Clock, WifiOff, RefreshCw } from "lucide-react";
import { useLang } from "@/lib/language-context";


export default function SettlementPolicies() {
  const { t } = useLang();

  const holdRelease = [
  t("Hold the amount at session start", "حجز المبلغ عند بداية الجلسة"),
  t("Capture actual charge on session end", "خصم التكلفة الفعلية عند انتهاء الجلسة"),
  t("Auto-release the difference (Release)", "إطلاق الفرق تلقائياً (Release)"),
];

const timeoutPolicy = [
   { label: t("Hold expiry timeout", "مهلة انتهاء الحجز"), value: "30 min" },
   { label: t("Max capture limit",   "الحد الأقصى للالتقاط"), value: "500 SAR" },
   { label: t("Retry attempts",      "محاولات إعادة المحاولة"), value: "3 tries" },
];

const recoveryPolicy = [
    { label: t("Active continuation",   "الاستمرارية النشطة"),   value: "<= 10 SAR" },
    { label: t("Periodic continuation", "الاستمرارية الدورية"),  value: "> 10 SAR"  },
];

const valueMap: Record<string, string> = {
  "30 min": t("30 min", "30 دقيقة"),
  "500 SAR": t("500 SAR", "500 ريال"),
  "3 tries": t("3 tries", "3 محاولات"),
  "<= 10 SAR": t("<= 10 SAR", "≤ 10 ريال"),
  "> 10 SAR": t("> 10 SAR", "> 10 ريال"),
};
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">
  {t("Settlement & Authorization Policies", "سياسات التسوية والتفويض")}
</h2>
      </div>

      <div className="p-5 space-y-5">

        {/* Hold → Capture → Release */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
            <p className="text-xs font-semibold text-gray-600">
  {t("Hold → Capture → Release", "حجز ← التقاط ← إطلاق")}
</p>
          </div>
          <div className="space-y-2">
            {holdRelease.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-600">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Timeout */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-orange-500" />
            <p>{t("Hold Timeout Policy",                "سياسة انتهاء الحجز")}</p>
          </div>
          <div className="space-y-2">
            {timeoutPolicy.map((item) => (
  <div key={item.label} className="flex items-center justify-between">
    <p className="text-sm text-gray-600">{item.label}</p>
    <p className="text-sm font-semibold text-indigo-600">
  {valueMap[item.value] || item.value}
</p>
  </div>
))}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Offline/Fallback */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <WifiOff className="h-4 w-4 text-red-400" />
            <p className="text-xs font-semibold text-gray-600">{t("Offline / Fallback Policy",          "سياسة عدم الاتصال")}</p>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
           {t("On connection loss: transactions stored locally · On reconnect: retroactive charges applied · User notified",
   "عند انقطاع الاتصال: تُخزَّن المعاملات محلياً · عند إعادة الاتصال: تُطبَّق الرسوم بأثر رجعي · يتم إشعار المستخدم")}
          </p>
        </div>

        <div className="border-t border-gray-100" />

        {/* Recovery */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="h-4 w-4 text-green-500" />
            <p className="text-xs font-semibold text-gray-600">{t("Recovery Policy",                    "سياسة الاسترداد")}</p>
          </div>
          <div className="space-y-2">
            {recoveryPolicy.map((item) => (
  <div key={item.label} className="flex items-center justify-between">
    <p className="text-sm text-gray-600">{item.label}</p>
    <p className="text-sm font-semibold text-indigo-600">
  {valueMap[item.value] || item.value}
</p>
  </div>
))}
          </div>
        </div>
      </div>
    </div>
  );
}