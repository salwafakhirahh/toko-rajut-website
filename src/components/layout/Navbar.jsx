import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiShoppingBag, FiShoppingCart, FiUser, FiArrowLeft,
  FiLogOut, FiLogIn, FiPackage, FiLayout, FiHome, FiInfo
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const PORTFOLIO_URL = import.meta.env.VITE_PORTFOLIO_URL || 'http://localhost:5173';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, logout, isAuthenticated, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout berhasil');
      navigate('/toko', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout gagal');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToAbout = () => {
    const el = document.getElementById('about');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.warn('Section #about tidak ditemukan di halaman ini');
    }
  };

  const handleHomeClick = () => {
    if (location.pathname === '/toko') {
      scrollToTop();
    } else {
      navigate('/toko');
      setTimeout(scrollToTop, 500);
    }
  };

  const handleAboutClick = () => {
    if (location.pathname === '/toko') {
      scrollToAbout();
    } else {
      navigate('/toko');
      setTimeout(scrollToAbout, 500);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/30 backdrop-blur-xl border-b border-white/40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <a
            href={PORTFOLIO_URL}
            className="flex items-center gap-1 text-gray-700 hover:text-dustyRose transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Portfolio</span>
          </a>
          <button
            type="button"
            onClick={handleHomeClick}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img src="/images/logo.jpg" alt="Urban Knitters" className="w-8 h-8 object-contain rounded-full" />
            <span className="text-xl font-bold text-dustyRose">Urban Knitters</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleHomeClick}
            className="flex items-center gap-1 text-gray-700 hover:text-dustyRose transition-colors cursor-pointer"
          >
            <FiHome className="w-5 h-5" />
            <span className="hidden sm:inline">Beranda</span>
          </button>

          <Link
            to="/toko/products"
            className="flex items-center gap-1 text-gray-700 hover:text-dustyRose transition-colors"
          >
            <FiShoppingBag className="w-5 h-5" />
            <span className="hidden sm:inline">Produk</span>
          </Link>

          <button
            type="button"
            onClick={handleAboutClick}
            className="flex items-center gap-1 text-gray-700 hover:text-dustyRose transition-colors cursor-pointer"
          >
            <FiInfo className="w-5 h-5" />
            <span className="hidden sm:inline">Tentang Toko</span>
          </button>

          {isAuthenticated && isAdmin && (
            <Link
              to="/toko/admin/dashboard"
              className="flex items-center gap-1 text-gray-700 hover:text-dustyRose transition-colors"
            >
              <FiLayout className="w-5 h-5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          )}

          {!isAdmin && (
            <Link
              to="/toko/cart"
              className="flex items-center gap-1 text-gray-700 hover:text-dustyRose transition-colors"
            >
              <FiShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">Keranjang</span>
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {!isAdmin && (
                <>
                  <Link
                    to="/toko/orders"
                    className="flex items-center gap-1 text-gray-700 hover:text-dustyRose transition-colors"
                  >
                    <FiPackage className="w-5 h-5" />
                    <span className="hidden sm:inline">Pesanan</span>
                  </Link>
                  <Link
                    to="/toko/profile"
                    className="flex items-center gap-1 text-gray-700 hover:text-dustyRose transition-colors"
                  >
                    <FiUser className="w-5 h-5" />
                    <span className="hidden sm:inline">Profil</span>
                  </Link>
                </>
              )}
              <span className="hidden md:inline text-sm text-gray-700 ml-2">
                Hi, {profile?.full_name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-full hover:bg-red-600 transition-all text-sm"
              >
                <FiLogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/toko/login"
                className="flex items-center gap-1 bg-white/40 text-gray-700 px-3 py-2 rounded-full hover:bg-white/60 transition-all border border-white/40 text-sm"
              >
                <FiLogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
              <Link
                to="/toko/admin"
                className="flex items-center gap-1 bg-dustyRose text-white px-3 py-2 rounded-full hover:bg-coral transition-all text-sm"
              >
                <FiUser className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;