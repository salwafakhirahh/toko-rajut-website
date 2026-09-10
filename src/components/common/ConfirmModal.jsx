import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Ya, Hapus',
  cancelText = 'Batal',
  confirmColor = 'red'
}) => {
  const colorClasses = {
    red: 'bg-red-500 hover:bg-red-600',
    dustyRose: 'bg-dustyRose hover:bg-coral',
  };

  const iconColors = {
    red: 'bg-red-100 text-red-500',
    dustyRose: 'bg-dustyRose/20 text-dustyRose',
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
            onClick={onCancel}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="glass rounded-2xl p-6 shadow-2xl border border-white/50 relative">
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconColors[confirmColor]}`}>
                  <FiAlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {title || 'Konfirmasi'}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {message || 'Apakah Anda yakin?'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 py-2.5 bg-white/60 text-gray-700 rounded-lg hover:bg-white/80 transition-all font-semibold border border-white/40"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 py-2.5 text-white rounded-lg transition-all font-semibold shadow-lg ${colorClasses[confirmColor]}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;