// src/components/dashboard/overview/overview-stats.tsx
"use client";

import { Users, Battery, Zap, UserCog, Wallet } from "lucide-react";
import StatsCard from "./stats-card";
import { useDashboard } from "@/hooks/use-dashboard";
import { useLang } from "@/lib/language-context";
import { Money, formatCount, formatMoney, parseMoney, byCurrencyBlocks } from "@/lib/money";

/** One currency's wallet block from `counts.wallets.by_currency`. */
interface WalletBalance {
  balance: Money;
  /** §13a: the count field is `wallet_count`, NOT `count`. */
  walletCount: number | null;
}

// §13a (confirmed shape): `wallets` on GET /dashboard/counts groups per currency
// under `by_currency`, keyed by currency code. The money field is
// `total_balance` and the count is `wallet_count`. One balance line PER
// currency, never a cross-currency sum; no per-currency data renders as "—".
// `total_balance_sar` sits INSIDE `wallets` (not top-level on counts) and is
// deliberately never read (§12 alias sunset).
const walletBalances = (wallets: unknown): WalletBalance[] => {
  if (!wallets || typeof wallets !== "object") return [];
  const rec = wallets as Record<string, unknown>;
  return byCurrencyBlocks(rec.by_currency).flatMap(({ currency, block }) => {
    const balance = parseMoney(block.total_balance, {
      currency,
      source: "GET /dashboard/counts wallets",
    });
    if (!balance) return [];
    return [
      {
        balance,
        walletCount: typeof block.wallet_count === "number" ? block.wallet_count : null,
      },
    ];
  });
};

export default function OverviewStats() {
  const { counts, isLoading } = useDashboard();
  const { t, lang } = useLang();

  const balances = walletBalances(counts?.wallets);

  const stats = [
    {
      title: t("Total Users",           "إجمالي المستخدمين"),
      value: counts?.total_users ?? 0,
      icon: <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />,
      iconBg: "bg-blue-100",
    },
    {
      title: t("Total Admins",          "إجمالي المشرفين"),
      value: counts?.total_admins ?? 0,
      icon: <UserCog className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />,
      iconBg: "bg-purple-100",
    },
    {
      title: t("Battery Swap Active",   "تبديل البطاريات"),
      value: counts?.total_battery_swap_active ?? 0,
      icon: <Battery className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />,
      iconBg: "bg-green-100",
    },
    {
      title: t("Fast Charging Active",  "الشحن السريع"),
      value: counts?.total_fast_charging_active ?? 0,
      icon: <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />,
      iconBg: "bg-orange-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
      {stats.map((stat) => (
        <StatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          iconBg={stat.iconBg}
          isLoading={isLoading}
        />
      ))}
      <StatsCard
        title={t("Wallet Balances", "أرصدة المحافظ")}
        value={
          balances.length > 0 ? (
            <span className="flex flex-col" dir="ltr">
              {balances.map(({ balance, walletCount }) => (
                <span key={balance.currency} className="text-sm sm:text-base leading-snug tabular-nums">
                  {formatMoney(balance)}
                  {walletCount != null && (
                    <span className="ms-1.5 text-[10px] font-medium text-gray-400">
                      {formatCount(walletCount, lang)} {t("wallets", "محفظة")}
                    </span>
                  )}
                </span>
              ))}
            </span>
          ) : (
            "—"
          )
        }
        icon={<Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />}
        iconBg="bg-emerald-100"
        isLoading={isLoading}
      />
    </div>
  );
}
