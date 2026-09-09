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
    <div className={`app-form-grid-2 ${className}`}>
      <DateFilterInput
        label="Fecha Inicio"
        value={fechaInicio}
        onChange={handleFechaInicioChange}
        testId="adm-fecha-inicio"
      />
      <DateFilterInput
        label="Fecha Final"
        value={fechaFinal}
        onChange={handleFechaFinalChange}
        testId="adm-fecha-final"
      />
    </div>
  );
});

DateRangeFilter.displayName = 'DateRangeFilter';
