import React, { useState } from 'react';
import { FiHome, FiTruck, FiDollarSign, FiCreditCard, FiSmartphone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import PickupForm from './PickupForm';
import DeliveryForm from './DeliveryForm';
import OrderSummary from './OrderSummary';

const CheckoutForm = ({ cartItems, total, onSuccess }) => {
  const [method, setMethod] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: '',
    message: '',
  });
  const [errors, setErrors] = useState({});

  const handleCustomerChange = (data) => {
    setCustomerData(data);
    if (errors.name && data.name) setErrors((prev) => ({ ...prev, name: '' }));
    if (errors.phone && data.phone) setErrors((prev) => ({ ...prev, phone: '' }));
    if (errors.address && data.address) setErrors((prev) => ({ ...prev, address: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!customerData.name || !customerData.name.trim()) {
      newErrors.name = 'Nama penerima wajib diisi';
    } else if (customerData.name.trim().length < 3) {
      newErrors.name = 'Nama minimal 3 karakter';
    }
    if (!customerData.phone || !customerData.phone.trim()) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    } else if (!/^[0-9+\-\s]{8,20}$/.test(customerData.phone.trim())) {
      newErrors.phone = 'Format nomor telepon tidak valid';
    }
    if (method === 'delivery' && (!customerData.address || !customerData.address.trim())) {
      newErrors.address = 'Alamat pengiriman wajib diisi';
    }
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Pilih metode pembayaran';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Mohon periksa kembali data yang belum lengkap');
      return;
    }
    onSuccess({ method, paymentMethod, ...customerData });
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

  const paymentOptions = [
    {
      value: 'cod',
      label: 'Cash on Delivery (COD)',
      desc: 'Bayar tunai saat pesanan diterima',
      icon: <FiDollarSign className="w-6 h-6" />,
    },
    {
      value: 'transfer',
      label: 'Transfer Bank',
      desc: 'Transfer ke rekening toko sebelum dikirim',
      icon: <FiCreditCard className="w-6 h-6" />,
    },
    {
      value: 'ewallet',
      label: 'E-Wallet',
      desc: 'OVO, GoPay, DANA, ShopeePay',
      icon: <FiSmartphone className="w-6 h-6" />,
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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

      <div className="glass rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Metode Pembayaran</h3>
        <div className="space-y-3">
          {paymentOptions.map((pay) => (
            <button
              key={pay.value}
              type="button"
              onClick={() => setPaymentMethod(pay.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                paymentMethod === pay.value
                  ? 'bg-gradient-to-r from-dustyRose/20 to-coral/10 border-dustyRose shadow-lg'
                  : 'bg-white/30 border-white/40 hover:border-dustyRose/50 hover:bg-white/50'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  paymentMethod === pay.value
                    ? 'bg-dustyRose text-white shadow-md'
                    : 'bg-dustyRose/20 text-dustyRose'
                }`}
              >
                {pay.icon}
              </div>
              <div className="flex-1">
                <h4
                  className={`font-bold mb-1 ${
                    paymentMethod === pay.value ? 'text-dustyRose' : 'text-gray-800'
                  }`}
                >
                  {pay.label}
                </h4>
                <p className="text-xs text-gray-600">{pay.desc}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  paymentMethod === pay.value
                    ? 'border-dustyRose bg-dustyRose'
                    : 'border-gray-300 bg-white/50'
                }`}
              >
                {paymentMethod === pay.value && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
            </button>
          ))}
        </div>

        {errors.paymentMethod && (
          <p className="text-xs text-red-500 mt-2">{errors.paymentMethod}</p>
        )}

        {paymentMethod === 'transfer' && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm">
            <p className="font-semibold text-blue-700 mb-2">Rekening Tujuan</p>
            <p className="text-blue-600">Bank BCA: 1234567890</p>
            <p className="text-blue-600">a/n Urban Knitters</p>
            <p className="text-xs text-blue-500 mt-2">
              Setelah transfer, konfirmasi ke WhatsApp admin agar pesanan segera diproses.
            </p>
          </div>
        )}

        {paymentMethod === 'ewallet' && (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl text-sm">
            <p className="font-semibold text-purple-700 mb-2">E-Wallet Tujuan</p>
            <p className="text-purple-600">OVO / GoPay / DANA: 081234567890</p>
            <p className="text-xs text-purple-500 mt-2">
              Kirim bukti transfer ke WhatsApp admin setelah melakukan pembayaran.
            </p>
          </div>
        )}

        {paymentMethod === 'cod' && method === 'pickup' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm">
            <p className="text-yellow-700">
              Untuk metode COD dengan pengambilan di toko, pembayaran dilakukan tunai saat Anda
              datang mengambil pesanan.
            </p>
          </div>
        )}
      </div>

      {method === 'pickup' ? (
        <PickupForm data={customerData} onChange={handleCustomerChange} errors={errors} />
      ) : (
        <DeliveryForm data={customerData} onChange={handleCustomerChange} errors={errors} />
      )}

      <OrderSummary
        items={cartItems}
        total={total}
        paymentMethod={paymentMethod}
        deliveryMethod={method}
      />

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