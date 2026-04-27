import { memo } from 'react';
import type { PanelNpsTablaRow } from '@/modules/informes/postventa/services/panel-nps.service';
import {
  formatCantidadCo,
  formatNumeroCo,
} from '@/modules/informes/postventa/format-cantidad-co';

export type PanelNpsTablaFilaProps = {
  row: PanelNpsTablaRow;
};

function etiquetaFila(row: PanelNpsTablaRow) {
  if (row.tipo === 'tecnico') {
    return row.nombreTecnico ?? row.nitTecnico ?? '—';
  }
  if (row.sede === 'general') return 'General';
  return row.sede;
}

function claseFondoNpsMeta(row: PanelNpsTablaRow) {
  if (row.tipo === 'tecnico') return 'bg-amber-50';
  if (row.sede === 'general') return 'bg-sky-100';
  return 'bg-purple-100';
}

export const PanelNpsTablaFila = memo(function PanelNpsTablaFila({
  row,
}: PanelNpsTablaFilaProps) {
  const indent = row.tipo === 'tecnico';

  return (
    <tr className="border-t">
      <td
        className={`px-2 py-1 text-left text-[11px] text-gray-800 bg-gray-50 border-r ${
          indent ? 'pl-6' : ''
        }`}
      >
        {etiquetaFila(row)}
      </td>
      <td className="px-1 py-1 bg-red-500 text-white text-center">
        {formatCantidadCo(row.enc0a6)}
      </td>
      <td className="px-1 py-1 bg-yellow-300 text-black text-center">
        {formatCantidadCo(row.enc7a8)}
      </td>
      <td className="px-1 py-1 bg-green-500 text-black text-center">
        {formatCantidadCo(row.enc9a10)}
      </td>
      <td className="px-1 py-1 bg-cyan-300 text-black text-center">
        {formatCantidadCo(row.to)}
      </td>
      <td
        className={`px-1 py-1 text-black text-center ${claseFondoNpsMeta(row)}`}
      >
        {formatNumeroCo(row.nps, 1, 1)}%
      </td>
      <td
        className={`px-1 py-1 text-black text-center ${claseFondoNpsMeta(row)}`}
      >
        {formatNumeroCo(row.meta, 0, 0)}%
      </td>
    </tr>
  );
});
