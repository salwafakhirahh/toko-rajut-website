import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

const CustomSelect = ({ options, value, onChange, placeholder = 'Pilih...', label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
          isOpen
            ? 'bg-gradient-to-r from-white/60 to-dustyRose/20 border-dustyRose shadow-lg'
            : 'bg-gradient-to-r from-white/40 to-dustyRose/10 border-dustyRose/30 hover:border-dustyRose/50'
        }`}
      >
        <span className={`font-medium ${selectedOption ? 'text-gray-800' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiChevronDown className="w-5 h-5 text-dustyRose" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl rounded-xl border-2 border-dustyRose/30 shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
          >
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Belum ada pilihan
              </div>
            ) : (
              options.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between transition-all border-b border-dustyRose/10 last:border-b-0 ${
                    value === option.value
                      ? 'bg-gradient-to-r from-dustyRose/20 to-coral/10 text-dustyRose font-semibold'
                      : 'text-gray-700 hover:bg-dustyRose/10'
                  }`}
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <FiCheck className="w-4 h-4 text-dustyRose" />
                  )}
                </motion.button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;