// Simple modal component for showing QR codes
// Usage: <Modal open={open} onClose={...}>{children}</Modal>
'use client';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6 relative max-w-full w-[350px]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">✕</button>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
