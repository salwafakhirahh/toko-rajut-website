import React, { useEffect, useState } from 'react';
import {
  FiSearch, FiDownload, FiFileText,
  FiDollarSign, FiShoppingBag, FiTrendingUp,
} from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import { supabase } from '../../services/supabaseClient';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const SalesReport = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*, orders(order_number, status, created_at, customer_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const filterByPeriod = (list) => {
    if (period === 'all') return list;
    const now = new Date();
    return list.filter((it) => {
      const dateStr = it.orders?.created_at || it.created_at;
      if (!dateStr) return false;
      const date = new Date(dateStr);
      if (period === 'daily') {
        return (
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth() &&
          date.getDate() === now.getDate()
        );
      }
      if (period === 'monthly') {
        return (
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth()
        );
      }
      if (period === 'yearly') {
        return date.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filtered = filterByPeriod(items).filter((it) => {
    const q = search.toLowerCase();
    return (
      (it.product_name || '').toLowerCase().includes(q) ||
      (it.orders?.order_number || '').toLowerCase().includes(q) ||
      (it.orders?.customer_name || '').toLowerCase().includes(q)
    );
  });

  const totalRevenue = filtered.reduce((sum, it) => sum + Number(it.subtotal || 0), 0);
  const totalItems = filtered.reduce((sum, it) => sum + Number(it.quantity || 0), 0);

  const formatPrice = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  const formatDate = (s) => (s ? new Date(s).toLocaleDateString('id-ID') : '-');

  const exportCSV = () => {
    const headers = ['No Pesanan', 'Pelanggan', 'Produk', 'Qty', 'Harga', 'Subtotal', 'Tanggal'];
    const rows = filtered.map((it) => [
      it.orders?.order_number || '',
      it.orders?.customer_name || '',
      it.product_name || '',
      it.quantity,
      it.price,
      it.subtotal,
      formatDate(it.orders?.created_at || it.created_at),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan-penjualan-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success('CSV berhasil diunduh');
  };

  const exportPDF = () => {
    const win = window.open('', '_blank');
    const html = `
      <html><head><title>Laporan Penjualan</title>
      <style>
        body { font-family: sans-serif; padding: 24px; }
        h1 { color: #c97b84; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
        th { background: #f4d9d0; }
        .total { margin-top: 16px; font-weight: bold; }
      </style></head><body>
      <h1>Laporan Penjualan</h1>
      <p>Periode: ${period}</p>
      <p>Tanggal cetak: ${new Date().toLocaleString('id-ID')}</p>
      <table>
        <thead><tr>
          <th>No Pesanan</th><th>Pelanggan</th><th>Produk</th><th>Qty</th><th>Harga</th><th>Subtotal</th><th>Tanggal</th>
        </tr></thead>
        <tbody>
          ${filtered.map((it) => `
            <tr>
              <td>${it.orders?.order_number || ''}</td>
              <td>${it.orders?.customer_name || ''}</td>
              <td>${it.product_name || ''}</td>
              <td>${it.quantity}</td>
              <td>${formatPrice(it.price)}</td>
              <td>${formatPrice(it.subtotal)}</td>
              <td>${formatDate(it.orders?.created_at || it.created_at)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      <p class="total">Total Item: ${totalItems}</p>
      <p class="total">Total Pendapatan: ${formatPrice(totalRevenue)}</p>
      </body></html>`;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  if (loading) return <LoadingSpinner message="Memuat laporan..." />;

  return (
    <AdminLayout>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Laporan Penjualan</h1>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <FiDownload /> Export CSV
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <FiFileText /> Export PDF
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'daily', label: 'Harian' },
          { key: 'monthly', label: 'Bulanan' },
          { key: 'yearly', label: 'Tahunan' },
          { key: 'all', label: 'Semua' },
        ].map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-2 rounded-lg transition-all ${
              period === p.key
                ? 'bg-dustyRose text-white'
                : 'bg-white/30 text-gray-700 hover:bg-white/50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <FiDollarSign />
            </div>
            <span className="text-gray-600">Total Pendapatan</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <FiShoppingBag />
            </div>
            <span className="text-gray-600">Total Item Terjual</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalItems}</p>
        </div>
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
              <FiTrendingUp />
            </div>
            <span className="text-gray-600">Rata-rata per Transaksi</span>
          </div>
          <p className="text-2xl font-bold text-dustyRose">
            {filtered.length > 0 ? formatPrice(Math.round(totalRevenue / filtered.length)) : 'Rp 0'}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari produk, no pesanan, atau pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full bg-white/60 backdrop-blur border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
          />
        </div>
      </div>

      <div className="admin-card">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>No Pesanan</th>
                <th>Pelanggan</th>
                <th>Produk</th>
                <th>Qty</th>
                <th>Harga</th>
                <th>Subtotal</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Belum ada penjualan pada periode ini
                  </td>
                </tr>
              ) : (
                filtered.map((it) => (
                  <tr key={it.id}>
                    <td className="font-mono text-xs">{it.orders?.order_number || '-'}</td>
                    <td>{it.orders?.customer_name || '-'}</td>
                    <td className="font-medium">{it.product_name}</td>
                    <td>{it.quantity}</td>
                    <td>{formatPrice(it.price)}</td>
                    <td className="font-semibold text-dustyRose">{formatPrice(it.subtotal)}</td>
                    <td className="text-xs">{formatDate(it.orders?.created_at || it.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SalesReport;