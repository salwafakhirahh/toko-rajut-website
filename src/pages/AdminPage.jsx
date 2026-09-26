import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLogin from '../components/admin/AdminLogin';
import Dashboard from '../components/admin/Dashboard';
import ProductManagement from '../components/admin/ProductManagement';
import ProductForm from '../components/admin/ProductForm';
import ProductDetail from '../components/admin/ProductDetail';
import CategoryManagement from '../components/admin/CategoryManagement';
import OrderManagement from '../components/admin/OrderManagement';
import OrderDetail from '../components/admin/OrderDetail';
import SalesReport from '../components/admin/SalesReport';
import TopProducts from '../components/admin/TopProducts';
import UserManagement from '../components/admin/UserManagement';
import AdminProfile from '../components/admin/AdminProfile';
import ProtectedRoute from '../components/common/ProtectedRoute';

const AdminPage = () => {
  return (
    <Routes>
      <Route index element={<AdminLogin />} />
      <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="products" element={<ProtectedRoute><ProductManagement /></ProtectedRoute>} />
      <Route path="products/add" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
      <Route path="products/edit/:id" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
      <Route path="products/detail/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
      <Route path="categories" element={<ProtectedRoute><CategoryManagement /></ProtectedRoute>} />
      <Route path="orders" element={<ProtectedRoute><OrderManagement /></ProtectedRoute>} />
      <Route path="orders/detail/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
      <Route path="reports" element={<ProtectedRoute><SalesReport /></ProtectedRoute>} />
      <Route path="reports/top" element={<ProtectedRoute><TopProducts /></ProtectedRoute>} />
      <Route path="users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
      <Route path="profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
    </Routes>
  );
};

export default AdminPage;