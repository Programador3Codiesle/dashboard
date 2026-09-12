'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import {
  NpsTecnicoRow,
  OrigenNpsTecnicos,
  SedeNpsTecnicos,
  npsTecnicosService,
} from '@/modules/informes/postventa/services/nps-tecnicos.service';
import { getXlsx } from '@/utils/export-xlsx';
import { useToast } from '@/components/shared/ui/ToastContext';
import { Pagination } from '@/components/shared/ui/Pagination';
import { formatNumeroCo } from '@/modules/informes/postventa/format-cantidad-co';
import { InformesPageFrame } from '@/modules/informes/components/InformesPageFrame';
import { INFORMES_COPY, INFORMES_PV_TRIMENU } from '@/modules/informes/constants';
import { informesKeys } from '@/modules/informes/shared/constants/query-keys';
import { useInformesPageGuard } from '@/modules/informes/shared/hooks/useInformesPageGuard';

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

export function NpsTecnicosGestion() {
  const { blocked } = useInformesPageGuard({
    trimenuId: INFORMES_PV_TRIMENU.npsTecnicos,
    redirectTo: '/dashboard/informes/postventa',
  });
  const [origen, setOrigen] = useState<OrigenNpsTecnicos>('nps_int');
  const [sede, setSede] = useState<SedeNpsTecnicos>('todas');
  const [mes, setMes] = useState<number>(0);
  const [filtrosAplicados, setFiltrosAplicados] = useState<{
    origen: OrigenNpsTecnicos;
    sede: SedeNpsTecnicos;
    mes: number;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingExport, setLoadingExport] = useState(false);

  const { showError, showInfo } = useToast();

  const {
    data: rows = [],
    isFetching,
    isError,
  } = useQuery<NpsTecnicoRow[]>({
    queryKey: informesKeys.pv.npsTecnicos(JSON.stringify(filtrosAplicados)),
    queryFn: () =>
      npsTecnicosService.listar({
        origen: filtrosAplicados!.origen,
        sede: filtrosAplicados!.sede,
        mes: filtrosAplicados!.mes,
      }),
    enabled: filtrosAplicados != null,
  });

  useEffect(() => {
    if (!isError) return;
    showError('No se pudo cargar el informe NPS por técnicos.');
  }, [isError, showError]);

  useEffect(() => {
    if (filtrosAplicados == null || isFetching) return;
    if (rows.length === 0) {
      showInfo('No hay datos para los filtros seleccionados.');
    }
  }, [filtrosAplicados, isFetching, rows.length, showInfo]);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setFiltrosAplicados({ origen, sede, mes });
  };

  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safeCurrentPage]);

  const handleExportar = useCallback(async () => {
    if (rows.length === 0) {
      showError('No hay datos para exportar');
      return;
    }
    setLoadingExport(true);
    try {
      const excelRows = rows.map((row) => ({
        Tecnico: row.tecnico,
        NPS: Number(row.nps.toFixed(1)),
        'Cantidad de encuestas 0 a 6': row.enc0a6,
        'Cantidad de encuestas 7 a 8': row.enc7a8,
        'Cantidad de encuestas 9 a 10': row.enc9a10,
        Mes: row.mesNombre,
      }));
      const XLSX = await getXlsx();
      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'NPS tecnicos');
      XLSX.writeFile(workbook, 'NPS detallado por tecnico.xlsx');
    } catch {
      showError('No se pudo exportar el informe');
    } finally {
      setLoadingExport(false);
    }
  }, [rows, showError]);

  if (blocked) return null;

  return (
    <InformesPageFrame
      title={INFORMES_COPY.npsTecnicos.title}
      description={INFORMES_COPY.npsTecnicos.description}
      backHref="/dashboard/informes/postventa"
      backLabel={INFORMES_COPY.backPv}
    >
      <form
        onSubmit={handleBuscar}
        className="bg-white rounded-xl shadow-sm border brand-border p-4 md:p-3 sm:p-4 md:p-6 space-y-4"
      >
        <div className="app-form-grid-3">
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

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="submit"
            disabled={isFetching}
            className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium brand-btn disabled:opacity-60"
          >
            {isFetching && <Loader2 size={16} className="animate-spin" />}
            <span>{isFetching ? 'Buscando...' : 'Buscar'}</span>
          </button>
          <button
            type="button"
            onClick={handleExportar}
            disabled={loadingExport || isFetching || rows.length === 0}
            className={`inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
              rows.length > 0
                ? 'bg-(--color-success) text-white hover:opacity-90'
                : 'border border-gray-300 text-gray-700 bg-white'
            }`}
          >
            {loadingExport && <Loader2 size={16} className="animate-spin" />}
            <FileSpreadsheet size={16} />
            <span>Exportar a Excel</span>
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm border brand-border p-4 md:p-3 sm:p-4 md:p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">
          Resultados
        </h2>
        <div className="app-table-scroll">
          <table className="min-w-[800px] w-full text-xs border-collapse">
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
                    {formatNumeroCo(row.nps, 1, 1)}%
                  </td>
                  <td className="px-2 py-1 text-center">{row.enc0a6}</td>
                  <td className="px-2 py-1 text-center">{row.enc7a8}</td>
                  <td className="px-2 py-1 text-center">{row.enc9a10}</td>
                  <td className="px-2 py-1 text-center">{row.mesNombre}</td>
                </tr>
              ))}
              {!isFetching && rows.length === 0 && (
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
        {!isFetching && totalRows > 0 && (
          <div className="pt-4 border-t border-gray-200 flex justify-center">
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </InformesPageFrame>
  );
}

