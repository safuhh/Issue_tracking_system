import api, { refreshAuthSession } from '../../../shared/services/api';
import { AuthUser } from '../store/authSlice';
import { Issue, IssueStats } from '../../issues/services/types';

export interface AuthResponse {
  success: boolean;
  message?: string;
  accessToken: string;
  user: AuthUser;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AdminUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  createdBy?: string;
  createdAt?: string;
}

export interface AdminDataResponse {
  success: boolean;
  message: string;
  stats: {
    totalUsers: number;
    activeRoles: string[];
    systemStatus: string;
    uptime: number;
    issueStats?: IssueStats;
  };
  users: AdminUser[];
  issues?: Issue[];
}

export interface DevDataResponse {
  success: boolean;
  message: string;
  devData: {
    activeSprint: string;
    gitBranch: string;
    environment: string;
    apiLatency: string;
    activeDeployments: number;
    issues: Array<{
      id: string;
      title: string;
      priority: string;
      status: string;
    }>;
  };
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'developer';
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  user: AdminUser;
}

export interface UpdateUserPayload {
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: 'user' | 'developer';
}

export const authService = {
  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const data = await refreshAuthSession();
    return { success: true, accessToken: data.accessToken, user: data.user };
  },

  getMe: async (): Promise<{ success: boolean; user: AuthUser }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getProfile: async (): Promise<{ success: boolean; user: AuthUser }> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  getAdminData: async (): Promise<AdminDataResponse> => {
    const response = await api.get<AdminDataResponse>('/users/admin');
    return response.data;
  },

  getDevData: async (): Promise<DevDataResponse> => {
    const response = await api.get<DevDataResponse>('/users/dev');
    return response.data;
  },

  createUser: async (data: CreateUserPayload): Promise<CreateUserResponse> => {
    const response = await api.post<CreateUserResponse>('/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: UpdateUserPayload): Promise<CreateUserResponse> => {
    const response = await api.put<CreateUserResponse>(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/users/${id}`);
    return response.data;
  },
};

export default authService;
