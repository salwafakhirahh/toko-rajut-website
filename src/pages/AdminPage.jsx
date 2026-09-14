import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLogin from '../components/admin/AdminLogin';
import AdminRegister from '../components/admin/AdminRegister';
import Dashboard from '../components/admin/Dashboard';
import ProductManagement from '../components/admin/ProductManagement';
import ProductForm from '../components/admin/ProductForm';
import ProductDetail from '../components/admin/ProductDetail';
import CategoryManagement from '../components/admin/CategoryManagement';
import OrderManagement from '../components/admin/OrderManagement';
import SalesReport from '../components/admin/SalesReport';
import TopProducts from '../components/admin/TopProducts';
import ProtectedRoute from '../components/common/ProtectedRoute';

const AdminPage = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLogin />} />
      <Route path="/register" element={<AdminRegister />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><ProductManagement /></ProtectedRoute>} />
      <Route path="/products/add" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
      <Route path="/products/edit/:id" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
      <Route path="/products/detail/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute><CategoryManagement /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrderManagement /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><SalesReport /></ProtectedRoute>} />
      <Route path="/reports/top" element={<ProtectedRoute><TopProducts /></ProtectedRoute>} />
    </Routes>
  );
};

export default AdminPage;