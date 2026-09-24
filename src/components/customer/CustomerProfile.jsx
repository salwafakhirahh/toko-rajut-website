import React, { useEffect, useState } from 'react';
import {
  FiCamera, FiSave, FiUser, FiMail, FiPhone, FiMapPin,
  FiHome, FiTruck
} from 'react-icons/fi';
import {
  supabase, getAddresses, getPickupContacts
} from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import AddressManager from './AddressManager';
import PickupContactManager from './PickupContactManager';
import toast from 'react-hot-toast';

const CustomerProfile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({ full_name: '', phone: '', address: '', avatar_url: '' });
  const [errors, setErrors] = useState({});
  const [addressCount, setAddressCount] = useState(0);
  const [pickupCount, setPickupCount] = useState(0);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        avatar_url: profile.avatar_url || '',
      });
      setLoading(false);
    }
  }, [profile]);

  // Muat jumlah alamat dan kontak setiap kali tab berubah
  useEffect(() => {
    const loadCounts = async () => {
      if (!user) return;
      try {
        const [addresses, contacts] = await Promise.all([
          getAddresses(user.id),
          getPickupContacts(user.id),
        ]);
        setAddressCount(addresses.length);
        setPickupCount(contacts.length);
      } catch (error) {
        console.error(error);
      }
    };
    loadCounts();
  }, [user, activeTab]);

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
      const filePath = `customer-${user.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setForm((prev) => ({ ...prev, avatar_url: data.publicUrl }));
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id);
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

  const tabs = [
    { key: 'profile', label: 'Info Profil', icon: <FiUser className="w-4 h-4" /> },
    {
      key: 'address',
      label: 'Alamat Pengiriman',
      icon: <FiTruck className="w-4 h-4" />,
      count: addressCount,
    },
    {
      key: 'pickup',
      label: 'Kontak Pengambilan',
      icon: <FiHome className="w-4 h-4" />,
      count: pickupCount,
    },
  ];

  return (
    <div className="pt-24 px-4 pb-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Profil Saya</h1>
        <p className="text-gray-600 mb-6">Kelola informasi akun dan data pengiriman Anda</p>

        {/* Tab Navigasi */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-dustyRose text-white shadow-md'
                  : 'bg-white/40 text-gray-700 hover:bg-white/60 border border-white/40'
              }`}
            >
              {tab.icon}
              {tab.label}
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    activeTab === tab.key
                      ? 'bg-white/30 text-white'
                      : 'bg-dustyRose/20 text-dustyRose'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Info Profil */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="bg-white/60 backdrop-blur rounded-2xl shadow-lg p-6 space-y-6" noValidate>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt="Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg" />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-dustyRose/20 flex items-center justify-center border-4 border-white shadow-lg">
                    <FiUser className="w-12 h-12 text-dustyRose" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-dustyRose text-white p-2 rounded-full cursor-pointer hover:bg-coral shadow-md">
                  <FiCamera className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
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
                />
              </div>
              {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={user?.email || ''} disabled
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 border border-white/40 text-gray-500 cursor-not-allowed" />
              </div>
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
                />
              </div>
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
            </div>

            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-dustyRose text-white py-3 rounded-xl hover:bg-coral font-semibold disabled:opacity-50">
              <FiSave /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        )}

        {/* Tab: Alamat Pengiriman */}
        {activeTab === 'address' && (
          <div className="bg-white/60 backdrop-blur rounded-2xl shadow-lg p-6">
            <AddressManager />
          </div>
        )}

        {/* Tab: Kontak Pengambilan */}
        {activeTab === 'pickup' && (
          <div className="bg-white/60 backdrop-blur rounded-2xl shadow-lg p-6">
            <PickupContactManager />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;