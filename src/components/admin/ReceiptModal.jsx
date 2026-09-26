import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPrinter, FiDownload, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

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

const ReceiptModal = ({ isOpen, onClose, order, items }) => {
  if (!isOpen || !order) return null;

  const buildReceiptHTML = () => {
    const itemsRows = (items || [])
      .map(
        (it) => `
        <tr>
          <td>${it.product_name || '-'}</td>
          <td style="text-align:center">${it.quantity}</td>
          <td style="text-align:right">${formatPrice(it.price)}</td>
          <td style="text-align:right">${formatPrice(it.subtotal)}</td>
        </tr>`
      )
      .join('');

    return `
      <html>
      <head>
        <title>Struk ${order.order_number || ''}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            max-width: 360px;
            margin: 0 auto;
            color: #333;
            background: white;
          }
          h1 { font-size: 18px; text-align: center; margin: 0 0 4px 0; letter-spacing: 1px; }
          .subtitle { text-align: center; font-size: 12px; color: #666; margin-bottom: 12px; }
          .divider { border-top: 1px dashed #999; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; font-size: 12px; margin: 3px 0; gap: 8px; }
          .label { color: #666; flex-shrink: 0; }
          .value { text-align: right; word-break: break-word; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
          th, td { padding: 4px 0; text-align: left; vertical-align: top; }
          th { border-bottom: 1px solid #999; font-size: 11px; }
          .total { font-size: 14px; font-weight: bold; margin-top: 8px; display: flex; justify-content: space-between; }
          .footer { text-align: center; font-size: 11px; color: #888; margin-top: 16px; line-height: 1.6; }
          .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            background: #f3f4f6;
            color: #374151;
          }
        </style>
      </head>
      <body>
        <h1>URBAN KNITTERS</h1>
        <div class="subtitle">Toko Rajut Handmade</div>
        <div class="subtitle" style="margin-top:-8px">Jl. Contoh No. 123 &middot; 0812-3456-7890</div>

        <div class="divider"></div>

        <div class="row"><span class="label">No Pesanan</span><span class="value">${order.order_number || '-'}</span></div>
        <div class="row"><span class="label">Tanggal</span><span class="value">${formatDate(order.created_at)}</span></div>
        <div class="row"><span class="label">Pelanggan</span><span class="value">${order.customer_name || '-'}</span></div>
        <div class="row"><span class="label">Telepon</span><span class="value">${order.customer_phone || '-'}</span></div>
        <div class="row"><span class="label">Pengiriman</span><span class="value">${deliveryLabel(order.delivery_method)}</span></div>
        <div class="row"><span class="label">Pembayaran</span><span class="value">${paymentLabel(order.payment_method)}</span></div>
        <div class="row"><span class="label">Status</span><span class="value"><span class="status-badge">${order.status || '-'}</span></span></div>
        ${
          order.delivery_method === 'delivery' && order.delivery_address
            ? `<div class="row"><span class="label">Alamat</span><span class="value">${order.delivery_address}</span></div>`
            : ''
        }
        ${
          order.customer_message
            ? `<div class="row"><span class="label">Catatan</span><span class="value">${order.customer_message}</span></div>`
            : ''
        }

        <div class="divider"></div>

        <table>
          <thead>
            <tr>
              <th>Produk</th>
              <th style="text-align:center">Qty</th>
              <th style="text-align:right">Harga</th>
              <th style="text-align:right">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>

        <div class="divider"></div>
        <div class="total">
          <span>TOTAL</span>
          <span>${formatPrice(order.total_amount)}</span>
        </div>
        <div class="divider"></div>

        <div class="footer">
          <div>Terima kasih telah berbelanja</div>
          <div>Barang yang sudah dibeli tidak dapat dikembalikan</div>
          <div style="margin-top:8px; font-size:10px;">Struk ini dicetak otomatis oleh sistem</div>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const html = buildReceiptHTML();
    const win = window.open('', '_blank', 'width=400,height=600');
    if (!win) {
      toast.error('Popup diblokir browser. Izinkan popup lalu coba lagi.');
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 300);
    toast.success('Dialog cetak dibuka', { duration: 3000 });
  };

  const handleSavePDF = () => {
    toast.success(
      'Pilih "Save as PDF" pada dialog, lalu klik Save untuk menyimpan.',
      { duration: 6000 }
    );
    setTimeout(() => handlePrint(), 800);
  };

  return (
    <AnimatePresence>
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
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="glass rounded-2xl p-6 shadow-2xl border border-white/50 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
          >
            <FiX className="w-5 h-5" />
          </button>

          <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
            Preview Struk
          </h3>

          <div className="bg-white p-4 rounded-lg border border-dashed border-gray-300 text-xs font-mono mb-4 max-h-80 overflow-y-auto">
            <div className="text-center mb-2">
              <p className="font-bold tracking-wide">URBAN KNITTERS</p>
              <p className="text-gray-500 text-[10px]">Toko Rajut Handmade</p>
            </div>
            <div className="border-t border-dashed border-gray-300 my-2"></div>

            <div className="flex justify-between gap-2"><span className="text-gray-500">No</span><span>{order.order_number}</span></div>
            <div className="flex justify-between gap-2"><span className="text-gray-500">Tgl</span><span>{formatDate(order.created_at)}</span></div>
            <div className="flex justify-between gap-2"><span className="text-gray-500">Nama</span><span>{order.customer_name || '-'}</span></div>
            <div className="flex justify-between gap-2"><span className="text-gray-500">Telp</span><span>{order.customer_phone || '-'}</span></div>
            <div className="flex justify-between gap-2"><span className="text-gray-500">Kirim</span><span>{deliveryLabel(order.delivery_method)}</span></div>
            <div className="flex justify-between gap-2"><span className="text-gray-500">Bayar</span><span>{paymentLabel(order.payment_method)}</span></div>

            {order.delivery_method === 'delivery' && order.delivery_address && (
              <div className="flex justify-between gap-2">
                <span className="text-gray-500">Alamat</span>
                <span className="text-right">{order.delivery_address}</span>
              </div>
            )}

            <div className="border-t border-dashed border-gray-300 my-2"></div>

            {items && items.map((it, i) => (
              <div key={i} className="mb-1.5">
                <p className="font-medium">{it.product_name}</p>
                <div className="flex justify-between text-gray-500 text-[11px]">
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
            <div className="text-center mt-3 text-gray-500 text-[10px]">
              Terima kasih
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-dustyRose text-white rounded-lg hover:bg-coral font-semibold shadow-md transition-all"
            >
              <FiPrinter className="w-4 h-4" />
              Cetak / Print
            </button>
            <button
              onClick={handleSavePDF}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold shadow-md transition-all"
            >
              <FiDownload className="w-4 h-4" />
              Simpan PDF
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-2 py-2.5 bg-white/60 text-gray-700 rounded-lg hover:bg-white/80 font-semibold border border-white/40"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReceiptModal;