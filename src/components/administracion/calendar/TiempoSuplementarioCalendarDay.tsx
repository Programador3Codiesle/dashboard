'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import type { TiempoSuplementarioCalendario } from '@/modules/administracion/services/solicitud-tiempo-suplementario.service';

export interface TiempoSuplementarioCalendarDayProps {
  date: string | null;
  todayStr: string;
  tiempos: TiempoSuplementarioCalendario[];
  onCrear: (date: string) => void;
  onVerDetalle: (item: TiempoSuplementarioCalendario) => void;
}

/**
 * Día del calendario de tiempo suplementario.
 * Muestra todos los tiempos del día; clic en uno abre detalle; clic en "Agregar" abre crear (solo si no es fecha pasada).
 * Títulos con texto blanco y fondo brand.
 */
export const TiempoSuplementarioCalendarDay = React.memo(({
  date,
  todayStr,
  tiempos,
  onCrear,
  onVerDetalle,
}: TiempoSuplementarioCalendarDayProps) => {
  if (!date) {
    return <div className="aspect-square" />;
  }

  const isPast = date < todayStr;
  const isToday = date === todayStr;
  const hasTiempos = tiempos.length > 0;

  const handleCrearClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPast) onCrear(date);
  };

  const handleDetalleClick = (e: React.MouseEvent, item: TiempoSuplementarioCalendario) => {
    e.stopPropagation();
    onVerDetalle(item);
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
        ${hasTiempos ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/40" : ""}
      `}
    >
      <div className="text-sm font-medium text-gray-900 shrink-0">{date.split("-")[2]}</div>
      <div className="mt-1 flex-1 min-h-0 overflow-auto space-y-0.5">
        {tiempos.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={(e) => handleDetalleClick(e, t)}
            className="w-full text-left text-xs font-medium text-white bg-[var(--color-primary)] hover:opacity-90 truncate block rounded px-1 py-0.5 transition-opacity"
            title={`${t.horaInicio} - ${t.horaFin}`}
          >
            {t.horaInicio}-{t.horaFin}
          </button>
        ))}
      </div>
      {!isPast && (
        <button
          type="button"
          onClick={handleCrearClick}
          className="mt-1 shrink-0 w-full flex items-center justify-center gap-0.5 rounded py-0.5 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 text-xs font-medium"
          aria-label="Agregar solicitud"
        >
          <Plus size={14} /> Agregar
        </button>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  if (prevProps.date !== nextProps.date) return false;
  if (prevProps.tiempos.length !== nextProps.tiempos.length) return false;
  if (prevProps.tiempos.some((t, i) => t.id !== nextProps.tiempos[i]?.id)) return false;
  if (prevProps.onCrear !== nextProps.onCrear || prevProps.onVerDetalle !== nextProps.onVerDetalle) return false;
  return true;
});

TiempoSuplementarioCalendarDay.displayName = 'TiempoSuplementarioCalendarDay';
