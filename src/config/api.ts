// src/config/api.ts
import { ApiConfig } from '@/types/api';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vego.sa/api';

// للاستخدام مع fetch (أسماء كبيرة)
export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login`,
  REGISTER: `${API_BASE_URL}/register`,
  LOGOUT: `${API_BASE_URL}/logout`,
  USER: `${API_BASE_URL}/user`,
  CABINETS: `${API_BASE_URL}/cabinets`,
  ORDERS: `${API_BASE_URL}/orders`,
  REPORTS: `${API_BASE_URL}/reports`,
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,
} as const;

// للاستخدام مع axios (أسماء كبيرة - مسارات نسبية)
export const API_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  USER: '/user',
  CABINETS: '/cabinets',
  ORDERS: '/orders',
  REPORTS: '/reports',
  NOTIFICATIONS: '/notifications',
} as const;

// ✅ للتوافق مع ApiConfig (أسماء صغيرة)
export const API_CONFIG: ApiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    login: API_ROUTES.LOGIN,
    register: API_ROUTES.REGISTER,
    logout: API_ROUTES.LOGOUT,
    user: API_ROUTES.USER,
  }
};

// أنواع المسارات
export type ApiEndpoint = keyof typeof API_ENDPOINTS;
export type ApiRoute = keyof typeof API_ROUTES;

// دوال مساعدة
export const buildEndpoint = (route: ApiRoute, ...segments: string[]): string => {
  const basePath = API_ROUTES[route];
  const fullPath = segments.length ? `${basePath}/${segments.join('/')}` : basePath;
  return `${API_BASE_URL}${fullPath}`;
};

export const buildUrl = (path: string): string => {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};