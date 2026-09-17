import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiShoppingBag, FiTruck, FiHeart, FiStar, FiChevronRight,
  FiSearch, FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getProducts, getCategories } from '../services/supabaseClient';
import ProductGrid from '../components/customer/ProductGrid';
import AboutStore from '../components/customer/AboutStore';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsData.slice(0, 8));
      setCategories(categoriesData);
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (slug) => {
    const iconMap = {
      'baju-rajut': <FiShoppingBag className="w-7 h-7" />,
      'sweater-rajut': <FiShoppingBag className="w-7 h-7" />,
      'tas-rajut': <FiShoppingBag className="w-7 h-7" />,
      'mainan-rajut': <FiHeart className="w-7 h-7" />,
      'lainnya': <FiStar className="w-7 h-7" />,
    };
    return iconMap[slug] || <FiStar className="w-7 h-7" />;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/toko/products?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/toko/products');
    }
  };

  const features = [
    { icon: <FiShoppingBag className="w-6 h-6" />, title: 'Produk Berkualitas', desc: 'Bahan terbaik' },
    { icon: <FiTruck className="w-6 h-6" />, title: 'Pengiriman Cepat', desc: 'Aman sampai tujuan' },
    { icon: <FiHeart className="w-6 h-6" />, title: 'Handmade', desc: 'Dibuat dengan cinta' },
    { icon: <FiStar className="w-6 h-6" />, title: 'Rating Tinggi', desc: 'Kepuasan pelanggan' },
  ];

  if (loading) return <LoadingSpinner message="Memuat produk..." />;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="relative min-h-[400px] md:min-h-[450px] flex items-center"
          style={{
            backgroundImage: 'url(/images/background-toko-rajut.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-roseQuartz/90 via-roseQuartz/70 to-transparent"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-block px-4 py-1 bg-white/40 backdrop-blur-md rounded-full text-sm font-semibold text-dustyRose mb-4 border border-white/50">
                  Koleksi Terbaru
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 leading-tight">
                  Selamat Datang di{' '}
                  <span className="text-dustyRose">Toko Rajut</span>
                </h1>
                <p className="text-base md:text-lg text-gray-700 mb-6 max-w-lg">
                  Temukan berbagai produk rajut berkualitas tinggi dengan desain eksklusif dan harga terjangkau.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/toko/products"
                    className="inline-flex items-center gap-2 bg-dustyRose text-white px-6 py-3 rounded-full hover:bg-coral transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-sm md:text-base"
                  >
                    <FiShoppingBag className="w-5 h-5" />
                    Belanja Sekarang
                  </Link>
                  <Link
                    to="/toko/products"
                    className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md text-gray-800 px-6 py-3 rounded-full hover:bg-white/80 transition-all border border-white/50 shadow-lg font-semibold text-sm md:text-base"
                  >
                    Lihat Katalog
                    <FiChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              <div className="hidden md:flex justify-end">
                <div className="glass rounded-2xl p-6 max-w-xs shadow-2xl border border-white/50">
                  <div className="text-center">
                    <span className="inline-block px-3 py-1 bg-coral text-white text-xs font-bold rounded-full mb-3">
                      PROMO SPESIAL
                    </span>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Diskon Hingga 20%
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Untuk pembelian produk rajut pilihan
                    </p>
                    <Link
                      to="/toko/products"
                      className="inline-block w-full bg-dustyRose text-white py-2 rounded-full hover:bg-coral transition-all text-sm font-semibold"
                    >
                      Lihat Promo
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar di Beranda */}
      <section className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSearch} className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk rajut favorit Anda..."
            className="w-full px-4 py-4 pl-12 pr-32 bg-white/50 backdrop-blur-md rounded-full border border-white/50 focus:outline-none focus:ring-2 focus:ring-dustyRose shadow-lg text-gray-700"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-28 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-dustyRose text-white px-6 py-2 rounded-full hover:bg-coral transition-all font-semibold text-sm"
          >
            Cari
          </button>
        </form>
      </section>

      {/* Features */}
      <section className="bg-white/40 backdrop-blur-md border-y border-white/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-dustyRose/20 flex items-center justify-center text-dustyRose flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kategori */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            <span className="text-gray-800">Kategori</span>
            <span className="text-dustyRose"> Produk</span>
          </h2>
          <Link
            to="/toko/products"
            className="text-dustyRose hover:text-coral font-semibold text-sm flex items-center gap-1"
          >
            Lihat Semua <FiChevronRight />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/toko/products?category=${category.slug}`}
              className="glass-card rounded-xl p-5 text-center group"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-dustyRose/20 flex items-center justify-center text-dustyRose mb-3 group-hover:bg-dustyRose group-hover:text-white transition-all">
                {getCategoryIcon(category.slug)}
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Produk Terbaru */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            <span className="text-gray-800">Produk</span>
            <span className="text-dustyRose"> Terbaru</span>
          </h2>
          <Link
            to="/toko/products"
            className="text-dustyRose hover:text-coral font-semibold text-sm flex items-center gap-1"
          >
            Lihat Semua <FiChevronRight />
          </Link>
        </div>

        <ProductGrid products={products} />
      </section>

      {/* Section Tentang Urban Knitters */}
      <AboutStore />

      {/* Banner Promo */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="glass rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              Dapatkan Penawaran Spesial
            </h2>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Berlangganan sekarang dan dapatkan diskon 10% untuk pembelian pertama Anda!
            </p>
            <Link
              to="/toko/products"
              className="inline-block bg-dustyRose text-white px-8 py-3 rounded-full hover:bg-coral transition-all shadow-lg font-semibold"
            >
              Mulai Belanja
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;