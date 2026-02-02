'use client';

import React from 'react';
import { StatusBadge } from '@/components/shared/ui/StatusBadge';
import { TableRow } from '@/components/shared/ui/TableRow';
import { TiempoSuplementarioInforme } from '@/modules/administracion/services/informe-tiempo-suplementario.service';

interface TiempoSuplementarioTableRowProps {
  tiempo: TiempoSuplementarioInforme;
}

/**
 * Componente memoizado para filas de tabla de tiempo suplementario
 */
export const TiempoSuplementarioTableRow = React.memo(({
  tiempo
}: TiempoSuplementarioTableRowProps) => {
  return (
    <TableRow className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-4 px-6 font-medium text-gray-900">{tiempo.nombreEmpleado}</td>
      <td className="py-4 px-6">{tiempo.sede}</td>
      <td className="py-4 px-6">{tiempo.area}</td>
      <td className="py-4 px-6">{tiempo.fecha}</td>
      <td className="py-4 px-6">{tiempo.horaInicio}</td>
      <td className="py-4 px-6">{tiempo.horaFin}</td>
      <td className="py-4 px-6 text-sm">{tiempo.descripcion}</td>
      <td className="py-4 px-6">
        <StatusBadge estado={tiempo.estado} />
      </td>
    </TableRow>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.tiempo.id === nextProps.tiempo.id &&
    prevProps.tiempo.estado === nextProps.tiempo.estado
  );
});

TiempoSuplementarioTableRow.displayName = 'TiempoSuplementarioTableRow';
