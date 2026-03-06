'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Plus, ChevronDown } from 'lucide-react';
import AdminsTable from './admins-table';
import AdminStatsCards from './admin-stats-cards';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Admin } from '@/types/dashboard/admin';

const mockAdmins: Admin[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15',
    lastActive: '2024-03-20T10:30:00',
    assignedCabinets: 3,
    avatar: '/avatars/sarah.jpg',
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@company.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-02-01',
    lastActive: '2024-03-19T15:45:00',
    assignedCabinets: 2,
    avatar: '/avatars/mike.jpg',
  },
  {
    id: '3',
    name: 'Lisa Rodriguez',
    email: 'lisa@company.com',
    role: 'subadmin',
    status: 'active',
    createdAt: '2024-02-15',
    lastActive: '2024-03-18T09:20:00',
    assignedCabinets: 1,
    avatar: '/avatars/lisa.jpg',
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david@company.com',
    role: 'admin',
    status: 'inactive',
    createdAt: '2024-01-20',
    lastActive: '2024-03-10T14:15:00',
    assignedCabinets: 0,
    avatar: '/avatars/david.jpg',
  },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'disconnected', label: 'Disconnected' },
];

const adminOptions = [
  { value: 'all', label: 'All Admins' },
  { value: 'sarah', label: 'Sarah Johnson' },
  { value: 'mike', label: 'Mike Chen' },
  { value: 'lisa', label: 'Lisa Rodriguez' },
  { value: 'david', label: 'David Kim' },
];

const regionOptions = [
  { value: 'all', label: 'All Regions' },
  { value: 'downtown', label: 'Downtown Plaza' },
  { value: 'university', label: 'University Campus' },
  { value: 'business', label: 'Business District' },
];

const AdminsManagement = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [admins, setAdmins] = useState<Admin[]>(mockAdmins); // ← هنا بيتحكم في الـ list
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAdmin, setSelectedAdmin] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ← الفانكشن دي بتمسح الـ admin من الـ list
  const handleDelete = (adminId: string) => {
    setAdmins(prev => prev.filter(admin => admin.id !== adminId));
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
  };

  const getStatusLabel = () => statusOptions.find(opt => opt.value === selectedStatus)?.label || 'All Status';
  const getAdminLabel = () => adminOptions.find(opt => opt.value === selectedAdmin)?.label || 'All Admins';
  const getRegionLabel = () => regionOptions.find(opt => opt.value === selectedRegion)?.label || 'All Regions';

  return (
    <div className="space-y-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-800">
          Admins Management
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View and manage all cabinets assigned to sub-admins
        </p>
      </div>

      <div className="mb-6">
        <AdminStatsCards admins={admins} />
      </div>

      <div className="mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search cabinets or admins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl border-gray-300 w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-4 rounded-xl border-gray-300 gap-2"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>

            <Button
              onClick={() => router.push('/dashboard/admins/add')}
              className="h-12 px-4 rounded-xl text-white gap-2 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Admin</span>
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 w-full sm:w-[180px] justify-between h-11">
                    {getStatusLabel()} <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[180px]">
                  {statusOptions.map((option) => (
                    <DropdownMenuItem key={option.value} onClick={() => setSelectedStatus(option.value)}>
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 w-full sm:w-[180px] justify-between h-11">
                    {getAdminLabel()} <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[180px]">
                  {adminOptions.map((option) => (
                    <DropdownMenuItem key={option.value} onClick={() => setSelectedAdmin(option.value)}>
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 w-full sm:w-[180px] justify-between h-11">
                    {getRegionLabel()} <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[180px]">
                  {regionOptions.map((option) => (
                    <DropdownMenuItem key={option.value} onClick={() => setSelectedRegion(option.value)}>
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="default" onClick={handleApplyFilters} className="h-11 px-6 gap-2">
                <Filter className="h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {/* ← هنا بنبعت onDelete للـ AdminsTable */}
          <AdminsTable admins={filteredAdmins} onDelete={handleDelete} />
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-gray-400">
        Showing {filteredAdmins.length} of {admins.length} admins
      </div>
    </div>
  );
};

export default AdminsManagement;