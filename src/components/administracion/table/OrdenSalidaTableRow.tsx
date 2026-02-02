'use client';

import React from 'react';
import { TableRow } from '@/components/shared/ui/TableRow';
import { OrdenSalidaResponse } from '@/modules/administracion/services/formato-orden-salida.service';

interface OrdenSalidaTableRowProps {
  orden: OrdenSalidaResponse;
}

/**
 * Componente memoizado para filas de tabla de órdenes de salida
 */
export const OrdenSalidaTableRow = React.memo(({
  orden
}: OrdenSalidaTableRowProps) => {
  return (
    <TableRow className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-4 px-6 font-medium text-gray-900">{orden.numeroOrden}</td>
      <td className="py-4 px-6">{orden.bodega}</td>
      <td className="py-4 px-6 font-semibold brand-text">{orden.placa}</td>
      <td className="py-4 px-6">{orden.descripcionModelo}</td>
      <td className="py-4 px-6 text-gray-600">{orden.fecha}</td>
      <td className="py-4 px-6">
        <button className="brand-text brand-text-hover font-medium">
          Ver Detalle
        </button>
      </td>
    </TableRow>
  );
}, (prevProps, nextProps) => {
  return prevProps.orden.id === nextProps.orden.id;
});

OrdenSalidaTableRow.displayName = 'OrdenSalidaTableRow';
