import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiKey } from 'react-icons/fi';
import { loginWithToken } from '../../services/authService';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminLogin = () => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginWithToken(token);
      navigate('/toko/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Token tidak valid!');
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Memverifikasi token..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-dustyRose/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLock className="w-8 h-8 text-dustyRose" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-600 mt-2">Masukkan token akses admin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Token Admin
            </label>
            <div className="relative">
              <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Masukkan token..."
                className="w-full pl-10 pr-4 py-2 bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100/50 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-dustyRose text-white rounded-lg hover:bg-coral transition-all font-semibold"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Demo token: <span className="font-mono bg-white/30 px-2 py-1 rounded">urban123</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;