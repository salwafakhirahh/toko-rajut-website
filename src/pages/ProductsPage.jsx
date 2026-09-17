import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiHome, FiX, FiSearch } from 'react-icons/fi';
import { getProducts, getCategories } from '../services/supabaseClient';
import ProductGrid from '../components/customer/ProductGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  // Kategori yang dipilih diambil dari URL query ?category=...
  const selectedCategory = searchParams.get('category') || 'all';

  // Ambil data produk dan kategori saat komponen pertama kali dimuat
  useEffect(() => {
    fetchData();
  }, []);

  // Sinkronkan kata kunci pencarian dari URL query ?search=...
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) setSearch(searchFromUrl);
  }, [searchParams]);

  // Fungsi untuk mengambil data produk dan kategori dari Supabase
  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error saat mengambil data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handler saat tombol kategori diklik
  const handleCategorySelect = (slug) => {
    if (slug === 'all') {
      // Reset semua query jika pilih "Semua"
      setSearchParams({});
    } else {
      setSearchParams({ category: slug });
    }
  };

  // Ambil ID kategori berdasarkan slug yang sedang dipilih
  // Filter produk memakai category_id, bukan slug dari nama kategori
  const getSelectedCategoryId = () => {
    if (selectedCategory === 'all') return 'all';
    const cat = categories.find((c) => c.slug === selectedCategory);
    return cat?.id || 'all';
  };

  // Proses filter produk berdasarkan pencarian dan kategori
  const filtered = products.filter((product) => {
    // Filter berdasarkan nama produk (case-insensitive)
    const matchSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    // Filter berdasarkan category_id
    let matchCategory = true;
    if (selectedCategory !== 'all') {
      const selectedCatId = getSelectedCategoryId();
      matchCategory = product.category_id === selectedCatId;
    }

    return matchSearch && matchCategory;
  });

  // Hitung jumlah produk per kategori untuk ditampilkan di badge tombol
  const getCategoryCount = (slug) => {
    if (slug === 'all') return products.length;
    const cat = categories.find((c) => c.slug === slug);
    if (!cat) return 0;
    return products.filter((p) => p.category_id === cat.id).length;
  };

  if (loading) return <LoadingSpinner message="Memuat produk..." />;

  return (
    <div className="pt-24 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Tombol kembali ke halaman utama toko */}
        <Link
          to="/toko"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-dustyRose transition-colors font-medium mb-6"
        >
          <FiArrowLeft className="w-5 h-5" />
          Kembali ke Beranda
        </Link>

        {/* Judul halaman */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <FiHome className="w-8 h-8 text-dustyRose" />
          <h1 className="text-4xl font-bold">
            <span className="text-gray-800">Katalog</span>
            <span className="text-dustyRose"> Produk</span>
          </h1>
        </div>

        {/* Kolom pencarian produk */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-full max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white/60 backdrop-blur border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
            />
          </div>
        </div>

        {/* Informasi hasil filter jika ada pencarian atau kategori aktif */}
        {(search || selectedCategory !== 'all') && (
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-600">
            <span>
              Menampilkan{' '}
              <strong className="text-dustyRose">{filtered.length}</strong>{' '}
              produk
            </span>

            {selectedCategory !== 'all' && (
              <span className="flex items-center gap-1 bg-dustyRose/20 px-3 py-1 rounded-full">
                Kategori:{' '}
                <strong className="text-dustyRose capitalize">
                  {selectedCategory.replace(/-/g, ' ')}
                </strong>
              </span>
            )}

            {search && (
              <span className="flex items-center gap-1 bg-dustyRose/20 px-3 py-1 rounded-full">
                Pencarian:{' '}
                <strong className="text-dustyRose">"{search}"</strong>
              </span>
            )}

            {/* Tombol reset filter */}
            <button
              onClick={() => {
                setSearch('');
                setSearchParams({});
              }}
              className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
            >
              <FiX className="w-4 h-4" /> Reset
            </button>
          </div>
        )}

        {/* Tombol filter kategori */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {/* Tombol Semua */}
            <button
              onClick={() => handleCategorySelect('all')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                selectedCategory === 'all'
                  ? 'bg-dustyRose text-white shadow-lg'
                  : 'bg-white/40 text-gray-700 hover:bg-white/60 border border-white/40'
              }`}
            >
              Semua
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedCategory === 'all'
                    ? 'bg-white/30'
                    : 'bg-dustyRose/20 text-dustyRose'
                }`}
              >
                {getCategoryCount('all')}
              </span>
            </button>

            {/* Tombol per kategori */}
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              const count = getCategoryCount(cat.slug);

              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-dustyRose text-white shadow-lg'
                      : 'bg-white/40 text-gray-700 hover:bg-white/60 border border-white/40'
                  }`}
                >
                  {cat.name}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/30'
                        : 'bg-dustyRose/20 text-dustyRose'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid produk atau pesan kosong */}
        {filtered.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-gray-600 mb-2 font-medium">
              Tidak ada produk ditemukan
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Coba kata kunci lain atau reset filter
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSearchParams({});
              }}
              className="bg-dustyRose text-white px-6 py-2 rounded-full hover:bg-coral transition-all"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <ProductGrid products={filtered} />
        )}
      </div>
    </div>
  );
};

export default ProductsPage;