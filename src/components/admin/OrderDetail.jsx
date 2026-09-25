import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiPrinter, FiPackage, FiUser, FiMapPin,
  FiCreditCard, FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout';
import { getOrderDetailById } from '../../services/reportService';
import StatusBadge from '../common/StatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
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

  const handlePrintReceipt = () => {
    if (!order || items.length === 0) {
      toast.error('Data struk tidak tersedia');
      return;
    }

    const itemsRows = items
      .map(
        (it) => `
        <tr>
          <td>${it.product_name}</td>
          <td style="text-align:center">${it.quantity}</td>
          <td style="text-align:right">${formatPrice(it.price)}</td>
          <td style="text-align:right">${formatPrice(it.subtotal)}</td>
        </tr>`
      )
      .join('');

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
          <tbody>${itemsRows}</tbody>
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
          {/* Tombol Lihat Struk (buka modal preview) */}
          <button
            onClick={() => setShowReceipt(true)}
            className="flex items-center gap-2 bg-white/60 text-dustyRose px-4 py-2 rounded-lg hover:bg-white/80 border border-dustyRose/30 shadow-md font-semibold transition-all"
          >
            <FiPackage /> Lihat Struk
          </button>

          {/* Tombol Cetak Struk (langsung print) */}
          <button
            onClick={handlePrintReceipt}
            className="flex items-center gap-2 bg-dustyRose text-white px-4 py-2 rounded-lg hover:bg-coral shadow-md"
          >
            <FiPrinter /> Cetak Struk
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

      {/* Modal Preview Struk */}
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
                  Preview Struk
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
                  {order.delivery_method === 'delivery' && order.delivery_address && (
                    <div className="flex justify-between gap-2">
                      <span>Alamat</span>
                      <span className="text-right">{order.delivery_address}</span>
                    </div>
                  )}
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
    </AdminLayout>
  );
};

export default OrderDetail;