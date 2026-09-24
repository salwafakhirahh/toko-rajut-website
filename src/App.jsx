import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import CustomerRoute from './components/common/CustomerRoute';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import './styles/index.css';
import './styles/admin.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Redirect halaman root ke halaman toko */}
            <Route path="/" element={<Navigate to="/toko" replace />} />

            {/* Halaman tamu / customer, hanya bisa diakses kalau bukan admin */}
            <Route path="/toko" element={<CustomerRoute><HomePage /></CustomerRoute>} />
            <Route path="/toko/products" element={<CustomerRoute><ProductsPage /></CustomerRoute>} />
            <Route path="/toko/product/:id" element={<CustomerRoute><ProductDetailPage /></CustomerRoute>} />
            <Route path="/toko/cart" element={<CustomerRoute><CartPage /></CustomerRoute>} />
            <Route path="/toko/checkout" element={<CustomerRoute><CheckoutPage /></CustomerRoute>} />
            <Route path="/toko/login" element={<CustomerRoute><LoginPage /></CustomerRoute>} />
            <Route path="/toko/register" element={<CustomerRoute><RegisterPage /></CustomerRoute>} />
            <Route path="/toko/orders" element={<CustomerRoute><MyOrdersPage /></CustomerRoute>} />
            <Route path="/toko/orders/:id" element={<CustomerRoute><OrderDetailPage /></CustomerRoute>} />
            <Route path="/toko/profile" element={<CustomerRoute><CustomerProfilePage /></CustomerRoute>} />

            {/* Halaman admin, semua sub-route ditangani oleh AdminPage */}
            <Route path="/toko/admin/*" element={<AdminPage />} />

            {/* Halaman 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>

        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '16px',
              padding: '16px 24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              color: '#1F2937',
              fontSize: '14px',
              fontWeight: '500'
            },
            success: {
              style: {
                borderLeft: '4px solid #FBAF46',
                background: 'rgba(255, 255, 255, 0.95)'
              },
              iconTheme: {
                primary: '#FBAF46',
                secondary: '#FFFFFF'
              }
            },
            error: {
              style: {
                borderLeft: '4px solid #EF4444',
                background: 'rgba(255, 255, 255, 0.95)'
              },
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF'
              }
            }
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;