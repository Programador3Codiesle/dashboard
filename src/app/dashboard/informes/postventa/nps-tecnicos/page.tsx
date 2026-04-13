'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  NpsTecnicoRow,
  OrigenNpsTecnicos,
  SedeNpsTecnicos,
  npsTecnicosService,
} from '@/modules/informes/postventa/services/nps-tecnicos.service';
import { useToast } from '@/components/shared/ui/ToastContext';
import { Pagination } from '@/components/shared/ui/Pagination';

function getRowColor(nps: number) {
  if (nps < 0) return 'bg-red-50';
  if (nps > 0 && nps < 75) return 'bg-yellow-50';
  return 'bg-emerald-50';
}

const ORIGEN_OPCIONES: { value: OrigenNpsTecnicos; label: string }[] = [
  { value: 'nps_int', label: 'NPS Interno' },
  { value: 'nps_col', label: 'NPS Colmotores' },
];

const SEDE_OPCIONES: { value: SedeNpsTecnicos; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'giron', label: 'Girón' },
  { value: 'rosita', label: 'La Rosita' },
  { value: 'bocono', label: 'Cúcuta Boconó' },
  { value: 'barranca', label: 'Barrancabermeja' },
];

const MESES_OPCIONES: { value: number; label: string }[] = [
  { value: 0, label: 'Todos' },
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

const PAGE_SIZE = 15;

const COLUMNAS_TABLA = [
  'Tecnico',
  'NPS',
  'Cantidad de encuestas 0 a 6',
  'Cantidad de encuestas 7 a 8',
  'Cantidad de encuestas 9 a 10',
  'Mes',
] as const;

export default function NpsTecnicosPage() {
  const [origen, setOrigen] = useState<OrigenNpsTecnicos>('nps_int');
  const [sede, setSede] = useState<SedeNpsTecnicos>('todas');
  const [mes, setMes] = useState<number>(0);
  const [rows, setRows] = useState<NpsTecnicoRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const { showError, showInfo } = useToast();

  useEffect(() => {
    setCurrentPage(1);
  }, [rows]);

  const { mutate, status } = useMutation<NpsTecnicoRow[], Error, void>({
    mutationFn: async () => {
      const data = await npsTecnicosService.listar({
        origen,
        sede,
        mes,
      });
      setRows(data);
      if (!data.length) {
        showInfo('No hay datos para los filtros seleccionados.');
      }
      return data;
    },
    onError: () => {
      showError('No se pudo cargar el informe NPS por técnicos.');
    },
  });

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };

  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, currentPage]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold brand-text">
            Informe NPS por Técnicos
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Consulta el NPS por técnico según el origen de datos, sede y mes.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleBuscar}
        className="bg-white rounded-xl shadow-sm border brand-border p-4 md:p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Origen de datos
            </label>
            <select
              value={origen}
              onChange={(e) => setOrigen(e.target.value as OrigenNpsTecnicos)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            >
              {ORIGEN_OPCIONES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Sede</label>
            <select
              value={sede}
              onChange={(e) => setSede(e.target.value as SedeNpsTecnicos)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            >
              {SEDE_OPCIONES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Mes</label>
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            >
              {MESES_OPCIONES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
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
          Resultados
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border-collapse">
            <thead>
              <tr className="brand-bg text-white text-center">
                {COLUMNAS_TABLA.map((col) => (
                  <th
                    key={col}
                    className={`px-2 py-2 ${col === 'Tecnico' ? 'text-left' : ''}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, index) => (
                <tr
                  key={`${row.tecnico}-${row.mesNumero ?? 0}-${row.origen}-${row.sede}-${currentPage}-${index}`}
                  className={`${getRowColor(row.nps)} border-t`}
                >
                  <td className="px-2 py-1 text-left font-medium text-gray-800">
                    {row.tecnico}
                  </td>
                  <td className="px-2 py-1 text-center font-semibold">
                    {row.nps.toFixed(1)}%
                  </td>
                  <td className="px-2 py-1 text-center">{row.enc0a6}</td>
                  <td className="px-2 py-1 text-center">{row.enc7a8}</td>
                  <td className="px-2 py-1 text-center">{row.enc9a10}</td>
                  <td className="px-2 py-1 text-center">{row.mesNombre}</td>
                </tr>
              ))}
              {status !== 'pending' && rows.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-3 text-center text-gray-400 text-xs"
                    colSpan={6}
                  >
                    No hay datos para mostrar. Ajusta los filtros y vuelve a
                    buscar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {status !== 'pending' && totalRows > 0 && (
          <div className="pt-4 border-t border-gray-200 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

