import React, { useEffect, useState } from 'react';
import { FiSearch, FiUser, FiMail, FiPhone, FiCalendar } from 'react-icons/fi';
import { supabase } from '../../services/supabaseClient';
import LoadingSpinner from '../common/LoadingSpinner';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) return <LoadingSpinner message="Memuat data pengguna..." />;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Pengguna</h1>
          <p className="text-gray-600">Daftar semua pengguna yang terdaftar</p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, email, atau telepon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white/60 backdrop-blur border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
            />
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dustyRose/10 border-b border-white/40">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Pengguna</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Kontak</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Role</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Terdaftar</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-gray-500">
                      Tidak ada pengguna yang cocok dengan pencarian
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id} className="border-b border-white/20 hover:bg-white/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-dustyRose/20 flex items-center justify-center">
                              <FiUser className="text-dustyRose" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-800">
                              {user.full_name || user.username || 'Tanpa nama'}
                            </p>
                            <p className="text-xs text-gray-500">{user.username || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FiMail className="w-4 h-4 text-gray-400" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                            <FiPhone className="w-4 h-4 text-gray-400" />
                            {user.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin'
                              ? 'bg-dustyRose text-white'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {user.role || 'customer'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="w-4 h-4 text-gray-400" />
                          {formatDate(user.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-600">
          Menampilkan <strong className="text-dustyRose">{filtered.length}</strong> dari{' '}
          <strong>{users.length}</strong> pengguna
        </p>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;