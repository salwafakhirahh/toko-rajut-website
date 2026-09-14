import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getCart, createOrder, clearCart, supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { calculateSubtotal, calculateFinalPrice } from '../utils/priceHelper';
import CheckoutForm from '../components/checkout/CheckoutForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

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

  const handleCheckout = async (data) => {
    const loadingToast = toast.loading('Memproses pesanan...');

    try {
      const total = cartItems.reduce(
        (sum, item) => sum + calculateSubtotal(item.products, item.quantity),
        0
      );

      const order = {
        user_id: user.id,
        order_number: `ORD-${Date.now()}`,
        total_amount: total,
        status: 'pending',
        delivery_method: data.method,
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

      toast.success('Pesanan berhasil dibuat!', { id: loadingToast });
      setTimeout(() => navigate('/toko'), 2000);
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
    <div className="pt-6 px-4">
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