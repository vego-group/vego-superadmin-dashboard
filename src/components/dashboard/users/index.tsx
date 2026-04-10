// src/components/dashboard/users/index.tsx
'use client';

import { useState } from 'react';
import { Search, Filter, ChevronDown, RefreshCw, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import UsersTable from './users-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUsers } from '@/hooks/use-users';
import { useLang } from "@/lib/language-context"; // ← ADD THIS IMPORT

// ─── Component ────────────────────────────────────────────────────────────────
export default function UsersManagement() {
  const { t } = useLang(); // ← ADD THIS
  
  // ─── Filter options with translations ───────────────────────────────────────
  const statusOptions = [
    { value: 'all',     label: t('All Status', 'كل الحالات') },
    { value: 'active',  label: t('Active',     'نشط')        },
    { value: 'blocked', label: t('Blocked',    'محظور')      },
  ];

  const { users, isLoading, error, fetchUsers, toggleBlockUser } = useUsers();

  const [searchQuery,    setSearchQuery]    = useState('');
  const [showFilters,    setShowFilters]    = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  // ─── Filter logic ──────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase();

    const matchSearch =
      u.name.toLowerCase().includes(q)         ||
      u.id.toLowerCase().includes(q)           ||
      (u.email   ?? '').toLowerCase().includes(q) ||
      (u.phone   ?? '').toLowerCase().includes(q) ||
      (u.city    ?? '').toLowerCase().includes(q) ||
      (u.address ?? '').toLowerCase().includes(q);

    const matchStatus =
      selectedStatus === 'all' || u.status === selectedStatus;

    return matchSearch && matchStatus;
  });

  const getLabel = (opts: typeof statusOptions, val: string) =>
    opts.find((o) => o.value === val)?.label ?? opts[0].label;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            {t("User Management", "إدارة المستخدمين")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("View and manage all registered users", "عرض وإدارة جميع المستخدمين المسجلين")}
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={isLoading}
          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
          title={t("Refresh", "تحديث")}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search + Filter bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t("Search by name, email, phone, city or ID…", "ابحث بالاسم أو البريد أو الهاتف أو المدينة أو المعرف…")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl border-gray-300 w-full"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters((v) => !v)}
            className="h-12 px-4 rounded-xl border-gray-300 gap-2"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">{t("Filters", "فلاتر")}</span>
          </Button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-gray-100 shadow-sm animate-in fade-in">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">

              {/* Status */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 w-full sm:w-[180px] justify-between h-11">
                    {getLabel(statusOptions, selectedStatus)}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[180px]">
                  {statusOptions.map((o) => (
                    <DropdownMenuItem
                      key={o.value}
                      onClick={() => setSelectedStatus(o.value)}
                      className={selectedStatus === o.value ? 'bg-gray-100' : ''}
                    >
                      {o.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={() => setShowFilters(false)}
                className="h-11 px-6 gap-2"
              >
                <Filter className="h-4 w-4" />
                {t("Apply Filters", "تطبيق الفلاتر")}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2 text-sm">
          <RefreshCw className="h-4 w-4 animate-spin" />
          {t("Loading users…", "جارٍ تحميل المستخدمين…")}
        </div>
      ) : (
        <UsersTable users={filtered} onToggleBlock={toggleBlockUser} />
      )}
    </div>
  );
}