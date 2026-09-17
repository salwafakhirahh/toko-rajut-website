import React from 'react';
import { motion } from 'framer-motion';
import {
  FiHeart, FiAward, FiUsers, FiPackage,
  FiCheckCircle, FiMapPin, FiPhone, FiMail,
} from 'react-icons/fi';

const AboutStore = () => {
  const values = [
    {
      icon: <FiHeart className="w-6 h-6" />,
      title: 'Handmade dengan Cinta',
      description:
        'Setiap produk dirajut dengan tangan oleh pengrajin lokal, bukan produksi massal. Kami percaya kualitas lahir dari ketelitian dan kesabaran.',
    },
    {
      icon: <FiAward className="w-6 h-6" />,
      title: 'Bahan Berkualitas',
      description:
        'Kami hanya menggunakan benang pilihan yang lembut, tahan lama, dan nyaman dipakai untuk berbagai aktivitas sehari-hari.',
    },
    {
      icon: <FiUsers className="w-6 h-6" />,
      title: 'Mendukung Pengrajin Lokal',
      description:
        'Sebagian besar produk kami dibuat oleh pengrajin lokal. Setiap pembelian Anda ikut membantu mereka terus berkarya.',
    },
    {
      icon: <FiPackage className="w-6 h-6" />,
      title: 'Desain Eksklusif',
      description:
        'Koleksi kami terbatas dan tidak dijual di tempat lain. Cocok untuk Anda yang ingin tampil beda dengan sentuhan personal.',
    },
  ];

  const highlights = [
    'Produk handmade asli Indonesia',
    'Dibuat dengan bahan berkualitas',
    'Desain eksklusif dan terbatas',
    'Pengiriman aman ke seluruh Indonesia',
    'Packing rapi dan aman',
    'Layanan ramah dan responsif',
  ];

  const contacts = [
    { icon: <FiMapPin className="w-5 h-5" />, label: 'Ponorogo, Jawa Timur, Indonesia' },
    { icon: <FiPhone className="w-5 h-5" />, label: '+62 812 3456 7890' },
    { icon: <FiMail className="w-5 h-5" />, label: 'hello@urbanknitters.id' },
  ];

  return (
    <section id="about" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-times mb-4">
            <span className="text-gray-800">Tentang</span>
            <span className="text-dustyRose"> Urban Knitters</span>
          </h2>
          <div className="w-24 h-1 bg-dustyRose mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-4 font-inter max-w-3xl mx-auto">
            Urban Knitters adalah toko rajutan handmade yang menghadirkan produk berkualitas
            dengan desain eksklusif dan harga terjangkau. Kami percaya bahwa setiap rajutan
            punya cerita, dan cerita itu layak sampai ke tangan Anda.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-6 md:p-10 mb-12"
        >
          <h3 className="text-2xl font-times font-bold text-gray-800 mb-4">
            Cerita Kami
          </h3>
          <p className="text-gray-600 font-inter leading-relaxed mb-4">
            Urban Knitters berawal dari kecintaan sederhana pada seni merajut. Awalnya hanya
            hobi mengisi waktu luang, tetapi seiring waktu, hasil rajutan kami mulai diminati
            teman dan keluarga. Dari situ, kami memutuskan untuk membagikan karya ini ke
            lebih banyak orang melalui sebuah toko online.
          </p>
          <p className="text-gray-600 font-inter leading-relaxed">
            Setiap produk yang kami jual dibuat dengan tangan, tanpa mesin pabrik, dan
            melalui proses kontrol kualitas yang ketat. Kami percaya bahwa produk handmade
            memiliki nilai lebih yang tidak bisa ditiru oleh produksi massal. Sentuhan
            personal, ketelitian, dan kesabaran pengrajin adalah jiwa dari setiap karya kami.
          </p>
        </motion.div>

        <div className="mb-12">
          <h3 className="text-2xl font-times font-bold text-gray-800 text-center mb-8">
            Nilai yang Kami Pegang
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-dustyRose/20 text-dustyRose flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h4 className="font-bold text-gray-800 mb-2 font-inter">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-600 font-inter leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6 md:p-8"
          >
            <h3 className="text-2xl font-times font-bold text-gray-800 mb-4">
              Kenapa Memilih Kami?
            </h3>
            <ul className="space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <FiCheckCircle className="w-5 h-5 text-dustyRose flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 font-inter text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6 md:p-8"
          >
            <h3 className="text-2xl font-times font-bold text-gray-800 mb-4">
              Hubungi Kami
            </h3>
            <p className="text-sm text-gray-600 font-inter mb-4">
              Punya pertanyaan tentang produk atau pesanan? Silakan hubungi kami melalui:
            </p>
            <ul className="space-y-4">
              {contacts.map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-dustyRose/20 text-dustyRose flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-gray-700 font-inter text-sm">{item.label}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutStore;