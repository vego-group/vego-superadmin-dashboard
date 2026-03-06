export type CabinetStatus = 'online' | 'offline' | 'maintenance';

export interface Cabinet {
  id: string;
  name: string;
  location: string;
  status: CabinetStatus;
  totalLockers: number;
  availableLockers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CabinetStats {
  total: number;
  online: number;
  offline: number;
  maintenance: number;
  yourLockers: number;
  adminsLockers: number;
}