import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import { getProducts, getCategories } from '../services/supabaseClient';
import ProductGrid from '../components/customer/ProductGrid';
import CategoryFilter from '../components/customer/CategoryFilter';
import SearchBar from '../components/common/SearchBar';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'all';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (slug) => {
    if (slug === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: slug });
    }
  };

  const filtered = products.filter((product) => {
    const matchSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'all' ||
      product.categories?.name?.toLowerCase().replace(/\s/g, '-') === selectedCategory;
    return matchSearch && matchCategory;
  });

  if (loading) return <LoadingSpinner message="Memuat produk..." />;

  return (
    <div className="pt-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/toko"
            className="flex items-center gap-2 text-gray-600 hover:text-dustyRose transition-colors font-medium"
          >
            <FiArrowLeft className="w-5 h-5" />
            Kembali ke Home
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3 mb-8">
          <FiHome className="w-8 h-8 text-dustyRose" />
          <h1 className="text-4xl font-bold">
            <span className="text-gray-800">Katalog</span>
            <span className="text-dustyRose"> Produk</span>
          </h1>
        </div>

        <div className="mb-6 flex justify-center">
          <SearchBar onSearch={setSearch} />
        </div>

        <div className="mb-8">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={handleCategorySelect}
          />
        </div>

        <ProductGrid products={filtered} />
      </div>
    </div>
  );
};

export default ProductsPage;