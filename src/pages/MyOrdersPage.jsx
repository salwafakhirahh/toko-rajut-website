import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPackage, FiClock, FiCheckCircle, FiTruck,
  FiXCircle, FiChevronRight, FiLock, FiShoppingBag,
  FiHome, FiMapPin
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getOrdersByUser } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const data = await getOrdersByUser(user.id);
      setOrders(data);
    } catch (error) {
      toast.error('Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  // Status berbeda tergantung metode pengiriman
  const getStatusInfo = (status, deliveryMethod) => {
    const baseMap = {
      pending: {
        label: 'Menunggu Pembayaran',
        color: 'bg-yellow-100 text-yellow-700',
        icon: <FiClock className="w-4 h-4" />,
      },
      paid: {
        label: 'Dibayar',
        color: 'bg-blue-100 text-blue-700',
        icon: <FiCheckCircle className="w-4 h-4" />,
      },
      delivered: {
        label: 'Selesai',
        color: 'bg-green-100 text-green-700',
        icon: <FiCheckCircle className="w-4 h-4" />,
      },
      cancelled: {
        label: 'Dibatalkan',
        color: 'bg-red-100 text-red-700',
        icon: <FiXCircle className="w-4 h-4" />,
      },
    };

    // Shipped hanya ada di delivery
    if (status === 'shipped' && deliveryMethod === 'delivery') {
      return {
        label: 'Sedang Dikirim',
        color: 'bg-purple-100 text-purple-700',
        icon: <FiTruck className="w-4 h-4" />,
      };
    }

    return baseMap[status] || baseMap.pending;
  };

  // Pesan status khusus yang muncul di kartu pesanan
  const getStatusMessage = (order) => {
    const isPickup = order.delivery_method === 'pickup';

    if (order.status === 'paid' && isPickup) {
      return {
        text: 'Silakan ambil pesanan Anda di Toko Urban Knitters',
        color: 'text-amber-600',
      };
    }
    if (order.status === 'paid' && !isPickup) {
      return {
        text: 'Pesanan akan segera dikirim ke alamat Anda',
        color: 'text-blue-600',
      };
    }
    if (order.status === 'shipped' && !isPickup) {
      return {
        text: 'Pesanan sedang dalam perjalanan ke alamat Anda',
        color: 'text-purple-600',
      };
    }
    if (order.status === 'delivered' && isPickup) {
      return {
        text: 'Pesanan telah diambil. Terima kasih!',
        color: 'text-green-600',
      };
    }
    if (order.status === 'delivered' && !isPickup) {
      return {
        text: 'Pesanan telah diterima. Terima kasih!',
        color: 'text-green-600',
      };
    }
    return null;
  };

  const filterOptions = [
    { value: 'all', label: 'Semua' },
    { value: 'pending', label: 'Belum Bayar' },
    { value: 'paid', label: 'Dibayar' },
    { value: 'shipped', label: 'Dikirim' },
    { value: 'delivered', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' },
  ];

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 pt-20">
        <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-dustyRose/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLock className="w-8 h-8 text-dustyRose" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Diperlukan</h2>
          <p className="text-gray-600 mb-6">
            Silakan login untuk melihat riwayat pesanan Anda.
          </p>
          <button
            onClick={() => navigate('/toko/login')}
            className="w-full py-3 bg-dustyRose text-white rounded-lg hover:bg-coral transition-all font-semibold"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner message="Memuat pesanan..." />;

  return (
    <div className="pt-6 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FiPackage className="w-8 h-8 text-dustyRose" />
          <h1 className="text-3xl font-bold text-gray-800">Pesanan Saya</h1>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === opt.value
                  ? 'bg-dustyRose text-white shadow-md'
                  : 'bg-white/40 text-gray-700 hover:bg-white/60 border border-white/40'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <FiShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-6">
              {filter === 'all' ? 'Belum ada pesanan' : 'Tidak ada pesanan dengan status ini'}
            </p>
            <button
              onClick={() => navigate('/toko/products')}
              className="bg-dustyRose text-white px-6 py-2 rounded-full hover:bg-coral"
            >
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status, order.delivery_method);
              const statusMessage = getStatusMessage(order);
              const isPickup = order.delivery_method === 'pickup';

              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/toko/orders/${order.id}`)}
                  className="glass-card rounded-2xl p-5 cursor-pointer hover:shadow-xl transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-gray-500 font-mono">{order.order_number}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
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

                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm text-gray-600 flex items-start gap-1 max-w-[60%]">
                      {isPickup ? (
                        <>
                          <FiMapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>Ambil di Toko Urban Knitters</span>
                        </>
                      ) : (
                        <>
                          <FiMapPin className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{order.delivery_address || 'Alamat tidak tersedia'}</span>
                        </>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-lg font-bold text-dustyRose">
                        Rp {order.total_amount?.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {statusMessage && (
                    <div className={`text-xs mb-3 p-2 rounded-lg ${isPickup ? 'bg-amber-50' : 'bg-blue-50'}`}>
                      <span className={statusMessage.color}>{statusMessage.text}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-white/40">
                    <span className="text-xs text-gray-500">
                      {isPickup ? 'Ambil Sendiri' : 'Dikirim ke Alamat'}
                    </span>
                    <span className="text-dustyRose text-sm font-semibold flex items-center gap-1">
                      Lihat Detail <FiChevronRight />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;