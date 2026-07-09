'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ordenesSalidaService, OrdenSalida } from '@/modules/informes/gestion-humana/services/ordenes-salida.service';
import { useToast } from '@/components/shared/ui/ToastContext';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useAuth } from '@/core/auth/hooks/useAuth';

const PAGE_SIZE = 10;
const IDS_MODO_OBSERVACION = new Set([460, 625, 814, 826]);

export default function OrdenesSalidaPage() {
  const { user } = useAuth();
  const { showError, showSuccess, showInfo } = useToast();
  const cargaInicialRef = useRef(false);
  const queryClient = useQueryClient();
  const [fechaIni, setFechaIni] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtrosAplicados, setFiltrosAplicados] = useState<{
    fechaIni?: string;
    fechaFin?: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [observaciones, setObservaciones] = useState<Record<number, string>>({});
  const idUsuario = user?.id ? Number(user.id) : null;
  const esModoObservacion = idUsuario != null && IDS_MODO_OBSERVACION.has(idUsuario);
  const mostrarFiltros = !esModoObservacion;
  const inputClass =
    'border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white w-full';

  const {
    data = [],
    isFetching: listando,
    isError: errorListado,
    isFetched,
  } = useQuery<OrdenSalida[]>({
    queryKey: ['informes', 'gestion-humana', 'ordenes-salida', filtrosAplicados],
    queryFn: () => ordenesSalidaService.listar(filtrosAplicados ?? {}),
    enabled: esModoObservacion || filtrosAplicados != null,
    retry: false,
    staleTime: 60 * 1000,
  });

  const guardarObsMutation = useMutation({
    mutationFn: async ({ id, observacion }: { id: number; observacion: string }) => {
      await ordenesSalidaService.guardarObservacion(id, observacion);
    },
    onSuccess: async () => {
      showSuccess('Observación guardada correctamente.');
      await queryClient.invalidateQueries({
        queryKey: ['informes', 'gestion-humana', 'ordenes-salida'],
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Error guardando observación';
      showError(message);
    },
  });

  const handleFiltrar = () => {
    if (mostrarFiltros && (!fechaIni || !fechaFin)) {
      showError('Debe seleccionar fecha inicial y fecha final');
      return;
    }
    if (listando) return;
    setCurrentPage(1);
    setFiltrosAplicados({
      fechaIni: fechaIni || undefined,
      fechaFin: fechaFin || undefined,
    });
  };

  useEffect(() => {
    if (!esModoObservacion || cargaInicialRef.current) return;
    cargaInicialRef.current = true;
    setFiltrosAplicados({
      fechaIni: undefined,
      fechaFin: undefined,
    });
  }, [esModoObservacion]);

  useEffect(() => {
    if (!errorListado) return;
    showError('Error consultando informe de órdenes de salida');
  }, [errorListado, showError]);

  useEffect(() => {
    if (!isFetched || listando) return;
    if (data.length === 0) {
      showInfo('No hay registros para el rango de fechas seleccionado.');
    }
  }, [isFetched, listando, data.length, showInfo]);

  const consultaSinResultados = isFetched && data.length === 0;
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, currentPage]);
  const showInitialLoader = listando && data.length === 0;
  const showUpdating = listando && data.length > 0;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleChangeObs = (id: number, value: string) => {
    setObservaciones((prev) => ({ ...prev, [id]: value }));
  };

  const handleGuardarObs = (row: OrdenSalida) => {
    if (!esModoObservacion) return;
    const obs = (observaciones[row.id] ?? '').trim();
    if (!obs) {
      showError('Por favor ingrese una observación');
      return;
    }
    guardarObsMutation.mutate({ id: row.id, observacion: obs });
  };

  const formatDateOnly = (value?: string | null) => (value ? value.slice(0, 10) : '');

  const handleExportCsv = async () => {
    if (!data.length) return;
    const XLSX = await import('xlsx');
    const rows = data.map((r) => ({
      'Área': r.area ?? '',
      'Sede': r.sede ?? '',
      'Jefe Autorizó': r.jefeNombre,
      'Tipo Salida': r.tipoSalidaNombre,
      'Explicación': r.explicacion,
      'Fecha Orden': formatDateOnly(r.fecha_salida),
      'Placa': r.placa ?? '',
      'Conductor': r.conductor ?? '',
      'Persona salió': r.quienSale ?? '',
      'Observación': r.observacion ?? '',
      'Fecha Observación': formatDateOnly(r.fecha_reg_obs),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OrdenesSalida');
    XLSX.writeFile(workbook, 'informe-ordenes-salida.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold brand-text tracking-tight">
            Informe Órdenes de Salida
          </h1>
          <p className="text-gray-500 mt-1">
            Consulte y gestione observaciones por rango de fechas.
          </p>
        </div>
      </div>

      {mostrarFiltros && (
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">
                Fecha inicial
              </label>
              <input
                type="date"
                value={fechaIni}
                onChange={(e) => setFechaIni(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">
                Fecha final
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleFiltrar}
              disabled={listando || !fechaIni || !fechaFin}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {listando && <Loader2 size={16} className="animate-spin" />}
              <span>{listando ? 'Consultando...' : 'Filtrar'}</span>
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
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-gray-800">Resultados</span>
          <div className="flex items-center gap-3">
            {!listando && totalItems > 0 && (
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
        <div className="app-table-scroll">
          <table className="min-w-full text-xs" id="tabladatos">
            <thead className="bg-(--color-primary) text-white">
              <tr>
                {!esModoObservacion && <th className="px-2 py-1 text-left">Área</th>}
                {!esModoObservacion && <th className="px-2 py-1 text-left">Sede</th>}
                <th className="px-2 py-1 text-left">Jefe autorizó</th>
                <th className="px-2 py-1 text-left">Tipo salida</th>
                <th className="px-2 py-1 text-left">Explicación</th>
                <th className="px-2 py-1 text-left">Fecha orden</th>
                <th className="px-2 py-1 text-left">Placa</th>
                <th className="px-2 py-1 text-left">Conductor</th>
                <th className="px-2 py-1 text-left">Persona salió</th>
                <th className="px-2 py-1 text-left">Observación</th>
                {!esModoObservacion && (
                  <th className="px-2 py-1 text-left">Fecha observación</th>
                )}
                {esModoObservacion && <th className="px-2 py-1 text-left">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {showInitialLoader && (
                <tr>
                  <td colSpan={esModoObservacion ? 9 : 11} className="px-2 py-6 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={18} />
                      <span>Cargando datos...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!listando && data.length === 0 && consultaSinResultados && (
                <tr>
                  <td
                    colSpan={esModoObservacion ? 9 : 11}
                    className="px-2 py-4 text-center text-gray-500"
                  >
                    No se encontraron registros con los filtros seleccionados.
                  </td>
                </tr>
              )}
              {!listando && data.length === 0 && !consultaSinResultados && (
                <tr>
                  <td
                    colSpan={esModoObservacion ? 9 : 11}
                    className="px-2 py-4 text-center text-gray-500"
                  >
                    No hay datos para mostrar. Seleccione fechas y pulse Filtrar.
                  </td>
                </tr>
              )}
              {paginatedData.map((row) => {
                const fondo =
                  row.observacion && row.observacion.trim() !== ''
                    ? 'bg-white'
                    : 'bg-yellow-50';
                return (
                  <tr key={row.id} className={`${fondo} border-t text-[11px]`}>
                    {!esModoObservacion && <td className="px-2 py-1">{row.area}</td>}
                    {!esModoObservacion && <td className="px-2 py-1">{row.sede}</td>}
                    <td className="px-2 py-1">{row.jefeNombre}</td>
                    <td className="px-2 py-1">{row.tipoSalidaNombre}</td>
                    <td className="px-2 py-1">{row.explicacion}</td>
                    <td className="px-2 py-1">{formatDateOnly(row.fecha_salida)}</td>
                    <td className="px-2 py-1">{row.placa}</td>
                    <td className="px-2 py-1">{row.conductor}</td>
                    <td className="px-2 py-1">{row.quienSale}</td>
                    <td className="px-2 py-1 align-top">
                      {row.observacion || !esModoObservacion ? (
                        row.observacion
                      ) : (
                        <textarea
                          className="border rounded-md px-2 py-1 text-xs w-56 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                          value={observaciones[row.id] ?? ''}
                          onChange={(e) => handleChangeObs(row.id, e.target.value)}
                        />
                      )}
                    </td>
                    {!esModoObservacion && (
                      <td className="px-2 py-1">{formatDateOnly(row.fecha_reg_obs)}</td>
                    )}
                    {esModoObservacion && (
                      <td className="px-2 py-1">
                        {!row.observacion && (
                        <button
                          type="button"
                          onClick={() => handleGuardarObs(row)}
                          disabled={guardarObsMutation.isPending}
                          className="inline-flex items-center px-3 py-1 rounded-md bg-(--color-primary) text-white text-[11px] font-medium shadow hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Guardar
                        </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!listando && totalItems > 0 && (
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

