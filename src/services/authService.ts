import { api } from '@/lib/api-client';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'Admin' | 'User' | 'HR' | 'Travel';
  created_at?: string;
  last_login?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: string;
}

const TOKEN_KEY = 'passport_pathfinder_token';
const USER_KEY = 'passport_pathfinder_user';

// Add token validation
const isTokenValid = (token: string): boolean => {
  if (!token) return false;
  
  // Basic check to see if token has proper JWT format
  const parts = token.split('.');
  return parts.length === 3;
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    // Store the token and user in localStorage
    localStorage.setItem(TOKEN_KEY, response.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    
    return response.data;
  },
  
  register: async (userData: RegisterData): Promise<User> => {
    const response = await api.post<{ message: string; user: User }>('/auth/register', userData);
    return response.data.user;
  },
  
  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
  },
  
  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Check if we have a token first
      const token = authService.getToken();
      if (!token || !isTokenValid(token)) {
        return null;
      }
      
      // Verify token with server
      const response = await api.get<{ user: User }>('/auth/me');
      
      // Update stored user data
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      
      return response.data.user;
    } catch (error) {
      console.error("Failed to get current user:", error);
      
      // For auth verification errors, fall back to stored user data
      // but don't automatically log out
      return authService.getStoredUser();
    }
  },
  
  getStoredUser: (): User | null => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      return null;
    }
  },
  
  getToken: (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    // Only return the token if it looks valid
    return token && isTokenValid(token) ? token : null;
  },
  
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token && isTokenValid(token);
  },
  
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  setUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  
  hasRole: (roles: string | string[]): boolean => {
    const user = authService.getStoredUser();
    if (!user) return false;
    
    const rolesToCheck = Array.isArray(roles) ? roles : [roles];
    return rolesToCheck.includes(user.role);
  },
  
  isAdmin: (): boolean => {
    return authService.hasRole('Admin');
  }
};