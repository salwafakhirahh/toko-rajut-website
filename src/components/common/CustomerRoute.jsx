import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const CustomerRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Memuat..." />;
  }

  // Tidak ada redirect. Semua boleh akses halaman customer.
  return children;
};

export default CustomerRoute;