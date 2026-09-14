import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.includes('/admin/dashboard') ||
                      location.pathname.includes('/admin/products') ||
                      location.pathname.includes('/admin/categories') ||
                      location.pathname.includes('/admin/orders') ||
                      location.pathname.includes('/admin/reports');

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-roseQuartz to-dustyRose flex flex-col">
      {!isAdminPage && <Navbar />}
      <main className={`flex-1 ${isAdminPage ? '' : 'pt-16'}`}>
        {children}
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
};

export default Layout;