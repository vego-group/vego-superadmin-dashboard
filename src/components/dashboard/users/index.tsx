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

// ─── Filter options ───────────────────────────────────────────────────────────
const statusOptions = [
  { value: 'all',     label: 'All Status' },
  { value: 'active',  label: 'Active'     },
  { value: 'blocked', label: 'Blocked'    },
];

const tripOptions = [
  { value: 'all',  label: 'All Trips'    },
  { value: 'low',  label: '0 – 10 Trips' },
  { value: 'mid',  label: '11 – 25 Trips'},
  { value: 'high', label: '25+ Trips'    },
];

const ratingOptions = [
  { value: 'all',  label: 'All Ratings' },
  { value: 'low',  label: 'Below 3.5'   },
  { value: 'mid',  label: '3.5 – 4.5'   },
  { value: 'high', label: 'Above 4.5'   },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function UsersManagement() {
  const { users, isLoading, error, fetchUsers, toggleBlockUser } = useUsers();

  const [searchQuery,     setSearchQuery]     = useState('');
  const [showFilters,     setShowFilters]     = useState(false);
  const [selectedStatus,  setSelectedStatus]  = useState('all');
  const [selectedTrips,   setSelectedTrips]   = useState('all');
  const [selectedRating,  setSelectedRating]  = useState('all');

  // ─── Filter logic ──────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q) ||
      (u.phone ?? '').toLowerCase().includes(q);

    const matchStatus =
      selectedStatus === 'all' || u.status === selectedStatus;

    const matchTrips =
      selectedTrips === 'all' ||
      (selectedTrips === 'low'  && u.trips <= 10) ||
      (selectedTrips === 'mid'  && u.trips > 10 && u.trips <= 25) ||
      (selectedTrips === 'high' && u.trips > 25);

    const matchRating =
      selectedRating === 'all' ||
      (selectedRating === 'low'  && u.rating < 3.5) ||
      (selectedRating === 'mid'  && u.rating >= 3.5 && u.rating <= 4.5) ||
      (selectedRating === 'high' && u.rating > 4.5);

    return matchSearch && matchStatus && matchTrips && matchRating;
  });

  const getLabel = (opts: typeof statusOptions, val: string) =>
    opts.find((o) => o.value === val)?.label ?? opts[0].label;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            User Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all registered users
          </p>
        </div>

        {/* Manual refresh */}
        <button
          onClick={fetchUsers}
          disabled={isLoading}
          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
          title="Refresh"
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
              placeholder="Search by name, email, phone, or user ID…"
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
            <span className="hidden sm:inline">Filters</span>
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

              {/* Trips */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 w-full sm:w-[180px] justify-between h-11">
                    {getLabel(tripOptions, selectedTrips)}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[180px]">
                  {tripOptions.map((o) => (
                    <DropdownMenuItem
                      key={o.value}
                      onClick={() => setSelectedTrips(o.value)}
                      className={selectedTrips === o.value ? 'bg-gray-100' : ''}
                    >
                      {o.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Rating */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 w-full sm:w-[180px] justify-between h-11">
                    {getLabel(ratingOptions, selectedRating)}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[180px]">
                  {ratingOptions.map((o) => (
                    <DropdownMenuItem
                      key={o.value}
                      onClick={() => setSelectedRating(o.value)}
                      className={selectedRating === o.value ? 'bg-gray-100' : ''}
                    >
                      {o.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button onClick={() => setShowFilters(false)} className="h-11 px-6 gap-2">
                <Filter className="h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2 text-sm">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading users…
        </div>
      ) : (
        <UsersTable users={filtered} onToggleBlock={toggleBlockUser} />
      )}
    </div>
  );
}