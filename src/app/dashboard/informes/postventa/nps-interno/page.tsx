'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, FileSpreadsheet, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  NpsInternoEncuestaDetalle,
  npsInternoService,
} from '@/modules/informes/postventa/services/nps-interno.service';
import { useToast } from '@/components/shared/ui/ToastContext';
import { Pagination } from '@/components/shared/ui/Pagination';

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

const SEDES_DETALLE = [
  { value: 'todas', label: 'Todas' },
  { value: 'giron', label: 'Girón' },
  { value: 'rosita', label: 'La Rosita' },
  { value: 'bocono', label: 'Cúcuta Boconó' },
  { value: 'barranca', label: 'Barrancabermeja' },
] as const;

const MES_OPCIONES = [
  { value: '0', label: 'Todos' },
  ...MESES.map((label, i) => ({ value: String(i + 1), label })),
];

const ENC_PAGE_SIZE = 15;

const inputClass =
  'border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white';
const labelClass = 'text-xs font-medium text-gray-600 mb-1';

export default function NpsInternoPage() {
  const [sedeDetalle, setSedeDetalle] = useState('todas');
  const [mesDetalle, setMesDetalle] = useState('0');
  const [encuestas, setEncuestas] = useState<NpsInternoEncuestaDetalle[]>([]);
  const [encPage, setEncPage] = useState(1);
  const [loadingEncuestas, setLoadingEncuestas] = useState(true);
  const [loadingEncuestasFiltro, setLoadingEncuestasFiltro] = useState(false);
  const [verbalizacion, setVerbalizacion] = useState<string | null>(null);

  const { showError, showInfo } = useToast();

  const cargarEncuestasInicial = useCallback(async () => {
    setLoadingEncuestas(true);
    try {
      const rows = await npsInternoService.listarEncuestas();
      setEncuestas(rows);
      setEncPage(1);
      if (!rows.length) {
        showInfo('No hay encuestas NPS para mostrar.');
      }
    } catch {
      showError('No se pudo cargar el listado de encuestas.');
      setEncuestas([]);
    } finally {
      setLoadingEncuestas(false);
    }
  }, [showError, showInfo]);

  useEffect(() => {
    void cargarEncuestasInicial();
  }, [cargarEncuestasInicial]);

  useEffect(() => {
    if (verbalizacion === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVerbalizacion(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [verbalizacion]);

  const handleBuscarEncuestas = async () => {
    setLoadingEncuestasFiltro(true);
    try {
      const mes = Number(mesDetalle);
      const rows = await npsInternoService.listarEncuestas({
        sede: sedeDetalle,
        mes: Number.isNaN(mes) ? 0 : mes,
      });
      setEncuestas(rows);
      setEncPage(1);
      if (!rows.length) {
        showInfo('No hay resultados para la sede y mes seleccionados.');
      }
    } catch {
      showError('No se pudo aplicar el filtro de encuestas.');
    } finally {
      setLoadingEncuestasFiltro(false);
    }
  };

  const encSurveysLoading = loadingEncuestas || loadingEncuestasFiltro;

  const encTotal = encuestas.length;
  const encTotalPages = Math.max(1, Math.ceil(encTotal / ENC_PAGE_SIZE));
  const encPaginated = useMemo(() => {
    const start = (encPage - 1) * ENC_PAGE_SIZE;
    return encuestas.slice(start, start + ENC_PAGE_SIZE);
  }, [encuestas, encPage]);

  const handleExportEncuestasExcel = () => {
    if (!encuestas.length) {
      showInfo('No hay datos para exportar.');
      return;
    }
    const excelRows = encuestas.map((r) => ({
      Documento: r.nit,
      Técnico: r.nombres,
      'Satisfacción con el concesionario': r.pregunta1,
      'Satisfacción con el trabajo': r.pregunta2,
      'Explicación todo el trabajo realizado': r.pregunta3,
      'Se cumplieron los compromisos pactados': r.pregunta4,
      Verbalización: r.pregunta5,
      Fecha: r.fecha,
      'N° orden': r.nOrden,
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'NPS interno');
    XLSX.writeFile(workbook, 'informe-nps-interno-encuestas.xlsx');
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">
            NPS interno
          </h1>
          <p className="text-gray-500 mt-1">
            Detalle y listado de encuestas (equivalente al informe legacy).
          </p>
        </div>
      </div>

      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800">
          Detalle de encuestas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col min-w-0">
            <label className={labelClass}>Sede</label>
            <select
              value={sedeDetalle}
              onChange={(e) => setSedeDetalle(e.target.value)}
              className={inputClass}
            >
              {SEDES_DETALLE.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col min-w-0">
            <label className={labelClass}>Mes</label>
            <select
              value={mesDetalle}
              onChange={(e) => setMesDetalle(e.target.value)}
              className={inputClass}
            >
              {MES_OPCIONES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={() => void handleBuscarEncuestas()}
            disabled={encSurveysLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 transition-colors"
          >
            {loadingEncuestasFiltro && (
              <Loader2 size={16} className="animate-spin" />
            )}
            <span>Buscar</span>
          </button>
          <button
            type="button"
            onClick={handleExportEncuestasExcel}
            disabled={!encuestas.length || loadingEncuestasFiltro}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
              encuestas.length
                ? 'bg-emerald-600 text-white hover:opacity-90'
                : 'border border-gray-300 text-gray-700 bg-white'
            }`}
          >
            <FileSpreadsheet size={16} />
            <span>Exportar a Excel</span>
          </button>
          {encuestas.length > 0 && (
            <span className="text-xs text-gray-500">
              {encuestas.length} registro{encuestas.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Listado de encuestas
          </h2>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[960px] text-[11px]">
            <thead className="brand-bg text-white">
              <tr>
                <th className="text-left py-2 px-2 font-semibold whitespace-nowrap">
                  Documento
                </th>
                <th className="text-left py-2 px-2 font-semibold whitespace-nowrap">
                  Técnico
                </th>
                <th className="text-left py-2 px-2 font-semibold whitespace-nowrap">
                  Sat. concesionario
                </th>
                <th className="text-left py-2 px-2 font-semibold whitespace-nowrap">
                  Sat. trabajo
                </th>
                <th className="text-left py-2 px-2 font-semibold whitespace-nowrap">
                  Explicación trabajo
                </th>
                <th className="text-left py-2 px-2 font-semibold whitespace-nowrap">
                  Compromisos
                </th>
                <th className="text-center py-2 px-2 font-semibold whitespace-nowrap">
                  Verbalización
                </th>
              </tr>
            </thead>
            <tbody>
              {encSurveysLoading && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    <Loader2 className="inline animate-spin mr-2" size={20} />
                    Cargando encuestas...
                  </td>
                </tr>
              )}
              {!encSurveysLoading && encuestas.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    No hay encuestas para mostrar.
                  </td>
                </tr>
              )}
              {!encSurveysLoading &&
                encPaginated.map((row, i) => (
                  <tr
                    key={`${row.nOrden}-${row.nit}-${i}`}
                    className="border-b border-gray-100 hover:bg-gray-50/60"
                  >
                    <td className="px-2 py-1.5 align-top">{row.nit}</td>
                    <td className="px-2 py-1.5 align-top">{row.nombres}</td>
                    <td className="px-2 py-1.5 align-top">{row.pregunta1}</td>
                    <td className="px-2 py-1.5 align-top">{row.pregunta2}</td>
                    <td className="px-2 py-1.5 align-top">{row.pregunta3}</td>
                    <td className="px-2 py-1.5 align-top">{row.pregunta4}</td>
                    <td className="px-2 py-1.5 text-center align-top">
                      <button
                        type="button"
                        onClick={() => setVerbalizacion(row.pregunta5 || '—')}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 text-(--color-primary) hover:bg-gray-50"
                        title="Ver verbalización"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!encSurveysLoading && encTotal > 0 && (
          <div className="p-4 border-t border-gray-200 flex justify-center">
            <Pagination
              currentPage={encPage}
              totalPages={encTotalPages}
              onChange={setEncPage}
            />
          </div>
        )}
      </motion.div>

      {verbalizacion !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nps-verb-title"
          onClick={() => setVerbalizacion(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3
                id="nps-verb-title"
                className="text-base font-semibold text-gray-900"
              >
                Verbalización
              </h3>
              <button
                type="button"
                onClick={() => setVerbalizacion(null)}
                className="text-sm text-gray-500 hover:text-gray-800 px-2 py-1"
              >
                Cerrar
              </button>
            </div>
            <div className="px-5 py-4 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap">
              {verbalizacion}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
