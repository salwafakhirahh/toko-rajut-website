import React from 'react';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { calculateFinalPrice, calculateSubtotal } from '../../utils/priceHelper';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const product = item.products;
  const defaultImage = `https://picsum.photos/100/100?random=${product?.id}`;

  const finalPrice = calculateFinalPrice(product);
  const subtotal = calculateSubtotal(product, item.quantity);
  const hasDiscount = (product?.discount || 0) > 0;

  return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-4">
      <img
        src={product?.image_url || defaultImage}
        alt={product?.name}
        className="w-20 h-20 object-cover rounded-lg"
      />
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800">{product?.name}</h3>

        {hasDiscount ? (
          <div>
            <p className="text-xs line-through text-gray-400">
              Rp {product?.price?.toLocaleString('id-ID')}
            </p>
            <p className="text-dustyRose font-bold">
              Rp {finalPrice.toLocaleString('id-ID')}
            </p>
          </div>
        ) : (
          <p className="text-dustyRose font-bold">
            Rp {finalPrice.toLocaleString('id-ID')}
          </p>
        )}

        <p className="text-xs text-gray-500 mt-1">
          Subtotal: Rp {subtotal.toLocaleString('id-ID')}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          className="p-1 bg-white/30 rounded-full hover:bg-white/50"
        >
          <FiMinus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-semibold">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="p-1 bg-white/30 rounded-full hover:bg-white/50"
        >
          <FiPlus className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={() => onRemove(item.id)}
        className="p-2 text-red-500 hover:text-red-700 transition-colors"
      >
        <FiTrash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

export default CartItem;