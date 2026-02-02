'use client';

import React, { useCallback } from 'react';
import { DateFilterInput } from '@/components/shared/ui/DateFilterInput';

interface DateRangeFilterProps {
  fechaInicio: string;
  fechaFinal: string;
  onFechaInicioChange: (value: string) => void;
  onFechaFinalChange: (value: string) => void;
  className?: string;
}

/**
 * Componente de filtro de rango de fechas optimizado
 * Aísla el estado de las fechas para evitar re-renders innecesarios
 */
export const DateRangeFilter = React.memo(({
  fechaInicio,
  fechaFinal,
  onFechaInicioChange,
  onFechaFinalChange,
  className = ""
}: DateRangeFilterProps) => {
  const handleFechaInicioChange = useCallback((value: string) => {
    onFechaInicioChange(value);
  }, [onFechaInicioChange]);

  const handleFechaFinalChange = useCallback((value: string) => {
    onFechaFinalChange(value);
  }, [onFechaFinalChange]);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <DateFilterInput
        label="Fecha Inicio"
        value={fechaInicio}
        onChange={handleFechaInicioChange}
      />
      <DateFilterInput
        label="Fecha Final"
        value={fechaFinal}
        onChange={handleFechaFinalChange}
      />
    </div>
  );
});

DateRangeFilter.displayName = 'DateRangeFilter';
