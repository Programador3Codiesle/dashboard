'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { StatusBadge } from '@/components/shared/ui/StatusBadge';
import { TableRow } from '@/components/shared/ui/TableRow';
import { AusentismoInforme } from '@/modules/administracion/services/informe-ausentismo.service';

interface AusentismoTableRowProps {
  ausentismo: AusentismoInforme;
  onVerDetalle: (ausentismo: AusentismoInforme) => void;
}

/**
 * Componente memoizado para filas de tabla de ausentismos
 * Solo se re-renderiza cuando cambian los datos del ausentismo o la función callback
 */
export const AusentismoTableRow = React.memo(({
  ausentismo,
  onVerDetalle
}: AusentismoTableRowProps) => {
  const handleClick = React.useCallback(() => {
    onVerDetalle(ausentismo);
  }, [ausentismo, onVerDetalle]);

  return (
    <TableRow className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-4 px-6">{ausentismo.gestionadoPor}</td>
      <td className="py-4 px-6 font-medium text-gray-900">{ausentismo.colaborador}</td>
      <td className="py-4 px-6">{ausentismo.sede}</td>
      <td className="py-4 px-6">{ausentismo.area}</td>
      <td className="py-4 px-6">{ausentismo.fechaInicio}</td>
      <td className="py-4 px-6">{ausentismo.horaInicio}</td>
      <td className="py-4 px-6">{ausentismo.fechaFin}</td>
      <td className="py-4 px-6">{ausentismo.horaFin}</td>
      <td className="py-4 px-6">
        <StatusBadge estado={ausentismo.estado} />
      </td>
      <td className="py-4 px-6">
        <button
          onClick={handleClick}
          className="brand-text brand-text-hover"
        >
          <Eye size={18} />
        </button>
      </td>
    </TableRow>
  );
}, (prevProps, nextProps) => {
  // Comparación personalizada para evitar re-renders innecesarios
  return (
    prevProps.ausentismo.id === nextProps.ausentismo.id &&
    prevProps.ausentismo.estado === nextProps.ausentismo.estado &&
    prevProps.onVerDetalle === nextProps.onVerDetalle
  );
});

AusentismoTableRow.displayName = 'AusentismoTableRow';
