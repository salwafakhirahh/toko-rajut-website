import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiShield, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { supabase } from '../../services/supabaseClient';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

      sessionStorage.setItem('just_logged_in', 'true');
      sessionStorage.removeItem('toko_guest_mode');

      toast.success('Login admin berhasil!');
      navigate('/toko/admin/dashboard', { replace: true });
    } catch (error) {
      console.error(error);
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
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
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

          <div className="flex justify-end">
            <Link
              to="/toko/forgot-password"
              className="text-sm text-dustyRose hover:text-coral font-medium"
            >
              Lupa password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-dustyRose text-white rounded-lg hover:bg-coral transition-all font-semibold"
          >
            Login Admin
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
          Admin hanya dapat login. Registrasi admin dilakukan manual oleh pemilik toko.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;