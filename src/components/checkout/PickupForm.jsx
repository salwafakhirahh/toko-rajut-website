import React, { useEffect, useState } from 'react';
import {
  FiPlus, FiCheck, FiStar, FiUser, FiPhone, FiEdit2
} from 'react-icons/fi';
import { getPickupContacts } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import PickupContactFormModal from '../customer/PickupContactFormModal';

const PickupForm = ({ data, onChange, errors = {} }) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [showManualForm, setShowManualForm] = useState(false);

  useEffect(() => {
    if (user) fetchContacts();
  }, [user]);

  const fetchContacts = async () => {
    try {
      const list = await getPickupContacts(user.id);
      setContacts(list);
      if (list.length === 0) setShowManualForm(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = (contact) => {
    setSelectedId(contact.id);
    setShowManualForm(false);
    onChange({
      ...data,
      name: contact.name,
      phone: contact.phone,
    });
  };

  const handleAddNew = () => {
    setEditingContact(null);
    setShowAddModal(true);
  };

  const handleEditContact = (e, contact) => {
    e.stopPropagation();
    setEditingContact(contact);
    setShowAddModal(true);
  };

  const handleShowManual = () => {
    setSelectedId(null);
    setShowManualForm(true);
    onChange({
      ...data,
      name: '',
      phone: '',
    });
  };

  const handleAfterAddContact = async () => {
    if (!user) return;
    try {
      const list = await getPickupContacts(user.id);
      setContacts(list);
      if (list.length > 0) {
        handleSelectContact(list[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAfterEditContact = async () => {
    if (!user) return;
    try {
      const list = await getPickupContacts(user.id);
      setContacts(list);

      if (editingContact) {
        const updated = list.find((c) => c.id === editingContact.id);
        if (updated && selectedId === editingContact.id) {
          onChange({
            ...data,
            name: updated.name,
            phone: updated.phone,
          });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setEditingContact(null);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingContact(null);
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="w-6 h-6 border-2 border-dustyRose border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2 text-center">Memuat kontak...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Daftar Kontak Tersimpan */}
      {contacts.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Pilih Kontak Pengambilan
            </h3>
            <button
              type="button"
              onClick={handleAddNew}
              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-dustyRose text-white rounded-full hover:bg-coral font-semibold"
            >
              <FiPlus className="w-3 h-3" />
              Kontak Baru
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {contacts.map((contact) => {
              const isSelected = selectedId === contact.id;
              return (
                <div
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
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
                        <FiUser className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-800 text-sm">
                          {contact.label}
                        </span>
                        {contact.is_default && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-dustyRose text-white text-xs font-semibold">
                            <FiStar className="w-2.5 h-2.5 fill-white" />
                            Utama
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                        <FiUser className="w-3 h-3" />
                        {contact.name}
                        <span className="text-gray-400">·</span>
                        <FiPhone className="w-3 h-3" />
                        {contact.phone}
                      </p>
                      {contact.notes && (
                        <p className="text-xs text-gray-500 mt-1 italic line-clamp-2 pr-16">
                          {contact.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleEditContact(e, contact)}
                    className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white/70 text-dustyRose rounded-full hover:bg-white text-xs font-semibold border border-dustyRose/30 transition-all"
                    title="Edit kontak"
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
              Atau isi data pengambil secara manual
            </button>
          )}
        </div>
      )}

      {/* Form Manual */}
      {showManualForm && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-800">
              {contacts.length === 0 ? 'Data Pengambilan' : 'Isi Data Manual'}
            </h3>
            {contacts.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setShowManualForm(false);
                  if (contacts.length > 0 && contacts[0]) {
                    handleSelectContact(contacts[0]);
                  }
                }}
                className="text-xs text-gray-500 hover:text-dustyRose"
              >
                Kembali ke daftar
              </button>
            )}
          </div>

          {contacts.length === 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700">
                Data pengambil ini akan otomatis tersimpan setelah checkout, supaya tidak perlu isi ulang saat ambil di toko berikutnya.
              </p>
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Nama Pengambil <span className="text-red-500">*</span>
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
                placeholder="Masukkan nama pengambil"
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
          placeholder="Contoh: Diambil oleh adik saya, atau bawa KTP"
        />
      </div>

      <PickupContactFormModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        existingContact={editingContact}
        onSuccess={editingContact ? handleAfterEditContact : handleAfterAddContact}
      />
    </div>
  );
};

export default PickupForm;