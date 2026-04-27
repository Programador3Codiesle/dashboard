'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  llegadasTardeService,
  LlegadaTarde,
  ResumenLlegadasTarde,
} from '@/modules/informes/gestion-humana/services/llegadas-tarde.service';
import { useToast } from '@/components/shared/ui/ToastContext';
import { Pagination } from '@/components/shared/ui/Pagination';
import { usuariosService } from '@/modules/usuarios/services/usuarios.service';

interface SedeOption {
  value: string;
  label: string;
}

interface EmpleadoOption {
  value: number;
  label: string;
}

const SEDES_OPTIONS: SedeOption[] = [
  { value: 'Giron', label: 'Girón' },
  { value: 'Rosita', label: 'Rosita' },
  { value: 'Bocono', label: 'Bocono' },
  { value: 'Malecon', label: 'Malecon' },
  { value: 'Barranca', label: 'Barranca' },
  { value: 'Otra', label: 'Otra' },
];

const PAGE_SIZE = 10;

export default function LlegadasTardePage() {
  const { showError, showInfo } = useToast();
  const consultaEnCursoRef = useRef(false);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [sede, setSede] = useState<string>('');
  const [empleado, setEmpleado] = useState<number | undefined>(undefined);
  const [fechaInicio, setFechaInicio] = useState<string>(today);
  const [fechaFin, setFechaFin] = useState<string>(today);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: usuariosResponse, isPending: empleadosCargando } = useQuery({
    queryKey: ['informes', 'llegadas-tarde', 'empleados'],
    queryFn: () => usuariosService.getUsuarios(1, 1500),
    staleTime: 5 * 60 * 1000,
  });

  const usuarios = useMemo(() => {
    if (Array.isArray(usuariosResponse)) return usuariosResponse;
    if (usuariosResponse && Array.isArray(usuariosResponse.items)) return usuariosResponse.items;
    return [];
  }, [usuariosResponse]);

  const empleados = useMemo(() => {
    const seen = new Set<number>();
    const opts: EmpleadoOption[] = [];
    for (const u of usuarios) {
      const v = u.usuario;
      if (!v || seen.has(v)) continue;
      seen.add(v);
      opts.push({
        value: v,
        label: u.nombre?.trim() || String(v),
      });
    }
    return opts.sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }, [usuarios]);

  const inputClass =
    'border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white w-full';

  const detalleMutation = useMutation<LlegadaTarde[]>({
    retry: false,
    mutationFn: async () => {
      if (!fechaInicio || !fechaFin) {
        throw new Error(
          `Debe seleccionar dos fechas. Ejemplo:\nDesde: ${today}\nHasta: ${today}`,
        );
      }
      return llegadasTardeService.listar({
        sede: sede || undefined,
        empleado: empleado ?? undefined,
        fechaInicio,
        fechaFin,
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
        'Error consultando informe de llegadas tarde';
      showError(message);
    },
  });

  const resumenMutation = useMutation<ResumenLlegadasTarde[]>({
    retry: false,
    mutationFn: async () => {
      if (!fechaInicio || !fechaFin) {
        throw new Error('Debe seleccionar dos fechas');
      }
      return llegadasTardeService.listarResumen(fechaInicio, fechaFin);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error consultando consolidado de llegadas tarde';
      showError(message);
    },
  });

  const detalle = detalleMutation.data ?? [];
  const consultaSinResultados =
    detalleMutation.isSuccess &&
    Array.isArray(detalleMutation.data) &&
    detalleMutation.data.length === 0;
  const totalItems = detalle.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return detalle.slice(start, start + PAGE_SIZE);
  }, [detalle, currentPage]);

  const showInitialLoader = detalleMutation.isPending && detalle.length === 0;
  const showUpdating = detalleMutation.isPending && detalle.length > 0;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const formatDateOnly = (value?: string | null) => {
    if (!value) return '';
    const s = String(value).trim();
    const iso = s.match(/^(\d{4}-\d{2}-\d{2})/);
    if (iso) return iso[1];
    return s.slice(0, 10);
  };

  const handleConsultar = () => {
    if (!fechaInicio || !fechaFin) {
      showError('Debe seleccionar fecha inicial y fecha final');
      return;
    }
    if (detalleMutation.isPending || consultaEnCursoRef.current) return;
    setCurrentPage(1);
    consultaEnCursoRef.current = true;
    detalleMutation.mutate(undefined, {
      onSettled: () => {
        consultaEnCursoRef.current = false;
      },
    });
  };

  const handleExportDetalle = () => {
    const data = detalleMutation.data ?? [];
    if (!data.length) return;

    const rows = data.map((r) => ({
      Documento: String(r.empleado),
      Nombre: r.nombres,
      Sede: r.sede,
      Fecha: formatDateOnly(r.fecha),
      'Hora entrada AM': r.llegada_am ?? 'NO REGISTRA ENTRADA',
      'Hora entrada PM': r.llegada_pm ?? 'NO REGISTRA ENTRADA',
      'Hora inicio ausentismo': r.inicio_ausentismo ?? '0',
      'Hora final ausentismo': r.fin_ausentismo ?? '0',
      'Diferencia AM': r.dif_entrada_am ?? 0,
      'Diferencia PM': r.dif_entrada_pm ?? 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Detalle');
    XLSX.writeFile(workbook, 'informe-llegadas-tarde-detalle.xlsx');
  };

  const handleExportResumen = async () => {
    if (!fechaInicio || !fechaFin) {
      showError('Debe seleccionar fecha inicial y fecha final');
      return;
    }
    try {
      const data = await resumenMutation.mutateAsync();
      if (!data.length) {
        showInfo('No hay registros o información para el consolidado en el rango seleccionado.');
        return;
      }

      const rows = data.map((r) => ({
        NIT: String(r.nit),
        Nombres: r.nombres,
        'Total Minutos Tarde': r.totalMinutosTarde,
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Consolidado');
      XLSX.writeFile(workbook, 'informe-llegadas-tarde-resumen.xlsx');
    } catch {
      // error ya manejado en onError
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">
            Informe Llegadas Tarde
          </h1>
          <p className="text-gray-500 mt-1">
            Consulte el detalle por sede, empleado y rango de fechas.
          </p>
        </div>
      </div>

      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Sede</label>
            <select className={inputClass} value={sede} onChange={(e) => setSede(e.target.value)}>
              <option value="">Todas</option>
              {SEDES_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Empleado</label>
            <select
              className={inputClass}
              value={empleado != null ? String(empleado) : ''}
              disabled={empleadosCargando || empleados.length === 0}
              onChange={(e) => {
                const v = e.target.value;
                setEmpleado(v === '' ? undefined : Number(v));
              }}
            >
              {empleadosCargando ? (
                <option value="">Cargando empleados...</option>
              ) : empleados.length === 0 ? (
                <option value="">No hay empleados</option>
              ) : (
                <>
                  <option value="">
                    Todos
                  </option>
                  {empleados.map((emp) => (
                    <option key={emp.value} value={emp.value}>
                      {emp.label}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Fecha inicial</label>
            <input
              type="date"
              className={inputClass}
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              min="2024-07-15"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Fecha final</label>
            <input
              type="date"
              className={inputClass}
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              max={today}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleConsultar}
            disabled={
              detalleMutation.isPending ||
              !fechaInicio ||
              !fechaFin ||
              empleados.length === 0
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {detalleMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            <span>{detalleMutation.isPending ? 'Consultando...' : 'Consultar'}</span>
          </button>
          <button
            type="button"
            onClick={handleExportDetalle}
            disabled={!detalle.length}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-sm hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Exportar a Excel (detalle)
          </button>
          <button
            type="button"
            onClick={handleExportResumen}
            disabled={resumenMutation.isPending || !fechaInicio || !fechaFin}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-sm font-medium shadow-sm hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {resumenMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            <span>{resumenMutation.isPending ? 'Generando...' : 'Consolidado horas'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-gray-800">Resultados</span>
          <div className="flex items-center gap-3">
            {!detalleMutation.isPending && totalItems > 0 && (
              <span className="text-xs text-gray-500">
                {totalItems} registro{totalItems === 1 ? '' : 's'}
              </span>
            )}
            {showUpdating && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 size={14} className="animate-spin" />
                Actualizando...
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs" id="tableInfLlegadasTarde">
            <thead className="bg-(--color-primary) text-white">
              <tr>
                <th className="px-2 py-1 text-left">Documento</th>
                <th className="px-2 py-1 text-left">Nombre</th>
                <th className="px-2 py-1 text-left">Sede</th>
                <th className="px-2 py-1 text-left">Fecha</th>
                <th className="px-2 py-1 text-left">Hora entrada AM</th>
                <th className="px-2 py-1 text-left">Hora entrada PM</th>
                <th className="px-2 py-1 text-left">Hora inicio ausentismo</th>
                <th className="px-2 py-1 text-left">Hora final ausentismo</th>
                <th className="px-2 py-1 text-left">Diferencia AM</th>
                <th className="px-2 py-1 text-left">Diferencia PM</th>
              </tr>
            </thead>
            <tbody>
              {showInitialLoader && (
                <tr>
                  <td colSpan={10} className="px-2 py-6 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={18} />
                      <span>Cargando datos...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!detalleMutation.isPending &&
                !detalle.length &&
                consultaSinResultados && (
                  <tr>
                    <td colSpan={10} className="px-2 py-4 text-center text-gray-500">
                      No se encontraron registros con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              {!detalleMutation.isPending &&
                !detalle.length &&
                !consultaSinResultados && (
                  <tr>
                    <td colSpan={10} className="px-2 py-4 text-center text-gray-500">
                      No hay datos para mostrar. Ajuste los filtros y pulse Consultar.
                    </td>
                  </tr>
                )}
              {paginatedData.map((row, index) => (
                <tr
                  key={`${row.empleado}-${row.fecha}-${row.llegada_am ?? 'na'}-${row.llegada_pm ?? 'np'}-${index}`}
                  className="border-t text-[11px]"
                >
                  <td className="px-2 py-1">{row.empleado}</td>
                  <td className="px-2 py-1">{row.nombres}</td>
                  <td className="px-2 py-1 text-center">{row.sede}</td>
                  <td className="px-2 py-1 text-center">{formatDateOnly(row.fecha)}</td>
                  <td className="px-2 py-1 text-center">
                    {row.llegada_am ?? 'NO REGISTRA ENTRADA'}
                  </td>
                  <td className="px-2 py-1 text-center">
                    {row.llegada_pm ?? 'NO REGISTRA ENTRADA'}
                  </td>
                  <td className="px-2 py-1 text-center">
                    {row.inicio_ausentismo ?? '0'}
                  </td>
                  <td className="px-2 py-1 text-center">
                    {row.fin_ausentismo ?? '0'}
                  </td>
                  <td className="px-2 py-1 text-center">
                    {row.dif_entrada_am ?? 0}
                  </td>
                  <td className="px-2 py-1 text-center">
                    {row.dif_entrada_pm ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!detalleMutation.isPending && totalItems > 0 && (
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
