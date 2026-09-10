import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingBag, FiDollarSign, FiUsers } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import { getProducts, getOrders } from '../../services/supabaseClient';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [products, orders] = await Promise.all([
        getProducts(),
        getOrders(),
      ]);

      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue: totalRevenue,
        totalCustomers: new Set(orders.map(o => o.customer_phone)).size,
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Produk', value: stats.totalProducts, icon: <FiPackage />, color: '#FBAF46' },
    { title: 'Total Pesanan', value: stats.totalOrders, icon: <FiShoppingBag />, color: '#F79480' },
    { title: 'Pemasukan', value: `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`, icon: <FiDollarSign />, color: '#10B981' },
    { title: 'Pelanggan', value: stats.totalCustomers, icon: <FiUsers />, color: '#3B82F6' },
  ];

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="admin-card">
            <div className="flex items-center justify-between mb-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${card.color}20`, color: card.color }}
              >
                {card.icon}
              </div>
            </div>
            <p className="text-sm text-gray-600">{card.title}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {loading ? '...' : card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="admin-card">
          <h2 className="text-xl font-bold mb-4">Menu</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/toko/admin/products/add" className="p-4 bg-white/30 rounded-lg hover:bg-white/50 transition-all text-center">
              <FiPackage className="w-6 h-6 mx-auto mb-2 text-dustyRose" />
              <span className="text-sm font-medium">Tambah Produk</span>
            </Link>
            <Link to="/toko/admin/categories" className="p-4 bg-white/30 rounded-lg hover:bg-white/50 transition-all text-center">
              <FiPackage className="w-6 h-6 mx-auto mb-2 text-dustyRose" />
              <span className="text-sm font-medium">Kelola Kategori</span>
            </Link>
            <Link to="/toko/admin/orders" className="p-4 bg-white/30 rounded-lg hover:bg-white/50 transition-all text-center">
              <FiShoppingBag className="w-6 h-6 mx-auto mb-2 text-dustyRose" />
              <span className="text-sm font-medium">Lihat Pesanan</span>
            </Link>
            <Link to="/toko/admin/reports" className="p-4 bg-white/30 rounded-lg hover:bg-white/50 transition-all text-center">
              <FiDollarSign className="w-6 h-6 mx-auto mb-2 text-dustyRose" />
              <span className="text-sm font-medium">Lihat Laporan</span>
            </Link>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-xl font-bold mb-4">Selamat Datang</h2>
          <p className="text-gray-600 text-sm">
            Selamat datang di Admin Panel Urban Knitters. Di sini Anda dapat mengelola produk, 
            kategori, pesanan, dan melihat laporan penjualan.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;