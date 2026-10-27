import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRBAC } from '../hooks/useRBAC';
import { UserRole } from '../store/authSlice';

interface Props {
  children: React.ReactElement;
  requiredRole?: UserRole | UserRole[];
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<Props> = ({
  children,
  requiredRole,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasRole } = useRBAC();
  const location = useLocation();

  // Show spinner while silent refresh is in progress on page load
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <span className="text-slate-600 text-sm font-medium">Verifying authorization...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login saving the attempted URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Determine allowed roles
  const targetRoles: UserRole[] = allowedRoles
    ? allowedRoles
    : Array.isArray(requiredRole)
    ? requiredRole
    : requiredRole
    ? [requiredRole]
    : [];

  // If role requirement is specified, verify user has at least one of those roles
  if (targetRoles.length > 0 && !hasRole(...targetRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
