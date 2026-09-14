import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiShield, FiUserPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { supabase } from '../../services/supabaseClient';
import { loginWithToken } from '../../services/authService';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
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

      await loginWithToken(token);
      localStorage.setItem('adminToken', token);
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email Admin</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tokorajut.com"
                className="w-full pl-10 pr-4 py-2 bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Token Admin</label>
            <div className="relative">
              <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Masukkan token admin"
                className="w-full pl-10 pr-4 py-2 bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-dustyRose text-white rounded-lg hover:bg-coral transition-all font-semibold"
          >
            Login Admin
          </button>
        </form>

        <div className="mt-4 p-3 bg-white/30 rounded-lg">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Demo:</span> admin@tokorajut.com / admin123 / rahasia_admin_123
          </p>
        </div>

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