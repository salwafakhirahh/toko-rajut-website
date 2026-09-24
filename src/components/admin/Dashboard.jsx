import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiPackage, FiShoppingBag, FiDollarSign, FiUsers,
  FiTrendingUp, FiClock, FiEdit, FiEye, FiAlertTriangle,
  FiBarChart2, FiList, FiGrid
} from 'react-icons/fi';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import {
  getProducts, getOrders, getCustomers, getAdmins,
} from '../../services/supabaseClient';
import { calculateFinalPrice } from '../../utils/priceHelper';
import LoadingSpinner from '../common/LoadingSpinner';

const COLORS = ['#C97B84', '#E8A0A8', '#FBAF46', '#F79480', '#9C6B94', '#6BA3BE'];

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, ordersData, customersData, adminsData] = await Promise.all([
        getProducts(),
        getOrders(),
        getCustomers(),
        getAdmins(),
      ]);
      setProducts(productsData || []);
      setOrders(ordersData || []);
      setCustomers(customersData || []);
      setAdmins(adminsData || []);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  const formatDate = (s) =>
    s
      ? new Date(s).toLocaleDateString('id-ID', {
          day: 'numeric', month: 'short', year: 'numeric',
        })
      : '-';

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce(
      (sum, o) => sum + Number(o.total_amount || 0),
      0
    );
    const deliveredRevenue = orders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const lowStockProducts = products.filter((p) => (p.stock || 0) <= 5);
    const outOfStockProducts = products.filter((p) => (p.stock || 0) === 0);

    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue,
      deliveredRevenue,
      pendingOrders,
      totalCustomers: customers.length,
      totalAdmins: admins.length,
      lowStockProducts,
      outOfStockProducts,
    };
  }, [products, orders, customers, admins]);

  const salesChartData = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push({
        date: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        iso: d.toISOString().slice(0, 10),
        total: 0,
        count: 0,
      });
    }

    orders.forEach((o) => {
      const iso = (o.created_at || '').slice(0, 10);
      const found = days.find((d) => d.iso === iso);
      if (found) {
        found.total += Number(o.total_amount || 0);
        found.count += 1;
      }
    });

    return days;
  }, [orders]);

  const categoryChartData = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      if (!o.id) return;
    });

    products.forEach((p) => {
      const catName = p.categories?.name || 'Tanpa Kategori';
      map.set(catName, (map.get(catName) || 0) + 1);
    });

    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [products]);

  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.stock || 0) - (a.stock || 0))
      .slice(0, 5);
  }, [products]);

  if (loading) return <LoadingSpinner message="Memuat dashboard..." />;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Ringkasan informasi toko Urban Knitters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/toko/admin/products/add"
            className="flex items-center gap-2 px-4 py-2 bg-dustyRose text-white rounded-lg hover:bg-coral text-sm font-semibold shadow-md"
          >
            <FiPackage /> Tambah Produk
          </Link>
        </div>
      </div>

      {/* Kartu Info */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <FiPackage />
            </div>
            <span className="text-xs text-gray-600">Total Produk</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.outOfStockProducts.length} habis · {stats.lowStockProducts.length} stok rendah
          </p>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <FiShoppingBag />
            </div>
            <span className="text-xs text-gray-600">Total Pesanan</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.pendingOrders} pesanan menunggu
          </p>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <FiDollarSign />
            </div>
            <span className="text-xs text-gray-600">Total Pemasukan</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatPrice(stats.totalRevenue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatPrice(stats.deliveredRevenue)} dari pesanan selesai
          </p>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <FiUsers />
            </div>
            <span className="text-xs text-gray-600">Customer</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalCustomers}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.totalAdmins} admin aktif
          </p>
        </div>
      </div>

      {/* Tab Navigasi */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'overview', label: 'Ringkasan', icon: <FiGrid className="w-4 h-4" /> },
          { key: 'grafik', label: 'Grafik & Statistik', icon: <FiBarChart2 className="w-4 h-4" /> },
          { key: 'produk', label: 'Kelola Produk', icon: <FiList className="w-4 h-4" /> },
          { key: 'pesanan', label: 'Pesanan Terbaru', icon: <FiClock className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-dustyRose text-white shadow-md'
                : 'bg-white/40 text-gray-700 hover:bg-white/60 border border-white/40'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Ringkasan */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="admin-card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-dustyRose" /> Menu Cepat
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/toko/admin/products" className="p-4 bg-white/40 rounded-xl hover:bg-white/60 transition-all text-center border border-white/40">
                <FiPackage className="w-6 h-6 mx-auto mb-2 text-dustyRose" />
                <span className="text-sm font-medium">Kelola Produk</span>
              </Link>
              <Link to="/toko/admin/categories" className="p-4 bg-white/40 rounded-xl hover:bg-white/60 transition-all text-center border border-white/40">
                <FiList className="w-6 h-6 mx-auto mb-2 text-dustyRose" />
                <span className="text-sm font-medium">Kelola Kategori</span>
              </Link>
              <Link to="/toko/admin/orders" className="p-4 bg-white/40 rounded-xl hover:bg-white/60 transition-all text-center border border-white/40">
                <FiShoppingBag className="w-6 h-6 mx-auto mb-2 text-dustyRose" />
                <span className="text-sm font-medium">Lihat Pesanan</span>
              </Link>
              <Link to="/toko/admin/reports" className="p-4 bg-white/40 rounded-xl hover:bg-white/60 transition-all text-center border border-white/40">
                <FiBarChart2 className="w-6 h-6 mx-auto mb-2 text-dustyRose" />
                <span className="text-sm font-medium">Lihat Laporan</span>
              </Link>
            </div>
          </div>

          <div className="admin-card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiAlertTriangle className="text-amber-500" />
              Produk Stok Rendah
            </h2>
            {stats.lowStockProducts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                Semua produk stoknya aman
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {stats.lowStockProducts.slice(0, 8).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 p-3 bg-white/40 rounded-lg border border-white/40"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={p.image_url || `https://picsum.photos/40/40?random=${p.id}`}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {p.categories?.name || 'Tanpa Kategori'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                          p.stock === 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {p.stock === 0 ? 'Habis' : `${p.stock} pcs`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Grafik */}
      {activeTab === 'grafik' && (
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="admin-card lg:col-span-2">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-dustyRose" />
              Penjualan 7 Hari Terakhir
            </h2>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <AreaChart data={salesChartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C97B84" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#C97B84" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => formatPrice(value)}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #eee',
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#C97B84"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="admin-card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiBarChart2 className="text-dustyRose" />
              Jumlah Pesanan per Hari
            </h2>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #eee',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="#E8A0A8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="admin-card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiPackage className="text-dustyRose" />
              Distribusi Produk per Kategori
            </h2>
            {categoryChartData.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-10">
                Belum ada data kategori
              </p>
            ) : (
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, value }) => `${name} (${value})`}
                      labelLine={false}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #eee',
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Kelola Produk */}
      {activeTab === 'produk' && (
        <div className="admin-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FiList className="text-dustyRose" /> Daftar Produk Terbaru
            </h2>
            <Link
              to="/toko/admin/products"
              className="text-sm text-dustyRose hover:text-coral font-semibold"
            >
              Lihat Semua
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Belum ada produk
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/40">
                    <th className="text-left px-3 py-2 text-xs font-bold text-gray-700 uppercase w-14">Gambar</th>
                    <th className="text-left px-3 py-2 text-xs font-bold text-gray-700 uppercase">Nama</th>
                    <th className="text-left px-3 py-2 text-xs font-bold text-gray-700 uppercase w-28">Kategori</th>
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-700 uppercase w-28">Harga</th>
                    <th className="text-center px-3 py-2 text-xs font-bold text-gray-700 uppercase w-20">Stok</th>
                    <th className="text-center px-3 py-2 text-xs font-bold text-gray-700 uppercase w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/30">
                  {topProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-white/20">
                      <td className="px-3 py-2">
                        <img
                          src={p.image_url || `https://picsum.photos/40/40?random=${p.id}`}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-800 line-clamp-1">
                        {p.name}
                      </td>
                      <td className="px-3 py-2 text-gray-600 text-xs">
                        {p.categories?.name || '-'}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-dustyRose whitespace-nowrap">
                        {formatPrice(calculateFinalPrice(p))}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                            (p.stock || 0) === 0
                              ? 'bg-red-100 text-red-700'
                              : (p.stock || 0) <= 5
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`/toko/admin/products/detail/${p.id}`)}
                            className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            title="Lihat"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => navigate(`/toko/admin/products/edit/${p.id}`)}
                            className="p-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                            title="Edit"
                          >
                            <FiEdit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Pesanan Terbaru */}
      {activeTab === 'pesanan' && (
        <div className="admin-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FiClock className="text-dustyRose" /> Pesanan Terbaru
            </h2>
            <Link
              to="/toko/admin/orders"
              className="text-sm text-dustyRose hover:text-coral font-semibold"
            >
              Lihat Semua
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Belum ada pesanan
            </p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 6).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-3 p-3 bg-white/40 rounded-lg border border-white/40"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-gray-500 truncate">
                      {order.order_number}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {order.customer_name || '-'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-dustyRose">
                      {formatPrice(order.total_amount)}
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
      )}
    </AdminLayout>
  );
};

export default Dashboard;