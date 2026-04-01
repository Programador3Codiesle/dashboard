'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  NpsInternoTecnicoResumen,
  npsInternoService,
} from '@/modules/informes/postventa/services/nps-interno.service';
import { useToast } from '@/components/shared/ui/ToastContext';

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export default function NpsInternoPage() {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState<number>(today.getFullYear());
  const [data, setData] = useState<NpsInternoTecnicoResumen[]>([]);

  const { showError, showInfo } = useToast();

  const { mutate, status } = useMutation<
    NpsInternoTecnicoResumen[],
    Error,
    void
  >({
    mutationFn: async () => {
      const resp = await npsInternoService.obtenerResumen({ year });
      setData(resp);
      if (!resp.length) {
        showInfo('No hay datos de NPS interno para el año seleccionado.');
      }
      return resp;
    },
    onError: () => {
      showError('No se pudo cargar el informe NPS interno.');
    },
  });

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold brand-text">NPS Interno</h1>
          <p className="text-gray-500 text-sm mt-1">
            NPS interno por técnico, sedes y meses del año seleccionado.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleBuscar}
        className="bg-white rounded-xl shadow-sm border brand-border p-4 md:p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Año</label>
            <input
              type="number"
              min={2000}
              max={9999}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={status === 'pending'}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium brand-btn disabled:opacity-60"
          >
            {status === 'pending' ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm border brand-border p-4 md:p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">
          Resumen por técnico
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[--color-primary] text-white text-center">
                <th className="px-2 py-2 text-left">Técnico</th>
                <th className="px-2 py-2 text-left">Sedes</th>
                <th className="px-2 py-2 text-left">Dato</th>
                {MESES.map((mes, index) => (
                  <th key={mes} className="px-2 py-2">
                    {mes}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((tec) => {
                const valoresNps: (string | number)[] = [];
                const valoresEncuestas: (string | number)[] = [];

                for (let i = 1; i <= MESES.length; i += 1) {
                  const mesData = tec.meses.find((m) => m.mes === i);
                  if (mesData) {
                    valoresNps.push(`${mesData.nps.toFixed(0)}%`);
                    valoresEncuestas.push(mesData.totalEncuestas);
                  } else {
                    valoresNps.push(0);
                    valoresEncuestas.push(0);
                  }
                }

                return (
                  <tbody key={tec.tecnicoNit}>
                    <tr>
                      <td
                        className="px-2 py-1 text-left align-top"
                        rowSpan={3}
                      >
                        {tec.tecnicoNombre}
                      </td>
                      <td
                        className="px-2 py-1 text-left align-top"
                        rowSpan={3}
                      >
                        {tec.sedes}
                      </td>
                      <td className="px-2 py-1 text-left bg-blue-100">NPS</td>
                      {valoresNps.map((val, idx) => (
                        <td
                          key={`nps-${tec.tecnicoNit}-${idx}`}
                          className="px-2 py-1 text-center bg-blue-100"
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-2 py-1 text-left bg-green-100">
                        Encuestas
                      </td>
                      {valoresEncuestas.map((val, idx) => (
                        <td
                          key={`enc-${tec.tecnicoNit}-${idx}`}
                          className="px-2 py-1 text-center bg-green-100"
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-2 py-1 text-left bg-yellow-100">OT</td>
                      {MESES.map((_, idx) => (
                        <td
                          key={`ot-${tec.tecnicoNit}-${idx}`}
                          className="px-2 py-1 text-center bg-yellow-100"
                        >
                          {/* En el legacy las OT están comentadas; mantenemos la fila vacía */}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                );
              })}

              {status !== 'pending' && data.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-3 text-center text-gray-400 text-xs"
                    colSpan={3 + MESES.length}
                  >
                    Sin datos para mostrar. Elige un año y pulsa Buscar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

