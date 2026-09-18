import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiShield, FiUserPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { supabase } from '../../services/supabaseClient';
import { loginWithToken } from '../../services/authService';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '', token: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email admin wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    if (!formData.token.trim()) {
      newErrors.token = 'Token admin wajib diisi';
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Akun ini bukan admin');
      }

      await loginWithToken(formData.token);
      localStorage.setItem('adminToken', formData.token);
      toast.success('Login admin berhasil!');
      navigate('/toko/admin/dashboard');
    } catch (error) {
      toast.error(error.message || 'Login gagal');
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Memverifikasi akses admin..." />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-roseQuartz to-dustyRose p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-dustyRose/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShield className="w-8 h-8 text-dustyRose" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-600 mt-2">Khusus admin toko</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2 bg-white/30 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose ${
                  errors.password ? 'border-red-400' : 'border-white/40'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Token Admin <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="token"
                value={formData.token}
                onChange={handleChange}
                placeholder="Masukkan token admin"
                className={`w-full pl-10 pr-4 py-2 bg-white/30 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose ${
                  errors.token ? 'border-red-400' : 'border-white/40'
                }`}
              />
            </div>
            {errors.token && (
              <p className="text-xs text-red-500 mt-1">{errors.token}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-dustyRose text-white rounded-lg hover:bg-coral transition-all font-semibold"
          >
            Login Admin
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-white/40">
          <p className="text-center text-gray-600 text-sm">
            Belum punya akun admin?{' '}
            <Link
              to="/toko/admin/register"
              className="text-dustyRose font-semibold hover:text-coral inline-flex items-center gap-1"
            >
              <FiUserPlus className="w-4 h-4" />
              Daftar Admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;