'use client';

import { useState } from 'react';
import { Search, Filter, Plus, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import UsersTable from './users-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mockUsers = [
  { id: 'USR001', name: 'Sarah Johnson', trips: 23, rating: 4.8, spending: 342.50, status: 'active' },
  { id: 'USR002', name: 'Michael Chen', trips: 15, rating: 4.5, spending: 225.80, status: 'active' },
  { id: 'USR003', name: 'Emma Wilson', trips: 8, rating: 3.2, spending: 95.20, status: 'blocked' },
  { id: 'USR004', name: 'James Brown', trips: 41, rating: 4.9, spending: 610.00, status: 'active' },
  { id: 'USR005', name: 'Layla Ahmed', trips: 5, rating: 3.8, spending: 60.00, status: 'active' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'blocked', label: 'Blocked' },
];

const tripOptions = [
  { value: 'all', label: 'All Trips' },
  { value: 'low', label: '0 - 10 Trips' },
  { value: 'mid', label: '11 - 25 Trips' },
  { value: 'high', label: '25+ Trips' },
];

const ratingOptions = [
  { value: 'all', label: 'All Ratings' },
  { value: 'low', label: 'Below 3.5' },
  { value: 'mid', label: '3.5 - 4.5' },
  { value: 'high', label: 'Above 4.5' },
];

export default function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState(mockUsers);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTrips, setSelectedTrips] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' || u.status === selectedStatus;

    const matchesTrips =
      selectedTrips === 'all' ||
      (selectedTrips === 'low' && u.trips <= 10) ||
      (selectedTrips === 'mid' && u.trips > 10 && u.trips <= 25) ||
      (selectedTrips === 'high' && u.trips > 25);

    const matchesRating =
      selectedRating === 'all' ||
      (selectedRating === 'low' && u.rating < 3.5) ||
      (selectedRating === 'mid' && u.rating >= 3.5 && u.rating <= 4.5) ||
      (selectedRating === 'high' && u.rating > 4.5);

    return matchesSearch && matchesStatus && matchesTrips && matchesRating;
  });

  const handleToggleBlock = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u
      )
    );
  };

  const handleApplyFilters = () => setShowFilters(false);

  const getLabel = (options: typeof statusOptions, value: string) =>
    options.find((o) => o.value === value)?.label || options[0].label;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your assigned smart locker cabinets</p>
      </div>

      {/* Search + Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, phone, or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl border-gray-300 w-full"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-4 rounded-xl border-gray-300 gap-2"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>
        </div>

        {/* Filters Dropdown Panel */}
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

              {/* Apply */}
              <Button
                onClick={handleApplyFilters}
                className="h-11 px-6 gap-2"
              >
                <Filter className="h-4 w-4" />
                Apply Filters
              </Button>

            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <UsersTable users={filtered} onToggleBlock={handleToggleBlock} />
    </div>
  );
}