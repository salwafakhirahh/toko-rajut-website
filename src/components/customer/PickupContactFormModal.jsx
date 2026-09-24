import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { addPickupContact, updatePickupContact } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const PickupContactFormModal = ({ isOpen, onClose, existingContact, onSuccess }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    label: '',
    name: '',
    phone: '',
    notes: '',
    is_default: false,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (existingContact) {
        setForm({
          label: existingContact.label || '',
          name: existingContact.name || '',
          phone: existingContact.phone || '',
          notes: existingContact.notes || '',
          is_default: existingContact.is_default || false,
        });
      } else {
        setForm({
          label: '',
          name: '',
          phone: '',
          notes: '',
          is_default: false,
        });
      }
      setErrors({});
    }
  }, [isOpen, existingContact]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.label.trim()) newErrors.label = 'Label wajib diisi, misal Diri Sendiri atau Adik';
    else if (form.label.trim().length > 50) newErrors.label = 'Label maksimal 50 karakter';

    if (!form.name.trim()) newErrors.name = 'Nama pengambil wajib diisi';
    else if (form.name.trim().length < 3) newErrors.name = 'Nama minimal 3 karakter';

    if (!form.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi';
    else if (!/^[0-9+\-\s]{8,20}$/.test(form.phone.trim())) newErrors.phone = 'Format nomor telepon tidak valid';

    if (form.notes && form.notes.trim().length > 200) {
      newErrors.notes = 'Catatan maksimal 200 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!validate()) {
      toast.error('Mohon periksa kembali data yang belum lengkap');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        label: form.label.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        notes: form.notes.trim(),
        is_default: form.is_default,
      };

      if (existingContact) {
        await updatePickupContact(existingContact.id, payload);
        toast.success('Kontak pengambilan berhasil diperbarui');
      } else {
        await addPickupContact(payload);
        toast.success('Kontak pengambilan berhasil ditambahkan');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyimpan kontak: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="glass rounded-2xl p-6 shadow-2xl border border-white/50 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {existingContact ? 'Edit Kontak Pengambilan' : 'Tambah Kontak Pengambilan'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) => handleChange('label', e.target.value)}
                    placeholder="Contoh: Diri Sendiri, Adik, Orang Tua"
                    className={`w-full px-4 py-2 bg-white/60 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose text-sm ${
                      errors.label ? 'border-red-400' : 'border-white/40'
                    }`}
                  />
                  {errors.label && <p className="text-xs text-red-500 mt-1">{errors.label}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nama Pengambil <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Nama lengkap yang akan mengambil"
                    className={`w-full px-4 py-2 bg-white/60 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose text-sm ${
                      errors.name ? 'border-red-400' : 'border-white/40'
                    }`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className={`w-full px-4 py-2 bg-white/60 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose text-sm ${
                      errors.phone ? 'border-red-400' : 'border-white/40'
                    }`}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Catatan (opsional)
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows="2"
                    placeholder="Contoh: Titip ke resepsionis, atau bawa KTP"
                    className={`w-full px-4 py-2 bg-white/60 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose text-sm resize-none ${
                      errors.notes ? 'border-red-400' : 'border-white/40'
                    }`}
                  />
                  {errors.notes && <p className="text-xs text-red-500 mt-1">{errors.notes}</p>}
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_default}
                    onChange={(e) => handleChange('is_default', e.target.checked)}
                    className="w-4 h-4 accent-dustyRose"
                  />
                  <span className="text-sm text-gray-700">Jadikan kontak utama</span>
                </label>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 bg-white/60 text-gray-700 rounded-lg hover:bg-white/80 font-semibold border border-white/40"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 bg-dustyRose text-white rounded-lg hover:bg-coral font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FiSave className="w-4 h-4" />
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PickupContactFormModal;