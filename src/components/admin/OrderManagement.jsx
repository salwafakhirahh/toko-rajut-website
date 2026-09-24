import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEdit2, FiX, FiCheck, FiAlertTriangle, FiSearch,
  FiShoppingBag, FiEye, FiPrinter, FiHome, FiTruck
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import StatusBadge from '../common/StatusBadge';
import { getOrders, updateOrderStatus } from '../../services/supabaseClient';
import { getOrderDetailById } from '../../services/reportService';
import LoadingSpinner from '../common/LoadingSpinner';

// Status berikutnya, dibedakan per metode pengiriman
const getNextStatuses = (currentStatus, deliveryMethod) => {
  if (deliveryMethod === 'pickup') {
    switch (currentStatus) {
      case 'pending': return ['paid', 'cancelled'];
      case 'paid': return ['delivered', 'cancelled'];
      case 'delivered':
      case 'cancelled': return [];
      default: return [];
    }
  }

  // delivery (kirim ke alamat)
  switch (currentStatus) {
    case 'pending': return ['paid', 'cancelled'];
    case 'paid': return ['shipped', 'cancelled'];
    case 'shipped': return ['delivered', 'cancelled'];
    case 'delivered':
    case 'cancelled': return [];
    default: return [];
  }
};

const isFinalStatus = (status) => status === 'delivered' || status === 'cancelled';

const paymentLabel = (method) => {
  switch (method) {
    case 'cod': return 'Tunai / COD';
    case 'transfer': return 'Transfer Bank';
    case 'ewallet': return 'E-Wallet';
    default: return method || '-';
  }
};

const deliveryLabel = (method) => {
  switch (method) {
    case 'pickup': return 'Ambil di Toko';
    case 'delivery': return 'Kirim ke Alamat';
    default: return method || '-';
  }
};

