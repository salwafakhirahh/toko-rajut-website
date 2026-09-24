import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiPlus, FiEdit, FiSearch, FiEye, FiEyeOff, FiStar, FiPackage
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import ConfirmModal from '../common/ConfirmModal';
import {
  getAllProductsAdmin,
  deactivateProduct,
  activateProduct,
} from '../../services/supabaseClient';
import { calculateFinalPrice } from '../../utils/priceHelper';
import LoadingSpinner from '../common/LoadingSpinner';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [confirmId, setConfirmId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('deactivate');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getAllProductsAdmin();
      setProducts(data);
    } catch (error) {
      toast.error('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateClick = (id) => {
    setConfirmId(id);
    setModalAction('deactivate');
    setShowModal(true);
  };

  const handleActivateClick = (id) => {
    setConfirmId(id);
    setModalAction('activate');
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    setShowModal(false);
    const loadingToast = toast.loading(
      modalAction === 'deactivate'
        ? 'Menonaktifkan produk...'
        : 'Mengaktifkan produk...'
    );
    try {
      if (modalAction === 'deactivate') {
        await deactivateProduct(confirmId);
        toast.success('Produk berhasil dinonaktifkan', { id: loadingToast });
      } else {
        await activateProduct(confirmId);
        toast.success('Produk berhasil diaktifkan', { id: loadingToast });
      }
      await fetchProducts();
    } catch (error) {
      toast.error('Gagal: ' + error.message, { id: loadingToast });
    } finally {
      setConfirmId(null);
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.is_active) ||
      (statusFilter === 'inactive' && !p.is_active);
    return matchSearch && matchStatus;
  });

  const activeCount = products.filter((p) => p.is_active).length;
  const inactiveCount = products.length - activeCount;

  if (loading) return <LoadingSpinner message="Memuat produk..." />;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk</h1>
          <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
            <FiPackage className="w-3.5 h-3.5" />
            Aktif: <strong className="text-green-600">{activeCount}</strong>
            <span className="text-gray-400">·</span>
            Nonaktif: <strong className="text-gray-500">{inactiveCount}</strong>
            <span className="text-gray-400">·</span>
            Ditampilkan: <strong className="text-dustyRose">{filtered.length}</strong>
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
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white/60 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
          >
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
            <option value="all">Semua</option>
          </select>
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
                <th className="px-2 py-2.5 text-right text-xs font-bold text-gray-700 uppercase w-24">
                  Harga
                </th>
                <th className="px-2 py-2.5 text-center text-xs font-bold text-gray-700 uppercase w-16">
                  Stok
                </th>
                <th className="px-2 py-2.5 text-center text-xs font-bold text-gray-700 uppercase w-20">
                  Status
                </th>
                <th className="px-2 py-2.5 text-center text-xs font-bold text-gray-700 uppercase w-32">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/30">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    <FiPackage className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <span className="text-sm">
                      {search || statusFilter !== 'active'
                        ? 'Tidak ada produk yang cocok'
                        : 'Belum ada produk aktif'}
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

                      <td className="px-2 py-2 text-right whitespace-nowrap">
                        {hasDiscount ? (
                          <>
                            <div className="text-xs text-gray-400 line-through">
                              Rp {product.price?.toLocaleString('id-ID')}
                            </div>
                            <div className="text-sm font-bold text-dustyRose">
                              Rp {finalPrice.toLocaleString('id-ID')}
                            </div>
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
                        {product.is_active ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-600 whitespace-nowrap">
                            Nonaktif
                          </span>
                        )}
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
                          {product.is_active ? (
                            <button
                              onClick={() => handleDeactivateClick(product.id)}
                              className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                              title="Nonaktifkan"
                            >
                              <FiEyeOff className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivateClick(product.id)}
                              className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
                              title="Aktifkan"
                            >
                              <FiEye className="w-3.5 h-3.5" />
                            </button>
                          )}
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
        title={modalAction === 'deactivate' ? 'Nonaktifkan Produk' : 'Aktifkan Produk'}
        message={
          modalAction === 'deactivate'
            ? 'Produk ini akan disembunyikan dari katalog customer, tapi tetap tersimpan di database dan riwayat pesanan. Yakin ingin menonaktifkan?'
            : 'Produk ini akan kembali muncul di katalog customer. Yakin ingin mengaktifkan?'
        }
        onConfirm={handleConfirmAction}
        onCancel={() => {
          setShowModal(false);
          setConfirmId(null);
        }}
        confirmText={modalAction === 'deactivate' ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
        cancelText="Batal"
        confirmColor={modalAction === 'deactivate' ? 'red' : 'green'}
      />
    </AdminLayout>
  );
};

export default ProductManagement;