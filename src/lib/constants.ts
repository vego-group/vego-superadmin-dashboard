export const APP_NAME = 'MyVego';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const CABINET_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  MAINTENANCE: 'maintenance',
} as const;

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user',
} as const;