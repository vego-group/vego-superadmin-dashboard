export interface Admin {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'superadmin' | 'admin' | 'subadmin';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastActive?: string;
  assignedCabinets: number;
  phone?: string;
}

export interface AdminCabinet {
  id: string;
  name: string;
  location: string;
  address: string;
  status: 'active' | 'maintenance' | 'disconnected';
  assignedAdminId: string;
  assignedAdminName: string;
  assignedAdminEmail: string;
  scootersCount: number;
  bikesCount: number;
  lastMaintenance?: string;
}

export interface AdminFilters {
  search: string;
  status: string;
  role: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}