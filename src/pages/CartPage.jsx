import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getCart, updateCartItem, removeFromCart } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import CartItem from '../components/customer/CartItem';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { calculateSubtotal } from '../utils/priceHelper';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      toast.error('Admin tidak dapat mengakses keranjang');
      setTimeout(() => navigate('/toko/admin/dashboard'), 1500);
      return;
    }
    if (!user) {
      setLoading(false);
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

  if (loading) return <LoadingSpinner message="Memuat keranjang..." />;

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 pt-20">
        <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-dustyRose/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLock className="w-8 h-8 text-dustyRose" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Diperlukan</h2>
          <p className="text-gray-600 mb-6">
            Silakan login untuk melihat keranjang belanja Anda.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/toko/login')}
              className="w-full py-3 bg-dustyRose text-white rounded-lg hover:bg-coral transition-all font-semibold"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/toko/register')}
              className="w-full py-3 bg-white/40 text-gray-700 rounded-lg hover:bg-white/60 transition-all font-semibold border border-white/40"
            >
              Daftar Akun Baru
            </button>
          </div>
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