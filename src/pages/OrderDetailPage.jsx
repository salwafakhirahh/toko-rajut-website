import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiClock, FiCheckCircle, FiTruck,
  FiXCircle, FiPackage, FiMapPin, FiPhone, FiUser,
  FiCreditCard, FiStar
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getOrderItems, getOrdersByUser, checkUserReview } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import ReviewModal from '../components/customer/ReviewModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [reviewedItems, setReviewedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState({ open: false, product: null });

  useEffect(() => {
    if (user) fetchOrderDetail();
  }, [id, user]);

  const fetchOrderDetail = async () => {
    try {
      const orders = await getOrdersByUser(user.id);
      const foundOrder = orders.find((o) => o.id === id);

      if (!foundOrder) {
        toast.error('Pesanan tidak ditemukan');
        navigate('/toko/orders');
        return;
      }

      setOrder(foundOrder);

      const orderItems = await getOrderItems(id);
      setItems(orderItems);

      const reviewed = {};
      for (const item of orderItems) {
        const existing = await checkUserReview(user.id, item.product_id, id);
        if (existing) reviewed[item.product_id] = true;
      }
      setReviewedItems(reviewed);
    } catch (error) {
      toast.error('Gagal memuat detail pesanan');
    } finally {
      setLoading(false);
    }
  };

  const timelineSteps = [
    { key: 'pending', label: 'Pesanan Dibuat', icon: <FiClock /> },
    { key: 'paid', label: 'Pembayaran Dikonfirmasi', icon: <FiCreditCard /> },
    { key: 'shipped', label: 'Pesanan Dikirim', icon: <FiTruck /> },
    { key: 'delivered', label: 'Pesanan Diterima', icon: <FiCheckCircle /> },
  ];

  const getStepIndex = (status) => {
    const map = { pending: 0, paid: 1, shipped: 2, delivered: 3 };
    return map[status] ?? -1;
  };

  if (loading) return <LoadingSpinner message="Memuat detail pesanan..." />;
  if (!order) return null;

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';

  return (
    <div className="pt-6 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/toko/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-dustyRose mb-6"
        >
          <FiArrowLeft /> Kembali ke Pesanan Saya
        </button>

        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-gray-500 font-mono">{order.order_number}</p>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(order.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {isCancelled ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                <FiXCircle className="w-4 h-4" />
                Dibatalkan
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                <FiCheckCircle className="w-4 h-4" />
                Aktif
              </span>
            )}
          </div>

          {!isCancelled && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-4">Status Pesanan</h3>
              <div className="space-y-4">
                {timelineSteps.map((step, index) => {
                  const isCompleted = index <= currentStep;
                  const isActive = index === currentStep;
                  return (
                    <div key={step.key} className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isCompleted
                            ? 'bg-dustyRose text-white'
                            : 'bg-gray-200 text-gray-400'
                        } ${isActive ? 'ring-4 ring-dustyRose/30' : ''}`}
                      >
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                        {isActive && (
                          <p className="text-xs text-dustyRose mt-1">Status saat ini</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiPackage /> Produk Dipesan
          </h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-3 border-b border-white/40 last:border-0">
                <img
                  src={item.products?.image_url || `https://picsum.photos/60/60?random=${item.product_id}`}
                  alt={item.product_name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.product_name}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} x Rp {item.price?.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-dustyRose">
                    Rp {item.subtotal?.toLocaleString('id-ID')}
                  </p>
                  {isDelivered && (
                    reviewedItems[item.product_id] ? (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1 justify-end">
                        <FiCheckCircle className="w-3 h-3" /> Sudah diulas
                      </span>
                    ) : (
                      <button
                        onClick={() => setReviewModal({ open: true, product: item })}
                        className="mt-1 text-xs bg-dustyRose text-white px-3 py-1 rounded-full hover:bg-coral transition-all flex items-center gap-1"
                      >
                        <FiStar className="w-3 h-3" /> Beri Ulasan
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-white/40 mt-4">
            <span className="font-semibold text-gray-800">Total</span>
            <span className="text-xl font-bold text-dustyRose">
              Rp {order.total_amount?.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Informasi Pengiriman</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <FiUser className="w-5 h-5 text-dustyRose mt-0.5" />
              <div>
                <p className="text-gray-500">Nama</p>
                <p className="font-medium text-gray-800">{order.customer_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FiPhone className="w-5 h-5 text-dustyRose mt-0.5" />
              <div>
                <p className="text-gray-500">Telepon</p>
                <p className="font-medium text-gray-800">{order.customer_phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FiMapPin className="w-5 h-5 text-dustyRose mt-0.5" />
              <div>
                <p className="text-gray-500">Metode</p>
                <p className="font-medium text-gray-800 capitalize">
                  {order.delivery_method === 'pickup' ? 'Ambil di Toko' : 'Kirim ke Alamat'}
                </p>
                {order.delivery_method === 'delivery' && order.delivery_address && (
                  <p className="text-gray-600 mt-1">{order.delivery_address}</p>
                )}
                {order.delivery_method === 'pickup' && order.pickup_location && (
                  <p className="text-gray-600 mt-1">{order.pickup_location}</p>
                )}
              </div>
            </div>
            {order.customer_message && (
              <div className="pt-3 border-t border-white/40">
                <p className="text-gray-500 mb-1">Pesan Tambahan</p>
                <p className="text-gray-800">{order.customer_message}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ReviewModal
        isOpen={reviewModal.open}
        onClose={() => setReviewModal({ open: false, product: null })}
        product={reviewModal.product}
        orderId={order.id}
        onSuccess={fetchOrderDetail}
      />
    </div>
  );
};

export default OrderDetailPage;