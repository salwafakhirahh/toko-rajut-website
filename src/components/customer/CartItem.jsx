import React from 'react';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const product = item.products;
  const defaultImage = `https://picsum.photos/100/100?random=${product?.id}`;

  return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-4">
      <img
        src={product?.image_url || defaultImage}
        alt={product?.name}
        className="w-20 h-20 object-cover rounded-lg"
      />
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800">{product?.name}</h3>
        <p className="text-dustyRose font-bold">
          Rp {product?.price?.toLocaleString('id-ID')}
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