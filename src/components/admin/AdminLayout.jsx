import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, FiPackage, FiFolder, FiShoppingBag, 
  FiBarChart2, FiLogOut, FiUser 
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
    <div className="min-h-screen bg-gradient-to-br from-cream via-roseQuartz to-dustyRose flex">
      <aside className="w-64 bg-white/30 backdrop-blur-xl border-r border-white/40 min-h-screen p-4 flex flex-col">
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
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
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

      <ConfirmModal
        isOpen={showLogoutModal}
        title="Logout dari Admin Panel"
        message="Apakah Anda yakin ingin keluar dari Admin Panel? Anda perlu memasukkan token kembali untuk masuk."
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