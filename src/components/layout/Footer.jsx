import React from 'react';
import { FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white/20 backdrop-blur-xl border-t border-white/40 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="flex justify-center gap-4 text-xl mb-4">
          <a href="#" className="text-gray-600 hover:text-dustyRose transition-colors">
            <FaInstagram />
          </a>
          <a href="#" className="text-gray-600 hover:text-dustyRose transition-colors">
            <FaTiktok />
          </a>
          <a href="#" className="text-gray-600 hover:text-dustyRose transition-colors">
            <FaWhatsapp />
          </a>
        </div>
        <p className="text-gray-600">
          <span className="font-bold text-dustyRose">Urban Knitters</span> &copy; 2024
        </p>
      </div>
    </footer>
  );
};

export default Footer;