import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, UserX, Briefcase } from 'lucide-react';
import { Admin } from '@/types/dashboard/admin';

interface AdminStatsCardsProps {
  admins: Admin[];
}

const AdminStatsCards = ({ admins }: AdminStatsCardsProps) => {
  const totalAdmins = admins.length;
  const activeAdmins = admins.filter(a => a.status === 'active').length;
  const inactiveAdmins = admins.filter(a => a.status === 'inactive').length;
  const totalAssignedCabinets = admins.reduce((acc, admin) => acc + admin.assignedCabinets, 0);

  const stats = [
    {
      title: 'Total Admins',
      value: totalAdmins,
      icon: Users,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
    {
      title: 'Active Admins',
      value: activeAdmins,
      icon: UserCheck,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      title: 'Inactive Admins',
      value: inactiveAdmins,
      icon: UserX,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Assigned Cabinets',
      value: totalAssignedCabinets,
      icon: Briefcase,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold mt-1 sm:mt-2">{stat.value}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.textColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminStatsCards;