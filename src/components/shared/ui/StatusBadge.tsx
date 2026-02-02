'use client';

import React from 'react';

interface StatusBadgeProps {
  estado: string;
  className?: string;
}

/**
 * Componente memoizado para badges de estado
 * Evita re-renders cuando el estado no cambia
 */
export const StatusBadge = React.memo(({ estado, className = "" }: StatusBadgeProps) => {
  const getBadgeClasses = (estado: string) => {
    if (estado === "Autorizado" || estado === "Aprobado") {
      return "bg-green-100 text-green-700";
    }
    if (estado === "Rechazado") {
      return "bg-red-100 text-red-700";
    }
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${getBadgeClasses(estado)} ${className}`}>
      {estado}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';
