import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart, FiArrowLeft, FiMinus, FiPlus,
  FiStar, FiInfo, FiEdit2, FiTrash2, FiLogIn,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  getProductById,
  addToCart,
  getProductReviews,
  getProductRatingSummary,
  getMyReviewForProduct,
  canUserReviewProduct,
  getDeliveredOrderIdForProduct,
  deleteReview,
} from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RatingStars from '../components/customer/RatingStars';
import ReviewModal from '../components/customer/ReviewModal';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({ average: 0, count: 0 });
  const [myReview, setMyReview] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [deliveredOrderId, setDeliveredOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    fetchAll();
  }, [id, user?.id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const productData = await getProductById(id);
      setProduct(productData);

      const [reviewsData, summary] = await Promise.all([
        getProductReviews(id),
        getProductRatingSummary(id),
      ]);
      setReviews(reviewsData);
      setRatingSummary(summary);

      if (user && !isAdmin) {
        const [myRev, eligible] = await Promise.all([
          getMyReviewForProduct(user.id, id),
          canUserReviewProduct(user.id, id),
        ]);
        setMyReview(myRev);
        setCanReview(eligible);

        if (eligible && !myRev) {
          const orderId = await getDeliveredOrderIdForProduct(user.id, id);
          setDeliveredOrderId(orderId);
        }
      } else {
        setMyReview(null);
        setCanReview(false);
        setDeliveredOrderId(null);
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (isAdmin) {
      toast.error('Admin tidak dapat membeli produk');
      return;
    }
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      setTimeout(() => navigate('/toko/login'), 1000);
      return;
    }
    const loadingToast = toast.loading('Menambahkan ke keranjang...');
    try {
      await addToCart({ user_id: user.id, product_id: product.id, quantity });
      toast.success(`${product.name} ditambahkan ke keranjang!`, { id: loadingToast });
    } catch (error) {
      toast.error('Gagal menambahkan: ' + error.message, { id: loadingToast });
    }
  };

  const handleBuyNow = async () => {
    if (isAdmin) {
      toast.error('Admin tidak dapat membeli produk');
      return;
    }
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      setTimeout(() => navigate('/toko/login'), 1000);
      return;
    }
    await handleAddToCart();
    setTimeout(() => navigate('/toko/cart'), 1000);
  };

  const handleOpenReview = () => {
    setEditingReview(myReview || null);
    setShowReviewModal(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Yakin ingin menghapus ulasan ini?')) return;
    try {
      await deleteReview(reviewId);
      toast.success('Ulasan berhasil dihapus');
      fetchAll();
    } catch (error) {
      toast.error('Gagal menghapus ulasan');
    }
  };

  if (loading) return <LoadingSpinner message="Memuat produk..." />;
  if (!product) return <div className="pt-20 text-center">Produk tidak ditemukan</div>;

  const price = product.price || 0;
  const discount = product.discount || 0;
  const finalPrice = price - (price * discount / 100);
  const hasDiscount = discount > 0;

  return (
    <div className="pt-6 px-4 pb-16">
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

            <div className="flex items-center gap-3 mb-4">
              <RatingStars
                rating={ratingSummary.average}
                size="md"
                showNumber
                showCount
                count={ratingSummary.count}
              />
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

            {isAdmin ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                <div className="flex items-start gap-3">
                  <FiInfo className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-700 text-sm">Mode Admin</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Anda login sebagai admin. Admin tidak dapat membeli produk.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-medium">Jumlah:</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 bg-white/30 rounded-full hover:bg-white/50">
                      <FiMinus />
                    </button>
                    <span className="w-12 text-center font-bold">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-2 bg-white/30 rounded-full hover:bg-white/50">
                      <FiPlus />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 mb-8">
                  <button onClick={handleAddToCart} className="flex-1 py-3 bg-white/40 backdrop-blur-md text-gray-800 rounded-lg hover:bg-white/60 flex items-center justify-center gap-2 border border-white/40">
                    <FiShoppingCart /> Tambah Keranjang
                  </button>
                  <button onClick={handleBuyNow} className="flex-1 py-3 bg-dustyRose text-white rounded-lg hover:bg-coral font-semibold">
                    Beli Sekarang
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-12">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
              <FiStar className="text-yellow-400 fill-yellow-400" />
              Ulasan ({reviews.length})
            </h3>

            {!isAdmin && user && canReview && !myReview && (
              <button onClick={handleOpenReview} className="px-4 py-2 bg-dustyRose text-white rounded-full hover:bg-coral font-semibold text-sm">
                Tulis Ulasan
              </button>
            )}

            {!isAdmin && user && myReview && (
              <div className="flex gap-2">
                <button onClick={handleOpenReview} className="flex items-center gap-1 px-4 py-2 bg-white/60 border border-white/40 rounded-full hover:bg-white/80 text-sm font-semibold">
                  <FiEdit2 className="w-4 h-4" /> Edit Ulasan
                </button>
                <button onClick={() => handleDeleteReview(myReview.id)} className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 text-sm font-semibold">
                  <FiTrash2 className="w-4 h-4" /> Hapus
                </button>
              </div>
            )}

            {!isAdmin && !user && (
              <button onClick={() => navigate('/toko/login')} className="flex items-center gap-2 px-4 py-2 bg-white/60 border border-white/40 rounded-full hover:bg-white/80 text-sm font-semibold">
                <FiLogIn className="w-4 h-4" /> Login untuk memberi ulasan
              </button>
            )}
          </div>

          {!isAdmin && user && !myReview && !canReview && (
            <p className="text-xs text-gray-500 mb-3">
              Anda hanya dapat memberi ulasan untuk produk yang sudah dibeli dan diterima.
            </p>
          )}

          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6 bg-white/20 rounded-lg">
              Belum ada ulasan untuk produk ini
            </p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="glass-card rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {review.user_name || 'Customer'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </p>
                    </div>
                    <RatingStars rating={review.rating} size="sm" />
                  </div>
                  <p className="text-sm text-gray-700">{review.review}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        product={{ product_id: product.id, product_name: product.name }}
        orderId={editingReview ? editingReview.order_id : deliveredOrderId}
        existingReview={editingReview}
        onSuccess={fetchAll}
      />
    </div>
  );
};

export default ProductDetailPage;