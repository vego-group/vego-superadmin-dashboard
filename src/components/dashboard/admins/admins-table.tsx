// src/components/dashboard/admins/admins-table.tsx
'use client';

import React, { useState } from 'react';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Trash2 } from 'lucide-react';
import { Admin } from '@/types/dashboard/admin';
import AdminCabinetsView from './admin-cabinets-view';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const adminCabinetDetails = {
  '1': {
    cabinetName: 'Cabinet-DT-001',
    location: 'Downtown Plaza',
    address: 'Main Street & 5th Ave',
    status: 'Active',
    ownership: 'Assigned to Admin',
    scooters: 4,
    bikes: 4,
  },
  '2': {
    cabinetName: 'Cabinet-UN-002',
    location: 'University Campus',
    address: 'Student Center',
    status: 'Maintenance',
    ownership: 'Assigned to Admin',
    scooters: 4,
    bikes: 4,
  },
  '3': {
    cabinetName: 'Cabinet-BD-003',
    location: 'Business District',
    address: 'Corporate Plaza',
    status: 'Disconnected',
    ownership: 'Assigned to Admin',
    scooters: 4,
    bikes: 4,
  },
};

interface AdminsTableProps {
  admins: Admin[];
  onDelete?: (adminId: string) => void;
}

const AdminsTable = ({ admins, onDelete }: AdminsTableProps) => {
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isCabinetsViewOpen, setIsCabinetsViewOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'maintenance': return 'text-yellow-600 bg-yellow-50';
      case 'disconnected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleViewCabinets = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsCabinetsViewOpen(true);
  };

  const handleConfirmDelete = () => {
    if (adminToDelete) {
      onDelete?.(adminToDelete.id);
      setAdminToDelete(null);
    }
  };

  const MobileCard = ({ admin }: { admin: Admin }) => {
    const cabinet = adminCabinetDetails[admin.id as keyof typeof adminCabinetDetails] || {
      cabinetName: 'N/A', location: 'N/A', address: 'N/A',
      status: 'Inactive', ownership: 'Unassigned', scooters: 0, bikes: 0,
    };

    return (
      <div className="bg-white border-b p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-900">{cabinet.cabinetName}</h3>
            <p className="text-sm text-gray-500">{admin.name}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cabinet.status)}`}>
            {cabinet.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Location</p>
            <p className="font-medium">{cabinet.location}</p>
          </div>
          <div>
            <p className="text-gray-500">Address</p>
            <p className="font-medium truncate">{cabinet.address}</p>
          </div>
          <div>
            <p className="text-gray-500">Scooters/Bikes</p>
            <p className="font-medium">{cabinet.scooters} / {cabinet.bikes}</p>
          </div>
          <div>
            <p className="text-gray-500">Ownership</p>
            <p className="font-medium">{cabinet.ownership}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline" size="sm"
            onClick={() => handleViewCabinets(admin)}
            className="flex-1 gap-1"
          >
            <Eye className="h-4 w-4" /> View
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => setAdminToDelete(admin)}
            className="flex-1 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" /> Remove
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Cabinet Name</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold">Assigned Admin</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Ownership</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                  No admins found
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => {
                const cabinet = adminCabinetDetails[admin.id as keyof typeof adminCabinetDetails] || {
                  cabinetName: 'N/A', location: 'N/A', address: 'N/A',
                  status: 'Inactive', ownership: 'Unassigned', scooters: 0, bikes: 0,
                };
                return (
                  <TableRow key={admin.id} className="border-b">
                    <TableCell className="py-4">
                      <div className="font-medium">{cabinet.cabinetName}</div>
                      <div className="text-sm text-gray-500">{cabinet.scooters} Scooters, {cabinet.bikes} Bikes</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{cabinet.location}</div>
                      <div className="text-sm text-gray-500">{cabinet.address}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{admin.name}</div>
                      <div className="text-sm text-gray-500">{admin.email}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(cabinet.status)}`}>
                        {cabinet.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{cabinet.ownership}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => handleViewCabinets(admin)}
                          className="gap-1 text-gray-600"
                        >
                          <Eye className="h-4 w-4" /> View
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => setAdminToDelete(admin)}
                          className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" /> Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        {admins.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No admins found</div>
        ) : (
          admins.map((admin) => <MobileCard key={admin.id} admin={admin} />)
        )}
      </div>

      {/* View Cabinets Modal */}
      <AdminCabinetsView
        isOpen={isCabinetsViewOpen}
        onClose={() => setIsCabinetsViewOpen(false)}
        admin={selectedAdmin}
      />

      {/* ===== Delete Confirm Dialog ===== */}
      <Dialog open={!!adminToDelete} onOpenChange={() => setAdminToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Remove Admin</DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <p className="text-gray-600 text-sm">
              Are you sure you want to remove{' '}
              <span className="font-semibold text-gray-900">{adminToDelete?.name}</span>?
              This action cannot be undone.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setAdminToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmDelete}
            >
              Yes, Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminsTable;