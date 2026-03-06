import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, MapPin, Wrench, Power, Bike, Shield, Eye } from 'lucide-react';
import { Admin } from '@/types/dashboard/admin';

// Mock data for admin cabinets based on the image
const adminCabinetsData = {
  '1': [ // Sarah Johnson
    {
      id: 'CAB-001',
      name: 'Cabinet-DT-001',
      location: 'Downtown Plaza',
      address: 'Main Street & 5th Ave',
      status: 'active',
      scooters: 4,
      bikes: 4,
    },
    {
      id: 'CAB-002',
      name: 'Cabinet-UN-002',
      location: 'University Campus',
      address: 'Student Center',
      status: 'maintenance',
      scooters: 4,
      bikes: 4,
    },
    {
      id: 'CAB-003',
      name: 'Cabinet-BD-003',
      location: 'Business District',
      address: 'Corporate Plaza',
      status: 'disconnected',
      scooters: 4,
      bikes: 4,
    },
  ],
  '2': [ // Mike Chen
    {
      id: 'CAB-004',
      name: 'Cabinet-UN-002',
      location: 'University Campus',
      address: 'Student Center',
      status: 'maintenance',
      scooters: 4,
      bikes: 4,
    },
    {
      id: 'CAB-005',
      name: 'Cabinet-DT-005',
      location: 'Downtown Plaza',
      address: 'Main Street & 5th Ave',
      status: 'active',
      scooters: 4,
      bikes: 4,
    },
  ],
  '3': [ // Lisa Rodriguez
    {
      id: 'CAB-006',
      name: 'Cabinet-BD-003',
      location: 'Business District',
      address: 'Corporate Plaza',
      status: 'disconnected',
      scooters: 4,
      bikes: 4,
    },
  ],
};

interface AdminCabinetsViewProps {
  isOpen: boolean;
  onClose: () => void;
  admin: Admin | null;
}

const AdminCabinetsView = ({ isOpen, onClose, admin }: AdminCabinetsViewProps) => {
  if (!admin) return null;

  const cabinets = adminCabinetsData[admin.id as keyof typeof adminCabinetsData] || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-yellow-500" />;
      case 'disconnected':
        return <Power className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Assigned Cabinets</DialogTitle>
          
        </DialogHeader>

        {/* Admin Info */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <Avatar className="h-12 w-12">
            <AvatarImage src={admin.avatar} />
            <AvatarFallback>{admin.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{admin.name}</h3>
            <p className="text-sm text-gray-500">{admin.email}</p>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline">{admin.role}</Badge>
              <Badge variant="outline">{admin.assignedCabinets} Cabinets</Badge>
            </div>
          </div>
        </div>

        {/* Cabinets List */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {cabinets.map((cabinet) => (
            <div
              key={cabinet.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-lg">{cabinet.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cabinet.status)}`}>
                      {cabinet.status.charAt(0).toUpperCase() + cabinet.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{cabinet.location}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin className="h-3 w-3" />
                    {cabinet.address}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Bike className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{cabinet.scooters} Scooters</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bike className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{cabinet.bikes} Bikes</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Button variant="outline" size="sm" className="gap-1">
                  <Eye className="h-3 w-3" />
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="gap-1 text-red-600 hover:text-red-700">
                  <X className="h-3 w-3" />
                  Remove
                </Button>
              </div>
            </div>
          ))}

          {cabinets.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No cabinets assigned to this admin
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCabinetsView;