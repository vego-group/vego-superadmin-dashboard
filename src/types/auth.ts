// src/types/auth.ts

// أدوار المستخدمين
export type UserRole = 'super_admin' | 'admin' | 'user';

// حالة المصادقة
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

// بيانات المستخدم الأساسية
export interface User {
  id: string;
  name: string;
  email: string;        // تأكد من أن email موجود
  phone?: string;        // اجعل phone اختيارياً
  role: UserRole;
  avatar?: string;
  createdAt: Date | string;
  lastLogin?: Date | string;
  permissions?: string[];
}

// بيانات تسجيل الدخول (استخدم email بدلاً من phone)
export interface LoginCredentials {
  email: string;         // تغيير من phone إلى email
  password: string;
  rememberMe?: boolean;
}

// بيانات التسجيل
export interface RegisterData {
  name: string;
  email: string;         // تغيير من phone إلى email
  password: string;
  confirmPassword?: string;
  phone?: string;        // اختياري
}

// الرد من API بعد تسجيل الدخول
export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    token: string;
    expiresIn?: number;
  };
  error?: string;
}

// حالة المصادقة في التطبيق
export interface AuthState {
  user: User | null;
  status: AuthStatus;
  token: string | null;
  error: string | null;
}

// السياق الخاص بالمصادقة
export interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
}

// الـ props الخاصة بصفحة الحماية
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

// الـ payload الخاص بالـ JWT
export interface JwtPayload {
  sub: string;        // user id
  role: UserRole;
  email: string;       // تغيير من phone إلى email
  exp: number;
  iat: number;
}

// صلاحيات المستخدم
export type Permission = 
  | 'view_dashboard'
  | 'manage_cabinets'
  | 'manage_users'
  | 'manage_admins'
  | 'view_revenue'
  | 'manage_settings'
  | 'send_notifications';

// صلاحيات كل دور
export const RolePermissions: Record<UserRole, Permission[]> = {
  super_admin: [
    'view_dashboard',
    'manage_cabinets',
    'manage_users',
    'manage_admins',
    'view_revenue',
    'manage_settings',
    'send_notifications',
  ],
  admin: [
    'view_dashboard',
    'manage_cabinets',
    'view_revenue',
    'send_notifications',
  ],
  user: [
    'view_dashboard',
  ],
};