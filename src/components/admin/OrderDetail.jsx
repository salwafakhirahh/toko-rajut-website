import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiPrinter, FiPackage, FiUser, FiMapPin, FiCreditCard
} from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import { getOrderDetailById } from '../../services/reportService';
import StatusBadge from '../common/StatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import ReceiptModal from './ReceiptModal';
import toast from 'react-hot-toast';

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

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const { order: orderData, items: itemsData } = await getOrderDetailById(id);
      setOrder(orderData);
      setItems(itemsData);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat detail transaksi');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  const formatDate = (s) =>
    s
      ? new Date(s).toLocaleString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '-';

  if (loading) return <LoadingSpinner message="Memuat detail transaksi..." />;

  if (!order) {
    return (
      <AdminLayout>
        <div className="admin-card text-center py-12">
          <p className="text-gray-600">Transaksi tidak ditemukan</p>
          <Link
            to="/toko/admin/reports"
            className="inline-block mt-4 px-4 py-2 bg-dustyRose text-white rounded-lg hover:bg-coral"
          >
            Kembali
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-dustyRose mb-4 transition-colors"
      >
        <FiArrowLeft /> Kembali
      </button>

      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Detail Transaksi</h1>
          <p className="text-sm text-gray-600 mt-1 font-mono">{order.order_number}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Tombol Struk — buka modal dengan aksi Print & Save PDF */}
          <button
            onClick={() => setShowReceipt(true)}
            className="flex items-center gap-2 bg-dustyRose text-white px-4 py-2 rounded-lg hover:bg-coral shadow-md font-semibold transition-all"
          >
            <FiPrinter /> Struk
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="admin-card">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <FiUser className="text-dustyRose" /> Informasi Pelanggan
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Nama</span>
              <span className="font-medium text-gray-800 text-right">
                {order.customer_name || '-'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Telepon</span>
              <span className="font-medium text-gray-800 text-right">
                {order.customer_phone || '-'}
              </span>
            </div>
            {order.customer_message && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Catatan</span>
                <span className="font-medium text-gray-800 text-right">
                  {order.customer_message}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="admin-card">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <FiPackage className="text-dustyRose" /> Info Pesanan
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Tanggal</span>
              <span className="font-medium text-gray-800 text-right">
                {formatDate(order.created_at)}
              </span>
            </div>
            <div className="flex justify-between gap-4 items-center">
              <span className="text-gray-500">Status</span>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Pengiriman</span>
              <span className="font-medium text-gray-800 text-right">
                {deliveryLabel(order.delivery_method)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Pembayaran</span>
              <span className="font-medium text-gray-800 text-right">
                {paymentLabel(order.payment_method)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {order.delivery_method === 'delivery' && order.delivery_address && (
        <div className="admin-card mb-6">
          <h2 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
            <FiMapPin className="text-dustyRose" /> Alamat Pengiriman
          </h2>
          <p className="text-sm text-gray-700">{order.delivery_address}</p>
        </div>
      )}

      <div className="admin-card">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiCreditCard className="text-dustyRose" /> Daftar Produk
        </h2>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="w-12 text-center">No</th>
                <th>Produk</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Harga</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, index) => (
                <tr key={it.id}>
                  <td className="text-center">{index + 1}</td>
                  <td className="font-medium">{it.product_name}</td>
                  <td className="text-center">{it.quantity}</td>
                  <td className="text-right">{formatPrice(it.price)}</td>
                  <td className="text-right font-semibold text-dustyRose">
                    {formatPrice(it.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="text-right font-bold">
                  Total
                </td>
                <td className="text-right font-bold text-dustyRose">
                  {formatPrice(order.total_amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal Struk dengan tombol Print & Save PDF */}
      <ReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        order={order}
        items={items}
      />
    </AdminLayout>
  );
};

export default OrderDetail;