import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar } from 'react-icons/fi';

const ProductCard = ({ product }) => {
  const defaultImage = `https://picsum.photos/400/300?random=${product.id}`;

  const price = product.price || 0;
  const discount = product.discount || 0;
  const finalPrice = price - (price * discount / 100);
  const hasDiscount = discount > 0;

  return (
    <div className="glass-card rounded-2xl overflow-hidden relative">
      {hasDiscount && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          -{discount}%
        </div>
      )}

      {product.is_promo && (
        <div className="absolute top-3 right-3 z-10 bg-dustyRose text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          PROMO
        </div>
      )}

      <Link to={`/toko/product/${product.id}`}>
        <img
          src={product.image_url || defaultImage}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-4">
        <Link to={`/toko/product/${product.id}`}>
          <h3 className="font-semibold text-gray-800 hover:text-dustyRose transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {product.description || 'Produk rajut berkualitas'}
        </p>
        <div className="flex items-center gap-2 mb-2">
          <FiStar className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-semibold">{product.rating || 0}</span>
          <span className="text-xs text-gray-500">({product.total_reviews || 0})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {hasDiscount ? (
              <>
                <p className="text-xs line-through text-gray-400">
                  Rp {price.toLocaleString('id-ID')}
                </p>
                <p className="text-lg font-bold text-dustyRose">
                  Rp {finalPrice.toLocaleString('id-ID')}
                </p>
              </>
            ) : (
              <p className="text-lg font-bold text-dustyRose">
                Rp {price.toLocaleString('id-ID')}
              </p>
            )}
          </div>
          <Link
            to={`/toko/product/${product.id}`}
            className="p-2 bg-dustyRose text-white rounded-full hover:bg-coral transition-colors"
          >
            <FiShoppingCart className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;