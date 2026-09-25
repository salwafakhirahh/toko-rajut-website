import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiClock, FiCheckCircle, FiTruck,
  FiXCircle, FiPackage, FiMapPin, FiPhone, FiUser,
  FiCreditCard, FiStar, FiHome, FiInfo, FiPrinter, FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  getOrderItems, getOrdersByUser, checkUserReview
} from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import ReviewModal from '../components/customer/ReviewModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const paymentLabel = (method) => {
  switch (method) {
    case 'cod': return 'Tunai / Cash on Delivery (COD)';
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

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [reviewedItems, setReviewedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState({ open: false, product: null });
  const [showReceipt, setShowReceipt] = useState(false);

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

  const formatPrice = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  const formatDate = (s) =>
    s
      ? new Date(s).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '-';

  const handlePrintReceipt = () => {
    if (!order || items.length === 0) {
      toast.error('Data struk tidak tersedia');
      return;
    }

    const rows = items.map((it) => `
      <tr>
        <td>${it.product_name}</td>
        <td style="text-align:center">${it.quantity}</td>
        <td style="text-align:right">${formatPrice(it.price)}</td>
        <td style="text-align:right">${formatPrice(it.subtotal)}</td>
      </tr>`).join('');

    const html = `
      <html>
      <head>
        <title>Struk ${order.order_number}</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 20px; max-width: 340px; margin: 0 auto; color: #333; }
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
        <div class="row"><span class="label">Tanggal</span><span>${formatDate(order.created_at)}</span></div>
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
        <div class="total"><span>TOTAL</span><span>${formatPrice(order.total_amount)}</span></div>
        <div class="divider"></div>
        <div class="footer">Terima kasih telah berbelanja!</div>
      </body>
      </html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  // Timeline berbeda per metode pengiriman
  const getTimelineSteps = (deliveryMethod) => {
    if (deliveryMethod === 'pickup') {
      return [
        { key: 'pending', label: 'Pesanan Dibuat', icon: <FiClock /> },
        { key: 'paid', label: 'Pembayaran Dikonfirmasi', icon: <FiCreditCard /> },
        { key: 'delivered', label: 'Pesanan Diambil', icon: <FiCheckCircle /> },
      ];
    }
    return [
      { key: 'pending', label: 'Pesanan Dibuat', icon: <FiClock /> },
      { key: 'paid', label: 'Pembayaran Dikonfirmasi', icon: <FiCreditCard /> },
      { key: 'shipped', label: 'Pesanan Dikirim', icon: <FiTruck /> },
      { key: 'delivered', label: 'Pesanan Diterima', icon: <FiCheckCircle /> },
    ];
  };

  const getStepIndex = (status, deliveryMethod) => {
    if (deliveryMethod === 'pickup') {
      const map = { pending: 0, paid: 1, delivered: 2 };
      return map[status] ?? -1;
    }
    const map = { pending: 0, paid: 1, shipped: 2, delivered: 3 };
    return map[status] ?? -1;
  };

  const getStatusMessage = (order) => {
    const isPickup = order.delivery_method === 'pickup';

    if (order.status === 'paid' && isPickup) {
      return {
        text: 'Pembayaran sudah dikonfirmasi. Silakan ambil pesanan Anda di toko.',
        bg: 'bg-amber-50 border-amber-200',
        color: 'text-amber-700',
        icon: <FiHome className="w-5 h-5 text-amber-500" />,
      };
    }
    if (order.status === 'paid' && !isPickup) {
      return {
        text: 'Pembayaran sudah dikonfirmasi. Pesanan akan segera dikirim ke alamat Anda.',
        bg: 'bg-blue-50 border-blue-200',
        color: 'text-blue-700',
        icon: <FiTruck className="w-5 h-5 text-blue-500" />,
      };
    }
    if (order.status === 'shipped') {
      return {
        text: 'Pesanan sedang dalam perjalanan. Kurir akan menghubungi nomor telepon Anda.',
        bg: 'bg-purple-50 border-purple-200',
        color: 'text-purple-700',
        icon: <FiTruck className="w-5 h-5 text-purple-500" />,
      };
    }
    if (order.status === 'delivered' && isPickup) {
      return {
        text: 'Pesanan telah diambil. Terima kasih telah berbelanja!',
        bg: 'bg-green-50 border-green-200',
        color: 'text-green-700',
        icon: <FiCheckCircle className="w-5 h-5 text-green-500" />,
      };
    }
    if (order.status === 'delivered' && !isPickup) {
      return {
        text: 'Pesanan telah diterima. Terima kasih telah berbelanja!',
        bg: 'bg-green-50 border-green-200',
        color: 'text-green-700',
        icon: <FiCheckCircle className="w-5 h-5 text-green-500" />,
      };
    }
    return null;
  };

  if (loading) return <LoadingSpinner message="Memuat detail pesanan..." />;
  if (!order) return null;

  const isPickup = order.delivery_method === 'pickup';
  const timelineSteps = getTimelineSteps(order.delivery_method);
  const currentStep = getStepIndex(order.status, order.delivery_method);
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';
  const statusMessage = getStatusMessage(order);

  return (
    <div className="pt-6 px-4 pb-12">
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
                {formatDate(order.created_at)}
              </p>
            </div>
            {isCancelled ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                <FiXCircle className="w-4 h-4" />
                Dibatalkan
              </span>
            ) : isDelivered ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                <FiCheckCircle className="w-4 h-4" />
                Selesai
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                <FiClock className="w-4 h-4" />
                Berlangsung
              </span>
            )}
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            {isPickup ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold">
                <FiHome className="w-4 h-4" />
                Ambil di Toko
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                <FiTruck className="w-4 h-4" />
                Kirim ke Alamat
              </span>
            )}

            {/* Tombol Lihat Struk */}
            <button
              onClick={() => setShowReceipt(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-dustyRose text-white text-sm font-semibold hover:bg-coral transition-all"
            >
              <FiPrinter className="w-4 h-4" />
              Lihat Struk
            </button>
          </div>

          {statusMessage && !isCancelled && (
            <div className={`p-4 rounded-xl border ${statusMessage.bg} mb-4`}>
              <div className="flex items-start gap-3">
                {statusMessage.icon}
                <p className={`text-sm ${statusMessage.color}`}>
                  {statusMessage.text}
                </p>
              </div>
            </div>
          )}

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

        {/* Kotak info khusus per metode */}
        {isPickup ? (
          <div className="glass rounded-2xl p-6 mb-6 border-l-4 border-amber-400">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FiHome className="text-amber-500" />
              Informasi Pengambilan
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="text-gray-500">Lokasi:</span>{' '}
                <span className="font-medium">{order.pickup_location || 'Toko Urban Knitters'}</span>
              </p>
              <p>
                <span className="text-gray-500">Alamat:</span>{' '}
                Jl Rajut Indah No. 123, Jakarta
              </p>
              <p>
                <span className="text-gray-500">Jam Operasional:</span>{' '}
                08.00 - 20.00 WIB
              </p>
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <FiInfo className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Silakan tunjukkan nomor pesanan <strong>{order.order_number}</strong> ke petugas toko saat mengambil pesanan.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-6 mb-6 border-l-4 border-blue-400">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FiTruck className="text-blue-500" />
              Informasi Pengiriman
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="text-gray-500">Penerima:</span>{' '}
                <span className="font-medium">{order.customer_name}</span>
              </p>
              <p>
                <span className="text-gray-500">Telepon:</span>{' '}
                {order.customer_phone}
              </p>
              <p>
                <span className="text-gray-500">Alamat Pengiriman:</span>
              </p>
              <p className="font-medium text-gray-800 pl-2">
                {order.delivery_address || 'Alamat tidak tersedia'}
              </p>
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <FiInfo className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  {order.status === 'shipped'
                    ? 'Kurir akan menghubungi nomor telepon Anda saat paket tiba di lokasi.'
                    : order.status === 'delivered'
                    ? 'Pesanan sudah diterima. Terima kasih telah berbelanja!'
                    : 'Pesanan akan segera dikirim setelah pembayaran dikonfirmasi.'}
                </p>
              </div>
            </div>
          </div>
        )}

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
          <h3 className="font-semibold text-gray-800 mb-4">Informasi Pemesan</h3>
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
              <FiCreditCard className="w-5 h-5 text-dustyRose mt-0.5" />
              <div>
                <p className="text-gray-500">Metode Pembayaran</p>
                <p className="font-medium text-gray-800">
                  {paymentLabel(order.payment_method)}
                </p>
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

      {/* Modal Struk */}
      <AnimatePresence>
        {showReceipt && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setShowReceipt(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="glass rounded-2xl p-6 shadow-2xl border border-white/50 relative">
                <button
                  onClick={() => setShowReceipt(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>

                <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
                  Struk Pesanan
                </h3>

                <div className="bg-white p-4 rounded-lg border border-dashed border-gray-300 text-xs font-mono mb-4 max-h-80 overflow-y-auto">
                  <div className="text-center mb-2">
                    <p className="font-bold">Urban Knitters</p>
                    <p className="text-gray-500">Toko Rajut Handmade</p>
                  </div>
                  <div className="border-t border-dashed border-gray-300 my-2"></div>
                  <div className="flex justify-between"><span>No</span><span>{order.order_number}</span></div>
                  <div className="flex justify-between"><span>Tgl</span><span>{formatDate(order.created_at)}</span></div>
                  <div className="flex justify-between"><span>Nama</span><span>{order.customer_name}</span></div>
                  <div className="flex justify-between"><span>Telp</span><span>{order.customer_phone}</span></div>
                  <div className="flex justify-between"><span>Kirim</span><span>{deliveryLabel(order.delivery_method)}</span></div>
                  <div className="flex justify-between"><span>Bayar</span><span>{paymentLabel(order.payment_method)}</span></div>
                  <div className="border-t border-dashed border-gray-300 my-2"></div>
                  {items.map((it, i) => (
                    <div key={i} className="mb-1">
                      <p>{it.product_name}</p>
                      <div className="flex justify-between text-gray-500">
                        <span>{it.quantity} x {formatPrice(it.price)}</span>
                        <span>{formatPrice(it.subtotal)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-dashed border-gray-300 my-2"></div>
                  <div className="flex justify-between font-bold">
                    <span>TOTAL</span>
                    <span>{formatPrice(order.total_amount)}</span>
                  </div>
                  <div className="text-center mt-3 text-gray-500">
                    Terima kasih!
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePrintReceipt}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-dustyRose text-white rounded-lg hover:bg-coral font-semibold"
                  >
                    <FiPrinter /> Cetak Struk
                  </button>
                  <button
                    onClick={() => setShowReceipt(false)}
                    className="px-4 py-2.5 bg-white/60 text-gray-700 rounded-lg hover:bg-white/80 font-semibold border border-white/40"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderDetailPage;