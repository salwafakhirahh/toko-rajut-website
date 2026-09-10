import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getCart, updateCartItem, removeFromCart } from '../services/supabaseClient';
import { useAuth } from './contexts/AuthContext';
import CartItem from '../components/customer/CartItem';
import LoadingSpinner from '../components/common/LoadingSpinner';

const GUEST_ID = '00000000-0000-0000-0000-000000000000';

const CartPage = () => {
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

  const handleUpdateQuantity = async (id, quantity) => {
    if (quantity < 1) return;
    try {
      await updateCartItem(id, quantity);
      fetchCart();
    } catch (error) {
      toast.error('Gagal update: ' + error.message);
    }
  };

  const handleRemove = async (id) => {
    const loadingToast = toast.loading('Menghapus...');
    try {
      await removeFromCart(id);
      fetchCart();
      toast.success('Produk dihapus dari keranjang', { id: loadingToast });
    } catch (error) {
      toast.error('Gagal menghapus: ' + error.message, { id: loadingToast });
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + (item.products?.price || 0) * item.quantity,
    0
  );

  if (loading) return <LoadingSpinner message="Memuat keranjang..." />;

  return (
    <div className="pt-6 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          <span className="text-gray-800">Keranjang</span>
          <span className="text-dustyRose"> Belanja</span>
        </h1>

        {cartItems.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <FiShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-6">Keranjang Anda masih kosong</p>
            <button
              onClick={() => navigate('/toko/products')}
              className="bg-dustyRose text-white px-6 py-2 rounded-full hover:bg-coral"
            >
              Mulai Belanja
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-dustyRose">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>
              <button
                onClick={() => navigate('/toko/checkout')}
                className="w-full py-3 bg-dustyRose text-white rounded-lg hover:bg-coral transition-all font-semibold"
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;