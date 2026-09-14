import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiEdit, FiTrash2, FiStar, FiPackage,
  FiTag, FiCalendar, FiTrendingUp, FiDollarSign,
  FiAlertCircle, FiCheckCircle, FiShoppingBag
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import ConfirmModal from '../common/ConfirmModal';
import { getProductById, deleteProduct } from '../../services/supabaseClient';
import { calculateFinalPrice } from '../../utils/priceHelper';
import LoadingSpinner from '../common/LoadingSpinner';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await getProductById(id);
      setProduct(data);
    } catch (error) {
      toast.error('Produk tidak ditemukan');
      navigate('/toko/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    const loadingToast = toast.loading('Menghapus produk...');
    try {
      await deleteProduct(id);
      toast.success('Produk berhasil dihapus!', { id: loadingToast });
      setTimeout(() => navigate('/toko/admin/products'), 1000);
    } catch (error) {
      toast.error('Gagal menghapus: ' + error.message, { id: loadingToast });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <LoadingSpinner message="Memuat detail produk..." />;
  if (!product) return null;

  const finalPrice = calculateFinalPrice(product);
  const hasDiscount = (product.discount || 0) > 0;
  const isOutOfStock = product.stock === 0;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/toko/admin/products')}
            className="flex items-center gap-2 text-gray-600 hover:text-dustyRose transition-colors"
          >
            <FiArrowLeft /> Kembali ke Daftar Produk
          </button>

          <div className="flex gap-2">
            <Link
              to={`/toko/admin/products/edit/${product.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            >
              <FiEdit /> Edit Produk
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
            >
              <FiTrash2 /> Hapus
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6">
            <div className="relative">
              {hasDiscount && (
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  Diskon {product.discount}%
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute top-4 right-4 z-10 bg-gray-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  Stok Habis
                </div>
              )}
              <img
                src={product.image_url || `https://picsum.photos/500/500?random=${product.id}`}
                alt={product.name}
                className="w-full rounded-xl shadow-lg"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="p-3 bg-white/40 rounded-lg text-center">
                <FiPackage className="w-5 h-5 text-dustyRose mx-auto mb-1" />
                <p className="text-xs text-gray-500">Stok</p>
                <p className="font-bold text-gray-800">{product.stock}</p>
              </div>
              <div className="p-3 bg-white/40 rounded-lg text-center">
                <FiStar className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Rating</p>
                <p className="font-bold text-gray-800">
                  {product.rating?.toFixed(1) || '0.0'}
                </p>
              </div>
              <div className="p-3 bg-white/40 rounded-lg text-center">
                <FiTrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Terjual</p>
                <p className="font-bold text-gray-800">
                  {product.total_sold || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {product.name}
              </h1>
              <p className="text-xs text-gray-500 font-mono mb-4">
                ID: {product.id}
              </p>

              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center gap-1 px-3 py-1 bg-white/40 rounded-full text-sm">
                  <FiTag className="w-3 h-3" />
                  {product.categories?.name || 'Tanpa Kategori'}
                </span>
                {isOutOfStock ? (
                  <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                    <FiAlertCircle className="w-3 h-3" />
                    Stok Habis
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    <FiCheckCircle className="w-3 h-3" />
                    Tersedia
                  </span>
                )}
              </div>

              <div className="p-4 bg-dustyRose/20 rounded-xl mb-4">
                {hasDiscount ? (
                  <>
                    <p className="text-xs text-gray-500 mb-1">Harga Normal</p>
                    <p className="text-sm line-through text-gray-400 mb-2">
                      Rp {product.price?.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-500 mb-1">Harga Diskon</p>
                    <div className="flex items-center gap-3">
                      <p className="text-3xl font-bold text-dustyRose">
                        Rp {finalPrice.toLocaleString('id-ID')}
                      </p>
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        Hemat Rp {(product.price - finalPrice).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-500 mb-1">Harga</p>
                    <p className="text-3xl font-bold text-dustyRose">
                      Rp {finalPrice.toLocaleString('id-ID')}
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-white/40">
                <div className="flex items-start gap-3">
                  <FiCalendar className="w-5 h-5 text-dustyRose mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Tanggal Dibuat</p>
                    <p className="text-sm font-medium text-gray-700">
                      {formatDate(product.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiTrendingUp className="w-5 h-5 text-dustyRose mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Terakhir Update</p>
                    <p className="text-sm font-medium text-gray-700">
                      {formatDate(product.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FiShoppingBag className="text-dustyRose" />
                Deskripsi Produk
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description || 'Tidak ada deskripsi untuk produk ini.'}
              </p>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-gray-800 mb-3">Ringkasan Statistik</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Ulasan</span>
                  <span className="font-bold text-gray-800">
                    {product.total_reviews || 0} ulasan
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rating Rata-rata</span>
                  <div className="flex items-center gap-1">
                    <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-gray-800">
                      {product.rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Terjual</span>
                  <span className="font-bold text-green-600">
                    {product.total_sold || 0} pcs
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/40">
                  <span className="text-sm text-gray-600">Estimasi Pendapatan</span>
                  <span className="font-bold text-dustyRose">
                    Rp {((product.total_sold || 0) * finalPrice).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Hapus Produk"
        message={`Yakin ingin menghapus "${product.name}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        confirmColor="red"
      />
    </AdminLayout>
  );
};

export default ProductDetail;