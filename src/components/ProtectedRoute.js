import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Unified protected route that supports both `roles` and legacy `allowedRoles` props
const ProtectedRoute = ({ children, roles = [], allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-vietnam-red"></div>
      </div>
    );
  }

  // Check authentication first
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Determine the required roles: prefer explicit `roles`, fall back to `allowedRoles`
  const requiredRoles = roles && roles.length > 0 ? roles : (allowedRoles || []);

  // Lấy role từ user (đã là UPPERCASE từ database)
  const userRole = user?.role;
  console.log('🔐 ProtectedRoute check:', {
    userRole,
    requiredRoles,
    isAuthenticated,
    currentPath: location.pathname
  });
  
  // Check roles (Authorization)
  if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    // Redirect based on role if they try to access a page they don't have permission for
    const roleRedirects = {
      'ADMIN': '/admin-dashboard',
      'SHIPPER': '/shipper-dashboard', 
      'CUSTOMER': '/',
      'STAFF': '/staff-dashboard'
    };
    
    // Chuyển hướng về dashboard tương ứng nếu truy cập route không hợp lệ
    const redirectPath = roleRedirects[userRole] || '/login';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;