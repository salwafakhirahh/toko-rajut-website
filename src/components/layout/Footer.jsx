import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiInstagram, FiMail, FiPhone, FiMapPin,
  FiShoppingBag, FiPackage, FiUser, FiHome
} from 'react-icons/fi';
import { FaTiktok, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Beranda', path: '/toko', icon: <FiHome className="w-4 h-4" /> },
    { name: 'Produk', path: '/toko/products', icon: <FiShoppingBag className="w-4 h-4" /> },
    { name: 'Keranjang', path: '/toko/cart', icon: <FiPackage className="w-4 h-4" /> },
    { name: 'Pesanan Saya', path: '/toko/orders', icon: <FiPackage className="w-4 h-4" /> },
    { name: 'Login', path: '/toko/login', icon: <FiUser className="w-4 h-4" /> },
    { name: 'Admin', path: '/toko/admin', icon: <FiUser className="w-4 h-4" /> },
  ];

  const categories = [
    { name: 'Baju Rajut', path: '/toko/products?category=baju-rajut' },
    { name: 'Sweater Rajut', path: '/toko/products?category=sweater-rajut' },
    { name: 'Tas Rajut', path: '/toko/products?category=tas-rajut' },
    { name: 'Mainan Rajut', path: '/toko/products?category=mainan-rajut' },
    { name: 'Lainnya', path: '/toko/products?category=lainnya' },
  ];

  return (
    <footer className="bg-white/20 backdrop-blur-xl border-t border-white/40 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-dustyRose mb-4">
              Urban Knitters
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Toko rajut online dengan produk handmade berkualitas tinggi.
              Dibuat dengan cinta untuk kenyamanan Anda.
            </p>
            <div className="flex gap-3 text-xl">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center text-gray-600 hover:bg-dustyRose hover:text-white transition-all"
              >
                <FiInstagram />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center text-gray-600 hover:bg-dustyRose hover:text-white transition-all"
              >
                <FaTiktok />
              </a>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center text-gray-600 hover:bg-dustyRose hover:text-white transition-all"
              >
                <FaWhatsapp />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 mb-4">Navigasi</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-dustyRose transition-colors"
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 mb-4">Kategori</h4>
            <ul className="space-y-2">
              {categories.map((cat, index) => (
                <li key={index}>
                  <Link
                    to={cat.path}
                    className="text-sm text-gray-600 hover:text-dustyRose transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 mb-4">Hubungi Kami</h4>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <FiMapPin className="w-5 h-5 text-dustyRose mt-0.5 flex-shrink-0" />
                <span>Jl. Rajut Indah No. 123, Jakarta, Indonesia</span>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="w-5 h-5 text-dustyRose flex-shrink-0" />
                <span>+62 822 4563 8337</span>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="w-5 h-5 text-dustyRose flex-shrink-0" />
                <span>hello@urbanknitters.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/40 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p>
              &copy; {currentYear}{' '}
              <span className="font-bold text-dustyRose">Urban Knitters</span>.
              All rights reserved.
            </p>
            <p className="text-xs">
              Dibuat dengan <span className="text-red-500">♥</span> oleh{' '}
              <span className="font-semibold text-dustyRose">Salwa Fakhirah Harsya</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;