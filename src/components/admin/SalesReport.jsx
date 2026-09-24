import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch, FiDownload, FiFileText, FiPrinter,
  FiDollarSign, FiShoppingBag, FiTrendingUp, FiFilter, FiEye,
} from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import { getAllSalesItems, getAllOrdersWithItems } from '../../services/reportService';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const SalesReport = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getAllSalesItems();
      setItems(data);

      const uniqueCats = [];
      const seen = new Set();
      data.forEach((it) => {
        const cat = it.products?.categories;
        if (cat && !seen.has(cat.id)) {
          seen.add(cat.id);
          uniqueCats.push(cat);
        }
      });
      setCategories(uniqueCats);
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  const formatDate = (s) => (s ? new Date(s).toLocaleDateString('id-ID') : '-');
  const formatDateTime = (s) =>
    s
      ? new Date(s).toLocaleString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '-';

  const getPeriodRange = () => {
    const now = new Date();
    if (period === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { start, end: now };
    }
    if (period === 'week') {
      const day = now.getDay() === 0 ? 7 : now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - day + 1);
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    }
    if (period === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end: now };
    }
    if (period === 'year') {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start, end: now };
    }
    return null;
  };

  const filtered = useMemo(() => {
    let list = [...items];

    const range = getPeriodRange();
    if (range) {
      list = list.filter((it) => {
        const d = new Date(it.orders?.created_at || it.created_at);
        return d >= range.start && d <= range.end;
      });
    }

    if (dateFrom) {
      const start = new Date(dateFrom);
      start.setHours(0, 0, 0, 0);
      list = list.filter(
        (it) => new Date(it.orders?.created_at || it.created_at) >= start
      );
    }
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      list = list.filter(
        (it) => new Date(it.orders?.created_at || it.created_at) <= end
      );
    }

    if (categoryFilter !== 'all') {
      list = list.filter(
        (it) => it.products?.categories?.id === categoryFilter
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (it) =>
          (it.product_name || '').toLowerCase().includes(q) ||
          (it.orders?.order_number || '').toLowerCase().includes(q) ||
          (it.orders?.customer_name || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [items, period, dateFrom, dateTo, categoryFilter, search]);

  const totalRevenue = filtered.reduce((sum, it) => sum + Number(it.subtotal || 0), 0);
  const totalItems = filtered.reduce((sum, it) => sum + Number(it.quantity || 0), 0);
  const uniqueOrders = new Set(filtered.map((it) => it.orders?.order_number)).size;

  const resetFilters = () => {
    setSearch('');
    setPeriod('all');
    setDateFrom('');
    setDateTo('');
    setCategoryFilter('all');
  };

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
    link.download = `laporan-penjualan-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success('CSV berhasil diunduh');
  };

  const buildReportHTML = () => {
    return `
      <html><head><title>Laporan Penjualan</title>
      <style>
        body { font-family: sans-serif; padding: 24px; color: #333; }
        h1 { color: #c97b84; margin-bottom: 4px; }
        .meta { color: #666; font-size: 13px; margin-bottom: 16px; }
        .summary { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
        .summary-card { border: 1px solid #eee; padding: 12px 16px; border-radius: 12px; min-width: 180px; }
        .summary-card span { color: #888; font-size: 12px; display: block; }
        .summary-card strong { font-size: 18px; color: #c97b84; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background: #f4d9d0; }
        .total { margin-top: 16px; font-weight: bold; }
      </style></head><body>
      <h1>Laporan Penjualan</h1>
      <div class="meta">
        Periode: ${period === 'all' ? 'Semua' : period}<br/>
        ${dateFrom ? `Dari: ${dateFrom}<br/>` : ''}
        ${dateTo ? `Sampai: ${dateTo}<br/>` : ''}
        Tanggal cetak: ${new Date().toLocaleString('id-ID')}
      </div>
      <div class="summary">
        <div class="summary-card"><span>Total Pendapatan</span><strong>${formatPrice(totalRevenue)}</strong></div>
        <div class="summary-card"><span>Total Transaksi</span><strong>${uniqueOrders}</strong></div>
        <div class="summary-card"><span>Total Item Terjual</span><strong>${totalItems}</strong></div>
      </div>
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
  };

  const exportPDF = () => {
    const win = window.open('', '_blank');
    win.document.write(buildReportHTML());
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  const printReport = () => {
    const win = window.open('', '_blank');
    win.document.write(buildReportHTML());
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  if (loading) return <LoadingSpinner message="Memuat laporan..." />;

  return (
    <AdminLayout>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Laporan Penjualan</h1>
          <p className="text-sm text-gray-600 mt-1">
            Total: <strong className="text-dustyRose">{items.length}</strong> baris transaksi
            {filtered.length !== items.length && (
              <> · Ditampilkan: <strong className="text-dustyRose">{filtered.length}</strong></>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={printReport}
            className="flex items-center gap-2 bg-dustyRose text-white px-4 py-2 rounded-lg hover:bg-coral"
          >
            <FiPrinter /> Cetak Laporan
          </button>
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
            <FiFileText /> Simpan PDF
          </button>
        </div>
      </div>

      <div className="admin-card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="text-dustyRose" />
          <h2 className="font-bold text-gray-800">Filter</h2>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'all', label: 'Semua' },
            { key: 'today', label: 'Hari Ini' },
            { key: 'week', label: 'Minggu Ini' },
            { key: 'month', label: 'Bulan Ini' },
            { key: 'year', label: 'Tahun Ini' },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-2 rounded-lg transition-all text-sm ${
                period === p.key
                  ? 'bg-dustyRose text-white'
                  : 'bg-white/30 text-gray-700 hover:bg-white/50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 bg-white/50 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 bg-white/50 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Kategori Produk
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white/50 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose text-sm"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 bg-white/50 text-gray-700 rounded-lg hover:bg-white/70 text-sm font-semibold border border-white/40"
            >
              Reset Filter
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk, no pesanan, atau pelanggan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose text-sm"
            />
          </div>
        </div>
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
            {uniqueOrders > 0 ? formatPrice(Math.round(totalRevenue / uniqueOrders)) : 'Rp 0'}
          </p>
        </div>
      </div>

      <div className="admin-card">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="w-12 text-center">No</th>
                <th>No Pesanan</th>
                <th>Pelanggan</th>
                <th>Produk</th>
                <th>Qty</th>
                <th>Harga</th>
                <th>Subtotal</th>
                <th>Tanggal</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    Belum ada penjualan pada periode ini
                  </td>
                </tr>
              ) : (
                filtered.map((it, index) => (
                  <tr key={it.id}>
                    <td className="text-center font-medium">{index + 1}</td>
                    <td className="font-mono text-xs">{it.orders?.order_number || '-'}</td>
                    <td>{it.orders?.customer_name || '-'}</td>
                    <td className="font-medium">{it.product_name}</td>
                    <td>{it.quantity}</td>
                    <td>{formatPrice(it.price)}</td>
                    <td className="font-semibold text-dustyRose">{formatPrice(it.subtotal)}</td>
                    <td className="text-xs">{formatDate(it.orders?.created_at || it.created_at)}</td>
                    <td className="text-center">
                      <Link
                        to={`/toko/admin/orders/detail/${it.order_id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-xs font-semibold"
                        title="Lihat detail transaksi"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                        Detail
                      </Link>
                    </td>
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