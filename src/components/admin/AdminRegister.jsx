import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiShield, FiUserPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { supabase } from '../../services/supabaseClient';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminToken: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminToken, setShowAdminToken] = useState(false);
  const navigate = useNavigate();

  const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || 'rahasia_admin_123';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nama lengkap wajib diisi';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Nama minimal 3 karakter';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }
    if (!formData.adminToken.trim()) {
      newErrors.adminToken = 'Token admin wajib diisi';
    } else if (formData.adminToken !== ADMIN_TOKEN) {
      newErrors.adminToken = 'Token admin tidak valid';
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
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'admin',
          },
        },
      });
      if (error) throw error;

      if (data.user) {
        await supabase
          .from('profiles')
          .update({
            role: 'admin',
            full_name: formData.fullName,
          })
          .eq('id', data.user.id);
      }

      toast.success('Admin berhasil didaftarkan! Silakan login.');
      setTimeout(() => navigate('/toko/admin'), 1500);
    } catch (error) {
      toast.error('Registrasi admin gagal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Mendaftarkan admin..." />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-roseQuartz to-dustyRose p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-dustyRose/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUserPlus className="w-8 h-8 text-dustyRose" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Daftar Admin</h1>
          <p className="text-gray-600 mt-2">Buat akun admin baru</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nama lengkap"
                className={`w-full pl-10 pr-4 py-2 bg-white/30 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose ${
                  errors.fullName ? 'border-red-400' : 'border-white/40'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email Admin <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@tokorajut.com"
                className={`w-full pl-10 pr-4 py-2 bg-white/30 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose ${
                  errors.email ? 'border-red-400' : 'border-white/40'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimal 6 karakter"
                className={`w-full pl-10 pr-10 py-2 bg-white/30 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose ${
                  errors.password ? 'border-red-400' : 'border-white/40'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Konfirmasi Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi password"
                className={`w-full pl-10 pr-10 py-2 bg-white/30 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose ${
                  errors.confirmPassword ? 'border-red-400' : 'border-white/40'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Token Admin <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showAdminToken ? 'text' : 'password'}
                name="adminToken"
                value={formData.adminToken}
                onChange={handleChange}
                placeholder="Masukkan token admin"
                className={`w-full pl-10 pr-10 py-2 bg-white/30 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose ${
                  errors.adminToken ? 'border-red-400' : 'border-white/40'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowAdminToken((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                aria-label={showAdminToken ? 'Sembunyikan token' : 'Tampilkan token'}
              >
                {showAdminToken ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.adminToken && (
              <p className="text-xs text-red-500 mt-1">{errors.adminToken}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Hanya yang tahu token yang bisa daftar admin            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-dustyRose text-white rounded-lg hover:bg-coral transition-all font-semibold"
          >
            Daftar Admin
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Sudah punya akun?{' '}
          <Link to="/toko/admin" className="text-dustyRose font-semibold hover:text-coral">
            Login Admin
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminRegister;