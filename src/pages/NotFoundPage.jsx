import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-dustyRose mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Halaman tidak ditemukan</p>
        <Link
          to="/toko"
          className="inline-block bg-dustyRose text-white px-6 py-2 rounded-full hover:bg-coral"
        >
          Kembali ke Toko
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;