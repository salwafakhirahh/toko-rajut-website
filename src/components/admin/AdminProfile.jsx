import React, { useEffect, useState } from 'react';
import { FiCamera, FiSave, FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const AdminProfile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    bio: '',
    avatar_url: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
      });
      setLoading(false);
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `admin-${user.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      setForm((prev) => ({ ...prev, avatar_url: publicUrl }));

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Foto berhasil diunggah');
      if (refreshProfile) await refreshProfile();
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengunggah foto');
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.full_name.trim()) newErrors.full_name = 'Nama lengkap wajib diisi';
    else if (form.full_name.trim().length < 3) newErrors.full_name = 'Nama minimal 3 karakter';
    if (form.phone && !/^[0-9+\-\s]{8,20}$/.test(form.phone.trim())) {
      newErrors.phone = 'Format nomor telepon tidak valid';
    }
    if (form.address && form.address.trim().length > 500) {
      newErrors.address = 'Alamat maksimal 500 karakter';
    }
    if (form.bio && form.bio.trim().length > 300) {
      newErrors.bio = 'Bio maksimal 300 karakter';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!validateForm()) {
      toast.error('Mohon periksa kembali data yang belum lengkap');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: form.full_name.trim(),
          phone: form.phone,
          address: form.address,
          bio: form.bio,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profil berhasil disimpan');
      if (refreshProfile) await refreshProfile();
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Memuat profil..." />;

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Profil Admin</h1>
        <p className="text-gray-600 mb-6">Kelola informasi pribadi Anda</p>

        <form onSubmit={handleSave} className="bg-white/60 backdrop-blur rounded-2xl shadow-lg p-6 space-y-6" noValidate>
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {form.avatar_url ? (
                <img
                  src={form.avatar_url}
                  alt="Avatar"
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-dustyRose/20 flex items-center justify-center border-4 border-white shadow-lg">
                  <FiUser className="w-12 h-12 text-dustyRose" />
                </div>
              )}

              <label className="absolute bottom-0 right-0 bg-dustyRose text-white p-2 rounded-full cursor-pointer hover:bg-coral transition-colors shadow-md">
                <FiCamera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            {uploading && <p className="text-sm text-gray-500">Mengunggah foto...</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/80 border focus:outline-none focus:ring-2 focus:ring-dustyRose ${
                  errors.full_name ? 'border-red-400' : 'border-white/40'
                }`}
                placeholder="Nama lengkap"
              />
            </div>
            {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 border border-white/40 text-gray-500 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Telepon</label>
            <div className="relative">
              <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/80 border focus:outline-none focus:ring-2 focus:ring-dustyRose ${
                  errors.phone ? 'border-red-400' : 'border-white/40'
                }`}
                placeholder="Nomor telepon"
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat</label>
            <div className="relative">
              <FiMapPin className="absolute left-4 top-3 text-gray-400" />
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="3"
                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/80 border focus:outline-none focus:ring-2 focus:ring-dustyRose ${
                  errors.address ? 'border-red-400' : 'border-white/40'
                }`}
                placeholder="Alamat lengkap"
              />
            </div>
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows="3"
              className={`w-full px-4 py-3 rounded-xl bg-white/80 border focus:outline-none focus:ring-2 focus:ring-dustyRose ${
                errors.bio ? 'border-red-400' : 'border-white/40'
              }`}
              placeholder="Ceritakan sedikit tentang Anda"
            />
            {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio}</p>}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-dustyRose text-white py-3 rounded-xl hover:bg-coral transition-colors font-semibold disabled:opacity-50"
          >
            <FiSave />
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;