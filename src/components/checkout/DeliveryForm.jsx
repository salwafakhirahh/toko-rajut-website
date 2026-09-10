import React from 'react';

const DeliveryForm = ({ data, onChange }) => {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <h3 className="text-xl font-bold mb-4">Data Pengiriman</h3>
      
      <div>
        <label className="block text-gray-700 font-medium mb-2">Nama *</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className="w-full px-4 py-2 bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
          placeholder="Masukkan nama"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Alamat Lengkap *</label>
        <textarea
          value={data.address}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          className="w-full px-4 py-2 bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose h-24 resize-none"
          placeholder="Masukkan alamat lengkap"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Nomor Telepon *</label>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => onChange({ ...data, phone: e.target.value })}
          className="w-full px-4 py-2 bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose"
          placeholder="Masukkan nomor telepon"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Pesan Tambahan</label>
        <textarea
          value={data.message}
          onChange={(e) => onChange({ ...data, message: e.target.value })}
          className="w-full px-4 py-2 bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose h-20 resize-none"
          placeholder="Pesan tambahan (opsional)"
        />
      </div>
    </div>
  );
};

export default DeliveryForm;