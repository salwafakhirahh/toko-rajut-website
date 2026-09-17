import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiX, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { addReview, updateReview } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const ReviewModal = ({
  isOpen,
  onClose,
  product,
  orderId,
  existingReview = null,
  onSuccess,
}) => {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setReview(existingReview.review || '');
    } else {
      setRating(5);
      setReview('');
    }
  }, [existingReview, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (existingReview) {
        await updateReview(existingReview.id, { rating, review });
        toast.success('Ulasan berhasil diperbarui!');
      } else {
        await addReview({
          product_id: product.product_id,
          user_id: user.id,
          order_id: orderId,
          rating,
          review,
          user_name: profile?.full_name || user.email,
          product_name: product.product_name,
        });
        toast.success('Ulasan berhasil dikirim!');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error('Gagal: ' + error.message);
    } finally {
      setLoading(false);
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
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="glass rounded-2xl p-6 shadow-2xl border border-white/50 relative">
              <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {existingReview ? 'Edit Ulasan' : 'Beri Ulasan'}
              </h3>
              <p className="text-sm text-gray-600 mb-6">{product?.product_name}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <FiStar
                          className={`w-8 h-8 ${
                            star <= (hoverRating || rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {rating === 5 ? 'Sangat Puas' :
                     rating === 4 ? 'Puas' :
                     rating === 3 ? 'Cukup' :
                     rating === 2 ? 'Kurang' : 'Sangat Kurang'}
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Ulasan</label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Ceritakan pengalaman Anda dengan produk ini..."
                    rows="4"
                    className="w-full px-4 py-2 bg-white/30 rounded-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-dustyRose resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-dustyRose text-white rounded-lg hover:bg-coral font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FiSend className="w-4 h-4" />
                  {loading ? 'Mengirim...' : existingReview ? 'Simpan Perubahan' : 'Kirim Ulasan'}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;