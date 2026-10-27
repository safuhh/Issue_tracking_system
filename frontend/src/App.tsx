import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './features/issues/pages/Home';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import Profile from './features/auth/pages/Profile';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import DeveloperDashboard from './features/developer/pages/DeveloperDashboard';
import Unauthorized from './features/auth/pages/Unauthorized';
import ProtectedRoute from './features/auth/components/ProtectedRoute';

export default function App(): React.ReactElement {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Authenticated user route */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Developer route — accessible only to Admin and Developer roles */}
      <Route
        path="/dev"
        element={
          <ProtectedRoute requiredRole={['admin', 'developer']}>
            <DeveloperDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin-only route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
