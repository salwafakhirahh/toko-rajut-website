import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Login berhasil!');
      setTimeout(() => navigate('/toko'), 1000);
    } catch (error) {
      toast.error('Login gagal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pt-20">
      <div className="glass rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-dustyRose/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLogIn className="w-8 h-8 text-dustyRose" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Login Customer</h1>
          <p className="text-gray-600 mt-2">Masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-dustyRose text-white rounded-lg hover:bg-coral transition-all font-semibold disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <p className="text-gray-600 text-sm">
            Belum punya akun?{' '}
            <Link to="/toko/register" className="text-dustyRose font-semibold hover:text-coral">
              Daftar di sini
            </Link>
          </p>
          <p className="text-gray-500 text-xs">
            Atau{' '}
            <Link to="/toko" className="text-dustyRose hover:underline">
              lanjut belanja sebagai guest
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;