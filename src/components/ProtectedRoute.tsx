import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  // Short delay to allow auth state to settle after login
  useEffect(() => {
    const timer = setTimeout(() => setIsChecking(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Check temporary user expiry and session timeout
  useEffect(() => {
    if (user?.isTemporary && user.expiresAt) {
      if (Date.now() > user.expiresAt) {
        logout();
      }
    }
    
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

  // Show a centered loading spinner while waiting for the auth state to stabilise
  if (isChecking) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <div className="spinner" /> {/* Add your spinner CSS class */}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;