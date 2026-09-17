import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiX, FiCheck, FiAlertTriangle, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import StatusBadge from '../common/StatusBadge';
import { getOrders, updateOrderStatus } from '../../services/supabaseClient';
import LoadingSpinner from '../common/LoadingSpinner';

const getNextStatuses = (currentStatus) => {
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

const StatusModal = ({ order, isOpen, onClose, onChange }) => {
  const [confirmAction, setConfirmAction] = useState(null);

  if (!order) return null;

  const nextStatuses = getNextStatuses(order.status);
  const isFinal = isFinalStatus(order.status);

  const statusInfo = {
    pending: { label: 'Pending', desc: 'Pesanan baru masuk' },
    paid: { label: 'Paid', desc: 'Sudah dibayar' },
    shipped: { label: 'Shipped', desc: 'Sedang dikirim' },
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
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {isFinal ? 'Status Pesanan' : 'Ubah Status Pesanan'}
              </h3>
              <p className="text-xs text-gray-500 font-mono mb-4">{order.order_number}</p>
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

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      (o.order_number || '').toLowerCase().includes(q) ||
      (o.customer_name || '').toLowerCase().includes(q) ||
      (o.customer_phone || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <LoadingSpinner message="Memuat pesanan..." />;

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manajemen Pesanan</h1>

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
                <th>No. Pesanan</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Metode</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Tidak ada pesanan yang cocok
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const isFinal = isFinalStatus(order.status);
                  return (
                    <tr key={order.id}>
                      <td className="font-mono text-xs">{order.order_number}</td>
                      <td>
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-xs text-gray-500">{order.customer_phone}</div>
                      </td>
                      <td className="font-semibold text-dustyRose">
                        Rp {order.total_amount?.toLocaleString('id-ID')}
                      </td>
                      <td>
                        <span className="capitalize">{order.delivery_method}</span>
                      </td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td>
                        {isFinal ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                            <FiCheck className="w-3.5 h-3.5" />
                            Selesai
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenModal(order)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-dustyRose text-white rounded-lg hover:bg-coral text-xs font-semibold shadow-md"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                            Ubah Status
                          </button>
                        )}
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