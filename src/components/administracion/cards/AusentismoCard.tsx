'use client';

import React from 'react';
import { User, Clock, Calendar } from 'lucide-react';
import { AusentismoDiaActual } from '@/modules/administracion/services/lista-ausentismo.service';

interface AusentismoCardProps {
  ausentismo: AusentismoDiaActual;
  index: number;
  confirming?: boolean;
  onConfirmar?: (id: number) => void;
}

/**
 * Componente memoizado para tarjetas de ausentismo
 * Evita re-renders innecesarios
 */
export const AusentismoCard = React.memo(({
  ausentismo,
  confirming = false,
  onConfirmar,
}: AusentismoCardProps) => {
  const estadoClasses =
    ausentismo.estado === "Autorizado"
      ? "bg-green-100 text-green-700 border-green-200"
      : ausentismo.estado === "Negado"
        ? "bg-red-100 text-red-700 border-red-200"
        : "bg-amber-100 text-amber-700 border-amber-200";

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 brand-bg-light rounded-xl flex items-center justify-center">
          <User className="brand-text" size={24} />
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${estadoClasses}`}>
          {ausentismo.estado}
        </span>
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
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <span>Hora inicio: {ausentismo.horaInicio}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <span>Hora fin: {ausentismo.horaFin}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="font-medium text-gray-900">Motivo:</p>
          <p className="text-gray-700">{ausentismo.motivo}</p>
        </div>
        {ausentismo.estado === "Autorizado" ? (
          <button
            type="button"
            disabled={confirming}
            onClick={() => onConfirmar?.(ausentismo.id)}
            className="mt-4 w-full rounded-xl brand-bg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {confirming ? "Confirmando..." : "Confirmar"}
          </button>
        ) : (
          <p className="mt-4 text-sm text-amber-700">
            El ausentismo no ha sido aprobado
          </p>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.ausentismo.id === nextProps.ausentismo.id &&
    prevProps.ausentismo.estado === nextProps.ausentismo.estado &&
    prevProps.confirming === nextProps.confirming
  );
});

AusentismoCard.displayName = 'AusentismoCard';
