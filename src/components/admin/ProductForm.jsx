import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiPlus, FiX, FiFolder, FiPercent, FiImage } from 'react-icons/fi';
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
  });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [errors, setErrors] = useState({});

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
        });
        setImagePreview(product.image_url || '');
      }
    } catch (error) {
      toast.error('Gagal memuat data');
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
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
      setErrors((prev) => ({ ...prev, category_id: '' }));
      setNewCategoryName('');
      setShowCategoryInput(false);

      toast.success('Kategori berhasil ditambahkan!', { id: loadingToast });
    } catch (error) {
      toast.error('Gagal menambahkan kategori: ' + error.message, { id: loadingToast });
    } finally {
      setAddingCategory(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Nama produk wajib diisi';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nama produk minimal 3 karakter';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Kategori produk wajib dipilih';
    }

    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = 'Harga wajib diisi dan lebih dari 0';
    }

    if (formData.stock === '' || Number(formData.stock) < 0) {
      newErrors.stock = 'Stok wajib diisi dan tidak boleh negatif';
    }

    const discount = Number(formData.discount) || 0;
    if (discount < 0 || discount > 100) {
      newErrors.discount = 'Diskon harus antara 0 sampai 100 persen';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Mohon periksa kembali data yang belum lengkap');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Menyimpan produk...');

    try {
      let imageUrl = formData.image_url;
      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile);
      }

      const data = {
        ...formData,
        name: formData.name.trim(),
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
      console.error(error);
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
        className="flex items-center gap-2 text-gray-600 hover:text-dustyRose mb-4 transition-colors"
      >
        <FiArrowLeft /> Kembali
      </button>

      <div className="admin-card max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Nama Produk */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Baju Rajut Polos"
              className={`w-full px-4 py-2 bg-white/30 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose ${
                errors.name ? 'border-red-400' : 'border-white/40'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Kategori */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-gray-700 font-medium">
                <FiFolder className="text-dustyRose" />
                Kategori <span className="text-red-500">*</span>
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
                <p className="text-xs text-gray-500 mt-2 ml-10">
                  Kategori akan otomatis tersimpan dan langsung terpilih
                </p>
              </div>
            )}

            <div className={errors.category_id ? 'ring-2 ring-red-400 rounded-lg' : ''}>
              <CustomSelect
                options={categoryOptions}
                value={formData.category_id}
                onChange={(value) => {
                  setFormData({ ...formData, category_id: value });
                  if (errors.category_id) {
                    setErrors((prev) => ({ ...prev, category_id: '' }));
                  }
                }}
                placeholder="Pilih Kategori"
              />
            </div>

            {errors.category_id && (
              <p className="text-xs text-red-500 mt-1">{errors.category_id}</p>
            )}

            {categories.length === 0 && !showCategoryInput && (
              <p className="text-xs text-red-500 mt-2">
                Belum ada kategori. Klik "Tambah Kategori Baru" untuk membuat.
              </p>
            )}
          </div>

          {/* Harga & Stok */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Harga (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="150000"
                min="0"
                className={`w-full px-4 py-2 bg-white/30 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose ${
                  errors.price ? 'border-red-400' : 'border-white/40'
                }`}
              />
              {errors.price && (
                <p className="text-xs text-red-500 mt-1">{errors.price}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Stok <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="10"
                min="0"
                className={`w-full px-4 py-2 bg-white/30 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose ${
                  errors.stock ? 'border-red-400' : 'border-white/40'
                }`}
              />
              {errors.stock && (
                <p className="text-xs text-red-500 mt-1">{errors.stock}</p>
              )}
            </div>
          </div>

          {/* Diskon */}
          <div className="p-4 bg-gradient-to-r from-dustyRose/10 to-coral/10 rounded-xl border border-dustyRose/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-dustyRose/20 flex items-center justify-center">
                <FiPercent className="w-4 h-4 text-dustyRose" />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                Pengaturan Diskon
              </span>
            </div>

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
                placeholder="0"
                className={`w-full px-4 py-2 bg-white/60 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose ${
                  errors.discount ? 'border-red-400' : 'border-dustyRose/30'
                }`}
              />
              {errors.discount && (
                <p className="text-xs text-red-500 mt-1">{errors.discount}</p>
              )}
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

          {/* Deskripsi */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Deskripsi produk..."
              className="w-full px-4 py-2 bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose resize-none"
            />
          </div>

          {/* Upload Gambar */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
              <FiImage className="text-dustyRose" />
              Gambar Produk
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 bg-white/30 rounded-lg border border-white/40 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-dustyRose file:text-white hover:file:bg-coral cursor-pointer"
            />
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-white/40 shadow-md"
                />
              </div>
            )}
          </div>

          {/* Tombol */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-dustyRose text-white rounded-lg hover:bg-coral transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
            >
              <FiSave /> {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/toko/admin/products')}
              className="px-6 py-3 bg-white/30 text-gray-700 rounded-lg hover:bg-white/50 transition-all"
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