import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
}) => {
  const { user, isAuthenticated, isLoading, checkAuthStatus } = useAuth();
  const location = useLocation();
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    // First check if there's a token without waiting for the context
    const hasToken = authService.getToken();
    
    if (!hasToken) {
      setLocalLoading(false);
      return;
    }
    
    // If we already have a user in context, we don't need to reload
    if (user) {
      setLocalLoading(false);
      return;
    }
    
    // If we have a token but no user, try to reload auth status
    const reloadAuth = async () => {
      try {
        await checkAuthStatus();
      } finally {
        setLocalLoading(false);
      }
    };
    
    reloadAuth();
  }, [user, checkAuthStatus]);

  // Show loading state while checking authentication
  // Use both global auth loading state and local loading state
  if (isLoading || localLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // Save the current location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role restrictions are specified, check if user has required role
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    if (!hasRequiredRole) {
      // User doesn't have the required role, redirect to dashboard
      return <Navigate to="/" replace />;
    }
  }

  // User is authenticated and has required role, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;