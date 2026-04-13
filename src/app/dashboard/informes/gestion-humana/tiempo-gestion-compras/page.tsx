'use client';

import { useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { tiempoGestionComprasService } from '@/modules/informes/gestion-humana/services/tiempo-gestion-compras.service';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/shared/ui/ToastContext';

const ESTADOS = ['DESPACHADA', 'EN PROCESO', 'EN TRANSITO', 'NEGADA', 'SIN REVISAR'];
const URGENCIAS = ['', 'No tan urgente', 'Urgente', 'Muy urgente'];
const PAGE_SIZE = 10;

export default function TiempoGestionComprasPage() {
  const { showError, showInfo } = useToast();
  const consultaEnCursoRef = useRef(false);
  const [fechaIni, setFechaIni] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [estado, setEstado] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const inputClass =
    'border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white w-full';

  const mutation = useMutation({
    retry: false,
    mutationFn: async () => {
      if ((fechaIni && !fechaFin) || (!fechaIni && fechaFin)) {
        throw new Error('Por favor ingrese ambas fechas');
      }
      return tiempoGestionComprasService.listar({
        fechaIni: fechaIni || undefined,
        fechaFin: fechaFin || undefined,
        estado: estado || undefined,
      });
    },
    onSuccess: (result) => {
      if (result.length === 0) {
        showInfo('No hay registros para los filtros seleccionados.');
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error consultando informe de tiempo gestión compras';
      showError(message);
    },
  });

  const data = mutation.data ?? [];
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, currentPage]);

  const formatDateOnly = (value?: string | null) => {
    if (!value) return '';
    const s = String(value).trim();
    const iso = s.match(/^(\d{4}-\d{2}-\d{2})/);
    if (iso) return iso[1];
    return s.slice(0, 10);
  };

  const handleFiltrar = () => {
    if ((fechaIni && !fechaFin) || (!fechaIni && fechaFin)) {
      showError('Por favor ingrese ambas fechas');
      return;
    }
    if (mutation.isPending || consultaEnCursoRef.current) return;
    setCurrentPage(1);
    consultaEnCursoRef.current = true;
    mutation.mutate(undefined, {
      onSettled: () => {
        consultaEnCursoRef.current = false;
      },
    });
  };

  const handleExportCsv = () => {
    if (!data.length) return;

    const rows = data.map((r) => ({
      'Solicitado Por': r.solicitado_por,
      'Descripción': r.descri_prod,
      'Area a Cargar': r.area_cargar,
      'Urgencia': URGENCIAS[r.urgencia] ?? '',
      'Fecha Solicitud': formatDateOnly(r.fecha_solicitud),
      'Fecha Negada': formatDateOnly(r.fecha_negada),
      'Fecha Despacho': formatDateOnly(r.fecha_despacho),
      'Estado Actual': r.estado_actual,
      Días: String(r.dias),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TiempoGestionCompras');
    XLSX.writeFile(workbook, 'informe-tiempo-gestion-compras.xlsx');
  };

  return (
    <div className="space-y-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Fecha inicial</label>
            <input
              type="date"
              value={fechaIni}
              onChange={(e) => setFechaIni(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Fecha final</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Estado</label>
            <select className={inputClass} value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="">Seleccione una opción</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleFiltrar}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
            <span>{mutation.isPending ? 'Consultando...' : 'Filtrar'}</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!data.length}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-sm hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Exportar a Excel
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs" id="tabladatos">
            <thead className="bg-(--color-primary) text-white">
              <tr>
                <th className="px-2 py-1 text-left">Solicitado Por</th>
                <th className="px-2 py-1 text-left">Descripción</th>
                <th className="px-2 py-1 text-left">Area a Cargar</th>
                <th className="px-2 py-1 text-left">Urgencia</th>
                <th className="px-2 py-1 text-left">Fecha Solicitud</th>
                <th className="px-2 py-1 text-left">Fecha Negada</th>
                <th className="px-2 py-1 text-left">Fecha Despacho</th>
                <th className="px-2 py-1 text-left">Estado Actual</th>
                <th className="px-2 py-1 text-left">Días</th>
              </tr>
            </thead>
            <tbody>
              {!mutation.isPending && !data.length && (
                <tr>
                  <td colSpan={9} className="px-2 py-4 text-center text-gray-500">
                    No hay datos para mostrar
                  </td>
                </tr>
              )}
              {paginatedData.map((row, idx) => (
                <tr key={idx} className="border-t text-[11px]">
                  <td className="px-2 py-1">{row.solicitado_por}</td>
                  <td className="px-2 py-1">{row.descri_prod}</td>
                  <td className="px-2 py-1">{row.area_cargar}</td>
                  <td className="px-2 py-1">{URGENCIAS[row.urgencia] ?? ''}</td>
                  <td className="px-2 py-1">{formatDateOnly(row.fecha_solicitud)}</td>
                  <td className="px-2 py-1">{formatDateOnly(row.fecha_negada)}</td>
                  <td className="px-2 py-1">{formatDateOnly(row.fecha_despacho)}</td>
                  <td className="px-2 py-1">{row.estado_actual}</td>
                  <td className="px-2 py-1">{row.dias}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!mutation.isPending && totalItems > 0 && (
          <div className="p-4 border-t border-gray-200 flex justify-center">
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

