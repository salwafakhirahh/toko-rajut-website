import React, { useState } from 'react';
import { FiHome, FiTruck } from 'react-icons/fi';
import PickupForm from './PickupForm';
import DeliveryForm from './DeliveryForm';
import OrderSummary from './OrderSummary';

const CheckoutForm = ({ cartItems, total, onSuccess }) => {
  const [method, setMethod] = useState('pickup');
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSuccess({ method, ...customerData });
  };

  const options = [
    {
      value: 'pickup',
      label: 'Ambil di Toko',
      desc: 'Ambil pesanan langsung di toko',
      icon: <FiHome className="w-6 h-6" />,
    },
    {
      value: 'delivery',
      label: 'Kirim ke Alamat',
      desc: 'Pesanan dikirim ke alamat Anda',
      icon: <FiTruck className="w-6 h-6" />,
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Metode Pemesanan</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMethod(option.value)}
              className={`relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                method === option.value
                  ? 'bg-gradient-to-r from-dustyRose/20 to-coral/10 border-dustyRose shadow-lg'
                  : 'bg-white/30 border-white/40 hover:border-dustyRose/50 hover:bg-white/50'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  method === option.value
                    ? 'bg-dustyRose text-white shadow-md'
                    : 'bg-dustyRose/20 text-dustyRose'
                }`}
              >
                {option.icon}
              </div>
              <div className="flex-1">
                <h4
                  className={`font-bold mb-1 ${
                    method === option.value ? 'text-dustyRose' : 'text-gray-800'
                  }`}
                >
                  {option.label}
                </h4>
                <p className="text-xs text-gray-600">{option.desc}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  method === option.value
                    ? 'border-dustyRose bg-dustyRose'
                    : 'border-gray-300 bg-white/50'
                }`}
              >
                {method === option.value && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {method === 'pickup' ? (
        <PickupForm data={customerData} onChange={setCustomerData} />
      ) : (
        <DeliveryForm data={customerData} onChange={setCustomerData} />
      )}

      <OrderSummary items={cartItems} total={total} />

      <button
        type="submit"
        className="w-full py-3 bg-dustyRose text-white rounded-lg hover:bg-coral transition-all font-semibold shadow-lg"
      >
        Konfirmasi Checkout
      </button>
    </form>
  );
};

export default CheckoutForm;