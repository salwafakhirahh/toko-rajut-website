import React, { useEffect, useState } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiStar, FiUser, FiPhone, FiHome
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  getPickupContacts, deletePickupContact, setDefaultPickupContact
} from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import PickupContactFormModal from './PickupContactFormModal';
import ConfirmModal from '../common/ConfirmModal';

const PickupContactManager = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [settingDefault, setSettingDefault] = useState(null);

  useEffect(() => {
    if (user) fetchContacts();
  }, [user]);

  const fetchContacts = async () => {
    try {
      const data = await getPickupContacts(user.id);
      setContacts(data);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat kontak');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingContact(null);
    setShowForm(true);
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    const loadingToast = toast.loading('Menghapus kontak...');
    try {
      await deletePickupContact(deleteId);
      await fetchContacts();
      toast.success('Kontak berhasil dihapus', { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghapus kontak', { id: loadingToast });
    } finally {
      setDeleteId(null);
    }
  };

  const handleSetDefault = async (id) => {
    setSettingDefault(id);
    const loadingToast = toast.loading('Mengubah kontak utama...');
    try {
      await setDefaultPickupContact(user.id, id);
      await fetchContacts();
      toast.success('Kontak utama berhasil diubah', { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengubah kontak utama', { id: loadingToast });
    } finally {
      setSettingDefault(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-dustyRose border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Memuat kontak...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-800">Kontak Pengambilan</h3>
          <p className="text-xs text-gray-500">
            {contacts.length} kontak tersimpan
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 px-3 py-2 bg-dustyRose text-white rounded-lg hover:bg-coral text-sm font-semibold"
        >
          <FiPlus className="w-4 h-4" />
          Tambah Kontak
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-12 bg-white/30 rounded-xl border border-dashed border-white/60">
          <FiHome className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium mb-1">Belum ada kontak tersimpan</p>
          <p className="text-sm text-gray-500 mb-4">
            Simpan kontak pengambil supaya tidak perlu isi ulang saat ambil di toko
          </p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-1 px-4 py-2 bg-dustyRose text-white rounded-lg hover:bg-coral text-sm font-semibold"
          >
            <FiPlus className="w-4 h-4" />
            Tambah Kontak Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`relative rounded-xl p-4 border-2 transition-all ${
                contact.is_default
                  ? 'bg-dustyRose/5 border-dustyRose'
                  : 'bg-white/40 border-white/40 hover:border-dustyRose/30'
              }`}
            >
              {contact.is_default && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-dustyRose text-white text-xs font-semibold">
                  <FiStar className="w-3 h-3 fill-white" />
                  Utama
                </span>
              )}

              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-dustyRose/20 text-dustyRose flex items-center justify-center flex-shrink-0">
                  <FiUser className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800">{contact.label}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <FiUser className="w-3.5 h-3.5" />
                    <span>{contact.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <FiPhone className="w-3.5 h-3.5" />
                    <span>{contact.phone}</span>
                  </div>
                </div>
              </div>

              {contact.notes && (
                <p className="text-sm text-gray-600 mb-3 italic">
                  Catatan: {contact.notes}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/40">
                {!contact.is_default && (
                  <button
                    onClick={() => handleSetDefault(contact.id)}
                    disabled={settingDefault === contact.id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/60 text-dustyRose rounded-lg hover:bg-white/80 text-xs font-semibold border border-dustyRose/30 disabled:opacity-50"
                  >
                    <FiStar className="w-3 h-3" />
                    {settingDefault === contact.id ? 'Menyimpan...' : 'Jadikan Utama'}
                  </button>
                )}
                <button
                  onClick={() => handleEdit(contact)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-xs font-semibold"
                >
                  <FiEdit2 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(contact.id)}
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

      <PickupContactFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingContact(null);
        }}
        existingContact={editingContact}
        onSuccess={fetchContacts}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Hapus Kontak"
        message="Yakin ingin menghapus kontak ini? Tindakan ini tidak dapat dibatalkan."
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

export default PickupContactManager;