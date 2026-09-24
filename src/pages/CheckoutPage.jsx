import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  getCart,
  createOrder,
  clearCart,
  supabase,
  getAddresses,
  addAddress,
  getPickupContacts,
  addPickupContact,
} from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { calculateSubtotal, calculateFinalPrice } from '../utils/priceHelper';
import CheckoutForm from '../components/checkout/CheckoutForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

const formatPrice = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

const paymentLabel = (method) => {
  switch (method) {
    case 'cod': return 'Cash on Delivery (COD)';
    case 'transfer': return 'Transfer Bank';
    case 'ewallet': return 'E-Wallet';
    default: return method || '-';
  }
};

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      toast.error('Admin tidak dapat melakukan checkout');
      setTimeout(() => navigate('/toko/admin/dashboard'), 1500);
      return;
    }
    if (!user) {
      toast.error('Silakan login terlebih dahulu untuk checkout');
      setTimeout(() => navigate('/toko/login'), 1500);
      return;
    }
    fetchCart();
  }, [user, isAdmin, navigate]);

  const fetchCart = async () => {
    try {
      const data = await getCart(user.id);
      setCartItems(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (data) => {
    if (!data.name || !data.name.trim()) {
      toast.error('Nama penerima wajib diisi');
      return false;
    }
    if (!data.phone || !data.phone.trim()) {
      toast.error('Nomor telepon wajib diisi');
      return false;
    }
    if (!/^[0-9+\-\s]{8,20}$/.test(data.phone.trim())) {
      toast.error('Format nomor telepon tidak valid');
      return false;
    }
    if (!data.method) {
      toast.error('Pilih metode pengiriman');
      return false;
    }
    if (data.method === 'delivery' && (!data.address || !data.address.trim())) {
      toast.error('Alamat pengiriman wajib diisi');
      return false;
    }
    if (!data.paymentMethod) {
      toast.error('Pilih metode pembayaran');
      return false;
    }
    if (cartItems.length === 0) {
      toast.error('Keranjang masih kosong');
      return false;
    }
    return true;
  };

  // Otomatis simpan data yang diisi manual ke daftar tersimpan
  const autoSaveCustomerData = async (data) => {
    if (!user) return;

    try {
      if (data.method === 'delivery') {
        const existing = await getAddresses(user.id);
        const isDuplicate = existing.some(
          (a) =>
            a.address?.trim().toLowerCase() === data.address.trim().toLowerCase() &&
            a.phone?.trim() === data.phone.trim()
        );

        if (!isDuplicate) {
          await addAddress({
            user_id: user.id,
            label: existing.length === 0 ? 'Rumah' : `Alamat ${existing.length + 1}`,
            recipient_name: data.name.trim(),
            phone: data.phone.trim(),
            address: data.address.trim(),
            is_default: existing.length === 0,
          });
        }
      } else if (data.method === 'pickup') {
        const existing = await getPickupContacts(user.id);
        const isDuplicate = existing.some(
          (c) =>
            c.name?.trim().toLowerCase() === data.name.trim().toLowerCase() &&
            c.phone?.trim() === data.phone.trim()
        );

        if (!isDuplicate) {
          await addPickupContact({
            user_id: user.id,
            label: existing.length === 0 ? 'Diri Sendiri' : `Kontak ${existing.length + 1}`,
            name: data.name.trim(),
            phone: data.phone.trim(),
            notes: data.message || '',
            is_default: existing.length === 0,
          });
        }
      }
    } catch (saveError) {
      // Jangan gagalkan checkout kalau auto-save bermasalah
      console.warn('Auto-save data customer gagal:', saveError);
    }
  };

  const handleCheckout = async (data) => {
    if (!validateForm(data)) return;

    const loadingToast = toast.loading('Memproses pesanan...');

    try {
      const total = cartItems.reduce(
        (sum, item) => sum + calculateSubtotal(item.products, item.quantity),
        0
      );

      const orderNumber = `ORD-${Date.now()}`;

      const order = {
        user_id: user.id,
        order_number: orderNumber,
        total_amount: total,
        status: 'pending',
        delivery_method: data.method,
        payment_method: data.paymentMethod,
        pickup_location: data.method === 'pickup' ? 'Toko Rajut' : null,
        delivery_address: data.method === 'delivery' ? data.address : null,
        customer_name: data.name,
        customer_phone: data.phone,
        customer_message: data.message || '',
      };

      const savedOrder = await createOrder(order);

      for (const item of cartItems) {
        const finalPrice = calculateFinalPrice(item.products);
        const subtotal = finalPrice * item.quantity;

        await supabase
          .from('order_items')
          .insert([{
            order_id: savedOrder.id,
            product_id: item.product_id,
            product_name: item.products.name,
            quantity: item.quantity,
            price: finalPrice,
            subtotal: subtotal,
          }]);
      }

      await clearCart(user.id);

      // Otomatis simpan alamat atau kontak kalau belum tersimpan
      await autoSaveCustomerData(data);

      const totalItem = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const methodLabel = data.method === 'pickup' ? 'Ambil di Toko' : 'Kirim ke Alamat';

      toast.success(
        () => (
          <div className="text-sm">
            <p className="font-bold text-dustyRose mb-1">Pesanan Berhasil Dibuat!</p>
            <p className="mb-1">
              <span className="text-gray-500">No. Pesanan:</span>{' '}
              <span className="font-mono font-semibold">{orderNumber}</span>
            </p>
            <p className="mb-1">
              <span className="text-gray-500">Nama:</span>{' '}
              <span className="font-semibold">{data.name}</span>
            </p>
            <p className="mb-1">
              <span className="text-gray-500">Metode:</span>{' '}
              <span className="font-semibold">{methodLabel}</span>
            </p>
            <p className="mb-1">
              <span className="text-gray-500">Pembayaran:</span>{' '}
              <span className="font-semibold">{paymentLabel(data.paymentMethod)}</span>
            </p>
            <p className="mb-1">
              <span className="text-gray-500">Total Item:</span>{' '}
              <span className="font-semibold">{totalItem} pcs</span>
            </p>
            <p className="mb-0">
              <span className="text-gray-500">Total Bayar:</span>{' '}
              <span className="font-bold text-dustyRose">{formatPrice(total)}</span>
            </p>
          </div>
        ),
        { id: loadingToast, duration: 6000 }
      );

      setTimeout(() => navigate('/toko/orders'), 2500);
    } catch (error) {
      toast.error('Gagal checkout: ' + error.message, { id: loadingToast });
    }
  };

  if (loading) return <LoadingSpinner message="Memuat checkout..." />;

  if (isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 pt-20">
        <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Mode Admin</h2>
          <p className="text-gray-600">Mengalihkan ke Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 pt-20">
        <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
          <FiLock className="w-8 h-8 text-dustyRose mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Diperlukan</h2>
          <p className="text-gray-600 mb-6">Silakan login untuk checkout.</p>
          <button
            onClick={() => navigate('/toko/login')}
            className="w-full py-3 bg-dustyRose text-white rounded-lg hover:bg-coral"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const total = cartItems.reduce(
    (sum, item) => sum + calculateSubtotal(item.products, item.quantity),
    0
  );

  return (
    <div className="pt-6 px-4 pb-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          <span className="text-gray-800">Checkout</span>
        </h1>
        <CheckoutForm cartItems={cartItems} total={total} onSuccess={handleCheckout} />
      </div>
    </div>
  );
};

export default CheckoutPage;