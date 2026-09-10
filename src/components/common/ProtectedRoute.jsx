import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../services/authService';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setAuthenticated(isAuthenticated());
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Memverifikasi akses admin..." />;
  }

  if (!authenticated) {
    return <Navigate to="/toko/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;