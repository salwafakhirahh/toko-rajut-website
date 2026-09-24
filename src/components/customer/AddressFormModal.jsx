import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { addAddress, updateAddress } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const AddressFormModal = ({ isOpen, onClose, existingAddress, onSuccess }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    label: '',
    recipient_name: '',
    phone: '',
    address: '',
    is_default: false,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (existingAddress) {
        setForm({
          label: existingAddress.label || '',
          recipient_name: existingAddress.recipient_name || '',
          phone: existingAddress.phone || '',
          address: existingAddress.address || '',
          is_default: existingAddress.is_default || false,
        });
      } else {
        setForm({
          label: '',
          recipient_name: '',
          phone: '',
          address: '',
          is_default: false,
        });
      }
      setErrors({});
    }
  }, [isOpen, existingAddress]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.label.trim()) newErrors.label = 'Label wajib diisi, misal Rumah atau Kantor';
    else if (form.label.trim().length > 50) newErrors.label = 'Label maksimal 50 karakter';

    if (!form.recipient_name.trim()) newErrors.recipient_name = 'Nama penerima wajib diisi';
    else if (form.recipient_name.trim().length < 3) newErrors.recipient_name = 'Nama minimal 3 karakter';

    if (!form.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi';
    else if (!/^[0-9+\-\s]{8,20}$/.test(form.phone.trim())) newErrors.phone = 'Format nomor telepon tidak valid';

    if (!form.address.trim()) newErrors.address = 'Alamat wajib diisi';
    else if (form.address.trim().length < 10) newErrors.address = 'Alamat minimal 10 karakter';
    else if (form.address.trim().length > 500) newErrors.address = 'Alamat maksimal 500 karakter';

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
        recipient_name: form.recipient_name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        is_default: form.is_default,
      };

      if (existingAddress) {
        await updateAddress(existingAddress.id, payload);
        toast.success('Alamat berhasil diperbarui');
      } else {
        await addAddress(payload);
        toast.success('Alamat berhasil ditambahkan');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyimpan alamat: ' + error.message);
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
                {existingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}
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
                    placeholder="Contoh: Rumah, Kantor, Kos"
                    className={`w-full px-4 py-2 bg-white/60 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose text-sm ${
                      errors.label ? 'border-red-400' : 'border-white/40'
                    }`}
                  />
                  {errors.label && <p className="text-xs text-red-500 mt-1">{errors.label}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nama Penerima <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.recipient_name}
                    onChange={(e) => handleChange('recipient_name', e.target.value)}
                    placeholder="Nama lengkap penerima"
                    className={`w-full px-4 py-2 bg-white/60 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose text-sm ${
                      errors.recipient_name ? 'border-red-400' : 'border-white/40'
                    }`}
                  />
                  {errors.recipient_name && <p className="text-xs text-red-500 mt-1">{errors.recipient_name}</p>}
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
                    Alamat Lengkap <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    rows="3"
                    placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota, kode pos"
                    className={`w-full px-4 py-2 bg-white/60 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dustyRose text-sm resize-none ${
                      errors.address ? 'border-red-400' : 'border-white/40'
                    }`}
                  />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_default}
                    onChange={(e) => handleChange('is_default', e.target.checked)}
                    className="w-4 h-4 accent-dustyRose"
                  />
                  <span className="text-sm text-gray-700">Jadikan alamat utama</span>
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

export default AddressFormModal;