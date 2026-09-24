import React, { useEffect, useState } from 'react';
import {
  FiPlus, FiCheck, FiStar, FiMapPin, FiUser, FiPhone, FiEdit2
} from 'react-icons/fi';
import { getAddresses } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import AddressFormModal from '../customer/AddressFormModal';

const DeliveryForm = ({ data, onChange, errors = {} }) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showManualForm, setShowManualForm] = useState(false);

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const list = await getAddresses(user.id);
      setAddresses(list);
      if (list.length === 0) setShowManualForm(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (addr) => {
    setSelectedId(addr.id);
    setShowManualForm(false);
    onChange({
      ...data,
      name: addr.recipient_name,
      phone: addr.phone,
      address: addr.address,
    });
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowAddModal(true);
  };

  const handleEditAddress = (e, addr) => {
    e.stopPropagation();
    setEditingAddress(addr);
    setShowAddModal(true);
  };

  const handleShowManual = () => {
    setSelectedId(null);
    setShowManualForm(true);
    onChange({
      ...data,
      name: '',
      phone: '',
      address: '',
    });
  };

  const handleAfterAddAddress = async () => {
    if (!user) return;
    try {
      const list = await getAddresses(user.id);
      setAddresses(list);
      if (list.length > 0) {
        handleSelectAddress(list[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAfterEditAddress = async () => {
    if (!user) return;
    try {
      const list = await getAddresses(user.id);
      setAddresses(list);

      // Kalau alamat yang diedit adalah yang sedang terpilih, refresh data terpilih
      if (editingAddress) {
        const updated = list.find((a) => a.id === editingAddress.id);
        if (updated && selectedId === editingAddress.id) {
          onChange({
            ...data,
            name: updated.recipient_name,
            phone: updated.phone,
            address: updated.address,
          });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setEditingAddress(null);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingAddress(null);
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="w-6 h-6 border-2 border-dustyRose border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2 text-center">Memuat alamat...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Daftar Alamat Tersimpan */}
      {addresses.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Pilih Alamat Pengiriman
            </h3>
            <button
              type="button"
              onClick={handleAddNew}
              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-dustyRose text-white rounded-full hover:bg-coral font-semibold"
            >
              <FiPlus className="w-3 h-3" />
              Alamat Baru
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {addresses.map((addr) => {
              const isSelected = selectedId === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => handleSelectAddress(addr)}
                  className={`relative w-full text-left p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-dustyRose/10 border-dustyRose shadow-md'
                      : 'bg-white/40 border-white/40 hover:border-dustyRose/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-dustyRose text-white'
                          : 'bg-dustyRose/20 text-dustyRose'
                      }`}
                    >
                      {isSelected ? (
                        <FiCheck className="w-4 h-4" />
                      ) : (
                        <FiMapPin className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-800 text-sm">
                          {addr.label}
                        </span>
                        {addr.is_default && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-dustyRose text-white text-xs font-semibold">
                            <FiStar className="w-2.5 h-2.5 fill-white" />
                            Utama
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                        <FiUser className="w-3 h-3" />
                        {addr.recipient_name}
                        <span className="text-gray-400">·</span>
                        <FiPhone className="w-3 h-3" />
                        {addr.phone}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2 pr-16">
                        {addr.address}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleEditAddress(e, addr)}
                    className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white/70 text-dustyRose rounded-full hover:bg-white text-xs font-semibold border border-dustyRose/30 transition-all"
                    title="Edit alamat"
                  >
                    <FiEdit2 className="w-3 h-3" />
                    Edit
                  </button>
                </div>
              );
            })}
          </div>

          {!showManualForm && (
            <button
              type="button"
              onClick={handleShowManual}
              className="mt-3 w-full text-center text-xs text-gray-500 hover:text-dustyRose py-2"
            >
              Atau isi alamat berbeda secara manual
            </button>
          )}
        </div>
      )}

      {/* Form Manual */}
      {showManualForm && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-800">
              {addresses.length === 0 ? 'Alamat Pengiriman' : 'Isi Alamat Manual'}
            </h3>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setShowManualForm(false);
                  if (addresses.length > 0 && addresses[0]) {
                    handleSelectAddress(addresses[0]);
                  }
                }}
                className="text-xs text-gray-500 hover:text-dustyRose"
              >
                Kembali ke daftar
              </button>
            )}
          </div>

          {addresses.length === 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700">
                Alamat ini akan otomatis tersimpan setelah checkout, supaya Anda tidak perlu isi ulang di pesanan berikutnya.
              </p>
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Nama Penerima <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={data.name}
                onChange={(e) => onChange({ ...data, name: e.target.value })}
                className={`w-full pl-12 pr-4 py-2 bg-white/30 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose ${
                  errors.name ? 'border-red-400' : 'border-white/40'
                }`}
                placeholder="Masukkan nama penerima"
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Nomor Telepon <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => onChange({ ...data, phone: e.target.value })}
                className={`w-full pl-12 pr-4 py-2 bg-white/30 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose ${
                  errors.phone ? 'border-red-400' : 'border-white/40'
                }`}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Alamat Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-4 top-3 text-gray-400" />
              <textarea
                value={data.address}
                onChange={(e) => onChange({ ...data, address: e.target.value })}
                className={`w-full pl-12 pr-4 py-2 bg-white/30 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose h-24 resize-none ${
                  errors.address ? 'border-red-400' : 'border-white/40'
                }`}
                placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota, kode pos"
              />
            </div>
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>
        </div>
      )}

      {/* Pesan Tambahan */}
      <div className="glass-card rounded-2xl p-6">
        <label className="block text-gray-700 font-medium mb-2">
          Pesan Tambahan (opsional)
        </label>
        <textarea
          value={data.message}
          onChange={(e) => onChange({ ...data, message: e.target.value })}
          className="w-full px-4 py-2 bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose h-20 resize-none"
          placeholder="Contoh: Titip ke resepsionis, atau bawa bubble wrap"
        />
      </div>

      <AddressFormModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        existingAddress={editingAddress}
        onSuccess={editingAddress ? handleAfterEditAddress : handleAfterAddAddress}
      />
    </div>
  );
};

export default DeliveryForm;