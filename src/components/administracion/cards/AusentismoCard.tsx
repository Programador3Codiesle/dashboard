'use client';

import React from 'react';
import { User, Clock, Calendar } from 'lucide-react';
import { AusentismoDiaActual } from '@/modules/administracion/services/lista-ausentismo.service';

interface AusentismoCardProps {
  ausentismo: AusentismoDiaActual;
  index: number;
}

/**
 * Componente memoizado para tarjetas de ausentismo
 * Evita re-renders innecesarios
 */
export const AusentismoCard = React.memo(({
  ausentismo,
  index
}: AusentismoCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
          <User className="text-rose-600" size={24} />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{ausentismo.nombre}</h3>
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <User size={16} className="text-gray-400" />
          <span>Empleado: {ausentismo.empleado}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <span>Fecha: {ausentismo.fecha}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="font-medium text-gray-900">Motivo:</p>
          <p className="text-gray-700">{ausentismo.motivo}</p>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.ausentismo.id === nextProps.ausentismo.id;
});

AusentismoCard.displayName = 'AusentismoCard';
