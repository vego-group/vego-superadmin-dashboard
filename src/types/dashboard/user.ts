export type UserRole = 'super_admin' | 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: Date;
  lastActive?: Date;
}

export interface UserStats {
  total: number;
  active: number;
  newThisMonth: number;
}