'use client';

import React from 'react';
import { TableRow } from '@/components/shared/ui/TableRow';
import { Inasistencia } from '@/modules/administracion/services/inasistencia.service';

interface InasistenciaTableRowProps {
  inasistencia: Inasistencia;
}

/**
 * Componente memoizado para filas de tabla de inasistencias
 */
export const InasistenciaTableRow = React.memo(({
  inasistencia
}: InasistenciaTableRowProps) => {
  return (
    <TableRow className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-4 px-6">{inasistencia.documento}</td>
      <td className="py-4 px-6 font-medium text-gray-900">{inasistencia.nombre}</td>
      <td className="py-4 px-6 text-gray-600">{inasistencia.fecha}</td>
    </TableRow>
  );
}, (prevProps, nextProps) => {
  return prevProps.inasistencia.id === nextProps.inasistencia.id;
});

InasistenciaTableRow.displayName = 'InasistenciaTableRow';
