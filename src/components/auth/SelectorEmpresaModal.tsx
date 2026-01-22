'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from '@/components/shared/ui/Portal';
import { EMPRESAS } from '@/utils/constants';
import { Building2 } from 'lucide-react';

interface SelectorEmpresaModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (empresaId: number) => void;
}

export function SelectorEmpresaModal({ open, onClose, onSelect }: SelectorEmpresaModalProps) {
  if (!open) return null;

  const handleSelect = (empresaId: number) => {
    onSelect(empresaId);
    onClose();
  };

  return (
    <Portal>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9998] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200/60 w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Selecciona tu empresa</h2>
                  <p className="text-sm text-gray-500">Elige a cuál empresa vas a ingresar</p>
                </div>
              </div>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {EMPRESAS.map((empresa, index) => (
                <motion.button
                  key={empresa.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(empresa.id)}
                  className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-200 hover:border-opacity-80 transition-all duration-200 text-left"
                  style={{
                    borderColor: empresa.color,
                    backgroundColor: `${empresa.color}08`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 text-white font-bold text-lg shadow-md"
                    style={{ backgroundColor: empresa.color }}
                  >
                    {empresa.nombre.charAt(0)}
                  </div>
                  <span className="font-semibold text-gray-900">{empresa.nombre}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
}
