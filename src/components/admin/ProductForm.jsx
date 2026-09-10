import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiPlus, FiX, FiFolder, FiPercent } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import CustomSelect from '../common/CustomSelect';
import {
  addProduct,
  updateProduct,
  getProductById,
  getCategories,
  addCategory,
  uploadProductImage,
} from '../../services/supabaseClient';
import LoadingSpinner from '../common/LoadingSpinner';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image_url: '',
    discount: 0,
    is_promo: false,
  });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);

      if (isEdit) {
        const product = await getProductById(id);
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          stock: product.stock || '',
          category_id: product.category_id || '',
          image_url: product.image_url || '',
          discount: product.discount || 0,
          is_promo: product.is_promo || false,
        });
        setImagePreview(product.image_url || '');
      }
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Nama kategori tidak boleh kosong');
      return;
    }

    setAddingCategory(true);
    const loadingToast = toast.loading('Menambahkan kategori...');

    try {
      const newCategory = await addCategory({
        name: newCategoryName.trim(),
        description: '',
      });

      const updatedCategories = await getCategories();
      setCategories(updatedCategories);

      setFormData({ ...formData, category_id: newCategory.id });
      setNewCategoryName('');
      setShowCategoryInput(false);

      toast.success('Kategori berhasil ditambahkan!', { id: loadingToast });
    } catch (error) {
      toast.error('Gagal menambahkan kategori: ' + error.message, { id: loadingToast });
    } finally {
      setAddingCategory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.category_id) {
      toast.error('Pilih kategori terlebih dahulu');
      setLoading(false);
      return;
    }

    const loadingToast = toast.loading('Menyimpan produk...');

    try {
      let imageUrl = formData.image_url;
      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile);
      }

      const data = {
        ...formData,
        image_url: imageUrl,
        discount: parseInt(formData.discount) || 0,
      };

      if (isEdit) {
        await updateProduct(id, data);
        toast.success('Produk berhasil diupdate!', { id: loadingToast });
      } else {
        await addProduct(data);
        toast.success('Produk berhasil ditambahkan!', { id: loadingToast });
      }

      setTimeout(() => navigate('/toko/admin/products'), 1500);
    } catch (error) {
      toast.error('Gagal menyimpan: ' + error.message, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const price = parseInt(formData.price) || 0;
  const discount = parseInt(formData.discount) || 0;
  const finalPrice = price - (price * discount / 100);

  if (fetching) return <LoadingSpinner message="Memuat data..." />;

  return (
    <AdminLayout>
      <button
        onClick={() => navigate('/toko/admin/products')}
        className="flex items-center gap-2 text-gray-600 hover:text-dustyRose mb-4"
      >
        <FiArrowLeft /> Kembali
      </button>

      <div className="admin-card">
        <h1 className="text-2xl font-bold mb-6">
          {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Nama Produk *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-gray-700 font-medium">
                <FiFolder className="text-dustyRose" />
                Kategori *
              </label>
              {!showCategoryInput && (
                <button
                  type="button"
                  onClick={() => setShowCategoryInput(true)}
                  className="flex items-center gap-1 text-sm text-dustyRose hover:text-coral font-semibold transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Tambah Kategori Baru
                </button>
              )}
            </div>

            {showCategoryInput && (
              <div className="mb-3 p-4 bg-gradient-to-r from-dustyRose/10 to-coral/10 rounded-xl border border-dustyRose/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-dustyRose/20 flex items-center justify-center">
                    <FiPlus className="w-4 h-4 text-dustyRose" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    Tambah Kategori Baru
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Contoh: Topi Rajut, Syal, dll..."
                    className="flex-1 px-4 py-2.5 bg-white/60 rounded-lg border border-dustyRose/30 focus:outline-none focus:ring-2 focus:ring-dustyRose text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={addingCategory}
                    className="px-5 py-2.5 bg-dustyRose text-white rounded-lg hover:bg-coral transition-all text-sm font-semibold disabled:opacity-50 shadow-lg"
                  >
                    {addingCategory ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryInput(false);
                      setNewCategoryName('');
                    }}
                    className="px-3 py-2.5 bg-white/60 text-gray-600 rounded-lg hover:bg-white/80 transition-all border border-white/40"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <CustomSelect
              options={categoryOptions}
              value={formData.category_id}
              onChange={(value) => setFormData({ ...formData, category_id: value })}
              placeholder="Pilih Kategori"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Harga *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Stok *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
                required
              />
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-dustyRose/10 to-coral/10 rounded-xl border border-dustyRose/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-dustyRose/20 flex items-center justify-center">
                <FiPercent className="w-4 h-4 text-dustyRose" />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                Pengaturan Diskon
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                  Diskon (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 bg-white/60 rounded-lg border border-dustyRose/30 focus:outline-none focus:ring-2 focus:ring-dustyRose"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                  Tandai Promo
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_promo: !formData.is_promo })}
                  className={`w-full px-4 py-2 rounded-lg border-2 transition-all font-semibold ${
                    formData.is_promo
                      ? 'bg-dustyRose text-white border-dustyRose'
                      : 'bg-white/60 text-gray-600 border-dustyRose/30'
                  }`}
                >
                  {formData.is_promo ? '🔥 Promo Aktif' : 'Tidak Promo'}
                </button>
              </div>
            </div>

            {discount > 0 && price > 0 && (
              <div className="mt-4 p-3 bg-white/40 rounded-lg">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Harga Normal:</span>
                  <span className="line-through text-gray-400">
                    Rp {price.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Diskon ({discount}%):</span>
                  <span className="text-red-500">
                    -Rp {(price * discount / 100).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-dustyRose/20">
                  <span className="text-gray-800">Harga Final:</span>
                  <span className="text-dustyRose">
                    Rp {finalPrice.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Deskripsi</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose resize-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Gambar Produk</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 bg-white/30 rounded-lg border border-white/40"
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-4 w-32 h-32 object-cover rounded-lg" />
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-dustyRose text-white rounded-lg hover:bg-coral transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FiSave /> {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/toko/admin/products')}
              className="px-6 py-3 bg-white/30 text-gray-700 rounded-lg hover:bg-white/50"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ProductForm;