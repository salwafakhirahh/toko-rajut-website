import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiPlus, FiEdit, FiTrash2, FiSearch, FiEye, FiStar
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

  const handleCancelDelete = () => {
    setShowModal(false);
    setDeleteId(null);
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner message="Memuat produk..." />;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Produk</h1>
          <p className="text-sm text-gray-600 mt-1">
            Total: {products.length} produk
          </p>
        </div>
        <Link
          to="/toko/admin/products/add"
          className="flex items-center gap-2 px-4 py-2 bg-dustyRose text-white rounded-lg hover:bg-coral transition-all"
        >
          <FiPlus /> Tambah Produk
        </Link>
      </div>

      <div className="admin-card">
        <div className="mb-4 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Gambar</th>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Harga Asli</th>
                <th>Diskon</th>
                <th>Harga Diskon</th>
                <th>Stok</th>
                <th>Rating</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    Tidak ada produk
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const finalPrice = calculateFinalPrice(product);
                  const hasDiscount = (product.discount || 0) > 0;

                  return (
                    <tr key={product.id}>
                      <td>
                        <img
                          src={
                            product.image_url ||
                            `https://picsum.photos/50/50?random=${product.id}`
                          }
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </td>
                      <td className="font-medium text-gray-800">
                        {product.name}
                      </td>
                      <td>{product.categories?.name || '-'}</td>
                      <td className="text-gray-700">
                        Rp {product.price?.toLocaleString('id-ID')}
                      </td>
                      <td>
                        {hasDiscount ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            {product.discount}%
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="font-semibold text-dustyRose">
                        Rp {finalPrice.toLocaleString('id-ID')}
                      </td>
                      <td>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            product.stock > 0
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.stock > 0
                            ? `${product.stock} tersisa`
                            : 'Habis'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <FiStar className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-semibold">
                            {product.rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              navigate(`/toko/admin/products/detail/${product.id}`)
                            }
                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Lihat Detail"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/toko/admin/products/edit/${product.id}`)
                            }
                            className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
                            title="Edit"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product.id)}
                            className="p-2 text-red-500 hover:text-red-700 transition-colors"
                            title="Hapus"
                          >
                            <FiTrash2 />
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
        onCancel={handleCancelDelete}
      />
    </AdminLayout>
  );
};

export default ProductManagement;