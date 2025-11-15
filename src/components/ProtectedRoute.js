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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-vietnam-green"></div>
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
  
  // ✅ NORMALIZE: Loại bỏ prefix "ROLE_" để so sánh
  const normalizedUserRole = userRole?.replace(/^ROLE_/, '');
  const normalizedRequiredRoles = requiredRoles.map(role => role.replace(/^ROLE_/, ''));
  
  console.log('🔐 ProtectedRoute check:', {
    originalUserRole: userRole,
    normalizedUserRole,
    originalRequiredRoles: requiredRoles,
    normalizedRequiredRoles,
    isAuthenticated,
    currentPath: location.pathname
  });
  
  // Check roles (Authorization) - So sánh sau khi normalize
  if (requiredRoles && requiredRoles.length > 0 && !normalizedRequiredRoles.includes(normalizedUserRole)) {
    console.warn('⚠️ Access denied - Role mismatch:', {
      userRole,
      requiredRoles,
      path: location.pathname
    });
    
    // ✅ CHUYỂN HƯỚNG ĐÚNG THEO ROLE
    const roleRedirects = {
      'ADMIN': '/admin-dashboard',
      'MANAGER': '/manager-dashboard',
      'SHIPPER': '/shipper-dashboard',
      'STAFF': '/staff-dashboard',
      'CUSTOMER': '/',  // Customer về trang chủ nếu truy cập route không được phép
      'ROLE_CUSTOMER': '/',
      'ROLE_ADMIN': '/admin-dashboard',
      'ROLE_MANAGER': '/manager-dashboard',
      'ROLE_SHIPPER': '/shipper-dashboard',
      'ROLE_STAFF': '/staff-dashboard'
    };
    
    const redirectPath = roleRedirects[userRole] || '/login';
    
    console.log('🔀 Redirecting to:', redirectPath, 'for role:', userRole);
    
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;