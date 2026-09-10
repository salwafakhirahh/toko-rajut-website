import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiShoppingCart, FiUser, FiArrowLeft } from 'react-icons/fi';

const PORTFOLIO_URL = 'http://localhost:5173';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/30 backdrop-blur-xl border-b border-white/40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        
        <div className="flex items-center gap-4">
          {/* Tombol ke Portfolio - PAKAI <a> */}
          <a
            href={PORTFOLIO_URL}
            className="flex items-center gap-1 text-gray-700 hover:text-dustyRose transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Portfolio</span>
          </a>
          <Link to="/toko" className="text-xl font-bold text-dustyRose">
            Urban Knitters
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/toko/products"
            className="flex items-center gap-1 text-gray-700 hover:text-dustyRose transition-colors"
          >
            <FiShoppingBag className="w-5 h-5" />
            <span className="hidden sm:inline">Produk</span>
          </Link>
          <Link
            to="/toko/cart"
            className="flex items-center gap-1 text-gray-700 hover:text-dustyRose transition-colors"
          >
            <FiShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Keranjang</span>
          </Link>
          <Link
            to="/toko/admin"
            className="flex items-center gap-1 bg-white/40 backdrop-blur-md text-gray-700 px-4 py-2 rounded-full hover:bg-white/60 transition-all border border-white/40"
          >
            <FiUser className="w-5 h-5" />
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;