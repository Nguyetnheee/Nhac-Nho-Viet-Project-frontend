import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-vietnam-red"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role, nếu user là staff thì coi như có role 'Staff'
  if (roles.length > 0) {
    const userRoles = [user?.role];
    if (user?.isStaff) {
      userRoles.push('Staff');
    }
    if (!roles.some(role => userRoles.includes(role))) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
