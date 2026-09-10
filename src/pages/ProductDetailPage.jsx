import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiArrowLeft, FiMinus, FiPlus, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getProductById, addToCart } from '../services/supabaseClient';
import { getGuestId } from '../utils/guestId';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await getProductById(id);
      setProduct(data);
    } catch (error) {
      toast.error('Produk tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const loadingToast = toast.loading('Menambahkan ke keranjang...');
    try {
      await addToCart({
        user_id: getGuestId(),
        product_id: product.id,
        quantity: quantity,
      });
      toast.success(`${product.name} ditambahkan ke keranjang!`, { id: loadingToast });
    } catch (error) {
      toast.error('Gagal menambahkan: ' + error.message, { id: loadingToast });
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    setTimeout(() => navigate('/toko/cart'), 1000);
  };

  if (loading) return <LoadingSpinner message="Memuat produk..." />;
  if (!product) return <div className="pt-20 text-center">Produk tidak ditemukan</div>;

  const price = product.price || 0;
  const discount = product.discount || 0;
  const finalPrice = price - (price * discount / 100);
  const hasDiscount = discount > 0;

  return (
    <div className="pt-6 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-dustyRose mb-6"
        >
          <FiArrowLeft /> Kembali
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative">
            {hasDiscount && (
              <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                Diskon {discount}%
              </div>
            )}
            <img
              src={product.image_url || `https://picsum.photos/500/500?random=${product.id}`}
              alt={product.name}
              className="w-full rounded-2xl shadow-xl"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <FiStar className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold">{product.rating || 0}</span>
              <span className="text-sm text-gray-500">({product.total_reviews || 0} ulasan)</span>
            </div>

            <div className="mb-4">
              {hasDiscount ? (
                <>
                  <p className="text-sm line-through text-gray-400">
                    Rp {price.toLocaleString('id-ID')}
                  </p>
                  <div className="flex items-center gap-3">
                    <p className="text-3xl font-bold text-dustyRose">
                      Rp {finalPrice.toLocaleString('id-ID')}
                    </p>
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      Hemat Rp {(price - finalPrice).toLocaleString('id-ID')}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-3xl font-bold text-dustyRose">
                  Rp {price.toLocaleString('id-ID')}
                </p>
              )}
            </div>

            <div className="space-y-2 mb-6 text-gray-700">
              <p><span className="font-medium">Kategori:</span> {product.categories?.name || '-'}</p>
              <p><span className="font-medium">Stok:</span> {product.stock}</p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Deskripsi</h3>
              <p className="text-gray-600">{product.description || 'Tidak ada deskripsi.'}</p>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="font-medium">Jumlah:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 bg-white/30 rounded-full hover:bg-white/50"
                >
                  <FiMinus />
                </button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 bg-white/30 rounded-full hover:bg-white/50"
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 bg-white/40 backdrop-blur-md text-gray-800 rounded-lg hover:bg-white/60 transition-all flex items-center justify-center gap-2 border border-white/40"
              >
                <FiShoppingCart /> Tambah Keranjang
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 py-3 bg-dustyRose text-white rounded-lg hover:bg-coral transition-all font-semibold"
              >
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;