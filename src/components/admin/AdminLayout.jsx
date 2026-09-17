import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiHome, FiPackage, FiFolder, FiShoppingBag,
  FiBarChart2, FiLogOut, FiUser, FiUsers
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { logout } from '../../services/authService';
import ConfirmModal from '../common/ConfirmModal';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/toko/admin/dashboard', icon: <FiHome /> },
    { name: 'Produk', path: '/toko/admin/products', icon: <FiPackage /> },
    { name: 'Kategori', path: '/toko/admin/categories', icon: <FiFolder /> },
    { name: 'Pesanan', path: '/toko/admin/orders', icon: <FiShoppingBag /> },
    { name: 'Laporan', path: '/toko/admin/reports', icon: <FiBarChart2 /> },
    { name: 'Pengguna', path: '/toko/admin/users', icon: <FiUsers /> },
    { name: 'Profil Admin', path: '/toko/admin/profile', icon: <FiUser /> },
  ];

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    toast.success('Berhasil logout');
    setTimeout(() => navigate('/toko'), 800);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-roseQuartz to-dustyRose flex flex-col">
      <div className="flex flex-1">
        <aside className="w-64 bg-white/30 backdrop-blur-xl border-r border-white/40 p-4 flex flex-col">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-dustyRose flex items-center gap-2">
              <FiUser className="w-6 h-6" />
              Admin Panel
            </h2>
            <p className="text-xs text-gray-600 mt-1">Urban Knitters</p>
          </div>

          <nav className="space-y-2 flex-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${location.pathname === item.path
                    ? 'bg-dustyRose text-white shadow-lg'
                    : 'text-gray-700 hover:bg-white/40'
                  }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-100/50 transition-all w-full mt-8"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </aside>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      <footer className="bg-white/20 backdrop-blur-xl border-t border-white/40 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-600">
          <p>
            &copy; {new Date().getFullYear()}{' '}
            <span className="font-bold text-dustyRose">Urban Knitters</span> - Admin Panel
          </p>
          <p>
            Dibuat dengan <span className="text-red-500">♥</span> oleh{' '}
            <span className="font-semibold text-dustyRose">Salwa Fakhirah Harsya</span>
          </p>
        </div>
      </footer>

      <ConfirmModal
        isOpen={showLogoutModal}
        title="Logout dari Admin Panel"
        message="Apakah Anda yakin ingin keluar dari Admin Panel?"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
        confirmText="Ya, Logout"
        cancelText="Batal"
        confirmColor="dustyRose"
      />
    </div>
  );
};

export default AdminLayout;