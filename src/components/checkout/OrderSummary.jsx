import React from 'react';

const OrderSummary = ({ items, total }) => {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-xl font-bold mb-4">Ringkasan Pesanan</h3>
      
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-600">
              {item.products?.name} x{item.quantity}
            </span>
            <span className="font-semibold">
              Rp {(item.products?.price * item.quantity)?.toLocaleString('id-ID')}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-white/40 pt-4">
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-dustyRose">
            Rp {total?.toLocaleString('id-ID')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;