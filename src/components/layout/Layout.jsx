import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.includes('/admin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-roseQuartz to-dustyRose">
      {!isAdminPage && <Navbar />}
      <main className={isAdminPage ? '' : 'pt-16'}>
        {children}
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
};

export default Layout;