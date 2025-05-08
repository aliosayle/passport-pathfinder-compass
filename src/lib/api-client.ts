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
  const token = localStorage.getItem('passport_pathfinder_token');
  
  if (token) {
    // Make sure we're setting the Authorization header properly
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auth errors more gracefully
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Only log errors in development environment
    if (import.meta.env.DEV) {
      console.log(`API Error for ${originalRequest.url}:`, error.response?.status);
    }
    
    // Avoid infinite loops - don't retry already retried requests
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // Don't attempt to refresh for these conditions
    const isAuthLogin = originalRequest.url?.includes('/auth/login');
    const isAuthRegister = originalRequest.url?.includes('/auth/register');
    
    // If this is a 401 or 403 error for a non-login/register endpoint
    if ((error.response?.status === 401 || error.response?.status === 403) 
        && !isAuthLogin && !isAuthRegister && !isRefreshingAuth) {
      // Mark request for retry
      originalRequest._retry = true;
      
      // If token exists but we got 403, it might be invalid - try clearing it
      if (error.response?.status === 403) {
        if (import.meta.env.DEV) {
          console.log('Received 403 Forbidden - token may be invalid, try logging in again');
        }
        
        // Don't auto logout, but clear the token
        localStorage.removeItem('passport_pathfinder_token');
        
        // Return reject so the application can handle the auth error
        return Promise.reject(error);
      }
      
      // Handle 401 unauthorized errors
      if (!isRefreshingAuth) {
        isRefreshingAuth = true;
        try {
          const token = authService.getToken();
          
          if (token) {
            processQueue();
            isRefreshingAuth = false;
            
            // Retry the original request
            return apiClient(originalRequest);
          } else {
            throw new Error('No valid token available');
          }
        } catch (refreshError) {
          processQueue(refreshError);
          isRefreshingAuth = false;
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Export as both default and named export
export const api = apiClient;
export default apiClient;