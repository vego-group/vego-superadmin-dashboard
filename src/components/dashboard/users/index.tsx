'use client';

import { useState } from 'react';
import { Search, Filter, ChevronDown, RefreshCw, AlertCircle, Plus, X, Loader2 } from 'lucide-react';
import { User as UserIcon, Phone, Mail } from 'lucide-react';
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
import { useLang } from "@/lib/language-context";

// ─── Add User Modal ────────────────────────────────────────────────────────────
function AddUserModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const { t } = useLang();
  const [form, setForm]           = useState({ name: "", phone: "", email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  if (!open) return null;

  const handleClose = () => {
    if (isLoading) return;
    setForm({ name: "", phone: "", email: "" });
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      setError(t("Name and phone are required.", "الاسم ورقم الجوال مطلوبان."));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/proxy/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name:  form.name,
          phone: form.phone,
          // ← مش بنبعت email لو فاضي عشان مانعملش duplicate entry
          ...(form.email.trim() ? { email: form.email.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || Object.values(data.errors ?? {}).flat().join(", ") || t("Failed to add user", "فشل إضافة المستخدم"));
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Failed to add user", "فشل إضافة المستخدم"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{t("Add New User", "إضافة مستخدم جديد")}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{t("Create a new user account", "إنشاء حساب مستخدم جديد")}</p>
          </div>
          <button onClick={handleClose} disabled={isLoading} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition disabled:opacity-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="px-6 py-5 space-y-4">

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              {t("Full Name", "الاسم الكامل")} <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={form.name}
                onChange={e => { setForm({ ...form, name: e.target.value }); setError(null); }}
                placeholder={t("e.g. Ahmed Al-Rashidi", "مثال: أحمد الراشدي")}
                disabled={isLoading}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-300 transition disabled:opacity-60"
              />
            </div>
          </div>

          {/* Phone — مع flag السعودية */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              {t("Phone Number", "رقم الجوال")} <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden h-11 focus-within:border-indigo-300 transition bg-gray-50">
              <div className="flex items-center gap-1.5 px-3 border-r border-gray-200 h-full bg-gray-100 shrink-0">
                <img src="/ksa-flag.png" alt="KSA" className="w-5 h-3.5 object-contain" />
                <span className="text-sm text-gray-600 font-medium">+966</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="5X XXX XXXX"
                value={form.phone.replace(/^966/, "")}
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                  setForm({ ...form, phone: `966${digits}` });
                  setError(null);
                }}
                disabled={isLoading}
                className="flex-1 h-full px-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-gray-50"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              {t("Email (optional)", "البريد الإلكتروني (اختياري)")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={e => { setForm({ ...form, email: e.target.value }); setError(null); }}
                placeholder="ahmed@example.com"
                disabled={isLoading}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-300 transition disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={handleClose} disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50">
            {t("Cancel", "إلغاء")}
          </button>
          <button onClick={handleSubmit} disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
            style={{ backgroundColor: "#1C1FC1" }}>
            {isLoading
              ? <><Loader2 className="h-4 w-4 animate-spin" />{t("Adding…", "جارٍ الإضافة…")}</>
              : t("Add User", "إضافة مستخدم")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function UsersManagement() {
  const { t } = useLang();

  const statusOptions = [
    { value: 'all',      label: t('All Status', 'كل الحالات')       },
    { value: 'active',   label: t('Active',     'نشط')              },
    { value: 'inactive', label: t('Inactive',   'غير نشط')          },
    { value: 'blocked',  label: t('Blocked',    'محظور')             },
    { value: 'pending',  label: t('Pending',    'قيد الانتظار')      },
  ];

  const { users, isLoading, error, fetchUsers, toggleBlockUser } = useUsers();

  const [searchQuery,    setSearchQuery]    = useState('');
  const [showFilters,    setShowFilters]    = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAdd,        setShowAdd]        = useState(false);

  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(q)              ||
      u.id.toLowerCase().includes(q)               ||
      (u.email   ?? '').toLowerCase().includes(q)  ||
      (u.phone   ?? '').toLowerCase().includes(q)  ||
      (u.city    ?? '').toLowerCase().includes(q)  ||
      (u.address ?? '').toLowerCase().includes(q);
    const matchStatus = selectedStatus === 'all' || u.status === selectedStatus;
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchUsers()}
            disabled={isLoading}
            className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
            title={t("Refresh", "تحديث")}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
            style={{ backgroundColor: "#1C1FC1" }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("Add User", "إضافة مستخدم")}</span>
          </button>
        </div>
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

              <Button onClick={() => setShowFilters(false)} className="h-11 px-6 gap-2">
                <Filter className="h-4 w-4" />
                {t("Apply Filters", "تطبيق الفلاتر")}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2 text-sm">
          <RefreshCw className="h-4 w-4 animate-spin" />
          {t("Loading users…", "جارٍ تحميل المستخدمين…")}
        </div>
      ) : (
        <UsersTable users={filtered} onToggleBlock={toggleBlockUser} />
      )}

      {/* Add User Modal */}
      <AddUserModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={() => { setShowAdd(false); fetchUsers(); }}
      />
    </div>
  );
}