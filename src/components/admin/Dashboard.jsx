import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPackage, FiShoppingBag, FiDollarSign, FiUsers,
  FiUser, FiUserCheck, FiTrendingUp, FiClock
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import {
  getProducts, getOrders, getCustomers, getAdmins
} from '../../services/supabaseClient';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalAdmins: 0,
  });
  const [customers, setCustomers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('customers');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [products, orders, customersData, adminsData] = await Promise.all([
        getProducts(),
        getOrders(),
        getCustomers(),
        getAdmins(),
      ]);

      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue: totalRevenue,
        totalCustomers: customersData.length,
        totalAdmins: adminsData.length,
      });

      setCustomers(customersData);
      setAdmins(adminsData);
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const statCards = [
    {
      title: 'Total Produk',
      value: stats.totalProducts,
      icon: <FiPackage />,
      color: '#FBAF46',
    },
    {
      title: 'Total Pesanan',
      value: stats.totalOrders,
      icon: <FiShoppingBag />,
      color: '#F79480',
    },
    {
      title: 'Pemasukan',
      value: `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`,
      icon: <FiDollarSign />,
      color: '#10B981',
    },
    {
      title: 'Customer',
      value: stats.totalCustomers,
      icon: <FiUsers />,
      color: '#3B82F6',
    },
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

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="admin-card">
          <h2 className="text-xl font-bold mb-4">Menu Cepat</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/toko/admin/products/add"
              className="p-4 bg-white/30 rounded-lg hover:bg-white/50 transition-all text-center"
            >
              <FiPackage className="w-6 h-6 mx-auto mb-2 text-dustyRose" />
              <span className="text-sm font-medium">Tambah Produk</span>
            </Link>
            <Link
              to="/toko/admin/categories"
              className="p-4 bg-white/30 rounded-lg hover:bg-white/50 transition-all text-center"
            >
              <FiPackage className="w-6 h-6 mx-auto mb-2 text-dustyRose" />
              <span className="text-sm font-medium">Kelola Kategori</span>
            </Link>
            <Link
              to="/toko/admin/orders"
              className="p-4 bg-white/30 rounded-lg hover:bg-white/50 transition-all text-center"
            >
              <FiShoppingBag className="w-6 h-6 mx-auto mb-2 text-dustyRose" />
              <span className="text-sm font-medium">Lihat Pesanan</span>
            </Link>
            <Link
              to="/toko/admin/reports"
              className="p-4 bg-white/30 rounded-lg hover:bg-white/50 transition-all text-center"
            >
              <FiDollarSign className="w-6 h-6 mx-auto mb-2 text-dustyRose" />
              <span className="text-sm font-medium">Lihat Laporan</span>
            </Link>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiClock className="text-dustyRose" />
            Pesanan Terbaru
          </h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              Belum ada pesanan
            </p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-white/30 rounded-lg"
                >
                  <div>
                    <p className="text-xs font-mono text-gray-500">
                      {order.order_number}
                    </p>
                    <p className="text-sm font-medium text-gray-800">
                      {order.customer_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-dustyRose">
                      Rp {order.total_amount?.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="admin-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FiUsers className="text-dustyRose" />
            Data Pengguna
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'customers'
                  ? 'bg-dustyRose text-white shadow-md'
                  : 'bg-white/40 text-gray-700 hover:bg-white/60'
              }`}
            >
              Customer ({stats.totalCustomers})
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'admins'
                  ? 'bg-dustyRose text-white shadow-md'
                  : 'bg-white/40 text-gray-700 hover:bg-white/60'
              }`}
            >
              Admin ({stats.totalAdmins})
            </button>
          </div>
        </div>

        {activeTab === 'customers' && (
          <div className="overflow-x-auto">
            {customers.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">
                Belum ada customer terdaftar
              </p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Terdaftar</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => (
                    <tr key={customer.id}>
                      <td className="font-medium">{index + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                            {customer.full_name?.charAt(0)?.toUpperCase() || 'C'}
                          </div>
                          <span className="font-medium text-gray-800">
                            {customer.full_name || 'Tanpa Nama'}
                          </span>
                        </div>
                      </td>
                      <td className="text-sm text-gray-600">{customer.email}</td>
                      <td>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          Customer
                        </span>
                      </td>
                      <td className="text-sm text-gray-600">
                        {formatDate(customer.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="overflow-x-auto">
            {admins.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">
                Belum ada admin terdaftar
              </p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Terdaftar</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin, index) => (
                    <tr key={admin.id}>
                      <td className="font-medium">{index + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-dustyRose/20 text-dustyRose flex items-center justify-center font-semibold text-sm">
                            {admin.full_name?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                          <span className="font-medium text-gray-800">
                            {admin.full_name || 'Admin'}
                          </span>
                        </div>
                      </td>
                      <td className="text-sm text-gray-600">{admin.email}</td>
                      <td>
                        <span className="px-2 py-1 bg-dustyRose/20 text-dustyRose rounded-full text-xs font-semibold">
                          Admin
                        </span>
                      </td>
                      <td className="text-sm text-gray-600">
                        {formatDate(admin.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;