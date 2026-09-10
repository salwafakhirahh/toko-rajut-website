import React, { useState, useEffect } from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import { getTopProducts } from '../../services/reportService';

const TopProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopProducts();
  }, []);

  const fetchTopProducts = async () => {
    try {
      const data = await getTopProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FiTrendingUp /> Produk Terlaris
      </h1>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Produk</th>
              <th>Terjual</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" className="text-center py-4">Memuat...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="3" className="text-center py-4">Belum ada data</td></tr>
            ) : (
              products.map((item, index) => (
                <tr key={index}>
                  <td className="font-bold text-dustyRose">{index + 1}</td>
                  <td className="font-medium">{item.products?.name || '-'}</td>
                  <td>{item.quantity} terjual</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default TopProducts;