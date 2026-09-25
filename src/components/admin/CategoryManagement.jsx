import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFolder, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import ConfirmModal from '../common/ConfirmModal';
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  countProductsByCategory,
} from '../../services/supabaseClient';
import LoadingSpinner from '../common/LoadingSpinner';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [checkingDelete, setCheckingDelete] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nama kategori wajib diisi';
    else if (formData.name.trim().length < 3) newErrors.name = 'Nama kategori minimal 3 karakter';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Mohon periksa kembali data yang belum lengkap');
      return;
    }

    const loadingToast = toast.loading('Menyimpan...');
    try {
      if (editingId) {
        await updateCategory(editingId, { ...formData, name: formData.name.trim() });
        toast.success('Kategori berhasil diupdate!', { id: loadingToast });
      } else {
        await addCategory({ ...formData, name: formData.name.trim() });
        toast.success('Kategori berhasil ditambahkan!', { id: loadingToast });
      }
      setFormData({ name: '', description: '' });
      setEditingId(null);
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      toast.error('Gagal menyimpan: ' + error.message, { id: loadingToast });
    }
  };

  const handleEdit = (category) => {
    setFormData({ name: category.name, description: category.description || '' });
    setEditingId(category.id);
    setShowForm(true);
    setErrors({});
  };

  const handleDeleteClick = async (category) => {
    setCheckingDelete(true);
    const loadingToast = toast.loading('Memeriksa kategori...');

    try {
      const count = await countProductsByCategory(category.id);
      toast.dismiss(loadingToast);

      if (count > 0) {
        toast.error(
          `Kategori "${category.name}" tidak dapat dihapus karena masih digunakan oleh ${count} produk. Pindahkan produk tersebut ke kategori lain terlebih dahulu.`,
          { duration: 6000 }
        );
        setCheckingDelete(false);
        return;
      }

      setDeleteId(category.id);
      setDeleteName(category.name);
      setShowModal(true);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memeriksa kategori: ' + error.message, { id: loadingToast });
    } finally {
      setCheckingDelete(false);
    }
  };

  const handleConfirmDelete = async () => {
    setShowModal(false);
    const loadingToast = toast.loading('Menghapus...');
    try {
      await deleteCategory(deleteId);
      fetchCategories();
      toast.success('Kategori berhasil dihapus!', { id: loadingToast });
    } catch (error) {
      toast.error('Gagal menghapus: ' + error.message, { id: loadingToast });
    } finally {
      setDeleteId(null);
      setDeleteName('');
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setDeleteId(null);
    setDeleteName('');
  };

  const filtered = categories.filter((cat) =>
    (cat.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (cat.description || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner message="Memuat kategori..." />;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Kategori</h1>
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
            <FiFolder className="w-4 h-4" />
            Total: <strong className="text-dustyRose">{categories.length}</strong> kategori
            {search && (
              <>
                <span className="text-gray-400">·</span>
                Ditampilkan: <strong className="text-dustyRose">{filtered.length}</strong>
              </>
            )}
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', description: '' });
            setErrors({});
          }}
          className="flex items-center gap-2 px-4 py-2 bg-dustyRose text-white rounded-lg hover:bg-coral transition-all shadow-md"
        >
          <FiPlus /> Tambah Kategori
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full bg-white/60 backdrop-blur border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
          />
        </div>
      </div>

      {/* Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
        <FiAlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          Kategori yang masih memiliki produk tidak dapat dihapus. Pindahkan produk ke kategori lain terlebih dahulu sebelum menghapus kategori.
        </p>
      </div>

      {showForm && (
        <div className="admin-card mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Nama Kategori <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-4 py-2 bg-white/30 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose ${
                  errors.name ? 'border-red-400' : 'border-white/40'
                }`}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-4 py-2 bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose h-20 resize-none"
              />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="px-6 py-2 bg-dustyRose text-white rounded-lg hover:bg-coral">
                Simpan
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setErrors({});
                }}
                className="px-6 py-2 bg-white/30 text-gray-700 rounded-lg hover:bg-white/50"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="w-12 text-center">No</th>
                <th>Nama</th>
                <th>Deskripsi</th>
                <th className="w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">
                    <FiFolder className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    {search ? 'Tidak ada kategori yang cocok' : 'Belum ada kategori'}
                  </td>
                </tr>
              ) : (
                filtered.map((cat, index) => (
                  <tr key={cat.id} className="hover:bg-white/20 transition-colors">
                    <td className="text-center font-medium text-gray-700">
                      {index + 1}
                    </td>
                    <td className="font-medium text-gray-800">{cat.name}</td>
                    <td className="text-sm text-gray-600">{cat.description || '-'}</td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cat)}
                          disabled={checkingDelete}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Hapus"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={showModal}
        title="Hapus Kategori"
        message={`Yakin ingin menghapus kategori "${deleteName}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        confirmColor="red"
      />
    </AdminLayout>
  );
};

export default CategoryManagement;