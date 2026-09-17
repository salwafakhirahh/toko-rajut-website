import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import ConfirmModal from '../common/ConfirmModal';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../../services/supabaseClient';
import LoadingSpinner from '../common/LoadingSpinner';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Menyimpan...');
    try {
      if (editingId) {
        await updateCategory(editingId, formData);
        toast.success('Kategori berhasil diupdate!', { id: loadingToast });
      } else {
        await addCategory(formData);
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
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowModal(true);
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
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setDeleteId(null);
  };

  const filtered = categories.filter((cat) =>
    (cat.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (cat.description || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner message="Memuat kategori..." />;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Kategori</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', description: '' });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-dustyRose text-white rounded-lg hover:bg-coral transition-all"
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

      {showForm && (
        <div className="admin-card mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Nama Kategori *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose h-20 resize-none"
              />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="px-6 py-2 bg-dustyRose text-white rounded-lg hover:bg-coral">
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-white/30 text-gray-700 rounded-lg hover:bg-white/50"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Deskripsi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  Tidak ada kategori yang cocok
                </td>
              </tr>
            ) : (
              filtered.map((cat) => (
                <tr key={cat.id}>
                  <td className="font-medium text-gray-800">{cat.name}</td>
                  <td>{cat.description || '-'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(cat)} className="p-2 text-blue-500 hover:text-blue-700">
                        <FiEdit />
                      </button>
                      <button onClick={() => handleDeleteClick(cat.id)} className="p-2 text-red-500 hover:text-red-700">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={showModal}
        title="Hapus Kategori"
        message="Yakin ingin menghapus kategori ini? Produk dengan kategori ini akan menjadi tanpa kategori."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </AdminLayout>
  );
};

export default CategoryManagement;