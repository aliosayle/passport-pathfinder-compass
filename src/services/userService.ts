import { api } from '@/lib/api-client';
import { User } from '@/services/authService';

export interface UserCreateData {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface UserUpdateData {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
}

export const userService = {
  // Get all users (Admin only)
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data; // Extract data from the axios response
  },

  // Get user by ID (Admin only)
  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data; // Extract data from the axios response
  },

  // Create new user (Admin only)
  create: async (userData: UserCreateData): Promise<User> => {
    const response = await api.post<{message: string; user: User}>('/users', userData);
    return response.data.user; // Extract user from the data property
  },

  // Update user (Admin only)
  update: async (id: string, userData: UserUpdateData): Promise<User> => {
    const response = await api.put<{message: string; user: User}>(`/users/${id}`, userData);
    return response.data.user; // Extract user from the data property
  },

  // Delete user (Admin only)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  }
};