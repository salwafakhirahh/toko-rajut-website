import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCart, createOrder, clearCart } from '../services/supabaseClient';
import { useAuth } from './contexts/AuthContext';
import CheckoutForm from '../components/checkout/CheckoutForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

const GUEST_ID = '00000000-0000-0000-0000-000000000000';

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const userId = user?.id || GUEST_ID;

  useEffect(() => {
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const data = await getCart(userId);
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
        (sum, item) => sum + (item.products?.price || 0) * item.quantity,
        0
      );

      const order = {
        user_id: userId,
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

      await createOrder(order);
      await clearCart(userId);

      toast.success('Pesanan berhasil dibuat!', { id: loadingToast });
      setTimeout(() => navigate('/toko'), 2000);
    } catch (error) {
      toast.error('Gagal checkout: ' + error.message, { id: loadingToast });
    }
  };

  if (loading) return <LoadingSpinner message="Memuat checkout..." />;

  const total = cartItems.reduce(
    (sum, item) => sum + (item.products?.price || 0) * item.quantity,
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