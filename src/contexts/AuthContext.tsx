import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService, User } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<User | null>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  login: async () => {},
  logout: () => {},
  checkAuthStatus: async () => null,
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use useCallback to prevent infinite loops in dependencies
  const checkAuthStatus = useCallback(async (): Promise<User | null> => {
    try {
      // First check if we have a token in localStorage
      const hasToken = authService.isAuthenticated();
      if (!hasToken) {
        return null;
      }
      
      // Always use stored user data first to avoid UI flicker
      const storedUser = authService.getStoredUser();
      
      // If we don't have any user data locally, clear everything to be safe
      if (!storedUser) {
        return null;
      }
      
      try {
        // Try to validate with server if possible
        const currentUser = await authService.getCurrentUser();
        return currentUser;
      } catch (verifyError) {
        // For auth errors, fallback to stored user data but don't clear session
        console.error('Error verifying user with server, using stored data');
        return storedUser;
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      return null;
    }
  }, []);

  const initAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const authenticatedUser = await checkAuthStatus();
      setUser(authenticatedUser);
    } finally {
      setIsLoading(false);
    }
  }, [checkAuthStatus]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ username, password });
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  useEffect(() => {
    // On initial load, check if user is already authenticated
    initAuth();
  }, [initAuth]);

  // Expose the full auth context
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
    login,
    logout,
    checkAuthStatus,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;