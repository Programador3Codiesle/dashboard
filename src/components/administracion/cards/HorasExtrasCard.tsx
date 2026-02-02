'use client';

import React from 'react';
import { TrendingUp, User, Clock, Calendar } from 'lucide-react';
import { HorasExtrasDiaActual } from '@/modules/administracion/services/lista-horas-extras.service';

interface HorasExtrasCardProps {
  horasExtras: HorasExtrasDiaActual;
  index: number;
}

/**
 * Componente memoizado para tarjetas de horas extras
 * Evita re-renders innecesarios
 */
export const HorasExtrasCard = React.memo(({
  horasExtras,
  index
}: HorasExtrasCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
          <TrendingUp className="text-teal-600" size={24} />
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          Aprobado
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{horasExtras.nombreEmpleado}</h3>
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <User size={16} className="text-gray-400" />
          <span>Empleado: {horasExtras.empleado}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <span>Hora inicio: {horasExtras.horaInicio}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <span>Hora fin: {horasExtras.horaFin}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <span>Fecha: {horasExtras.fecha}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="font-medium text-gray-900">Descripción:</p>
          <p className="text-gray-700">{horasExtras.descripcion}</p>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.horasExtras.id === nextProps.horasExtras.id;
});

HorasExtrasCard.displayName = 'HorasExtrasCard';
