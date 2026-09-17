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
  ];

  const handleLogoutClick = () => setShowLogoutModal(true);

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    toast.success('Berhasil logout');
    navigate('/toko', { replace: true });
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-cream via-roseQuartz to-dustyRose overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white/30 backdrop-blur-xl border-r border-white/40 p-4 flex flex-col overflow-y-auto">
          <div className="mb-6">
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
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm ${
                  location.pathname === item.path
                    ? 'bg-dustyRose text-white shadow-lg'
                    : 'text-gray-700 hover:bg-white/40'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Menu bawah: Profil Admin, lalu Logout */}
          <div className="mt-4 space-y-2 border-t border-white/40 pt-4">
            <Link
              to="/toko/admin/profile"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm ${
                location.pathname === '/toko/admin/profile'
                  ? 'bg-dustyRose text-white shadow-lg'
                  : 'text-gray-700 hover:bg-white/40'
              }`}
            >
              <FiUser />
              <span>Profil Admin</span>
            </Link>

            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-100/50 transition-all w-full text-sm"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Konten Utama */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        title="Logout dari Admin Panel"
        message="Apakah Anda yakin ingin keluar dari Admin Panel?"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        confirmText="Ya, Logout"
        cancelText="Batal"
        confirmColor="dustyRose"
      />
    </div>
  );
};

export default AdminLayout;