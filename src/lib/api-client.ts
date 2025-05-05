import axios from 'axios';
import { authService } from '@/services/authService';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Track if we're currently refreshing token or validating auth
let isRefreshingAuth = false;
let failedQueue: {resolve: Function; reject: Function}[] = [];

// Process failed requests queue after auth refresh
const processQueue = (error: any = null) => {
  failedQueue.forEach((req) => {
    if (error) {
      req.reject(error);
    } else {
      req.resolve();
    }
  });
  
  failedQueue = [];
};

// Add an interceptor for authentication
apiClient.interceptors.request.use((config) => {
  // Get token from authService to ensure consistency
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auth errors more gracefully
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Avoid infinite loops - don't retry already retried requests
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // Don't attempt to refresh for these conditions
    const isAuthLogin = originalRequest.url?.includes('/auth/login');
    const isAuthRegister = originalRequest.url?.includes('/auth/register');
    
    // If this is a 401 error for a non-login/register endpoint and we're not already refreshing
    if (error.response?.status === 401 && !isAuthLogin && !isAuthRegister && !isRefreshingAuth) {
      // Mark request for retry
      originalRequest._retry = true;
      
      // If not already refreshing auth, try to validate stored auth
      if (!isRefreshingAuth) {
        isRefreshingAuth = true;
        
        // Try to use the stored user data directly instead of clearing
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          // For non-auth endpoints, retry with existing token without clearing
          const token = authService.getToken();
          
          if (token) {
            // Wait for any in-progress auth refreshes to complete
            try {
              // Process all queued requests with the current token
              processQueue();
              isRefreshingAuth = false;
              
              // Retry the original request
              return apiClient(originalRequest);
            } catch (refreshError) {
              // Only clear session on critical auth errors
              processQueue(refreshError);
              isRefreshingAuth = false;
              return Promise.reject(refreshError);
            }
          }
        }
        
        // Only clear tokens for auth-specific endpoints
        const isAuthEndpoint = originalRequest.url?.includes('/auth/me');
        if (isAuthEndpoint) {
          console.log('Authentication endpoint failed, clearing session data');
          // Clear token but don't force logout - keep stored user data as fallback
          localStorage.removeItem('passport_pathfinder_token');
        }
        
        isRefreshingAuth = false;
      }
    }
    
    return Promise.reject(error);
  }
);

// Export as both default and named export
export const api = apiClient;
export default apiClient;