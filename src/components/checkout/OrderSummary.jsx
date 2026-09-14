import React from 'react';
import { calculateSubtotal, calculateFinalPrice, getDiscountAmount } from '../../utils/priceHelper';

const OrderSummary = ({ items, total }) => {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-xl font-bold mb-4">Ringkasan Pesanan</h3>

      <div className="space-y-3 mb-4">
        {items.map((item) => {
          const subtotal = calculateSubtotal(item.products, item.quantity);
          const finalPrice = calculateFinalPrice(item.products);
          const hasDiscount = (item.products?.discount || 0) > 0;

          return (
            <div key={item.id} className="flex justify-between text-sm">
              <div className="flex-1">
                <span className="text-gray-700">
                  {item.products?.name} x{item.quantity}
                </span>
                {hasDiscount && (
                  <p className="text-xs text-gray-400 line-through">
                    Rp {item.products?.price?.toLocaleString('id-ID')} x{item.quantity}
                  </p>
                )}
              </div>
              <span className="font-semibold">
                Rp {subtotal.toLocaleString('id-ID')}
              </span>
            </div>
          );
        })}
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