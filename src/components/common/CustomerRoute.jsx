import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const CustomerRoute = ({ children }) => {
  const { user, profile, loading, isAdmin } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Memeriksa akses..." />;
  }

  // Kalau admin, redirect ke dashboard admin
  if (user && isAdmin) {
    return <Navigate to="/toko/admin/dashboard" replace />;
  }

  // Kalau bukan admin, boleh lanjut (tamu atau customer)
  return children;
};

export default CustomerRoute;