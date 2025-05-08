import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService, User } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  // Use useCallback to prevent infinite loops in dependencies
  const checkAuthStatus = useCallback(async (): Promise<User | null> => {
    try {
      // Check if we have a token directly from localStorage to avoid any potential issues with service
      const token = localStorage.getItem('passport_pathfinder_token');
      
      if (!token) {
        console.log('No authentication token found in localStorage');
        return null;
      }
      
      // Always use stored user data first to avoid UI flicker
      const storedUser = authService.getStoredUser();
      
      try {
        // Try to validate with server
        console.log('Validating authentication with server...');
        const currentUser = await authService.getCurrentUser();
        console.log('Authentication validated successfully');
        return currentUser;
      } catch (verifyError: any) {
        console.error('Error verifying user with server:', verifyError?.response?.status);
        
        // If we got a 403, the token is likely invalid
        if (verifyError?.response?.status === 403) {
          console.log('Token rejected by server (403 Forbidden) - clearing token');
          localStorage.removeItem('passport_pathfinder_token');
          
          // Show a toast message to inform the user they need to log in again
          toast({
            title: "Session expired",
            description: "Please log in again to continue",
            variant: "destructive",
          });
          
          return null;
        }
        
        // For other errors, fall back to stored user data
        return storedUser;
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      return null;
    }
  }, [toast]);

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
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.user.username}!`,
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error?.response?.data?.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
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