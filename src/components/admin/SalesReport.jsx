import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiShoppingBag, FiTrendingUp } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import { getSalesReport } from '../../services/reportService';

const SalesReport = () => {
  const [period, setPeriod] = useState('daily');
  const [report, setReport] = useState({ totalSales: 0, totalOrders: 0, data: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await getSalesReport(period);
      setReport(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Laporan Penjualan</h1>

      <div className="flex gap-2 mb-6">
        {['daily', 'monthly', 'all'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg transition-all ${
              period === p ? 'bg-dustyRose text-white' : 'bg-white/30 text-gray-700 hover:bg-white/50'
            }`}
          >
            {p === 'daily' ? 'Harian' : p === 'monthly' ? 'Bulanan' : 'Semua'}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <FiDollarSign />
            </div>
            <span className="text-gray-600">Total Penjualan</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {loading ? '...' : `Rp ${report.totalSales?.toLocaleString('id-ID')}`}
          </p>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <FiShoppingBag />
            </div>
            <span className="text-gray-600">Total Pesanan</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {loading ? '...' : report.totalOrders}
          </p>
        </div>
      </div>

      <div className="admin-card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FiTrendingUp /> Rata-rata per Pesanan
        </h2>
        <p className="text-2xl font-bold text-dustyRose">
          {loading ? '...' : report.totalOrders > 0
            ? `Rp ${Math.round(report.totalSales / report.totalOrders).toLocaleString('id-ID')}`
            : 'Rp 0'}
        </p>
      </div>
    </AdminLayout>
  );
};

export default SalesReport;