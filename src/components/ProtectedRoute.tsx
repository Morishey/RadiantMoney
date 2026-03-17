import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Check if temporary user has expired
    if (user?.isTemporary && user.expiresAt) {
      if (Date.now() > user.expiresAt) {
        logout();
      }
    }
    
    // Check session timeout for regular users (additional check)
    if (user?.role === 'user' && user.sessionTimeout) {
      const lastActivity = localStorage.getItem('last_activity');
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
        if (timeSinceLastActivity > user.sessionTimeout) {
          console.log('Session expired in ProtectedRoute');
          logout();
        }
      }
    }
  }, [user, logout]);

  if (!isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;