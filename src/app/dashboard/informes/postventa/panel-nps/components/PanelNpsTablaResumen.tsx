import { memo } from 'react';
import type { PanelNpsTablaRow } from '@/modules/informes/postventa/services/panel-nps.service';
import { PanelNpsTablaFila } from './PanelNpsTablaFila';

export type PanelNpsTablaResumenProps = {
  tabla: PanelNpsTablaRow[];
  isLoading: boolean;
};

export const PanelNpsTablaResumen = memo(function PanelNpsTablaResumen({
  tabla,
  isLoading,
}: PanelNpsTablaResumenProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border brand-border p-4 md:p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">
        Resumen NPS (mes calendario actual)
      </h2>
      <p className="text-[11px] text-gray-500 mb-2">
        Filas en color: agregado por sede. Filas claras con sangría: técnico (NPS
        propio; PA usa totales 9–10 y 0–6 de la sede, como el panel legacy).
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border-collapse">
          <thead>
            <tr className="text-center text-[11px]">
              <th className="px-2 py-1 bg-gray-100 text-gray-700 text-left min-w-[120px]">
                Indicador
              </th>
              <th className="px-1 py-1 bg-red-500 text-white w-10">D</th>
              <th className="px-1 py-1 bg-yellow-300 text-black w-10">N</th>
              <th className="px-1 py-1 bg-green-500 text-black w-10">P</th>
              <th className="px-1 py-1 bg-cyan-300 text-black w-10">PA</th>
              <th className="px-1 py-1 bg-slate-200 text-black w-14">NPS</th>
              <th className="px-1 py-1 bg-slate-200 text-black w-16">
                META NPS
              </th>
            </tr>
          </thead>
          <tbody className="text-center">
            {tabla.map((row) => (
              <PanelNpsTablaFila
                key={`${row.tipo}-${row.sede}-${row.nitTecnico ?? 'agg'}`}
                row={row}
              />
            ))}
            {!isLoading && tabla.length === 0 && (
              <tr>
                <td
                  className="px-2 py-2 text-gray-400 text-xs text-left"
                  colSpan={7}
                >
                  Sin datos para el mes actual.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});