const StatusModal = ({ order, isOpen, onClose, onChange }) => {
  const [confirmAction, setConfirmAction] = useState(null);
  if (!order) return null;

  const nextStatuses = getNextStatuses(order.status, order.delivery_method);
  const isFinal = isFinalStatus(order.status);
  const isPickup = order.delivery_method === 'pickup';

  const statusInfo = isPickup
    ? {
        pending: { label: 'Pending', desc: 'Pesanan baru masuk' },
        paid: { label: 'Paid', desc: 'Sudah dibayar' },
        delivered: { label: 'Delivered', desc: 'Sudah diambil customer di toko' },
        cancelled: { label: 'Cancelled', desc: 'Pesanan dibatalkan' },
      }
    : {
        pending: { label: 'Pending', desc: 'Pesanan baru masuk' },
        paid: { label: 'Paid', desc: 'Sudah dibayar' },
        shipped: { label: 'Shipped', desc: 'Sedang dikirim kurir' },
        delivered: { label: 'Delivered', desc: 'Sudah diterima customer' },
        cancelled: { label: 'Cancelled', desc: 'Pesanan dibatalkan' },
      };

  const handleConfirm = () => {
    if (confirmAction) {
      onChange(confirmAction);
      setConfirmAction(null);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="glass rounded-2xl p-6 shadow-2xl border border-white/50 relative">
              <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {isFinal ? 'Status Pesanan' : 'Ubah Status Pesanan'}
              </h3>
              <p className="text-xs text-gray-500 font-mono mb-2">{order.order_number}</p>

              <div className="mb-4 flex items-center gap-2">
                {isPickup ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                    <FiHome className="w-3 h-3" />
                    Ambil di Toko
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                    <FiTruck className="w-3 h-3" />
                    Kirim ke Alamat
                  </span>
                )}
              </div>

              <div className="mb-4 p-3 bg-white/40 rounded-xl border border-white/40">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status saat ini:</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-xs text-gray-500 mt-2">{statusInfo[order.status]?.desc}</p>
              </div>

              {isFinal ? (
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl border border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <FiCheck className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-700 text-sm">Pesanan Selesai</p>
                      <p className="text-xs text-green-600 mt-1">
                        Status pesanan ini sudah final dan tidak dapat diubah lagi.
                      </p>
                    </div>
                  </div>
                </div>
              ) : confirmAction ? (
                <div>
                  <div className="p-4 bg-gradient-to-r from-dustyRose/10 to-coral/10 rounded-xl border border-dustyRose/30 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-dustyRose flex items-center justify-center flex-shrink-0">
                        <FiAlertTriangle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">Konfirmasi Perubahan</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Ubah status dari <span className="font-semibold">{statusInfo[order.status]?.label}</span> menjadi{' '}
                          <span className="font-semibold text-dustyRose">{statusInfo[confirmAction]?.label}</span>?
                        </p>
                        {isPickup && confirmAction === 'delivered' && (
                          <p className="text-xs text-amber-600 mt-2">
                            Pastikan customer sudah mengambil pesanan dan membayar lunas.
                          </p>
                        )}
                        {!isPickup && confirmAction === 'shipped' && (
                          <p className="text-xs text-blue-600 mt-2">
                            Pastikan paket sudah diserahkan ke kurir.
                          </p>
                        )}
                        {!isPickup && confirmAction === 'delivered' && (
                          <p className="text-xs text-green-600 mt-2">
                            Pastikan paket sudah diterima customer.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmAction(null)}
                      className="flex-1 py-2.5 bg-white/60 text-gray-700 rounded-lg hover:bg-white/80 font-semibold border border-white/40"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleConfirm}
                      className={`flex-1 py-2.5 text-white rounded-lg font-semibold shadow-lg ${
                        confirmAction === 'cancelled' ? 'bg-red-500 hover:bg-red-600' : 'bg-dustyRose hover:bg-coral'
                      }`}
                    >
                      Ya, Ubah
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Pilih status berikutnya:</p>
                  {nextStatuses.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Tidak ada status lanjutan
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {nextStatuses.map((status, index) => (
                        <motion.button
                          key={status}
                          type="button"
                          onClick={() => setConfirmAction(status)}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`w-full px-4 py-3 text-left rounded-xl border-2 transition-all flex items-center justify-between ${
                            status === 'cancelled'
                              ? 'bg-white/40 border-red-200 hover:border-red-400 hover:bg-red-50/50'
                              : 'bg-white/40 border-white/40 hover:border-dustyRose/50 hover:bg-white/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <StatusBadge status={status} />
                            <span className="text-xs text-gray-500">{statusInfo[status]?.desc}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [printing, setPrinting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleStatusChange = async (status) => {
    if (!selectedOrder) return;
    const loadingToast = toast.loading('Mengupdate status...');
    try {
      await updateOrderStatus(selectedOrder.id, status);
      await fetchOrders();
      toast.success('Status berhasil diupdate!', { id: loadingToast });
    } catch (error) {
      toast.error('Gagal update: ' + error.message, { id: loadingToast });
    }
  };

  const handlePrintReceipt = async (orderId) => {
    setPrinting(true);
    const loadingToast = toast.loading('Menyiapkan struk...');
    try {
      const { order, items } = await getOrderDetailById(orderId);

      const rows = items.map((it) => `
        <tr>
          <td>${it.product_name}</td>
          <td style="text-align:center">${it.quantity}</td>
          <td style="text-align:right">Rp ${Number(it.price).toLocaleString('id-ID')}</td>
          <td style="text-align:right">Rp ${Number(it.subtotal).toLocaleString('id-ID')}</td>
        </tr>`).join('');

      const html = `
        <html>
        <head><title>Struk ${order.order_number}</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 20px; max-width: 320px; margin: 0 auto; color: #333; }
          h1 { font-size: 18px; text-align: center; margin: 0 0 4px 0; }
          .subtitle { text-align: center; font-size: 12px; color: #666; margin-bottom: 12px; }
          .divider { border-top: 1px dashed #999; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; font-size: 12px; margin: 3px 0; }
          .label { color: #666; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
          th, td { padding: 4px 0; text-align: left; }
          th { border-bottom: 1px solid #999; font-size: 11px; }
          .total { font-size: 14px; font-weight: bold; margin-top: 8px; display: flex; justify-content: space-between; }
          .footer { text-align: center; font-size: 11px; color: #888; margin-top: 16px; }
        </style></head>
        <body>
          <h1>Urban Knitters</h1>
          <div class="subtitle">Toko Rajut Handmade</div>
          <div class="divider"></div>
          <div class="row"><span class="label">No Pesanan</span><span>${order.order_number}</span></div>
          <div class="row"><span class="label">Tanggal</span><span>${new Date(order.created_at).toLocaleString('id-ID')}</span></div>
          <div class="row"><span class="label">Pelanggan</span><span>${order.customer_name || '-'}</span></div>
          <div class="row"><span class="label">Telepon</span><span>${order.customer_phone || '-'}</span></div>
          <div class="row"><span class="label">Pengiriman</span><span>${deliveryLabel(order.delivery_method)}</span></div>
          <div class="row"><span class="label">Pembayaran</span><span>${paymentLabel(order.payment_method)}</span></div>
          ${order.delivery_method === 'delivery' && order.delivery_address ? `<div class="row"><span class="label">Alamat</span><span style="text-align:right; max-width:180px">${order.delivery_address}</span></div>` : ''}
          <div class="divider"></div>
          <table>
            <thead><tr>
              <th>Produk</th><th style="text-align:center">Qty</th><th style="text-align:right">Harga</th><th style="text-align:right">Subtotal</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="divider"></div>
          <div class="total"><span>TOTAL</span><span>Rp ${Number(order.total_amount).toLocaleString('id-ID')}</span></div>
          <div class="divider"></div>
          <div class="footer">Terima kasih telah berbelanja!</div>
        </body>
        </html>`;

      const win = window.open('', '_blank');
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 300);

      toast.success('Struk siap dicetak', { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyiapkan struk', { id: loadingToast });
    } finally {
      setPrinting(false);
    }
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      (o.order_number || '').toLowerCase().includes(q) ||
      (o.customer_name || '').toLowerCase().includes(q) ||
      (o.customer_phone || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchMethod =
      methodFilter === 'all' || o.delivery_method === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  if (loading) return <LoadingSpinner message="Memuat pesanan..." />;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Pesanan</h1>
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
            <FiShoppingBag className="w-4 h-4" />
            Total: <strong className="text-dustyRose">{orders.length}</strong> pesanan
            {(search || statusFilter !== 'all' || methodFilter !== 'all') && (
              <>
                <span className="text-gray-400">·</span>
                Ditampilkan: <strong className="text-dustyRose">{filtered.length}</strong>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[240px]">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari no. pesanan, customer, atau telepon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full bg-white/60 backdrop-blur border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
          />
        </div>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-4 py-3 rounded-full bg-white/60 backdrop-blur border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
        >
          <option value="all">Semua Metode</option>
          <option value="pickup">Ambil di Toko</option>
          <option value="delivery">Kirim ke Alamat</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-full bg-white/60 backdrop-blur border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="admin-card">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="w-12 text-center">No</th>
                <th>No. Pesanan</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Metode</th>
                <th>Status</th>
                <th className="text-center w-56">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    <FiShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    {search || statusFilter !== 'all' || methodFilter !== 'all'
                      ? 'Tidak ada pesanan yang cocok'
                      : 'Belum ada pesanan'}
                  </td>
                </tr>
              ) : (
                filtered.map((order, index) => {
                  const isFinal = isFinalStatus(order.status);
                  const isPickup = order.delivery_method === 'pickup';
                  return (
                    <tr key={order.id} className="hover:bg-white/20 transition-colors">
                      <td className="text-center font-medium text-gray-700">
                        {index + 1}
                      </td>
                      <td className="font-mono text-xs">{order.order_number}</td>
                      <td>
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-xs text-gray-500">{order.customer_phone}</div>
                      </td>
                      <td className="font-semibold text-dustyRose">
                        Rp {order.total_amount?.toLocaleString('id-ID')}
                      </td>
                      <td>
                        {isPickup ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold whitespace-nowrap">
                            <FiHome className="w-3 h-3" />
                            Ambil
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold whitespace-nowrap">
                            <FiTruck className="w-3 h-3" />
                            Kirim
                          </span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`/toko/admin/orders/detail/${order.id}`)}
                            className="flex items-center gap-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-xs font-semibold"
                            title="Lihat detail"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                            Detail
                          </button>
                          <button
                            onClick={() => handlePrintReceipt(order.id)}
                            disabled={printing}
                            className="flex items-center gap-1 px-2 py-1.5 bg-dustyRose text-white rounded-lg hover:bg-coral text-xs font-semibold disabled:opacity-50"
                            title="Cetak struk"
                          >
                            <FiPrinter className="w-3.5 h-3.5" />
                            Struk
                          </button>
                          {!isFinal && (
                            <button
                              onClick={() => handleOpenModal(order)}
                              className="flex items-center gap-1 px-2 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-xs font-semibold"
                              title="Ubah status"
                            >
                              <FiEdit2 className="w-3.5 h-3.5" />
                              Status
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StatusModal
        order={selectedOrder}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onChange={handleStatusChange}
      />
    </AdminLayout>
  );
};

export default OrderManagement;