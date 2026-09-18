import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiPlus, FiEdit, FiTrash2, FiSearch, FiEye, FiStar, FiPackage
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import ConfirmModal from '../common/ConfirmModal';
import { getProducts, deleteProduct } from '../../services/supabaseClient';
import { calculateFinalPrice } from '../../utils/priceHelper';
import LoadingSpinner from '../common/LoadingSpinner';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowModal(false);
    const loadingToast = toast.loading('Menghapus produk...');
    try {
      await deleteProduct(deleteId);
      await fetchProducts();
      toast.success('Produk berhasil dihapus!', { id: loadingToast });
    } catch (error) {
      toast.error('Gagal menghapus: ' + error.message, { id: loadingToast });
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner message="Memuat produk..." />;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk</h1>
          <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
            <FiPackage className="w-3.5 h-3.5" />
            Total: <strong className="text-dustyRose">{products.length}</strong> produk
            {search && (
              <>
                <span className="text-gray-400">·</span>
                Ditampilkan: <strong className="text-dustyRose">{filtered.length}</strong>
              </>
            )}
          </p>
        </div>
        <Link
          to="/toko/admin/products/add"
          className="flex items-center gap-2 px-4 py-2 bg-dustyRose text-white rounded-lg hover:bg-coral transition-all shadow-md text-sm"
        >
          <FiPlus className="w-4 h-4" /> Tambah Produk
        </Link>
      </div>

      <div className="admin-card">
        <div className="mb-4 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
          />
        </div>

        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/40">
                <th className="px-2 py-2.5 text-center text-xs font-bold text-gray-700 uppercase w-10">
                  No
                </th>
                <th className="px-2 py-2.5 text-left text-xs font-bold text-gray-700 uppercase w-14">
                  Gambar
                </th>
                <th className="px-2 py-2.5 text-left text-xs font-bold text-gray-700 uppercase">
                  Nama Produk
                </th>
                <th className="px-2 py-2.5 text-left text-xs font-bold text-gray-700 uppercase w-24">
                  Kategori
                </th>
                <th className="px-2 py-2.5 text-right text-xs font-bold text-gray-700 uppercase w-24">
                  Harga
                </th>
                <th className="px-2 py-2.5 text-center text-xs font-bold text-gray-700 uppercase w-16">
                  Stok
                </th>
                <th className="px-2 py-2.5 text-center text-xs font-bold text-gray-700 uppercase w-20">
                  Rating
                </th>
                <th className="px-2 py-2.5 text-center text-xs font-bold text-gray-700 uppercase w-32">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/30">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    <FiPackage className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <span className="text-sm">
                      {search ? 'Tidak ada produk yang cocok' : 'Belum ada produk'}
                    </span>
                  </td>
                </tr>
              ) : (
                filtered.map((product, index) => {
                  const finalPrice = calculateFinalPrice(product);
                  const hasDiscount = (product.discount || 0) > 0;
                  const isOutOfStock = product.stock === 0;

                  return (
                    <tr key={product.id} className="hover:bg-white/20 transition-colors">
                      <td className="px-2 py-2 text-center font-medium text-gray-700 text-xs">
                        {index + 1}
                      </td>

                      <td className="px-2 py-2">
                        <img
                          src={product.image_url || `https://picsum.photos/50/50?random=${product.id}`}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg shadow-sm"
                        />
                      </td>

                      <td className="px-2 py-2">
                        <div className="font-medium text-gray-800 text-sm line-clamp-1">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {product.categories?.name || '-'}
                        </div>
                      </td>

                      <td className="px-2 py-2">
                        <span className="inline-block text-xs px-2 py-0.5 bg-white/50 rounded-full text-gray-700 whitespace-nowrap">
                          {product.categories?.name || '-'}
                        </span>
                      </td>

                      <td className="px-2 py-2 text-right whitespace-nowrap">
                        {hasDiscount ? (
                          <>
                            <div className="text-xs text-gray-400 line-through">
                              Rp {product.price?.toLocaleString('id-ID')}
                            </div>
                            <div className="text-sm font-bold text-dustyRose">
                              Rp {finalPrice.toLocaleString('id-ID')}
                            </div>
                            <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">
                              -{product.discount}%
                            </span>
                          </>
                        ) : (
                          <div className="text-sm font-bold text-dustyRose">
                            Rp {product.price?.toLocaleString('id-ID')}
                          </div>
                        )}
                      </td>

                      <td className="px-2 py-2 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {isOutOfStock ? 'Habis' : product.stock}
                        </span>
                      </td>

                      <td className="px-2 py-2 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <FiStar className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-semibold text-gray-700">
                            {product.rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                      </td>

                      <td className="px-2 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`/toko/admin/products/detail/${product.id}`)}
                            className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                            title="Lihat Detail"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => navigate(`/toko/admin/products/edit/${product.id}`)}
                            className="p-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                            title="Edit"
                          >
                            <FiEdit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product.id)}
                            className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                            title="Hapus"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={showModal}
        title="Hapus Produk"
        message="Yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowModal(false);
          setDeleteId(null);
        }}
      />
    </AdminLayout>
  );
};

export default ProductManagement;