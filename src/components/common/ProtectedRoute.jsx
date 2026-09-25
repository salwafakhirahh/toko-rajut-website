import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Memverifikasi akses..." />;
  }

  if (!user) {
    return <Navigate to="/toko/admin" replace />;
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/toko" replace />;
  }

  return children;
};

export default ProtectedRoute;