'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import type { AusentismoCalendario } from '@/modules/administracion/services/nuevo-ausentismo.service';

export interface CalendarDayProps {
  date: string | null;
  todayStr: string;
  ausentismos: AusentismoCalendario[];
  onCrear: (date: string) => void;
  onVerDetalle: (ausentismo: AusentismoCalendario) => void;
}

/**
 * Componente memoizado para días del calendario.
 * Muestra todos los ausentismos del día; clic en uno abre detalle; clic en zona vacía o "+" abre crear (solo si no es fecha pasada).
 */
export const CalendarDay = React.memo(({
  date,
  todayStr,
  ausentismos,
  onCrear,
  onVerDetalle,
}: CalendarDayProps) => {
  if (!date) {
    return <div className="aspect-square" />;
  }

  const isPast = date < todayStr;
  const isToday = date === todayStr;
  const hasAusentismos = ausentismos.length > 0;

  const handleCrearClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPast) onCrear(date);
  };

  const handleDetalleClick = (e: React.MouseEvent, ausentismo: AusentismoCalendario) => {
    e.stopPropagation();
    onVerDetalle(ausentismo);
  };

  return (
    <div
      className={`
        aspect-square p-2 rounded-xl border-2 transition-all flex flex-col min-h-0
        ${isPast
          ? "bg-gray-100 border-gray-200 text-gray-400"
          : "bg-white border-gray-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
        }
        ${isToday ? "ring-2 ring-[var(--color-primary)] border-[var(--color-primary)]" : ""}
        ${hasAusentismos ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/40" : ""}
      `}
    >
      <div className="text-sm font-medium text-gray-900 flex-shrink-0">{date.split("-")[2]}</div>
      <div className="mt-1 flex-1 min-h-0 overflow-auto space-y-0.5">
        {ausentismos.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={(e) => handleDetalleClick(e, a)}
            className="w-full text-left text-xs font-medium text-white bg-[var(--color-primary)] hover:opacity-90 truncate block rounded px-1 py-0.5 transition-opacity"
            title={`${a.horaInicio} - ${a.horaFin} ${a.motivo}`}
          >
            {a.horaInicio}-{a.horaFin} {a.motivo}
          </button>
        ))}
      </div>
      {!isPast && (
        <button
          type="button"
          onClick={handleCrearClick}
          className="mt-1 flex-shrink-0 w-full flex items-center justify-center gap-0.5 rounded py-0.5 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 text-xs font-medium"
          aria-label="Agregar ausentismo"
        >
          <Plus size={14} /> Agregar
        </button>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  if (prevProps.date !== nextProps.date) return false;
  if (prevProps.ausentismos.length !== nextProps.ausentismos.length) return false;
  if (prevProps.ausentismos.some((a, i) => a.id !== nextProps.ausentismos[i]?.id)) return false;
  if (prevProps.onCrear !== nextProps.onCrear || prevProps.onVerDetalle !== nextProps.onVerDetalle) return false;
  return true;
});

CalendarDay.displayName = 'CalendarDay';
