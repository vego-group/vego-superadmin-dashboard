// src/config/api.ts
import { ApiConfig } from '@/types/api';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://mobility-live.com/api/super-admin';

// ─── Auth helper ──────────────────────────────────────────────────────────────
export const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

export const authHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// ─── Endpoints ────────────────────────────────────────────────────────────────
export const API_ENDPOINTS = {
  // Auth
  LOGIN:    `${API_BASE_URL}/login`,
  LOGOUT:   `${API_BASE_URL}/logout`,
  REGISTER: `${API_BASE_URL}/register`,
  USER:     `${API_BASE_URL}/user`,

  // Dashboard
  DASHBOARD_COUNTS: `${API_BASE_URL}/dashboard/counts`,

  //Overview
  DASHBOARD_STATS_BY_CITY: `${API_BASE_URL}/dashboard/stats-by-city`,

  // Users / Admins
  USERS_LIST:    `${API_BASE_URL}/users/list`,
  ADMINS_LIST:   `${API_BASE_URL}/admins/list`,
  ADMINS_ADD:    `${API_BASE_URL}/admins/add`,
  ADMINS_DELETE: (id: string) => `${API_BASE_URL}/admins/delete/${id}`,

  // Battery Swapping Cabinets
  CABINET_LIST:   `${API_BASE_URL}/cabinet/list`,
  CABINET_ADD:    `${API_BASE_URL}/cabinet/add`,
  CABINET_DELETE: (id: string) => `${API_BASE_URL}/cabinet/delete/${id}`,
  CABINET_DETAIL: (id: string) => `${API_BASE_URL}/cabinet/${id}`,

  // Fast Charging Piles
  PILE_LIST:   `${API_BASE_URL}/pile/list`,
  PILE_ADD:    `${API_BASE_URL}/pile/add`,
  PILE_UPDATE: (id: string) => `${API_BASE_URL}/pile/update/${id}`,
  PILE_DELETE: (id: string) => `${API_BASE_URL}/pile/delete/${id}`,

  // Legacy (kept for compatibility)
  CABINETS:      `${API_BASE_URL}/cabinets`,
  ORDERS:        `${API_BASE_URL}/orders`,
  REPORTS:       `${API_BASE_URL}/reports`,
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,

  // fINAMCIAL
  DASHBOARD_FINANCIAL: `${API_BASE_URL}/dashboard/financial`,
  TRANSACTIONS_REPORT: `${API_BASE_URL}/wallet/transactions/report`,

  // Alarms
  ALARMS_LIST:    `${API_BASE_URL}/alarms`,
ALARMS_RESOLVE: (id: number) => `${API_BASE_URL}/alarms/${id}/resolve`,


CABINET_SLOT_ACTION: (cabinetId: string, slotNumber: number) => 
  `${API_BASE_URL}/cabinet/${cabinetId}/slot/${slotNumber}`,

} as const;

export const API_ROUTES = {
  LOGIN:         '/login',
  LOGOUT:        '/logout',
  REGISTER:      '/register',
  USER:          '/user',
  CABINETS:      '/cabinets',
  ORDERS:        '/orders',
  REPORTS:       '/reports',
  NOTIFICATIONS: '/notifications',
} as const;

export const API_CONFIG: ApiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    login:    API_ROUTES.LOGIN,
    register: API_ROUTES.REGISTER,
    logout:   API_ROUTES.LOGOUT,
    user:     API_ROUTES.USER,
  },
};

export type ApiEndpoint = keyof typeof API_ENDPOINTS;
export type ApiRoute    = keyof typeof API_ROUTES;

export const buildEndpoint = (route: ApiRoute, ...segments: string[]): string => {
  const basePath = API_ROUTES[route];
  const fullPath = segments.length ? `${basePath}/${segments.join('/')}` : basePath;
  return `${API_BASE_URL}${fullPath}`;
};

export const buildUrl = (path: string): string => {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};



