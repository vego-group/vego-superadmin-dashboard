// src/types/api.ts
export interface LoginResponse {
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  message?: string;
  error?: string;
  status?: string;
  data?: any;
}

export interface ApiConfig {
  baseURL: string;
  endpoints: {
    login: string;
    register: string;
    logout: string;
    user: string;
  }
}