import React, { useEffect, useState } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiStar, FiMapPin, FiUser, FiPhone
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  getAddresses, deleteAddress, setDefaultAddress
} from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import AddressFormModal from './AddressFormModal';
import ConfirmModal from '../common/ConfirmModal';

const AddressManager = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [settingDefault, setSettingDefault] = useState(null);

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const data = await getAddresses(user.id);
      setAddresses(data);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat alamat');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    const loadingToast = toast.loading('Menghapus alamat...');
    try {
      await deleteAddress(deleteId);
      await fetchAddresses();
      toast.success('Alamat berhasil dihapus', { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghapus alamat', { id: loadingToast });
    } finally {
      setDeleteId(null);
    }
  };

  const handleSetDefault = async (id) => {
    setSettingDefault(id);
    const loadingToast = toast.loading('Mengubah alamat utama...');
    try {
      await setDefaultAddress(user.id, id);
      await fetchAddresses();
      toast.success('Alamat utama berhasil diubah', { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengubah alamat utama', { id: loadingToast });
    } finally {
      setSettingDefault(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-dustyRose border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Memuat alamat...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-800">Alamat Pengiriman</h3>
          <p className="text-xs text-gray-500">
            {addresses.length} alamat tersimpan
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 px-3 py-2 bg-dustyRose text-white rounded-lg hover:bg-coral text-sm font-semibold"
        >
          <FiPlus className="w-4 h-4" />
          Tambah Alamat
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-white/30 rounded-xl border border-dashed border-white/60">
          <FiMapPin className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium mb-1">Belum ada alamat tersimpan</p>
          <p className="text-sm text-gray-500 mb-4">
            Simpan alamat Anda supaya tidak perlu isi ulang saat checkout
          </p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-1 px-4 py-2 bg-dustyRose text-white rounded-lg hover:bg-coral text-sm font-semibold"
          >
            <FiPlus className="w-4 h-4" />
            Tambah Alamat Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`relative rounded-xl p-4 border-2 transition-all ${
                addr.is_default
                  ? 'bg-dustyRose/5 border-dustyRose'
                  : 'bg-white/40 border-white/40 hover:border-dustyRose/30'
              }`}
            >
              {addr.is_default && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-dustyRose text-white text-xs font-semibold">
                  <FiStar className="w-3 h-3 fill-white" />
                  Utama
                </span>
              )}

              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-dustyRose/20 text-dustyRose flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800">{addr.label}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <FiUser className="w-3.5 h-3.5" />
                    <span>{addr.recipient_name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <FiPhone className="w-3.5 h-3.5" />
                    <span>{addr.phone}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                {addr.address}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/40">
                {!addr.is_default && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    disabled={settingDefault === addr.id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/60 text-dustyRose rounded-lg hover:bg-white/80 text-xs font-semibold border border-dustyRose/30 disabled:opacity-50"
                  >
                    <FiStar className="w-3 h-3" />
                    {settingDefault === addr.id ? 'Menyimpan...' : 'Jadikan Utama'}
                  </button>
                )}
                <button
                  onClick={() => handleEdit(addr)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-xs font-semibold"
                >
                  <FiEdit2 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(addr.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-xs font-semibold"
                >
                  <FiTrash2 className="w-3 h-3" />
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingAddress(null);
        }}
        existingAddress={editingAddress}
        onSuccess={fetchAddresses}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Hapus Alamat"
        message="Yakin ingin menghapus alamat ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
        }}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        confirmColor="red"
      />
    </div>
  );
};

export default AddressManager;